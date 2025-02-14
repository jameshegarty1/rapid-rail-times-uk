"""empty message

Revision ID: 76cae7ac0169
Revises: e67986ce4e2e
Create Date: 2025-01-12 21:51:12.204665

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '76cae7ac0169'
down_revision = 'e67986ce4e2e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('known_services', sa.Column('operator', sa.String(), nullable=True))
    op.add_column('known_services', sa.Column('coaches', sa.Integer(), nullable=True))
    op.alter_column('known_services', 'scheduled_departure',
               existing_type=postgresql.TIME(),
               type_=sa.String(length=5),
               existing_nullable=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('known_services', 'scheduled_departure',
               existing_type=sa.String(length=5),
               type_=postgresql.TIME(),
               existing_nullable=False)
    op.drop_column('known_services', 'coaches')
    op.drop_column('known_services', 'operator')
    # ### end Alembic commands ###
