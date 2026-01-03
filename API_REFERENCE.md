# 📡 API Reference - Plateforme JobFair

Documentation complète de l'API REST de la plateforme JobFair.

**Base URL** : `http://localhost:8000/api` (développement)

Tous les endpoints (sauf Auth) nécessitent une authentification :
- **Étudiants/Admins** : Header `Authorization: Bearer {access_token}`
- **Entreprises** : Token dans l'URL `/api/company/{token}/...`

---

## 🔐 Authentication

### POST /api/auth/register/

Créer un nouveau compte étudiant.

**Body** :
```json
{
  "email": "etudiant@example.com",
  "password": "motdepasse123",
  "first_name": "Jean",
  "last_name": "Dupont"
}
```

**Response 201** :
```json
{
  "id": 1,
  "email": "etudiant@example.com",
  "role": "student",
  "student": {
    "id": 1,
    "first_name": "Jean",
    "last_name": "Dupont",
    "status": "available"
  }
}
```

---

### POST /api/auth/login/

Authentifier un utilisateur (étudiant ou admin).

**Body** :
```json
{
  "email": "etudiant@example.com",
  "password": "motdepasse123"
}
```

**Response 200** :
```json
{
  "access": "eyJ0eXAiOiJKV1QiLC...",
  "refresh": "eyJ0eXAiOiJKV1QiLC..."
}
```

**Utilisation** :
- Stocker les tokens côté client
- Utiliser `access` dans `Authorization: Bearer {access}`
- Utiliser `refresh` pour renouveler l'access token

---

### POST /api/auth/refresh/

Renouveler l'access token.

**Body** :
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLC..."
}
```

**Response 200** :
```json
{
  "access": "eyJ0eXAiOiJKV1QiLC..."
}
```

---

### GET /api/auth/me/

Obtenir les informations du utilisateur connecté.

**Headers** : `Authorization: Bearer {access_token}`

**Response 200** :
```json
{
  "id": 1,
  "email": "etudiant@example.com",
  "role": "student"
}
```

---

## 🎓 Students

### GET /api/students/me/

Obtenir le profil de l'étudiant connecté.

**Headers** : `Authorization: Bearer {access_token}`

**Response 200** :
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "email": "etudiant@example.com",
    "role": "student"
  },
  "first_name": "Jean",
  "last_name": "Dupont",
  "status": "available",
  "current_company": null,
  "full_name": "Jean Dupont"
}
```

---

### PATCH /api/students/me/

Modifier le profil de l'étudiant.

**Body** :
```json
{
  "first_name": "Jean-Michel"
}
```

**Response 200** : Profil mis à jour

---

### PATCH /api/students/me/status/

Changer le statut de l'étudiant (seulement `paused` → `available`).

**Body** :
```json
{
  "status": "available"
}
```

**Response 200** :
```json
{
  "message": "Statut mis à jour",
  "status": "available"
}
```

---

## 🏢 Companies

### GET /api/companies/

Lister toutes les entreprises en recrutement (pour étudiants).

**Headers** : `Authorization: Bearer {access_token}`

**Response 200** :
```json
[
  {
    "id": 1,
    "name": "TechCorp",
    "status": "recruiting",
    "max_concurrent_interviews": 2,
    "available_slots": 1,
    "queue_count": 5
  }
]
```

**Note** : Filtre automatiquement sur `status='recruiting'`

---

### GET /api/companies/{token}/

Obtenir le dashboard entreprise (avec token).

**URL** : `/api/companies/abc123def456.../`

**Response 200** :
```json
{
  "id": 1,
  "name": "TechCorp",
  "status": "recruiting",
  "max_concurrent_interviews": 2,
  "current_interview_count": 1,
  "available_slots": 1,
  "queue": [
    {
      "id": 10,
      "student": {
        "id": 5,
        "first_name": "Alice",
        "last_name": "Martin",
        "status": "in_interview"
      },
      "position": 1,
      "is_completed": false,
      "created_at": "2026-01-03T10:00:00Z"
    }
  ]
}
```

---

### PATCH /api/companies/{token}/status/

Changer le statut de recrutement de l'entreprise.

**Body** :
```json
{
  "status": "paused"
}
```

**Response 200** :
```json
{
  "message": "Statut mis à jour",
  "status": "paused"
}
```

---

### PATCH /api/companies/{token}/settings/

Modifier les paramètres de l'entreprise.

**Body** :
```json
{
  "max_concurrent_interviews": 3
}
```

**Response 200** : Settings mis à jour

---

## 📋 Queues (Files d'Attente)

### GET /api/queues/

Lister les inscriptions de l'étudiant connecté.

**Headers** : `Authorization: Bearer {access_token}`

