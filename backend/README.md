# Backend - Plateforme JobFair

Backend Django de la plateforme de gestion de files d'attente pour salons de l'emploi.

## 🛠️ Technologies

- **Django 5.0** - Framework web Python
- **Django REST Framework** - API REST
- **Django Channels** - WebSocket temps réel
- **Simple JWT** - Authentification JWT
- **SQLite** (dev) / **PostgreSQL** (prod) - Base de données
- **Redis** (prod) - Channel Layer pour WebSocket
- **Python 3.10+**

## 📋 Prérequis

- Python 3.10 ou supérieur
- pip (gestionnaire de paquets Python)
- virtualenv (recommandé)
- Redis (optionnel, pour production)

## 🚀 Installation Locale

### 1. Cloner et naviguer vers le backend

```bash
cd backend
```

### 2. Créer un environnement virtuel

**Linux/Mac** :
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows** :
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Configuration (Optionnel)

Créer un fichier `.env` à la racine du dossier backend :

```env
# Sécurité
SECRET_KEY=votre-cle-secrete-django-ici-changez-moi
DEBUG=True

# Base de données (laisser vide pour SQLite par défaut)
DATABASE_URL=

# Redis Channel Layer (laisser vide pour InMemory en dev)
REDIS_URL=

# CORS (frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Allowed hosts
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Note** : En développement, ces variables ont des valeurs par défaut. Le fichier `.env` est optionnel.

### 5. Appliquer les migrations

```bash
python manage.py migrate
```

Cela créera la base de données SQLite (`db.sqlite3`) et toutes les tables.

### 6. Créer un superuser (admin)

```bash
python manage.py createsuperuser
```

Suivez les instructions :
- Email : votre-email@example.com
- Password : (saisir deux fois)

### 7. Lancer le serveur de développement

```bash
python manage.py runserver 0.0.0.0:8000
```

Le backend est accessible sur : **http://localhost:8000**

### 8. Vérifier l'installation

- API: http://localhost:8000/api/
- Admin Django: http://localhost:8000/admin/
- Health check: http://localhost:8000/health/

---

## 📁 Structure du Projet

```
backend/
│
├── core/                       # Configuration principale
│   ├── settings.py            # Settings Django
│   ├── urls.py                # URLs principales
│   ├── asgi.py                # Application ASGI (WebSocket)
│   ├── wsgi.py                # Application WSGI (HTTP)
│   ├── permissions.py         # Permissions custom
│   └── views.py               # Vues globales (dashboard admin)
│
├── users/                      # Gestion des utilisateurs
│   ├── models.py              # User model (JWT auth)
│   ├── serializers.py         # Serializers DRF
│   ├── views.py               # Auth endpoints
│   └── urls.py                # /api/auth/*
│
├── students/                   # Profils étudiants
│   ├── models.py              # Student model (status, queue)
│   ├── serializers.py         # Serializers
│   ├── views.py               # Student CRUD + status
│   └── urls.py                # /api/students/*
│
├── companies/                  # Gestion des entreprises
│   ├── models.py              # Company model (token, slots)
│   ├── serializers.py         # Serializers
│   ├── views.py               # Company CRUD + dashboard
│   └── urls.py                # /api/companies/*
│
├── queues/                     # Files d'attente
│   ├── models.py              # Queue model (inscriptions)
│   ├── serializers.py         # Serializers
│   ├── services.py            # QueueService (business logic)
│   ├── views.py               # Queue operations
│   ├── urls.py                # /api/queues/*
│   └── tests.py               # Tests unitaires
│
├── notifications/              # Notifications temps réel
│   ├── consumers.py           # WebSocket consumers
│   ├── services.py            # NotificationService
│   ├── middleware.py          # Auth middleware (JWT + Company)
│   ├── routing.py             # WebSocket routing
│   └── apps.py
│
├── manage.py                   # CLI Django
├── requirements.txt            # Dépendances Python
├── db.sqlite3                  # Base SQLite (généré)
└── .env.example               # Template variables d'env
```

---

## 🗄️ Modèles de Données

### User (users/models.py)
Compte utilisateur pour étudiants et admins.

**Champs** :
- `email` : EmailField unique (USERNAME_FIELD)
- `role` : `student` | `admin`
- `password` : Hash bcrypt
- `is_active`, `is_staff`

**Relation** : OneToOne → Student

---

### Student (students/models.py)
Profil étudiant avec gestion de statut.

**Champs** :
- `user` : OneToOne → User
- `first_name`, `last_name`
- `status` : `available` | `in_interview` | `paused`
- `current_company` : FK → Company (nullable)

**Méthodes** :
- `start_interview(company)` : Démarre un entretien
- `end_interview()` : Termine et met en pause
- `set_available()` : Repasse disponible

---

### Company (companies/models.py)
Entreprise participante.

**Champs** :
- `name` : Nom unique
- `access_token` : Token unique 32 chars (auto-généré)
- `status` : `recruiting` | `paused`
- `max_concurrent_interviews` : Nombre de slots (défaut: 1)
- `max_queue_size` : Limite inscriptions (nullable)

**Méthodes** :
- `regenerate_token()` : Nouveau token
- `get_current_interview_count()` : Compte entretiens actifs
- `has_available_slots()` : Vérifie disponibilité

---

### Queue (queues/models.py)
Inscription d'un étudiant à une file.

**Champs** :
- `company` : FK → Company
- `student` : FK → Student
- `position` : Entier (ordre d'inscription, immutable)
- `is_completed` : Boolean (marqué "passé")

**Contrainte** : Unique (`company`, `student`)

**Méthodes** :
- `mark_completed()` : Marque passé + auto-pause étudiant
- `get_next_available(company, count)` : Prochains dispo

---

## ⚙️ Services et Business Logic

### QueueService (queues/services.py)

Service centralisé pour la logique des files.

**Méthodes principales** :
- `can_start_interview(queue_entry)` : Validation avant démarrage
- `start_interview(queue_entry)` : Démarre l'entretien
- `complete_interview(queue_entry)` : Termine et libère slot
- `get_student_opportunities(student)` : Liste opportunités

**Avantages** :
- Centralise la logique métier
- Facilite les tests
- Évite duplication de code

---

### NotificationService (notifications/services.py)

Service de notifications WebSocket.

**Méthodes** :
- `on_queue_inscription(queue_entry)` : Nouvelle inscription
- `on_interview_started(queue_entry)` : Entretien démarré
- `on_interview_completed(...)` : Entretien terminé
- `notify_student(student_id, message, data)` : Notif perso
- `notify_company(token, type, data)` : Notif entreprise

**Groups** :
- `student_{id}` : Notifications personnelles
- `company_{token}` : Dashboard entreprise
- `admin` : Panel admin

---

## 🔌 WebSocket (Django Channels)

### Configuration

**ASGI Application** : `core/asgi.py`

```python
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            CompanyTokenAuthMiddleware(
                URLRouter(notifications.routing.websocket_urlpatterns)
            )
        )
    ),
})
```

### Consumer (notifications/consumers.py)

**NotificationConsumer** :
- Authentification via JWT ou company token
- Gestion des groups automatique
- Handlers pour chaque type d'événement

**URL** : `ws://localhost:8000/ws/notifications/`

