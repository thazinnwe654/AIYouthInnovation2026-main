"""Set the product name for each team.

Product names are matched to teams by exact team name. The script is safe to
re-run: it only writes the product_name column and leaves every other field
alone. It does not create, delete or rename teams.

Usage:
    python seed_product_names.py            # apply
    python seed_product_names.py --dry-run  # show what would change
"""

import sys

from app.database import SessionLocal
from app import models


# Team name as stored in the teams table -> product name.
PRODUCT_NAMES = {
    "Secret Weapon": "Bizbuddy(AI Business Mentor)",
    "Thakhin": "Thakhin",
    "Frame Moggers": "MPilot",
    "Jimmy/Htut Khaung": "GridRescue Myanmar",
    "CodeTrio": "ResilienceAI",
    "Team Magnet": "Safety tracker",
    "RKD": "Job & Career Advisor",
    "Luminary(Lumi)": "Lumina offline ai learning Tutor",
    "V": "Veridel",
    "77": "SmartHome Energy Alert System With AI Assistant (Sentinel)",
    "BlueNode": "DeFlood.AI",
    "BrainGrowth": "BrainGrowth",
    "Emolink": "Emolink",
    "Trustlink Innovators": "antifake",
    "Code Titans": "AI Blackboards",
    "AI Don't Understand Us": "SignaBridge",
    "Sabina": "SchoolLens",
    "Blind Mice": "BarKyanLal",
    "NeuraNova": "ScamSense-AI",
    "Three Musketeers": "ViveResQ",
    "Eclipse": "Rise from the Eclipse",
    "M.I.A": "Hear Hands",
    "Teen Innovations": "Eduaccess",
    "Thein Naing Squad": "Agrisearch AI",
    "Core 2 AI": "Learn Smart AI",
    "Min Myanmar Team -1": "NurseyAI",
}


def main():
    dry_run = "--dry-run" in sys.argv
    db = SessionLocal()
    try:
        teams = db.query(models.Team).all()
        by_name = {}
        for team in teams:
            by_name.setdefault(team.name, []).append(team)

        applied, unchanged, missing = [], [], []

        for team_name, product in PRODUCT_NAMES.items():
            matches = by_name.get(team_name)
            if not matches:
                missing.append(team_name)
                continue
            for team in matches:
                if team.product_name == product:
                    unchanged.append(team.name)
                    continue
                if not dry_run:
                    team.product_name = product
                applied.append(f"{team.name} (id {team.id}) -> {product}")

        if not dry_run:
            db.commit()
        else:
            db.rollback()

        print(f"teams in database: {len(teams)}")
        print(f"product names supplied: {len(PRODUCT_NAMES)}")
        print(f"updated: {len(applied)}")
        for line in applied:
            print(f"  + {line}")
        print(f"already set: {len(unchanged)}")
        print(f"no matching team: {len(missing)}")
        for name in missing:
            print(f"  ! no team named {name!r} - left unset")
        if not dry_run:
            unset = sorted(
                {t.name for t in teams if not t.product_name}
            )
            print(f"teams with no product name: {len(unset)}")
            for name in unset:
                print(f"  - {name}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