**Response 200** :
```json
[
  {
    "id": 10,
    "company": {
      "id": 1,
      "name": "TechCorp",
      "status": "recruiting"
    },
    "position": 3,
    "is_completed": false,
    "created_at": "2026-01-03T10:00:00Z",
    "can_start": false,
    "reason": "2 personnes avant toi"
  }
]
```

---

### POST /api/queues/

S'inscrire à une file d'attente.

**Body** :
```json
{
  "company": 1
}
```

**Response 201** :
```json
{
  "id": 10,
  "company": 1,
  "student": 5,
  "position": 6,
  "is_completed": false,
  "created_at": "2026-01-03T10:30:00Z"
}
```

**Erreurs** :
- `400` : Déjà inscrit
- `400` : File pleine (max_queue_size atteint)

---

### POST /api/queues/{id}/start/

Démarrer un entretien.

**Headers** : `Authorization: Bearer {access_token}`

**Response 200** :
```json
{
  "message": "Entretien commencé chez TechCorp",
  "status": "in_interview",
  "company": "TechCorp"
}
```

**Erreurs** :
- `400` : Pas de slots disponibles
- `400` : Pas encore votre tour
- `400` : Déjà en entretien ailleurs

---

### DELETE /api/queues/{id}/

Se désinscrire d'une file (ou admin force delete).

**Headers** : `Authorization: Bearer {access_token}`

**Response 204** : No Content

---

### GET /api/queues/opportunities/

Obtenir les opportunités pour l'étudiant (où il peut démarrer maintenant).

**Headers** : `Authorization: Bearer {access_token}`

**Response 200** :
```json
{
  "student_status": "available",
  "opportunities": [
    {
      "queue_id": 10,
      "company_id": 1,
      "company_name": "TechCorp",
      "company_status": "recruiting",
      "position": 1,
      "can_start": true,
      "ahead_count": 0,
      "reason": "C'est votre tour!"
    },
    {
      "queue_id": 11,
      "company_id": 2,
      "company_name": "StartupInc",
      "position": 3,
      "can_start": false,
      "ahead_count": 2,
      "reason": "2 personnes avant toi"
    }
  ],
  "can_start_any": true
}
```

---

## 🏢 Company Queue Operations (Token-based)

### POST /api/company/{token}/queues/next/

Obtenir le prochain étudiant disponible.

**Response 200** :
```json
{
  "next_students": [
    {
      "queue_id": 12,
      "student_id": 7,
      "student_name": "Bob Durand",
      "position": 2
    }
  ],
  "count": 1
}
```

---

### POST /api/company/{token}/queues/{queue_id}/complete/

Marquer un étudiant comme "passé".

**Response 200** :
```json
{
  "message": "Alice Martin marqué comme passé",
  "student_id": 5,
  "is_completed": true,
  "next_available_count": 1
}
```

**Effet** :
- `queue.is_completed = True`
- `student.status = paused`
- `student.current_company = None`
- Slot libéré immédiatement
- Notifications envoyées aux prochains étudiants

---

## 👨‍💼 Admin - Students

### GET /api/students/admin/students/

Lister tous les étudiants (admin only).

**Headers** : `Authorization: Bearer {access_token}` (role=admin)

**Response 200** :
```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "email": "etudiant@example.com"
    },
    "first_name": "Jean",
    "last_name": "Dupont",
    "status": "available",
    "current_company": null
  }
]
```

---

### GET /api/students/admin/students/{id}/

Obtenir détails d'un étudiant.

**Response 200** : Détails + queue entries

---

### POST /api/students/admin/students/

Créer un étudiant (admin).

**Body** :
```json
{
  "email": "nouveau@example.com",
  "password": "temp123",
  "first_name": "Nouvel",
  "last_name": "Étudiant"
}
```

---

### PATCH /api/students/admin/students/{id}/

Modifier un étudiant (admin).

---

### DELETE /api/students/admin/students/{id}/

Supprimer un étudiant et ses inscriptions.

**Response 204** : No Content

---

### POST /api/students/admin/students/bulk-available/

Mettre tous les étudiants en statut "available" (action en masse).

**Headers** : `Authorization: Bearer {access_token}` (role=admin)

**Response 200** :
```json
{
  "message": "Updated 50 students to available",
  "updated": 50
}
```

**Note** : Utile pour réinitialiser tous les statuts en début d'événement.

---

## 👨‍💼 Admin - Companies

### GET /api/companies/admin/companies/

Lister toutes les entreprises (admin).

**Response 200** :
```json
[
  {
    "id": 1,
    "name": "TechCorp",
    "access_token": "abc123def456...",
    "status": "recruiting",
    "max_concurrent_interviews": 2,
    "current_interview_count": 1,
    "queue_count": 5,
    "created_at": "2026-01-01T08:00:00Z"
  }
]
```

---

### GET /api/companies/admin/companies/{id}/

Obtenir détails entreprise + file complète.

---

### POST /api/companies/admin/companies/

