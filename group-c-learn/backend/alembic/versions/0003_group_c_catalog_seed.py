"""0003 — seed catalogue (mentor_profile + mira_class publiées) pour phase 3

Données de démo cohérentes avec skill / student_profile des migrations 0001–0002.
"""
from alembic import op

revision = "0003c"
down_revision = "0002c"
branch_labels = None
depends_on = None


SEED_SQL = r"""
INSERT INTO mentor_profile (id, user_id, slug, display_name, headline, bio, status, aggregate_rating, rating_count, classes_given_count) VALUES (
  'ee111111-1111-1111-1111-111111111111',
  'ee222222-2222-2222-2222-222222222222',
  'samuel-demo-catalog',
  'Samuel Martin',
  'Pitch & stratégie de levée',
  'Bio démo catalogue — mentor synthétique.',
  'active',
  4.85,
  12,
  3
);

INSERT INTO mira_class (
  id,
  mentor_user_id,
  title,
  description,
  skills_taught,
  total_hours_collective,
  total_hours_individual,
  total_hours,
  format_envisaged,
  status,
  published_at,
  ai_assisted
) VALUES (
  'cc111111-1111-1111-1111-111111111111',
  'ee222222-2222-2222-2222-222222222222',
  'Pitch intensif demo',
  'Programme d''exemple pour tests catalogue (pitch + funding).',
  '["11111111-0001-0000-0000-000000000001", "11111111-0001-0000-0000-000000000002"]'::jsonb,
  12,
  12,
  24,
  'both',
  'published',
  NOW(),
  FALSE
);

INSERT INTO mira_class (
  id,
  mentor_user_id,
  title,
  description,
  skills_taught,
  total_hours_collective,
  total_hours_individual,
  total_hours,
  format_envisaged,
  status,
  published_at,
  ai_assisted
) VALUES (
  'cc222222-2222-2222-2222-222222222222',
  'ee222222-2222-2222-2222-222222222222',
  'Funding bootcamp demo',
  'Focus levée uniquement.',
  '["11111111-0001-0000-0000-000000000002"]'::jsonb,
  8,
  8,
  16,
  'virtual',
  'published',
  NOW(),
  FALSE
);

INSERT INTO mira_class (
  id,
  mentor_user_id,
  title,
  description,
  skills_taught,
  status,
  ai_assisted
) VALUES (
  'cc333333-3333-3333-3333-333333333333',
  'ee222222-2222-2222-2222-222222222222',
  'Classe draft cachée',
  'Ne doit pas apparaître dans GET /classes.',
  '[]'::jsonb,
  'draft',
  FALSE
);
"""


def _split_statements(sql: str) -> list[str]:
    import re

    sql = re.sub(r"--[^\n]*", "", sql)
    return [p.strip() for p in sql.split(";") if p.strip()]


def upgrade() -> None:
    for stmt in _split_statements(SEED_SQL):
        op.execute(stmt)


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM mira_class WHERE id IN (
          'cc111111-1111-1111-1111-111111111111',
          'cc222222-2222-2222-2222-222222222222',
          'cc333333-3333-3333-3333-333333333333'
        );
        DELETE FROM mentor_profile WHERE id = 'ee111111-1111-1111-1111-111111111111';
        """
    )
