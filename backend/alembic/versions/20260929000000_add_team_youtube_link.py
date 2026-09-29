"""add team youtube link

Revision ID: 20260929000000
Revises: 20260928000000
Create Date: 2026-09-29 05:10:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260929000000"
down_revision = "20260928000000"
branch_labels = None
depends_on = None


def upgrade():
    # Nullable: not every team has submitted a demo video.
    op.add_column(
        "teams",
        sa.Column("youtube_url", sa.String(), nullable=True),
    )


def downgrade():
    op.drop_column("teams", "youtube_url")
