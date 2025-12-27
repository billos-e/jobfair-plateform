# PLAN DE DÉVELOPPEMENT - JOBFAIR PLATFORM

## Architecture Générale

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│            React 18 + Vite + TailwindCSS                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │            │
│  │   Étudiant  │  │  Entreprise │  │    Admin    │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                │                │                    │
│  ┌──────┴────────────────┴────────────────┴──────┐            │
│  │    API Client (Axios) + WebSocket Client      │            │
│  └──────────────────────┬────────────────────────┘            │
└─────────────────────────┼────────────────────────────────────────┘
                          │ HTTP/REST + WebSocket (wss://)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│           Django 5 + DRF + Django Channels                       │
│  ┌─────────────────────────────────────────────────────┐        │
│  │    API REST (DRF ViewSets + Serializers)            │        │
│  │    • /api/auth/           • /api/students/          │        │
│  │    • /api/companies/      • /api/queues/            │        │
│  └─────────────────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────────────────┐        │
│  │    WebSocket Consumers (Django Channels)            │        │
│  │    • Notifications • Queue updates • Status changes │        │
│  └─────────────────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────────────────┐        │
│  │    Business Logic (Services)                        │        │
│  │    • QueueService • NotificationService             │        │
│  └─────────────────────────────────────────────────────┘        │
└────────────────────┬──────────────────────┬─────────────────────┘
                     │                      │
                     ▼                      ▼
           ┌─────────────────┐    ┌─────────────────┐
           │   PostgreSQL    │    │     Redis       │
           │   (Database)    │    │ (Channel Layer) │
           └─────────────────┘    └─────────────────┘
```

---

## Organisation Backend

### Apps Django

| App | Responsabilité |
|-----|----------------|
| `core` | Settings, URLs, ASGI config, middlewares |
| `users` | Modèle User custom, authentification JWT |
| `students` | Modèle Student, endpoints étudiants |
| `companies` | Modèle Company, endpoints entreprises (token auth) |
| `queues` | Modèle Queue, inscriptions, logique de file |
| `notifications` | WebSocket consumers, broadcasting |

### Services Métier

| Service | Responsabilité |
|---------|----------------|
| `QueueService` | Calcul premier disponible, vérification slots, gestion positions |
| `NotificationService` | Déclenchement notifications, sélection destinataires |
| `StudentStatusService` | Transitions de statut, règles R5-R8 |
| `CompanyService` | Gestion pause/recrutement, régénération tokens |

### Structure API REST

| Endpoint | Méthodes | Auth | Description |
|----------|----------|------|-------------|
| `/api/auth/register/` | POST | - | Inscription étudiant |
| `/api/auth/login/` | POST | - | Login → JWT |
| `/api/auth/refresh/` | POST | JWT | Refresh token |
| `/api/students/me/` | GET, PATCH | JWT | Profil étudiant connecté |
| `/api/students/me/status/` | PATCH | JWT | Changer statut (available/paused) |
| `/api/companies/` | GET | JWT | Liste entreprises en recrutement |
| `/api/companies/{token}/` | GET | Token | Dashboard entreprise |
| `/api/companies/{token}/status/` | PATCH | Token | Pause/Reprendre |
| `/api/queues/` | GET, POST | JWT | Inscriptions étudiant |
| `/api/queues/{id}/start/` | POST | JWT | Commencer entretien |
| `/api/queues/{id}/complete/` | POST | Token | Marquer passé (entreprise) |
| `/api/admin/students/` | GET, POST, PATCH, DELETE | Admin | CRUD étudiants |
| `/api/admin/companies/` | GET, POST, PATCH, DELETE | Admin | CRUD entreprises |
| `/api/admin/companies/{id}/regenerate-token/` | POST | Admin | Régénérer token |
| `/api/admin/dashboard/` | GET | Admin | Stats globales |

---

## Organisation Frontend

### Structure Composants

```
src/
├── main.jsx
├── App.jsx
├── index.css                    # TailwindCSS + Design System
├── contexts/
│   ├── AuthContext.jsx          # JWT + user info
│   └── WebSocketContext.jsx     # Connexion WS + événements
├── hooks/
│   ├── useAuth.js
│   ├── useWebSocket.js
│   └── useNotifications.js
├── services/
│   ├── api.js                   # Axios instance + interceptors
│   └── websocket.js             # WebSocket client
├── components/
│   ├── ui/                      # Design System
│   │   ├── Button.jsx
│   │   ├── Badge.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── Toast.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   ├── student/
│   │   ├── QueueCard.jsx
│   │   ├── OpportunityCard.jsx
│   │   └── StatusBadge.jsx
│   ├── company/
│   │   ├── StudentListItem.jsx
│   │   ├── InterviewSection.jsx
│   │   └── PauseToggle.jsx
│   └── admin/
│       ├── AlertCard.jsx
│       ├── StatsCard.jsx
│       └── EntityTable.jsx
└── pages/
    ├── auth/
    │   ├── Login.jsx
    │   └── Register.jsx
    ├── student/
    │   ├── Dashboard.jsx
    │   ├── Interview.jsx
    │   ├── Paused.jsx
    │   └── Companies.jsx
    ├── company/
    │   └── Dashboard.jsx
    └── admin/
        ├── Dashboard.jsx
        ├── Students.jsx
        └── Companies.jsx
```

### Gestion d'État

| Contexte | Données | Usage |
|----------|---------|-------|
| `AuthContext` | User, JWT tokens, login/logout | Auth globale |
| `WebSocketContext` | Connexion WS, dispatch events | Temps réel |
| **React Query** | Données API (companies, queues) | Cache + refetch |

---

## Phases de Développement

### Phase 1 : Backend Fondations
**Objectif** : Modèles de données, migrations, admin Django

**Livrables** :
- [ ] Projet Django initialisé (core, settings)
- [ ] App `users` : Modèle User custom avec role
- [ ] App `students` : Modèle Student
- [ ] App `companies` : Modèle Company avec token auto
- [ ] App `queues` : Modèle Queue avec contraintes
- [ ] Migrations appliquées
- [ ] Django Admin configuré

**Validation** : 
- `python manage.py check` sans erreurs
- Créer entités via admin Django
- Contraintes DB (unicité, FK) fonctionnelles

---

### Phase 2 : Backend API REST
**Objectif** : Endpoints CRUD, authentification JWT + token entreprise

**Livrables** :
- [ ] Auth JWT (register, login, refresh)
- [ ] Endpoints étudiants (profil, statut)
- [ ] Endpoints entreprises (par token)
- [ ] Endpoints queues (inscription, liste)
- [ ] Permissions granulaires (IsStudent, IsCompany, IsAdmin)
- [ ] Serializers avec validation

**Validation** :
- Tests API avec Postman/curl
- Permissions bloquent accès non autorisé
- Validation des entrées côté serveur

---

### Phase 3 : Backend Business Logic
**Objectif** : Règles métier R1-R20, services dédiés

**Livrables** :
- [ ] `QueueService` : calcul premier disponible, vérification slots
- [ ] `NotificationService` : trigger notifications
- [ ] Endpoint `/queues/{id}/start/` : commence entretien (R10)
- [ ] Endpoint `/queues/{id}/complete/` : marque passé (R6, R7, R12)
- [ ] Transitions de statut étudiant (R5, R8)
- [ ] Gestion pause entreprise (R17-R20)

**Validation** :
- Tests unitaires pour chaque règle métier
- Scénarios de race condition gérés
- Comportement pause/reprise correct

---

### Phase 4 : Backend Temps Réel
**Objectif** : WebSocket consumers, broadcasting

**Livrables** :
- [ ] Django Channels configuré (ASGI, Redis)
- [ ] Consumer `NotificationConsumer`
- [ ] Groupes WebSocket (student_{id}, company_{token}, admin)
- [ ] Broadcast sur : changement statut, inscription, marquage passé
- [ ] Reconnexion automatique

**Validation** :
- Test avec 2 clients simultanés
- Notifications reçues en <1s
- Pas de perte de messages

---

### Phase 5 : Frontend Structure
**Objectif** : Setup React, routing, auth context

**Livrables** :
- [ ] Projet Vite+React initialisé
- [ ] TailwindCSS configuré
- [ ] React Router : routes étudiants, entreprises, admin
- [ ] AuthContext : JWT storage, login/logout
- [ ] API client Axios avec interceptors
- [ ] Protection des routes (PrivateRoute)

**Validation** :
- Login/logout fonctionnel
- Redirection selon rôle
- Token renouvellement automatique

---

### Phase 6 : Frontend Design System
**Objectif** : Composants UI réutilisables selon P2 section 2

**Livrables** :
- [ ] Palette couleurs (CSS variables)
- [ ] Composant `Button` (primary, success, ghost, danger)
- [ ] Composant `Badge` (disponible, en entretien, pause, passé)
- [ ] Composant `Card` (standard, notification, section)
- [ ] Composant `Input`, `Toast`
- [ ] Typo Inter + hiérarchie

**Validation** :
- Storybook ou page de démo
- Respect des specs P2 (couleurs, padding, radius)

---

### Phase 7 : Frontend Dashboards
**Objectif** : 3 dashboards fonctionnels (wireframes P1 section 4)

**Livrables** :
- [ ] Dashboard Étudiant (opportunités, inscriptions, historique)
- [ ] Page "En entretien" et "En pause" étudiant
- [ ] Dashboard Entreprise (3 sections: en entretien, à venir, passés)
- [ ] Dashboard Admin (stats, alertes, recherche)
- [ ] Pages CRUD admin (étudiants, entreprises)

**Validation** :
- Wireframes respectés
- Responsive (mobile étudiant, desktop entreprise/admin)
- États vides gérés

---

### Phase 8 : Intégration Temps Réel
**Objectif** : WebSocket React, mises à jour auto

**Livrables** :
- [ ] WebSocketContext : connexion, déconnexion, events
- [ ] Listeners pour notifications, queue updates, status changes
- [ ] Invalidation React Query sur événements
- [ ] Toast notifications temps réel
- [ ] Indicateur connexion perdue + reconnexion

**Validation** :
- Test multi-clients (1 étudiant + 1 entreprise)
- Marquage "passé" → notification instantanée
- Reconnexion automatique

---

## Ordre de Priorité

1. **Phase 1-3** (Backend fondations + API + règles métier) : Priorité absolue
2. **Phase 4** (Temps réel) : Critique pour le MVP
3. **Phase 5-6** (Frontend base + design) : Parallélisable avec backend
4. **Phase 7** (Dashboards) : Core de l'UX
5. **Phase 8** (Intégration temps réel) : Finalisation

---

## Décisions Architecturales Initiales

### DEC-001 : Structure Apps Django
- **Décision** : Une app par entité métier (users, students, companies, queues) + notifications
- **Justification** : Séparation des responsabilités, facilite tests et maintenance

### DEC-002 : Business Logic dans Services
- **Décision** : Logique métier dans des classes Service, pas dans les Views
- **Justification** : Views restent minces, règles métier testables isolément, réutilisables

### DEC-003 : Token Entreprise dans URL
- **Décision** : `/company/{token}/` plutôt qu'auth header
- **Justification** : Cohérent avec specs (lien unique partageable), pas de login requis

### DEC-004 : React Query pour Cache API
- **Décision** : Utiliser TanStack Query plutôt que Redux
- **Justification** : Cache intelligent, invalidation facile, moins de boilerplate

### DEC-005 : JWT dans localStorage
- **Décision** : Stocker access token dans localStorage (pas httpOnly cookie)
- **Justification** : Permettre accès token pour WebSocket auth (limitation technique)
- **Mitigation** : Refresh token court (24h), validation serveur stricte

---

**Document créé** : 2024-12-26  
**Dernière mise à jour** : 2024-12-26
