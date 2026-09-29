"""Judge assignment scoping.

Verifies the rule the competition needs:

  * admin assigns no teams to a judge  -> that judge sees no teams and no files
  * admin assigns some teams          -> that judge sees only the assigned ones
  * admin assigns every team          -> that judge sees all of them

and that a JUDGE can never read or score a team they are not assigned to, while
HEAD_JUDGE and ADMIN keep the roster they need to run the process.

Two different team sets are compared on purpose:

  * every assigned team, which is what the competition listings return
    (leaderboard, competition teams);
  * only assigned teams that actually have submission rows, which is all the
    "submitted teams" and "submissions" endpoints can report. A team with no
    submission record is correctly absent from those, so comparing them against
    every team would fail for the wrong reason.

This test mutates judge_assignments for judge6@sti.edu.mm and restores the
original state (no assignments) before it exits.

Usage:
    .venv\\Scripts\\python.exe test_judge_assignment_scope.py
Run it with the backend virtualenv interpreter; the system Python on this
machine cannot reach the local API. Requires the backend on
http://127.0.0.1:8022.
"""

import json
import os
import sqlite3
import urllib.error
import urllib.parse
import urllib.request

BASE = "http://127.0.0.1:8022/api/v1"
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test.db")

SUBJECT_EMAIL = "judge6@sti.edu.mm"      # plain JUDGE, starts with no assignments
HEAD_JUDGE_EMAIL = "judge1@sti.edu.mm"   # HEAD_JUDGE, assigned to everything
ADMIN_EMAIL = "admin@sti.edu.mm"
PASSWORDS = {
    SUBJECT_EMAIL: "judge123",
    HEAD_JUDGE_EMAIL: "judge123",
    ADMIN_EMAIL: "admin123",
}
COMP_ID = 1

results = []


def record(ok, label, detail=""):
    results.append((ok, label))
    print(f"  [{'PASS' if ok else 'FAIL'}] {label}{(' - ' + detail) if detail else ''}")