**Query params** :
- JWT : `?token={access_token}`
- Company : `?company_token={access_token}`

### Channel Layer

**Développement** : InMemoryChannelLayer (pas de Redis requis)
**Production** : RedisChannelLayer

---

## 🔐 Authentification

### JWT pour Étudiants/Admins

**Endpoints** :
- `POST /api/auth/login/` → {access, refresh}
- `POST /api/auth/refresh/` → {access}
- `GET /api/auth/me/` → user info

**Configuration** :
- Access token : 30 minutes
- Refresh token : 1 jour
- Header : `Authorization: Bearer {access_token}`

---

### Company Token

**Génération** : Automatique à la création (`secrets.token_urlsafe(24)`)

**Utilisation** :
- URL : `/company/{token}/`
- Middleware : `CompanyTokenAuthMiddleware`
- Injecte `request.company`

**Régénération** : Endpoint admin `/api/companies/admin/companies/{id}/regenerate_token/`

---

## 📍 Endpoints API

Voir [API_REFERENCE.md](../API_REFERENCE.md) pour documentation complète.

**Principaux endpoints** :
- `/api/auth/*` - Authentification
- `/api/students/*` - Profils étudiants
- `/api/companies/*` - Liste entreprises (public)
- `/api/queues/*` - Gestion files d'attente
- `/api/company/{token}/*` - Dashboard entreprise
- `/api/admin/*` - Panel admin (students, companies, stats)