Créer une entreprise.

**Body** :
```json
{
  "name": "NewCorp",
  "max_concurrent_interviews": 1
}
```

**Response 201** : Entreprise créée avec `access_token` généré automatiquement

---

### PATCH /api/companies/admin/companies/{id}/

Modifier une entreprise.

---

### DELETE /api/companies/admin/companies/{id}/

Supprimer une entreprise.

---

### POST /api/companies/admin/companies/{id}/regenerate_token/

Régénérer le token d'accès d'une entreprise.

**Response 200** :
```json
{
  "access_token": "new_token_xyz789..."
}
```

---

### POST /api/companies/admin/companies/{id}/pause/

Mettre en pause le recrutement.

---

### POST /api/companies/admin/companies/{id}/resume/

Reprendre le recrutement.

---

### GET /api/companies/admin/companies/{id}/queue/

Obtenir la file complète de l'entreprise.

**Response 200** :
```json
{
  "queue": [
    {
      "id": 10,
      "student": {...},
      "position": 1,
      "is_completed": false
    }
  ]
}
```

---

### POST /api/companies/admin/companies/{id}/reorder_queue/

Réordonner manuellement la file (admin only).

**Body** :
```json
{
  "queue_ids": [12, 10, 11, 13]
}
```

**Response 200** : File réordonnée

---

### POST /api/companies/admin/companies/{id}/force_add_student/

Forcer ajout d'un étudiant dans la file (admin).

**Body** :
```json
{
  "student_id": 5,
  "position": 1
}
```

---

### POST /api/companies/admin/companies/bulk-resume/

Mettre toutes les entreprises en statut "recruiting" (action en masse).

**Headers** : `Authorization: Bearer {access_token}` (role=admin)

**Response 200** :
```json
{
  "message": "Updated 10 companies to recruiting",
  "updated": 10
}
```

**Note** : Utile pour réactiver toutes les entreprises en début d'événement.

---

## 👨‍💼 Admin - Dashboard

### GET /api/admin/dashboard/

Obtenir statistiques globales.

**Response 200** :
```json
{
  "total_students": 50,
  "active_students": 35,
  "students_in_interview": 8,
  "total_companies": 10,
  "recruiting_companies": 8,
  "total_queue_entries": 120,
  "completed_interviews": 45
}
```

---

## 🔌 WebSocket API

### Connection

**URL** : `ws://localhost:8000/ws/notifications/`

**Authentification** :
- Étudiants/Admins : `?token={jwt_access_token}`
- Entreprises : `?company_token={company_access_token}`

**Connection Response** :
```json
{
  "type": "connection_established",
  "auth_type": "jwt",
  "groups": ["student_5"]
}
```

---

### Client → Server Messages

#### Ping (keep-alive)
```json
{
  "type": "ping"
}
```

**Response** :
```json
{
  "type": "pong"
}
```

---

### Server → Client Events

#### Notification
```json
{
  "type": "notification",
  "data": {
    "message": "Nouvelle inscription à votre file",
    "level": "info"
  }
}
```

#### Queue Update
```json
{
  "type": "queue_update",
  "data": {
    "company_id": 1,
    "action": "inscription",
    "student_name": "Alice Martin"
  }
}
```

#### Status Change
```json
{
  "type": "status_change",
  "data": {
    "student_id": 5,
    "new_status": "in_interview",
    "company_name": "TechCorp"
  }
}
```

#### Can Start (Urgent)
```json
{
  "type": "can_start",
  "urgent": true,
  "data": {
    "company_name": "TechCorp",
    "queue_id": 10,
    "message": "C'est votre tour!"
  }
}
```

---

## ❌ Codes d'Erreur

| Code | Signification | Exemples |
|------|---------------|----------|
| `400` | Bad Request | Validation failed, business rule violation |
| `401` | Unauthorized | Token manquant ou invalide |
| `403` | Forbidden | Permissions insuffisantes |
| `404` | Not Found | Ressource introuvable |
| `409` | Conflict | Déjà inscrit, duplication |
| `500` | Server Error | Erreur interne |

**Format Error Response** :
```json
{
  "detail": "Description de l'erreur",
  "code": "error_code_optional"
}
```

---

## 📝 Notes d'Implémentation

### Pagination
Actuellement non implémentée. À ajouter si le nombre d'étudiants/entreprises devient important.

### Rate Limiting
À implémenter en production pour éviter les abus.

### Versioning
Pas de versioning actuellement. À considérer : `/api/v1/...` pour évolutions futures.

### CORS
Configuré pour `localhost:5173` en développement. Modifier en production.

---

Cette documentation est générée à partir du code. Pour plus de détails sur l'implémentation, consultez :
- [ARCHITECTURE.md](./ARCHITECTURE.md) pour la logique métier
- Code source des views dans chaque app Django