def get(path, token):
    req = urllib.request.Request(BASE + path)
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def post(path, token):
    req = urllib.request.Request(BASE + path, data=b"", method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def post_delete(path, token):
    req = urllib.request.Request(BASE + path, method="DELETE")
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def login(email):
    body = urllib.parse.urlencode(
        {"username": email, "password": PASSWORDS.get(email, "judge123")}
    ).encode()
    req = urllib.request.Request(BASE + "/auth/login", data=body, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())["access_token"]


def team_ids(payload):
    return {row["team_id"] for row in payload}


def db():
    return sqlite3.connect(DB_PATH)


def judge_id_for(email):
    con = db()
    row = con.execute(
        "SELECT j.id FROM judges j JOIN users u ON u.id = j.user_id WHERE u.email = ?", (email,)
    ).fetchone()
    con.close()
    return row[0]


def clear_subject_assignments():
    con = db()
    con.execute(
        "DELETE FROM judge_assignments WHERE judge_id = "
        "(SELECT id FROM judges WHERE user_id = (SELECT id FROM users WHERE email = ?))",
        (SUBJECT_EMAIL,),
    )
    con.commit()
    con.close()


def assign(admin_token, judge_id, team_id, comp_id):
    return post(
        f"/judges/assignments?judge_id={judge_id}&team_id={team_id}&competition_id={comp_id}",
        admin_token,
    )


def check_view(label, token, expected_all, expected_submitted, comp_id=COMP_ID):
    _, submitted = get("/judges/submitted-teams", token)
    _, subs = get("/judges/submissions", token)
    _, board = get(f"/competitions/{comp_id}/leaderboard", token)
    _, comp_teams = get(f"/competitions/{comp_id}/teams", token)
    _, evals = get("/judges/evaluations", token)
    eval_teams = {e["team_id"] for e in evals}

    got_submitted = team_ids(submitted)
    got_subs = team_ids(subs)
    got_board = team_ids(board)
    got_comp_teams = {t["id"] for t in comp_teams}

    ok = (
        got_submitted == expected_submitted
        and got_subs == expected_submitted
        and got_board == expected_all
        and got_comp_teams == expected_all
        and eval_teams <= expected_submitted
    )
    record(
        ok,
        label,
        f"expected submitted={len(expected_submitted)} all={len(expected_all)}; "
        f"got submitted={len(got_submitted)} subs={len(got_subs)} "
        f"board={len(got_board)} compTeams={len(got_comp_teams)} "
        f"evals={len(eval_teams)}",
    )


def main():
    print("Judge assignment scope test")
    print("=" * 66)

    admin_token = login(ADMIN_EMAIL)
    head_token = login(HEAD_JUDGE_EMAIL)
    subject_judge_id = judge_id_for(SUBJECT_EMAIL)

    con = db()
    all_in_comp = {r[0] for r in con.execute(
        "SELECT id FROM teams WHERE competition_id = ?", (COMP_ID,)
    )}
    submitted_any = {r[0] for r in con.execute(
        "SELECT DISTINCT team_id FROM submissions"
    )}
    every_team = {r[0] for r in con.execute("SELECT id FROM teams")}
    others = {r[0] for r in con.execute(
        "SELECT id FROM teams WHERE competition_id != ?", (COMP_ID,)
    )}
    con.close()

    print(f"\ncompetition {COMP_ID}: {len(all_in_comp)} team(s), "
          f"{len(all_in_comp & submitted_any)} with submissions; "
          f"{len(every_team)} team(s) overall")

    # ---- Case 1: nothing assigned -----------------------------------------
    print("\nCase 1: admin has assigned the judge NO teams")
    clear_subject_assignments()
    subj = login(SUBJECT_EMAIL)
    check_view("judge with 0 assignments sees nothing", subj, set(), set())

    status, body = post(f"/judges/evaluations/mine?team_id=36&competition_id={COMP_ID}", subj)
    record(
        status == 403,
        "judge with 0 assignments cannot open an evaluation",
        f"HTTP {status} {body.get('detail', '')}",
    )
    _, files = get("/deliverables/competitions/1/submissions", subj)
    record(len(files) == 0, "judge with 0 assignments sees no files", f"{len(files)} row(s)")

    # ---- Case 2: partial assignment ---------------------------------------
    print("\nCase 2: admin assigns SOME teams")
    sample = set(sorted(all_in_comp)[:2])
    for tid in sorted(sample):
        assign(admin_token, subject_judge_id, tid, COMP_ID)
    subj = login(SUBJECT_EMAIL)
    check_view(
        f"judge sees only the {len(sample)} assigned team(s)",
        subj,
        expected_all=sample,
        expected_submitted=sample & submitted_any,
    )
    hidden = (all_in_comp - sample) & submitted_any
    _, seen = get("/judges/submitted-teams", subj)
    record(
        not (hidden & team_ids(seen)),
        f"the other {len(hidden)} submitted team(s) in the competition are hidden",
    )

    unassigned = sorted(hidden)[0]
    status, body = post(
        f"/judges/evaluations/mine?team_id={unassigned}&competition_id={COMP_ID}", subj
    )
    record(
        status == 403,
        "judge cannot open an evaluation for an UNASSIGNED team",
        f"team {unassigned} -> HTTP {status} {body.get('detail', '')}",
    )
    _, comp_files = get("/deliverables/competitions/1/submissions", subj)
    record(
        all(s["team_id"] in sample for s in comp_files),
        "no submission rows for unassigned teams",
        f"{len(comp_files)} row(s), all within the assigned set",
    )

    # ---- Case 3: whole competition assigned -------------------------------
    print("\nCase 3: admin assigns EVERY team in the competition")
    clear_subject_assignments()
    for tid in sorted(all_in_comp):
        assign(admin_token, subject_judge_id, tid, COMP_ID)
    subj = login(SUBJECT_EMAIL)
    check_view(
        "judge sees all teams of the assigned competition",
        subj,
        expected_all=all_in_comp,
        expected_submitted=all_in_comp & submitted_any,
    )
    _, seen = get("/judges/submitted-teams", subj)
    record(
        not (others & team_ids(seen)),
        f"teams of other competitions stay hidden ({len(others)} team(s))",
    )

    # ---- Case 4: unassign -------------------------------------------------
    print("\nCase 4: admin removes an assignment")
    subj = login(SUBJECT_EMAIL)
    _, before = get("/judges/submitted-teams", subj)
    before_teams = team_ids(before)
    _, all_asg = get("/judges/assignments", admin_token)
    target = [a for a in all_asg if a["team_id"] in before_teams and a["judge_email"] == SUBJECT_EMAIL]
    record(bool(target), "assignment to remove was found", f"{len(target)} candidate(s)")

    if target:
        aid = target[0]["id"]
        status, body = post_delete(f"/judges/assignments/{aid}", admin_token)
        record(
            status == 200 and body.get("deleted") is True,
            "DELETE /judges/assignments/{id} succeeds",
            f"HTTP {status} {body.get('detail', '')}",
        )
        record(
            "leftover_evaluations" in body,
            "response reports how many evaluations are left unassigned",
            f"leftover_evaluations={body.get('leftover_evaluations')}",
        )
        subj = login(SUBJECT_EMAIL)
        _, after = get("/judges/submitted-teams", subj)
        removed = before_teams - team_ids(after)
        record(
            len(removed) == 1,
            "the removed team is no longer visible to that judge",
            f"{len(removed)} team(s) hidden",
        )
        _, evals = get("/judges/evaluations", subj)
        record(
            not (removed & {e["team_id"] for e in evals}),
            "no evaluation for the removed team is reachable",
        )
        status, _ = post(
            f"/judges/evaluations/mine?team_id={sorted(removed)[0]}&competition_id={COMP_ID}", subj
        )
        record(status == 403, "the removed team can no longer be scored")

        # restore
        status, _ = assign(admin_token, subject_judge_id, sorted(removed)[0], COMP_ID)
        record(status == 200, "assignment restored for the remaining cases")

    status, _ = post_delete("/judges/assignments/99999999", admin_token)
    record(status == 404, "deleting a non-existent assignment returns 404", f"HTTP {status}")

    status, _ = post_delete("/judges/assignments/1", subj)
    record(status in (401, 403), "a JUDGE cannot delete an assignment", f"HTTP {status}")

    # ---- Case 5: head judge and admin unaffected --------------------------
    print("\nCase 5: HEAD_JUDGE and ADMIN are unaffected")
    _, head_seen = get("/judges/submitted-teams", head_token)
    record(
        team_ids(head_seen) == submitted_any,
        "HEAD_JUDGE still sees every submitted team",
        f"{len(head_seen)} of {len(submitted_any)}",
    )
    _, head_board = get(f"/competitions/{COMP_ID}/leaderboard", head_token)
    record(
        team_ids(head_board) == all_in_comp,
        "HEAD_JUDGE leaderboard shows the whole competition",
        f"{len(head_board)} of {len(all_in_comp)}",
    )
    _, admin_board = get(f"/competitions/{COMP_ID}/leaderboard", admin_token)
    record(
        team_ids(admin_board) == all_in_comp,
        "ADMIN leaderboard shows the whole competition",
        f"{len(admin_board)} of {len(all_in_comp)}",
    )
    _, admin_teams = get(f"/competitions/{COMP_ID}/teams", admin_token)
    record(
        {t["id"] for t in admin_teams} == all_in_comp,
        "ADMIN competition team list shows every team",
        f"{len(admin_teams)} of {len(all_in_comp)}",
    )

    # ---- restore ----------------------------------------------------------
    clear_subject_assignments()
    subj_after = login(SUBJECT_EMAIL)
    _, after = get("/judges/submitted-teams", subj_after)
    record(len(after) == 0, "test data restored: subject judge has 0 assignments again")

    passed = sum(1 for ok, _ in results if ok)
    failed = len(results) - passed
    print("\n" + "=" * 66)
    print(f"  Total: {len(results)}  |  PASS: {passed}  |  FAIL: {failed}")
    print("=" * 66)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
