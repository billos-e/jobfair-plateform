# 🎯 Plateforme JobFair

Plateforme de gestion de files d'attente pour salons de l'emploi, permettant aux étudiants de s'inscrire aux entretiens avec les entreprises et de gérer leur passage en temps réel.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/billos-e/jobfair-plateform)

## 📋 Vue d'ensemble

Cette plateforme facilite l'organisation de salons de l'emploi en permettant :
- **Aux étudiants** : S'inscrire aux files d'attente des entreprises, suivre leur position et démarrer leurs entretiens
- **Aux entreprises** : Gérer leur file d'attente, appeler les candidats et marquer les entretiens terminés
- **Aux administrateurs** : Superviser l'ensemble de l'événement, gérer les étudiants et entreprises

## 🏗️ Architecture

```
┌─────────────────┐     REST API + WebSocket        ┌──────────────────┐
│                 │ ←─────────────────────────────→ │                  │
│   Frontend      │                                 │     Backend      │
│   (React)       │    JWT Auth / Company Token     │  (Django + DRF)  │
│                 │ ←─────────────────────────────→ │                  │
└─────────────────┘                                 └──────────────────┘
                                                             │
                                                             ↓
                                                    ┌──────────────────┐
                                                    │    Database      │
                                                    │  (SQLite / PG)   │
                                                    └──────────────────┘
```

### Stack Technique

**Backend**
- Django 5.0 (Framework Python)
- Django REST Framework (API REST)
- Django Channels (WebSocket temps réel)
- SQLite (développement) / PostgreSQL (production)
- Redis (Channel Layer pour WebSocket en production)
- JWT (authentification)

**Frontend**
- React 18
- Vite (build tool)
- React Router (navigation)
- TanStack Query (state management)
- Axios (HTTP client)
- TailwindCSS (styling)
- Lucide React (icons)

## 🚀 Quick Start

### Prérequis
- Python 3.10+
- Node.js 18+
- npm ou yarn

### Installation Backend

```bash
cd backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement (optionnel pour dev)
cp .env.example .env

# Migrer la base de données
python manage.py migrate

# Créer un superuser
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver 0.0.0.0:8000
```

### Installation Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'environnement (optionnel)
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Lancer le serveur de développement
npm run dev
```

Accéder à l'application : http://localhost:5173

## 📁 Structure du Projet

```
Jobfair Plateform/
│
├── backend/                 # Application Django
│   ├── core/               # Configuration principale
│   ├── users/              # Gestion des utilisateurs (JWT)
│   ├── students/           # Profils et statuts étudiants
│   ├── companies/          # Gestion des entreprises
│   ├── queues/             # Files d'attente et inscriptions
│   ├── notifications/      # WebSocket et notifications temps réel
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/               # Application React
│   ├── src/
│   │   ├── pages/         # Pages de l'application
│   │   │   ├── auth/      # Login, Register
│   │   │   ├── student/   # Dashboard étudiant
│   │   │   ├── company/   # Dashboard entreprise
│   │   │   └── admin/     # Panel admin
│   │   ├── components/    # Composants réutilisables
│   │   ├── contexts/      # Auth, WebSocket, Toast
│   │   ├── services/      # API clients
│   │   └── App.jsx
│   └── package.json
│
└── docs/                   # Documentation complémentaire
```

## 📚 Documentation Détaillée

- **[Architecture Complète](./ARCHITECTURE.md)** - Modèles de données, flux et règles métier
- **[Référence API](./API_REFERENCE.md)** - Documentation des endpoints REST
- **[Flux de Données](./DATA_FLOWS.md)** - Diagrammes des interactions
- **[Backend README](./backend/README.md)** - Guide détaillé backend
- **[Frontend README](./frontend/README.md)** - Guide détaillé frontend

## 🔑 Fonctionnalités Principales

### Pour les Étudiants
- ✅ Inscription aux files d'attente des entreprises
- ✅ Visualisation de leur position en temps réel
- ✅ Notification quand c'est leur tour
- ✅ Démarrage d'entretien (validation automatique des slots)
- ✅ Gestion de statut (disponible, en entretien, en pause)

### Pour les Entreprises
- ✅ Accès via token unique (pas de compte)
- ✅ Visualisation de la file d'attente
- ✅ Gestion des slots d'entretien simultanés
- ✅ Marquer les candidats comme "passés"
- ✅ Mise en pause du recrutement

### Pour les Administrateurs
- ✅ Gestion complète des étudiants et entreprises
- ✅ Vue d'ensemble en temps réel
- ✅ Modification des files d'attente
- ✅ Génération de tokens pour entreprises
- ✅ Statistiques et monitoring

## 🔐 Authentification

**Étudiants & Admins** : JWT (JSON Web Token)
- Login via email/password
- Access token (30 min) + Refresh token (1 jour)
- Auto-refresh automatique

**Entreprises** : Token unique dans l'URL
- Accès via `/company/{token}`
- Pas de compte utilisateur nécessaire
- Token régénérable par admin en cas de compromission

## 🔄 Temps Réel (WebSocket)

Notifications instantanées via Django Channels :
- Nouvel étudiant dans la file
- Étudiant prêt à démarrer
- Entretien terminé
- Changement de statut
- Mise à jour des positions

**Connexion WebSocket** : `ws://localhost:8000/ws/notifications/`

## 🗄️ Modèles de Données

### User
Compte utilisateur (étudiants et admins)
- `email` (unique)
- `role` : `student` | `admin`
- Authentification via JWT

### Student
Profil étudiant lié au User
- `first_name`, `last_name`
- `status` : `available` | `in_interview` | `paused`
- `current_company` (relation)

### Company
Entreprise participante
- `name`
- `access_token` (unique, pour accès dashboard)
- `status` : `recruiting` | `paused`
- `max_concurrent_interviews` (slots simultanés)

### Queue
Inscription d'un étudiant à une file
- `company` (relation)
- `student` (relation)
- `position` (ordre sacré, immutable)
- `is_completed` (marqué "passé")

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour les diagrammes détaillés.

## 🧪 Tests

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm run test  # À configurer si nécessaire
```

## 🚢 Déploiement

Voir les guides détaillés :
- [Backend Deployment](./backend/README.md#deployment)
- [Frontend Deployment](./frontend/README.md#deployment)

**Variables d'environnement** :
- Backend : `SECRET_KEY`, `DEBUG`, `DATABASE_URL`, `REDIS_URL`, `ALLOWED_HOSTS`
- Frontend : `VITE_API_URL`

## 📝 Règles Métier

Le système implémente plusieurs règles métier importantes :

- **R1** : Position dans la file sacrée (ordre d'inscription)
- **R2-R4** : Étudiants grisés conservent leur position
- **R5** : Seul l'étudiant peut se remettre disponible
- **R6-R8** : Completion automatique → statut "paused"
- **R9-R11** : Gestion des slots d'entretiens simultanés
- **R12** : Marquage "passé" libère immédiatement le slot

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour la liste complète.

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changes (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est propriétaire et destiné à un usage interne.

## 👥 Équipe

Développé pour la gestion des salons de l'emploi.

---

Pour toute question ou problème, consultez la [documentation détaillée](./docs/) ou contactez l'équipe de développement.
