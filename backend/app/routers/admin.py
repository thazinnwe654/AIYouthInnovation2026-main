import os


from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from .. import models
from ..security import get_current_user, get_password_hash, require_role

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user


@router.get("/users")
def list_users(db: Session = Depends(get_db), admin: models.User = Depends(require_role('ADMIN'))):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role.value,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.post("/users")
def create_user(
    email: str,
    password: str,
    role: str = "TEAM_MEMBER",
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role('ADMIN')),
):
    if role not in models.UserRole.__members__:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
    if db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = models.User(
        email=email,
        password_hash=get_password_hash(password),
        role=models.UserRole[role],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # Audit log for user creation
    audit = models.AuditLog(
        user_id=admin.id,
        action='create_user',
        entity_type='User',
        entity_id=user.id,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return {"id": user.id, "email": user.email, "role": user.role.value}


@router.get("/evaluation-criteria")
def list_criteria(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role.value not in ("ADMIN", "HEAD_JUDGE", "JUDGE"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view evaluation criteria")
    return db.query(models.EvaluationCriteria).all()


@router.post("/evaluation-criteria")
def create_criterion(
    name: str,
    weight: float,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role('ADMIN')),
):
    if weight <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Weight must be a positive number",
        )
    current_total = db.query(
        func.coalesce(func.sum(models.EvaluationCriteria.weight), 0)
    ).scalar()
    if current_total + weight > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Criterion weights must total exactly 100% (current total: {current_total})",
        )
    criterion = models.EvaluationCriteria(name=name, weight=weight)
    db.add(criterion)
    db.commit()
    db.refresh(criterion)
    return {"id": criterion.id, "name": criterion.name, "weight": criterion.weight}


@router.get("/audit-logs")
def list_audit_logs(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role('ADMIN')),
):
    return db.query(models.AuditLog).all()


@router.get("/teams/{team_id}/submissions")
def list_team_submissions_for_admin(
    team_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role('ADMIN')),
):
    team = db.get(models.Team, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    submissions = db.query(models.Submission).filter(models.Submission.team_id == team_id).all()
    result = []
    for submission in submissions:
        deliverable = db.get(models.Deliverable, submission.deliverable_id)
        files = db.query(models.SubmissionFile).filter(models.SubmissionFile.submission_id == submission.id).all()
        result.append({
            "id": submission.id,
            "deliverable_id": submission.deliverable_id,
            "deliverable_name": deliverable.name if deliverable else None,
            "status": submission.status.value,
            "version": submission.version,
            "updated_at": submission.updated_at,
            "files": [
                {
                    "id": file.id,
                    "original_filename": file.original_filename,
                    "file_type": file.file_type,
                    "file_size": file.file_size,
                    "version": file.version,
                    "uploaded_at": file.uploaded_at,
                    "submitted_at": file.submitted_at,
                    "storage_path": file.storage_path,
                }
                for file in files
            ],
        })
    return result


@router.post("/submissions/{submission_id}/reopen")
def admin_reopen_submission(
    submission_id: int,
    reason: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role('ADMIN')),
):
    submission = db.get(models.Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    if submission.status not in (models.SubmissionStatus.SUBMITTED, models.SubmissionStatus.LOCKED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted or locked submissions can be reopened",
        )
    if not reason or not reason.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A reason is required to reopen a submission")

    old_status = submission.status.value
    submission.status = models.SubmissionStatus.NEED_REVISION
    db.commit()
    db.refresh(submission)

    audit = models.AuditLog(
        user_id=admin.id,
        actor_role=admin.role.value,
        action='admin_reopen_submission',
        entity_type='Submission',
        entity_id=submission.id,
        old_value=old_status,
        new_value=models.SubmissionStatus.NEED_REVISION.value,
        reason=reason.strip(),
        metadata_json={
            "team_id": submission.team_id,
            "deliverable_id": submission.deliverable_id,
            "replacement_required": True,
        },
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    return {
        "id": submission.id,
        "status": submission.status.value,
        "replacement_required": True,
    }


@router.delete("/submissions/{submission_id}/files/{file_id}")
def admin_delete_submission_file(
    submission_id: int,
    file_id: int,
    reason: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_role('ADMIN')),
):
    submission = db.get(models.Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    file_record = db.query(models.SubmissionFile).filter(
        models.SubmissionFile.id == file_id,
        models.SubmissionFile.submission_id == submission_id,
    ).first()
    if not file_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    if not reason or not reason.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A reason is required to remove a submission file")

    try:
        if os.path.exists(file_record.storage_path):
            os.remove(file_record.storage_path)
    except OSError:
        pass

    db.delete(file_record)
    remaining = db.query(models.SubmissionFile).filter(models.SubmissionFile.submission_id == submission_id).count()
    if remaining == 0:
        submission.status = models.SubmissionStatus.OPEN
    db.commit()

    audit = models.AuditLog(
        user_id=admin.id,
        actor_role=admin.role.value,
        action='admin_remove_submission_file',
        entity_type='SubmissionFile',
        entity_id=file_record.id,
        old_value=file_record.original_filename,
        new_value=None,
        reason=reason.strip(),
        metadata_json={
            "submission_id": submission_id,
            "team_id": submission.team_id,
            "deliverable_id": submission.deliverable_id,
            "file_id": file_id,
        },
    )
    db.add(audit)
    db.commit()

    return {"id": file_id, "deleted": True, "reason": reason.strip()}
