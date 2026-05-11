# Démarrer le backend en local (groupe C)

Guide minimal. Pour le contexte du hackathon et la structure du projet, voir [`README.md`](./README.md) et [`../BRIEF.md`](../BRIEF.md).

## Prérequis

- Python 3.12+
- PostgreSQL joignable (souvent le conteneur du `docker-compose` du groupe ou une `DATABASE_URL` fournie).

## Étapes

1. **Configurer l’environnement**

   ```bash
   cd backend
   cp .env.example .env
   ```

   Renseigner dans `.env` au minimum : `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, et pour l’IA `OPENROUTER_API_KEY` (cf. README principal).

2. **Installer les dépendances**

   ```bash
   make install
   ```

   (ou équivalent : créer un venv, puis `pip install -r requirements-dev.txt`.)

3. **Migrer la base**

   ```bash
   make migrate
   ```

   Équivalent : `alembic upgrade head`.

4. **Lancer l’API**

   ```bash
   make dev
   ```

   Ou : `uvicorn main:app --reload --port 8000` (avec le venv activé).

OpenAPI : http://localhost:8000/docs

## Dépannage rapide

- **Connexion DB refusée** : vérifier que Postgres tourne (`docker compose up -d` à la racine du groupe selon votre setup) et que `DATABASE_URL` pointe au bon host/port.
- **Migrations bloquées** : s’assurer d’être sur la bonne base et à jour : `alembic current`, puis `alembic upgrade head`.
