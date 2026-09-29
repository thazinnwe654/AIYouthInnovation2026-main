"""Set the demo video link for each team.

Product-name style seed: teams are matched by exact team name, the script only
writes the youtube_url column, and it can be re-run safely. Teams without a
link in the table are simply left empty.

Only http/https URLs are accepted. Anything else (javascript:, data:) is
rejected and reported rather than stored, so a link can never become a way to
run script in the browser.

Usage:
    python seed_youtube_links.py            # apply
    python seed_youtube_links.py --dry-run  # show what would change
"""

import sys
from urllib.parse import urlparse

from app.database import SessionLocal
from app import models


ALLOWED_SCHEMES = ("http", "https")

# Team name as stored in the teams table -> demo video URL.
YOUTUBE_LINKS = {
    "Eclipse": "https://youtu.be/IoaAwbl1x3A?feature=shared",
    "M.I.A": "https://youtube.com/watch?v=XCh_G9P4xuk&si=Pa0OGS_fCJ_vKBtx",
    "Teen Innovations": "https://youtu.be/eNmJAg91dyA?si=01S5eX7p4Y5iaHwn",
    "Thein Naing Squad": "https://youtu.be/b5ikhiVJRdg?si=tR2cm1yDWYsVDgZ8",
    "Core 2 AI": "https://youtu.be/2_EUs610kZ8?si=nfDZI3eKy-P1BtI4",
    "Min Myanmar Team -1": "https://youtu.be/EEa4ikBvpdk?si=8ZGtcxNQ5rjhZa8g",
    "BlueNode": "https://youtu.be/vckWdnaWx1g",
    "BrainGrowth": "https://youtu.be/VGJOM27p2A4?feature=shared",
    "Emolink": "https://youtu.be/fbTO2Rq00k0?si=-QsCvSimc5aPU3iz",
    "Trustlink Innovators": "https://www.youtube.com/watch?v=f3ivIXCf6JI",
    "Code Titans": "https://youtu.be/Lywk0AP6U4g?si=recZGUN8cZIBa2Hn",
    "AI Don't Understand Us": "https://youtu.be/-oI8eEHEd9s",
    "Sabina": "https://www.youtube.com/watch?v=IzYIAX3OkBc",
    "Blind Mice": "https://youtu.be/EPGPPDTDpm0",
    "NeuraNova": "https://youtu.be/asViV5xu32A?si=l4jtjzKq-jYEcXG9",
    "Three Musketeers": "https://youtu.be/4wQJpTlZb44?si=0d-uHVlw6c6x4Djr",
    "Secret Weapon": "https://youtu.be/QdBjf6JHtzs?si=IKLH_7Aste03SsN6",
    "Thakhin": "https://www.youtube.com/watch?v=gXiOrwWp1Fg",
    "Frame Moggers": "https://youtube.com/shorts/cGwU7zORv9E?si=_Ek4JlbqpAdlsJpz",
    "Jimmy/Htut Khaung": "https://youtu.be/-cSc38Ek9g4?feature=shared",
    "CodeTrio": "https://www.youtube.com/watch?v=CY7_zR5LFbg",
    "Team Magnet": "https://www.youtube.com/watch?v=03c0CA2Mc5Y",
    "RKD": "https://youtu.be/LjwVkEFejGQ?si=XSO36BMTTLx4AI24",
    "Luminary(Lumi)": "https://youtu.be/NjnC8USKIZk?si=PS2MtWC0fld5Oa7e",
    "V": "https://youtu.be/2pGouXnkNq4",
    "Min Myanmar Team -2/77": "https://youtu.be/gCC5HevYjR4?si=dhxnjw9rljZPjS-T",
}


def is_safe_url(url):
    try:
        parsed = urlparse(url)
    except ValueError:
        return False
    return parsed.scheme in ALLOWED_SCHEMES and bool(parsed.netloc)


def main():
    dry_run = "--dry-run" in sys.argv
    db = SessionLocal()
    try:
        teams = db.query(models.Team).all()
        by_name = {}
        for team in teams:
            by_name.setdefault(team.name, []).append(team)

        applied, unchanged, missing, rejected = [], [], [], []

        for team_name, url in YOUTUBE_LINKS.items():
            if not is_safe_url(url):
                rejected.append(f"{team_name}: not a safe http(s) URL ({url!r})")
                continue
            matches = by_name.get(team_name)
            if not matches:
                missing.append(team_name)
                continue
            for team in matches:
                if team.youtube_url == url:
                    unchanged.append(team.name)
                    continue
                if not dry_run:
                    team.youtube_url = url
                applied.append(f"{team.name} (id {team.id}) -> {url}")

        if not dry_run:
            db.commit()
        else:
            db.rollback()

        print(f"teams in database: {len(teams)}")
        print(f"links supplied: {len(YOUTUBE_LINKS)}")
        print(f"updated: {len(applied)}")
        for line in applied:
            print(f"  + {line}")
        print(f"already set: {len(unchanged)}")
        print(f"rejected as unsafe: {len(rejected)}")
        for line in rejected:
            print(f"  ! {line}")
        print(f"no matching team: {len(missing)}")
        for name in missing:
            print(f"  ! no team named {name!r} - left empty")
        if not dry_run:
            without = sorted({t.name for t in teams if not t.youtube_url})
            print(f"teams with no link: {len(without)}")
            for name in without:
                print(f"  - {name}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
