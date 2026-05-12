"""0005 — Données démo enrichies : mentors réels, classes premium, communauté vivante."""

from alembic import op

revision = "0005c"
down_revision = "0004c"
branch_labels = None
depends_on = None


SEED_SQL = r"""
-- ── Skills supplémentaires ────────────────────────────────────────────────
INSERT INTO skill (id, slug, name, description, category, popularity_score) VALUES
  ('11111111-0001-0000-0000-000000000006', 'product-management', 'Product Management',
   'Piloter une roadmap produit, prioriser les features, travailler avec une équipe dev.', 'business', 82),
  ('11111111-0001-0000-0000-000000000007', 'growth-hacking', 'Growth Hacking',
   'Acquisition, rétention, viral loops — faire croître un SaaS de 0 à traction.', 'business', 78),
  ('11111111-0001-0000-0000-000000000008', 'copywriting', 'Copywriting',
   'Écrire pour convertir : emails, landing pages, cold outreach B2B.', 'business', 71),
  ('11111111-0001-0000-0000-000000000009', 'negotiation', 'Negotiation',
   'Négocier term sheets, contrats clients, salaires — techniques et posture.', 'soft', 68)
ON CONFLICT (id) DO NOTHING;

-- ── Nouveaux mentors ──────────────────────────────────────────────────────
INSERT INTO mentor_profile (
  id, user_id, slug, display_name, headline, bio, avatar_url,
  status, aggregate_rating, rating_count, classes_given_count
) VALUES
(
  'ee111111-2222-4111-8111-111111111111',
  'ee111111-2222-0000-0000-111111111111',
  'laure-dupont',
  'Laure Dupont',
  'UX Design & Product Strategy',
  'Ex-designer Spotify puis Doctolib, je forme les créatifs nomades à concevoir des interfaces SaaS qui convertissent. Basée à Lisbonne depuis 2023, je travaille avec des équipes early-stage en Europe et Amérique latine.',
  'https://i.pravatar.cc/300?u=laure-dupont-mira',
  'active', 4.93, 34, 6
),
(
  'ee111111-3333-4111-8111-111111111111',
  'ee111111-3333-0000-0000-111111111111',
  'thomas-remy',
  'Thomas Rémy',
  'Growth B2B & Revenue Strategy',
  'Ancien Head of Growth chez Alan et Pennylane. J''aide les founders B2B SaaS à structurer leur go-to-market de zéro jusqu''aux premiers 100k MRR. Mes méthodes sont pragmatiques, mes frameworks sont testés en prod.',
  'https://i.pravatar.cc/300?u=thomas-remy-mira',
  'active', 4.87, 21, 4
),
(
  'ee111111-4444-4111-8111-111111111111',
  'ee111111-4444-0000-0000-111111111111',
  'camille-vidal',
  'Camille Vidal',
  'Business Model & Lean Startup',
  'Facilitatrice Lean Canvas certifiée, j''ai accompagné +60 startups early-stage à Barcelone, Lisbonne et Dubaï. Ancienne program manager à Station F, je sais identifier en 20 min les hypothèses critiques d''un projet.',
  'https://i.pravatar.cc/300?u=camille-vidal-mira',
  'active', 4.78, 18, 5
);

-- ── Mise à jour Samuel Martin (photo + bio) ───────────────────────────────
UPDATE mentor_profile SET
  avatar_url     = 'https://i.pravatar.cc/300?u=samuel-martin-mira',
  bio            = 'Fondateur et ex-CTO, j''ai levé 3M€ en seed. Depuis 2019, j''accompagne des entrepreneurs tech à pitcher face aux VCs européens — +40 pitches coachés avec closing réussi. Je crois au storytelling financier avant les deck Figma.',
  headline       = 'Pitch Investor & Fundraising',
  aggregate_rating = 4.91,
  rating_count   = 47,
  classes_given_count = 8
WHERE id = 'ee111111-1111-1111-1111-111111111111';

-- ── Classes Laure Dupont ──────────────────────────────────────────────────
INSERT INTO mira_class (
  id, mentor_user_id, title, slug, description, skills_taught,
  total_hours_collective, total_hours_individual, total_hours,
  format_envisaged, delivery_language,
  recommended_price_per_hour_collective_cents,
  recommended_price_per_hour_individual_cents,
  rythm_pattern, target_cities, status, published_at, ai_assisted
) VALUES
(
  'cc444444-1111-4444-8444-111111111111',
  'ee111111-2222-0000-0000-111111111111',
  'UX Design pour SaaS — de Figma au produit',
  'ux-design-saas',
  'Maîtrisez les fondamentaux du design de produit SaaS : research utilisateur, wireframing, prototypage Figma et handoff dev. 6 semaines en format hybride avec projets réels sur des apps nomads. À l''issue du programme, vous livrez un case study complet prêt pour votre portfolio.',
  '["11111111-0001-0000-0000-000000000003", "11111111-0001-0000-0000-000000000006"]'::jsonb,
  16, 8, 24, 'virtual', 'fr', 2800, 5500,
  'biweekly_session',
  '["Lisbon", "Paris", "Remote"]'::jsonb,
  'published', NOW(), FALSE
);

-- ── Classes Thomas Rémy ───────────────────────────────────────────────────
INSERT INTO mira_class (
  id, mentor_user_id, title, slug, description, skills_taught,
  total_hours_collective, total_hours_individual, total_hours,
  format_envisaged, delivery_language,
  recommended_price_per_hour_collective_cents,
  recommended_price_per_hour_individual_cents,
  rythm_pattern, target_cities, status, published_at, ai_assisted
) VALUES
(
  'cc444444-2222-4444-8444-222222222222',
  'ee111111-3333-0000-0000-111111111111',
  'Growth B2B — de 0 à 100k MRR',
  'growth-b2b-100k-mrr',
  'Programme intensif de 5 semaines pour founders B2B SaaS. Cold outreach, LinkedIn selling, pricing stratégique et premières démos qualifiées. Vous repartez avec un playbook GTM opérationnel et vos 10 premiers leads chauds.',
  '["11111111-0001-0000-0000-000000000007", "11111111-0001-0000-0000-000000000008"]'::jsonb,
  12, 8, 20, 'both', 'fr', 4200, 7500,
  'intensive_weekend',
  '["Barcelona", "Lisbon", "Remote"]'::jsonb,
  'published', NOW(), FALSE
);

-- ── Classes Camille Vidal ─────────────────────────────────────────────────
INSERT INTO mira_class (
  id, mentor_user_id, title, slug, description, skills_taught,
  total_hours_collective, total_hours_individual, total_hours,
  format_envisaged, delivery_language,
  recommended_price_per_hour_collective_cents,
  recommended_price_per_hour_individual_cents,
  rythm_pattern, target_cities, status, published_at, ai_assisted
) VALUES
(
  'cc444444-3333-4444-8444-333333333333',
  'ee111111-4444-0000-0000-111111111111',
  'Lean Canvas & Business Model Design',
  'lean-canvas-workshop',
  'Workshop intensif de 3 jours pour valider votre business model avant de lever. Méthode Lean Canvas + interviews clients structurées + itération rapide en groupe. Idéal pre-seed ou pivot. Vous repartez avec un canvas validé et 10 insights clients réels.',
  '["11111111-0001-0000-0000-000000000004", "11111111-0001-0000-0000-000000000006"]'::jsonb,
  12, 4, 16, 'physical', 'fr', 3500, 6000,
  'intensive_weekend',
  '["Lisbon", "Barcelona", "Paris"]'::jsonb,
  'published', NOW(), FALSE
);

-- ── Classes Samuel Martin (enrichies) ────────────────────────────────────
INSERT INTO mira_class (
  id, mentor_user_id, title, slug, description, skills_taught,
  total_hours_collective, total_hours_individual, total_hours,
  format_envisaged, delivery_language,
  recommended_price_per_hour_collective_cents,
  recommended_price_per_hour_individual_cents,
  rythm_pattern, target_cities, status, published_at, ai_assisted
) VALUES
(
  'cc444444-4444-4444-8444-444444444444',
  'ee222222-2222-2222-2222-222222222222',
  'Public Speaking & Storytelling',
  'public-speaking-storytelling',
  'Prenez la parole avec impact : TEDx, démos produit, keynotes investisseurs. 4 semaines de travail sur votre présence, votre voix et votre structure narrative. Chaque session est filmée — vous mesurez vos progrès semaine après semaine.',
  '["11111111-0001-0000-0000-000000000005", "11111111-0001-0000-0000-000000000001"]'::jsonb,
  10, 6, 16, 'both', 'fr', 3800, 6500,
  'weekly_session',
  '["Paris", "Lisbon"]'::jsonb,
  'published', NOW(), FALSE
);

-- ── Mise à jour classes existantes Samuel Martin ──────────────────────────
UPDATE mira_class SET
  recommended_price_per_hour_collective_cents = 4500,
  recommended_price_per_hour_individual_cents = 8000,
  rythm_pattern    = 'intensive_weekend',
  target_cities    = '["Lisbon", "Barcelona", "Paris"]'::jsonb,
  description      = 'Le programme de référence pour préparer vos pitches investisseurs. Structure de deck, storytelling financier, simulation de Q&A avec vrais VCs. Vous repartez avec un deck révisé et une proposition de valeur affûtée. 24h de formation sur 2 weekends.'
WHERE id = 'cc111111-1111-1111-1111-111111111111';

UPDATE mira_class SET
  recommended_price_per_hour_collective_cents = 3200,
  recommended_price_per_hour_individual_cents = 6000,
  rythm_pattern    = 'intensive_weekend',
  target_cities    = '["Remote", "Lisbon", "Paris"]'::jsonb,
  description      = 'Deep dive sur la levée de fonds early-stage : term sheets, valorisation pre-money, due diligence côté fondateur, closing et relations post-investissement. Format bootcamp remote intensif de 3 jours.'
WHERE id = 'cc222222-2222-2222-2222-222222222222';

-- ── Modules — UX Design SaaS ──────────────────────────────────────────────
INSERT INTO mira_class_module (class_id, position, title, summary) VALUES
('cc444444-1111-4444-8444-111111111111', 1, 'User Research & Problem Definition',
 'Interviews utilisateurs, synthesis des insights, problem statement validé'),
('cc444444-1111-4444-8444-111111111111', 2, 'Information Architecture & Wireframing',
 'User flows, IA, wireframes basse fidélité sur Figma'),
('cc444444-1111-4444-8444-111111111111', 3, 'Design System & Composants',
 'Tokens de design, bibliothèque de composants, design system partagé'),
('cc444444-1111-4444-8444-111111111111', 4, 'Prototypage & Tests Utilisateurs',
 'Prototype haute fidélité, sessions de test et itération finale');

-- ── Modules — Growth B2B ──────────────────────────────────────────────────
INSERT INTO mira_class_module (class_id, position, title, summary) VALUES
('cc444444-2222-4444-8444-222222222222', 1, 'ICP & Segmentation Marché',
 'Définir le profil client idéal et prioriser les segments à fort potentiel'),
('cc444444-2222-4444-8444-222222222222', 2, 'Cold Outreach & Copywriting',
 'Séquences emails multi-touch, LinkedIn selling, scripts d''appels de qualification'),
('cc444444-2222-4444-8444-222222222222', 3, 'Demo SaaS & Closing',
 'Structure de démo orientée valeur, gestion des objections, techniques de closing');

-- ── Modules — Lean Canvas ─────────────────────────────────────────────────
INSERT INTO mira_class_module (class_id, position, title, summary) VALUES
('cc444444-3333-4444-8444-333333333333', 1, 'Lean Canvas Sprint',
 'Remplir et itérer votre canvas collectivement en 4h chrono'),
('cc444444-3333-4444-8444-333333333333', 2, 'Customer Discovery',
 '10 interviews clients en 2 jours avec grille de validation structurée'),
('cc444444-3333-4444-8444-333333333333', 3, 'Pivot ou Persévérer',
 'Décision basée sur données, ajustement du canvas et roadmap suivante');

-- ── Modules — Public Speaking ─────────────────────────────────────────────
INSERT INTO mira_class_module (class_id, position, title, summary) VALUES
('cc444444-4444-4444-8444-444444444444', 1, 'Présence physique & voix',
 'Exercices de posture, respiration, ancrage — fondations de l''impact oral'),
('cc444444-4444-4444-8444-444444444444', 2, 'Structure narrative — SCR & Pyramide',
 'Situation / Complication / Résolution — storytelling investisseur et keynote'),
('cc444444-4444-4444-8444-444444444444', 3, 'Répétitions filmées & debrief',
 'Sessions enregistrées avec analyse feedback — progression mesurable garantie');

-- ── Modules enrichis — classes Samuel existantes ──────────────────────────
INSERT INTO mira_class_module (class_id, position, title, summary) VALUES
('cc111111-1111-1111-1111-111111111111', 3, 'Financial Storytelling',
 'Projections, unit economics, narration financière convaincante pour VCs'),
('cc222222-2222-2222-2222-222222222222', 3, 'Due Diligence Founders',
 'Data room, legal basics, cap table et relations avec les investisseurs post-closing');

-- ── Sessions — UX Design SaaS ────────────────────────────────────────────
INSERT INTO mira_class_session (class_id, title, starts_at, spots_available, format_envisaged) VALUES
('cc444444-1111-4444-8444-111111111111',
 'UX SaaS — cohorte Remote Juillet 2026', NOW() + INTERVAL '55 days', 15, 'virtual'),
('cc444444-1111-4444-8444-111111111111',
 'UX SaaS — cohorte Lisbonne Septembre 2026', NOW() + INTERVAL '115 days', 10, 'virtual');

-- ── Sessions — Growth B2B ─────────────────────────────────────────────────
INSERT INTO mira_class_session (class_id, title, starts_at, spots_available, format_envisaged) VALUES
('cc444444-2222-4444-8444-222222222222',
 'Growth B2B — Weekend Barcelone Juin 2026', NOW() + INTERVAL '30 days', 12, 'both'),
('cc444444-2222-4444-8444-222222222222',
 'Growth B2B — Remote Août 2026', NOW() + INTERVAL '80 days', 20, 'virtual');

-- ── Sessions — Lean Canvas ────────────────────────────────────────────────
INSERT INTO mira_class_session (class_id, title, starts_at, spots_available, format_envisaged) VALUES
('cc444444-3333-4444-8444-333333333333',
 'Lean Canvas — Lisbonne Juin 2026', NOW() + INTERVAL '20 days', 8, 'physical'),
('cc444444-3333-4444-8444-333333333333',
 'Lean Canvas — Paris Juillet 2026', NOW() + INTERVAL '65 days', 10, 'physical');

-- ── Sessions — Public Speaking ────────────────────────────────────────────
INSERT INTO mira_class_session (class_id, title, starts_at, spots_available, format_envisaged) VALUES
('cc444444-4444-4444-8444-444444444444',
 'Public Speaking — Paris Mai 2026', NOW() + INTERVAL '15 days', 8, 'both'),
('cc444444-4444-4444-8444-444444444444',
 'Public Speaking — Lisbonne Septembre 2026', NOW() + INTERVAL '120 days', 10, 'both');

-- ── Communauté élargie ────────────────────────────────────────────────────
INSERT INTO student_profile (
  id, user_id, display_name, headline, bio, avatar_url,
  learning_horizon, preferred_destinations,
  current_country, community_visibility
) VALUES
(
  '55555555-0002-0000-0000-000000000002',
  '55555555-0002-0000-0000-000000000001',
  'Sophie Chen',
  'Product Designer freelance — ex-Figma',
  'Je conçois des interfaces pour des apps fintech depuis Shanghai. En transition vers le nomadisme, je cible Paris et Berlin pour 2026. Je me forme sur Figma avancé et product management.',
  'https://i.pravatar.cc/300?u=sophie-chen-mira',
  '6_months',
  '["Paris", "Berlin"]'::jsonb,
  'CN', 'public'
),
(
  '55555555-0003-0000-0000-000000000003',
  '55555555-0003-0000-0000-000000000001',
  'Marc Lefebvre',
  'Founder SaaS RH — pré-seed',
  'Je bootstrappe un SaaS RH pour PME depuis Lisbonne. Ancien DRH reconverti en founder, je cherche à affiner mon pitch et ma stratégie de levée seed pour Q3 2026.',
  'https://i.pravatar.cc/300?u=marc-lefebvre-mira',
  '3_months',
  '["Lisbon", "Barcelona"]'::jsonb,
  'PT', 'public'
),
(
  '55555555-0004-0000-0000-000000000004',
  '55555555-0004-0000-0000-000000000001',
  'Aicha Diallo',
  'Growth Marketer — SaaS EdTech',
  'Growth manager dans une startup EdTech dakaroise, je vise un poste Head of Growth à Paris ou Dubaï. Je me forme en copywriting B2B et growth hacking pour passer du marché africain au marché européen.',
  'https://i.pravatar.cc/300?u=aicha-diallo-mira',
  '6_months',
  '["Paris", "Dubai"]'::jsonb,
  'SN', 'public'
),
(
  '55555555-0005-0000-0000-000000000005',
  '55555555-0005-0000-0000-000000000001',
  'Julia Santos',
  'UX Researcher → Product Strategist',
  'Je mène des recherches utilisateurs pour des apps mobiles santé depuis São Paulo. Je cherche à me reconvertir en product strategy et à m''installer en Europe dès 2026.',
  'https://i.pravatar.cc/300?u=julia-santos-mira',
  '1_year',
  '["Lisbon", "Barcelona"]'::jsonb,
  'BR', 'public'
),
(
  '55555555-0006-0000-0000-000000000006',
  '55555555-0006-0000-0000-000000000001',
  'Kevin Park',
  'Dev Fullstack → Founder SaaS',
  'Développeur senior chez Kakao, je prépare mon passage au statut de founder en 2026. Je travaille mon pitch et mon lean canvas pour un SaaS B2B ciblant les PME japonaises.',
  'https://i.pravatar.cc/300?u=kevin-park-mira',
  '6_months',
  '["Tokyo", "Berlin", "Lisbon"]'::jsonb,
  'KR', 'public'
),
(
  '55555555-0007-0000-0000-000000000007',
  '55555555-0007-0000-0000-000000000001',
  'Fatima Zahra El Idrissi',
  'Avocate d''affaires → Legal Tech Founder',
  'Avocate spécialisée M&A à Casablanca, je lance une Legal Tech pour automatiser les due diligences. Je cible Paris et Genève pour ma première levée de fonds.',
  'https://i.pravatar.cc/300?u=fatima-zahra-mira',
  '6_months',
  '["Paris", "Geneva", "Dubai"]'::jsonb,
  'MA', 'public'
);

-- Mise à jour d''Anna Lopez (photo + headline)
UPDATE student_profile SET
  headline   = 'Designer UX en transition vers le SaaS',
  bio        = 'Je redesigne les onboardings SaaS depuis Lisbonne. Cible : lever des fonds pour mon produit de gestion freelance. J''ai quitté Madrid il y a 18 mois — le nomadisme a changé ma façon de travailler.',
  avatar_url = 'https://i.pravatar.cc/300?u=anna-lopez-mira'
WHERE id = '55555555-0001-0000-0000-000000000001';
"""


