"""add team product name

Revision ID: 20260928000000
Revises: 7852181720f5
Create Date: 2026-09-28 22:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260928000000"
down_revision = "7852181720f5"
branch_labels = None
depends_on = None


def upgrade():
    # Nullable so existing teams keep working and the SQLite batch path can
    # rebuild the table without a server default.
    op.add_column(
        "teams",
        sa.Column("product_name", sa.String(), nullable=True),
    )


def downgrade():
    op.drop_column("teams", "product_name")
