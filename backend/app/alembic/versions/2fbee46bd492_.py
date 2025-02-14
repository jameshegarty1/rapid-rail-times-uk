"""empty message

Revision ID: 2fbee46bd492
Revises: d4eca04b25ba
Create Date: 2025-01-12 20:55:00.943865

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2fbee46bd492'
down_revision = 'd4eca04b25ba'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_service_updates_id', table_name='service_updates')
    op.drop_index('ix_service_updates_service_id', table_name='service_updates')
    op.drop_table('service_updates')
    op.add_column('known_services', sa.Column('service_id', sa.String(), nullable=False))
    op.drop_index('ix_known_services_service_id_pattern', table_name='known_services')
    op.create_index(op.f('ix_known_services_service_id'), 'known_services', ['service_id'], unique=True)
    op.drop_column('known_services', 'operator')
    op.drop_column('known_services', 'destination_station')
    op.drop_column('known_services', 'service_id_pattern')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('known_services', sa.Column('service_id_pattern', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.add_column('known_services', sa.Column('destination_station', sa.VARCHAR(length=3), autoincrement=False, nullable=False))
    op.add_column('known_services', sa.Column('operator', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.drop_index(op.f('ix_known_services_service_id'), table_name='known_services')
    op.create_index('ix_known_services_service_id_pattern', 'known_services', ['service_id_pattern'], unique=False)
    op.drop_column('known_services', 'service_id')
    op.create_table('service_updates',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('service_id', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('schedule_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('estimated_departure', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('platform', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('is_cancelled', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('delay_reason', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('cancel_reason', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('last_updated', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['schedule_id'], ['known_services.id'], name='service_updates_schedule_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='service_updates_pkey')
    )
    op.create_index('ix_service_updates_service_id', 'service_updates', ['service_id'], unique=False)
    op.create_index('ix_service_updates_id', 'service_updates', ['id'], unique=False)
    # ### end Alembic commands ###
