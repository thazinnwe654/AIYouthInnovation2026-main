from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from .. import models
from ..models import CompetitionCategory
from ..security import get_current_user, require_role
from sqlalchemy import func, or_

router = APIRouter(prefix="/competitions", tags=["competitions"])


def _scoped_team_ids(db: Session, user: models.User, competition_id: int):
    """Team ids this user may see for a competition.

    ADMIN and HEAD_JUDGE see the whole competition: they run the scoring process
    and need the full roster. A plain JUDGE only sees the teams assigned to them,
    so an unassigned team's name never reaches their browser.
    """
    if user.role in (models.UserRole.ADMIN, models.UserRole.HEAD_JUDGE):
        return None  # None means "no restriction"
    if user.role != models.UserRole.JUDGE:
        return set()
    judge = db.query(models.Judge).filter(models.Judge.user_id == user.id).first()
    if not judge:
        return set()
    return {
        row[0]
        for row in db.query(models.JudgeAssignment.team_id)
        .filter(
            models.JudgeAssignment.judge_id == judge.id,
            models.JudgeAssignment.competition_id == competition_id,
        )
        .all()
    }


def _product_name(db: Session, team_id: int):
    row = db.query(models.Team.product_name).filter(models.Team.id == team_id).first()
    return row[0] if row else None


class CompetitionCreate(BaseModel):
    name: str
    category: CompetitionCategory


@router.get("/")
def list_competitions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role.value not in (
        "ADMIN",
        "TEAM_MEMBER",
        "TEAM_LEADER",
        "JUDGE",
        "HEAD_JUDGE",
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to list competitions",
        )
    comps = db.query(models.Competition).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "category": c.category,
        }
        for c in comps
    ]


@router.post("/")
def create_competition(
    competition: CompetitionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("ADMIN")),
):
    # Prevent duplicate competition names
    existing = (
        db.query(models.Competition)
        .filter(models.Competition.name == competition.name)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Competition with this name already exists",
        )
    db_competition = models.Competition(
        name=competition.name, category=competition.category
    )
    db.add(db_competition)
    db.commit()
    db.refresh(db_competition)
    # Audit log for competition creation
    audit = models.AuditLog(
        user_id=current_user.id,
        action="create_competition",
        entity_type="Competition",
        entity_id=db_competition.id,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return {"id": db_competition.id, "name": db_competition.name}


@router.get("/{competition_id}")
def get_competition(
    competition_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    comp = db.get(models.Competition, competition_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    return {
        "id": comp.id,
        "name": comp.name,
        "category": comp.category,
        "teams_count": len(comp.teams),
        "deliverables_count": len(comp.deliverables),
    }


@router.put("/{competition_id}")
def update_competition(
    competition_id: int,
    name: str = None,
    category: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("ADMIN")),
):
    comp = db.get(models.Competition, competition_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    if name is not None:
        comp.name = name
    if category is not None:
        comp.category = CompetitionCategory(category)
    db.commit()
    db.refresh(comp)
    return {"id": comp.id, "name": comp.name, "category": comp.category}


@router.delete("/{competition_id}")
def delete_competition(
    competition_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("ADMIN")),
):
    comp = db.get(models.Competition, competition_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    db.delete(comp)
    db.commit()
    return {"detail": "Competition deleted"}


@router.get("/{competition_id}/teams")
def list_competition_teams(
    competition_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role.value not in ("ADMIN", "JUDGE", "HEAD_JUDGE"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to list teams for this competition",
        )
    comp = db.get(models.Competition, competition_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    allowed = _scoped_team_ids(db, current_user, competition_id)
    return [
        {"id": t.id, "name": t.name, "members_count": len(t.members)}
        for t in comp.teams
        if allowed is None or t.id in allowed
    ]


@router.get("/{competition_id}/leaderboard")
def leaderboard(
    competition_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == models.UserRole.TEAM_MEMBER:
        raise HTTPException(status_code=403, detail="Not authorized")
    comp = db.get(models.Competition, competition_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")

    judge = (
        db.query(models.Judge).filter(models.Judge.user_id == current_user.id).first()
    )

    # Per-team totals contributed by the signed-in judge only.
    own_totals = {}
    if judge:
        own_rows = (
            db.query(
                models.Evaluation.team_id,
                func.coalesce(func.sum(models.EvaluationScore.score), 0),
                func.count(models.EvaluationScore.id),
            )
            .join(
                models.EvaluationScore,
                models.EvaluationScore.evaluation_id == models.Evaluation.id,
            )
            .filter(models.Evaluation.judge_id == judge.id)
            .group_by(models.Evaluation.team_id)
            .all()
        )
        own_totals = {r[0]: (float(r[1]), r[2]) for r in own_rows}

    teams = (
        db.query(models.Team.id, models.Team.name)
        .filter(models.Team.competition_id == competition_id)
        .all()
    )
    # A plain JUDGE only sees teams assigned to them. HEAD_JUDGE and ADMIN see
    # the whole competition so they can run the scoring process.
    allowed = _scoped_team_ids(db, current_user, competition_id)
    result = []
    for team_id, team_name in teams:
        if allowed is not None and team_id not in allowed:
            continue
        total, count = own_totals.get(team_id, (0.0, 0))
        result.append(
            {
                "team_id": team_id,
                "team_name": team_name,
                "product_name": _product_name(db, team_id),
                "total_score": total,
                "num_scores": count,
                "scope": "own",
            }
        )
    result.sort(key=lambda t: (-t["total_score"], t["team_id"]))
    for i, item in enumerate(result):
        item["rank"] = i + 1
    return result


@router.get("/{competition_id}/rankings")
def rankings(
    competition_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in (
        models.UserRole.TEAM_MEMBER,
        models.UserRole.TEAM_LEADER,
        models.UserRole.ADMIN,
        models.UserRole.JUDGE,
        models.UserRole.HEAD_JUDGE,
    ):
        raise HTTPException(
            status_code=403, detail="Not authorized to view rankings detail"
        )
    comp = db.get(models.Competition, competition_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    results = (
        db.query(
            models.Team.id,
            models.Team.name,
            func.coalesce(func.sum(models.EvaluationScore.score), 0).label("total"),
        )
        .outerjoin(models.Evaluation, models.Evaluation.team_id == models.Team.id)
        .outerjoin(
            models.EvaluationScore,
            models.EvaluationScore.evaluation_id == models.Evaluation.id,
        )
        .filter(models.Team.competition_id == competition_id)
        .group_by(models.Team.id, models.Team.name)
        .order_by(models.Team.name.asc())
        .all()
    )
    return [
        {"rank": i + 1, "team_id": r[0], "team_name": r[1]}
        for i, r in enumerate(results)
    ]
