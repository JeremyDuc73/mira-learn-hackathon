"""0004 — Alignement brief : slug/langue classe, modules, sessions, profil communautaire.

Colonnes annexes lecture catalogue + opt-in communauté (pas de modification des 0001/0002 livrées).
"""

from alembic import op

revision = "0004c"
down_revision = "0003c"
branch_labels = None
depends_on = None


SCHEMA_SQL = r"""
ALTER TABLE student_profile ADD COLUMN IF NOT EXISTS current_country VARCHAR(128);
ALTER TABLE student_profile ADD COLUMN IF NOT EXISTS community_visibility VARCHAR(16) NOT NULL DEFAULT 'private';
ALTER TABLE student_profile DROP CONSTRAINT IF EXISTS chk_student_profile_community_visibility;
ALTER TABLE student_profile ADD CONSTRAINT chk_student_profile_community_visibility
    CHECK (community_visibility IN ('private', 'public'));

ALTER TABLE mira_class ADD COLUMN IF NOT EXISTS slug VARCHAR(130);
ALTER TABLE mira_class ADD COLUMN IF NOT EXISTS delivery_language VARCHAR(16) NOT NULL DEFAULT 'fr';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_mira_class_slug_not_deleted
    ON mira_class (slug) WHERE deleted_at IS NULL AND slug IS NOT NULL;

UPDATE mira_class SET slug = 'pitch-intensif-demo', delivery_language = 'fr'
    WHERE id = 'cc111111-1111-1111-1111-111111111111';

UPDATE mira_class SET slug = 'funding-bootcamp-demo', delivery_language = 'fr'
    WHERE id = 'cc222222-2222-2222-2222-222222222222';

CREATE TABLE mira_class_module (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES mira_class (id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1),
    title VARCHAR(200) NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (class_id, position)
);

CREATE INDEX idx_mira_class_module_class_id ON mira_class_module (class_id);

CREATE TABLE mira_class_session (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES mira_class (id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL DEFAULT '',
    starts_at TIMESTAMP WITH TIME ZONE NULL,
    spots_available INTEGER NOT NULL DEFAULT 0 CHECK (spots_available >= 0),
    format_envisaged VARCHAR(16) NOT NULL DEFAULT 'both' CHECK (
        format_envisaged IN ('physical', 'virtual', 'both')
    ),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mira_class_session_class_id ON mira_class_session (class_id);

INSERT INTO mira_class_module (id, class_id, position, title, summary) VALUES
(
  'aaaaaaaa-aaaa-4aaa-8aaa-000000000001',
  'cc111111-1111-1111-1111-111111111111',
  1,
  'Story & structure',
  'Construire une narration startup claire'
),
(
  'bbbbbbbb-bbbb-4bbb-8bbb-000000000001',
  'cc111111-1111-1111-1111-111111111111',
  2,
  'Slides & présentation',
  'Slides investisseurs — design et rythme'
),
(
  'cccccccc-cccc-4ccc-8ccc-000000000001',
  'cc222222-2222-2222-2222-222222222222',
  1,
  'Venture jargon & due diligence',
  'Lexique VC et attentes lors des tours'
),
(
  'dddddddd-dddd-4ddd-8ddd-000000000001',
  'cc222222-2222-2222-2222-222222222222',
  2,
  'Negotiation baseline',
  'Term sheet — garde-fous essentiels'
);

INSERT INTO mira_class_session (id, class_id, title, starts_at, spots_available, format_envisaged) VALUES
(
  'eeeeeeee-eeee-4eee-8eee-000000000001',
  'cc111111-1111-1111-1111-111111111111',
  'Pitch intensif — cohorte Lisbonne (demo)',
  NOW() + INTERVAL '90 days',
  12,
  'both'
),
(
  'ffffffff-ffff-4fff-8fff-000000000001',
  'cc222222-2222-2222-2222-222222222222',
  'Funding bootcamp — remote cohort (demo)',
  NOW() + INTERVAL '45 days',
  20,
  'virtual'
);

UPDATE student_profile SET
    community_visibility = 'public',
    current_country = 'PT',
    preferred_destinations = '["Lisbon"]'::jsonb
WHERE id = '55555555-0001-0000-0000-000000000001';
"""


def _split_statements(sql: str) -> list[str]:
    import re

    sql = re.sub(r"--[^\n]*", "", sql)
    return [p.strip() for p in sql.split(";") if p.strip()]


def upgrade() -> None:
    for stmt in _split_statements(SCHEMA_SQL):
        op.execute(stmt)


DOWNGRADE_SQL = r"""
DELETE FROM mira_class_session WHERE id IN (
    'eeeeeeee-eeee-4eee-8eee-000000000001',
    'ffffffff-ffff-4fff-8fff-000000000001'
);
DELETE FROM mira_class_module WHERE id IN (
    'aaaaaaaa-aaaa-4aaa-8aaa-000000000001',
    'bbbbbbbb-bbbb-4bbb-8bbb-000000000001',
    'cccccccc-cccc-4ccc-8ccc-000000000001',
    'dddddddd-dddd-4ddd-8ddd-000000000001'
);
DROP INDEX IF EXISTS idx_mira_class_session_class_id;
DROP TABLE IF EXISTS mira_class_session;
DROP INDEX IF EXISTS idx_mira_class_module_class_id;
DROP TABLE IF EXISTS mira_class_module;
DROP INDEX IF EXISTS uniq_mira_class_slug_not_deleted;
ALTER TABLE mira_class DROP COLUMN IF EXISTS delivery_language;
ALTER TABLE mira_class DROP COLUMN IF EXISTS slug;

UPDATE student_profile SET
    community_visibility = 'private',
    current_country = NULL,
    preferred_destinations = '[]'::jsonb
WHERE id = '55555555-0001-0000-0000-000000000001';

ALTER TABLE student_profile DROP CONSTRAINT IF EXISTS chk_student_profile_community_visibility;
ALTER TABLE student_profile DROP COLUMN IF EXISTS community_visibility;
ALTER TABLE student_profile DROP COLUMN IF EXISTS current_country;
"""


def downgrade() -> None:
    for stmt in _split_statements(DOWNGRADE_SQL):
        op.execute(stmt)
