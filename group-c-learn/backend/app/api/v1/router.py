"""
Agrégation des routers v1.

MIGRATION HINT (post-hackathon) :
    Pattern conservé tel quel — chaque service backbone a son propre router agrégateur.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    catalog_learn,
    community,
    enrolment_intents,
    enrolments,
    example,
    health,
    learning_paths,
    skills_catalog,
    student_cv_imports,
    students,
)

router = APIRouter()

# Health checks (toujours en premier — utilisé par K8s liveness/readiness probes)
router.include_router(health.router, tags=["health"])

# Catalogue skills + relations (lecture publique)
router.include_router(skills_catalog.router, prefix="/skills", tags=["skills"])

# Catalogue classes + mentors (lecture publique)
router.include_router(
    catalog_learn.classes_router, prefix="/classes", tags=["classes-catalog"]
)
router.include_router(
    catalog_learn.mentors_router, prefix="/mentors", tags=["mentors-catalog"]
)

# Routes métier (1 inclusion par fichier endpoint)
# Apprenant nomad : profil + skills + parcours IA
router.include_router(students.router, prefix="/students", tags=["students"])
router.include_router(
    learning_paths.router, prefix="/students", tags=["learning-paths"]
)
router.include_router(
    enrolment_intents.router, prefix="/students", tags=["enrolment-intents"]
)
router.include_router(
    student_cv_imports.router, prefix="/students", tags=["cv-imports"]
)
router.include_router(enrolments.router, prefix="/enrolments", tags=["enrolments"])
router.include_router(community.router, prefix="/community", tags=["community"])
router.include_router(example.router, prefix="/examples", tags=["examples"])
