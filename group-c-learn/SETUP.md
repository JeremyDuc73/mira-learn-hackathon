# Lancer le projet — Groupe C

## Prérequis (à installer une seule fois)

| Outil | Lien |
|-------|------|
| Docker Desktop | https://www.docker.com/products/docker-desktop |
| Node.js 20+ | https://nodejs.org |
| Python 3.11+ | https://www.python.org/downloads |
| Git | https://git-scm.com |

---

## 1. Cloner le repo

### Mac / Linux
```bash
git clone https://github.com/JeremyDuc73/mira-learn-hackathon.git
cd mira-learn-hackathon/group-c-learn
```

### Windows (PowerShell)
```powershell
git clone https://github.com/JeremyDuc73/mira-learn-hackathon.git
cd mira-learn-hackathon\group-c-learn
```

---

## 2. Base de données (Docker)

> Docker Desktop doit être ouvert avant de lancer ces commandes.

### Mac / Linux
```bash
docker compose up -d
```

### Windows (PowerShell)
```powershell
docker compose up -d
```

La base de données tourne sur le port **5434**.

---

## 3. Backend (FastAPI)

### Mac / Linux
```bash
cd backend

# Créer l'environnement virtuel
python3 -m venv .venv
source .venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Copier le fichier d'environnement
cp .env.example .env

# Appliquer les migrations
alembic upgrade head

# Insérer les données de démo
python -m app.seed

# Lancer le serveur
uvicorn app.main:app --reload
```

### Windows (PowerShell)
```powershell
cd backend

# Créer l'environnement virtuel
python -m venv .venv
.venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Copier le fichier d'environnement
copy .env.example .env

# Appliquer les migrations
alembic upgrade head

# Insérer les données de démo
python -m app.seed

# Lancer le serveur (port 8000)
uvicorn app.main:app --reload
```

> **Windows — si le port 8000 est bloqué (erreur WinError 10013) :**
> ```powershell
> uvicorn app.main:app --reload --port 8001
> ```
> Dans ce cas, mettre `NEXT_PUBLIC_API_URL=http://localhost:8001` dans `web/.env.local` (étape 4).

Le backend tourne sur **http://localhost:8000**

---

## 4. Frontend (Next.js)

Ouvrir un **nouveau terminal** (garder le backend ouvert).

### Mac / Linux
```bash
cd web

# Créer le fichier d'environnement
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Installer les dépendances
npm install

# Lancer le serveur
npm run dev
```

### Windows (PowerShell)
```powershell
cd web

# Créer le fichier d'environnement
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Installer les dépendances
npm install

# Lancer le serveur
npm run dev
```

Le frontend tourne sur **http://localhost:3000**

---

## 5. Tester que tout fonctionne

1. Ouvrir http://localhost:3000
2. Aller sur http://localhost:3000/login et cliquer **"Continuer en démo"**
3. Tu es connectée en tant qu'Anna (compte de démo)
4. Tester : Catalogue → `/classes`, Profil → `/me`, Parcours → `/me/path`

---

## Résumé des ports

| Service | Port |
|---------|------|
| Frontend Next.js | 3000 |
| Backend FastAPI | 8000 |
| PostgreSQL (Docker) | 5434 |

---

## Problèmes fréquents

**`ModuleNotFoundError: No module named 'pydantic_core._pydantic_core'` (Windows)**
```powershell
# Supprimer et recréer le venv
rmdir /s /q .venv
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

**`Error loading ASGI app` (Windows)**
Vérifier que tu es bien dans le dossier `backend/` avant de lancer uvicorn.

**`alembic: command not found`**
Le venv n'est pas activé. Relancer `source .venv/bin/activate` (Mac) ou `.venv\Scripts\activate` (Windows).

**Docker ne démarre pas**
Ouvrir Docker Desktop et attendre qu'il soit complètement lancé avant de relancer `docker compose up -d`.