def _split_statements(sql: str) -> list[str]:
    import re
    sql = re.sub(r"--[^\n]*", "", sql)
    return [p.strip() for p in sql.split(";") if p.strip()]


def upgrade() -> None:
    for stmt in _split_statements(SEED_SQL):
        op.execute(stmt)


DOWNGRADE_SQL = r"""
DELETE FROM mira_class_session WHERE class_id IN (
  'cc444444-1111-4444-8444-111111111111',
  'cc444444-2222-4444-8444-222222222222',
  'cc444444-3333-4444-8444-333333333333',
  'cc444444-4444-4444-8444-444444444444'
);
DELETE FROM mira_class_module WHERE class_id IN (
  'cc444444-1111-4444-8444-111111111111',
  'cc444444-2222-4444-8444-222222222222',
  'cc444444-3333-4444-8444-333333333333',
  'cc444444-4444-4444-8444-444444444444'
);
DELETE FROM mira_class WHERE id IN (
  'cc444444-1111-4444-8444-111111111111',
  'cc444444-2222-4444-8444-222222222222',
  'cc444444-3333-4444-8444-333333333333',
  'cc444444-4444-4444-8444-444444444444'
);
DELETE FROM mentor_profile WHERE id IN (
  'ee111111-2222-4111-8111-111111111111',
  'ee111111-3333-4111-8111-111111111111',
  'ee111111-4444-4111-8111-111111111111'
);
DELETE FROM student_profile WHERE id IN (
  '55555555-0002-0000-0000-000000000002',
  '55555555-0003-0000-0000-000000000003',
  '55555555-0004-0000-0000-000000000004',
  '55555555-0005-0000-0000-000000000005',
  '55555555-0006-0000-0000-000000000006',
  '55555555-0007-0000-0000-000000000007'
);
DELETE FROM skill WHERE id IN (
  '11111111-0001-0000-0000-000000000006',
  '11111111-0001-0000-0000-000000000007',
  '11111111-0001-0000-0000-000000000008',
  '11111111-0001-0000-0000-000000000009'
);
"""


def downgrade() -> None:
    for stmt in _split_statements(DOWNGRADE_SQL):
        op.execute(stmt)