---

## 🧪 Tests

### Lancer les tests

```bash
python manage.py test
```

### Tests unitaires

Chaque app contient un fichier `tests.py` :
- `queues/tests.py` : Tests logique des files
- `notifications/tests.py` : Tests WebSocket (à venir)

### Coverage (à configurer)

```bash
pip install coverage
coverage run manage.py test
coverage report
```

---

## 🛠️ Commandes Utiles

### Créer des données de test

```bash
python manage.py shell
```

```python
from companies.models import Company
from users.models import User
from students.models import Student

# Créer une entreprise
company = Company.objects.create(name="TechCorp", max_concurrent_interviews=2)
print(f"Token: {company.access_token}")

# Créer un étudiant
user = User.objects.create_user(email="test@example.com", password="test123", role="student")
student = Student.objects.create(user=user, first_name="Test", last_name="User")
```

### Reset la base de données

```bash
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Afficher les routes

```bash
python manage.py show_urls  # Nécessite django-extensions
# ou
python manage.py shell
>>> from django.urls import get_resolver
>>> get_resolver().url_patterns
```

---

## 🚀 Déploiement

### Variables d'environnement Production

```env
SECRET_KEY=votre-cle-production-tres-secrete
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=votredomaine.com,www.votredomaine.com
CORS_ALLOWED_ORIGINS=https://votredomaine.com
```

### PostgreSQL Setup

```bash
pip install psycopg2-binary
```

`.env` :
```env
DATABASE_URL=postgresql://jobfair_user:password@localhost:5432/jobfair_db
```

### Redis Setup

```bash
pip install redis channels-redis
```

`.env` :
```env
REDIS_URL=redis://localhost:6379/0
```

### Collectstatic

```bash
python manage.py collectstatic
```

### Serveur ASGI (Production)

**Daphne** (recommandé pour Channels) :
```bash
daphne -b 0.0.0.0 -p 8000 core.asgi:application
```

**Gunicorn + Uvicorn** (alternatif) :
```bash
pip install gunicorn uvicorn
gunicorn core.asgi:application -k uvicorn.workers.UvicornWorker
```

### Docker (optionnel)

Créer `Dockerfile` :
```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "core.asgi:application"]
```

---

## 🐛 Debugging

### Activer DEBUG logs

Dans `settings.py` :
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django': {'handlers': ['console'], 'level': 'DEBUG'},
    },
}
```

### Django Debugger

```bash
pip install django-debug-toolbar
```

### Shell interactif

```bash
python manage.py shell
```

---

## 📚 Ressources

- [Documentation Django](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Django Channels](https://channels.readthedocs.io/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)

---

## 📝 Notes de Développement

### Migrations

Après modification d'un modèle :
```bash
python manage.py makemigrations
python manage.py migrate
```

### Admin Django

Enregistrer un modèle dans l'admin (`app/admin.py`) :
```python
from django.contrib import admin
from .models import YourModel

@admin.register(YourModel)
class YourModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_at']
```

### Permissions Custom

Voir `core/permissions.py` pour exemples :
- `IsStudent` : Vérifie `user.role == 'student'`
- `IsAdmin` : Vérifie `user.role == 'admin'`
- `IsCompanyToken` : Vérifie `request.company` existe

---

Pour toute question sur le backend, consultez [ARCHITECTURE.md](../ARCHITECTURE.md) ou [API_REFERENCE.md](../API_REFERENCE.md).
