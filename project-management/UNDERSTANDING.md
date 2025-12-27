# COMPRÉHENSION DU PROJET - JOBFAIR PLATFORM

## Résumé Exécutif

La plateforme JobFair est une application web temps réel orchestrant les flux d'entretiens lors d'événements de recrutement. Elle permet aux étudiants de s'inscrire dans des files d'attente virtuelles chez plusieurs entreprises simultanément, d'être notifiés instantanément quand c'est leur tour, et de maximiser leur nombre d'entretiens. Les entreprises gèrent leur flux de candidats avec des slots configurables, tandis que les administrateurs supervisent l'ensemble en temps réel avec capacité d'intervention immédiate.

---

## Acteurs et Rôles

### Étudiants
- **Authentification** : Email + mot de passe → JWT token
- **Actions principales** : 
  - S'inscrire dans plusieurs files d'attente (pas de limite)
  - Voir sa position dans chaque file en temps réel
  - Recevoir notifications quand c'est son tour
  - Cliquer "Commencer mon entretien" quand notifié
  - Repasser "Disponible" après un entretien
- **Restrictions** : Ne peut PAS terminer son propre entretien (seule l'entreprise décide)

### Entreprises
- **Authentification** : Lien unique avec token (pas de compte)
- **Actions principales** :
  - Voir leur file ordonnée (En entretien / À venir / Passés)
  - Marquer les étudiants comme "passé" pour libérer slots
  - Mettre leur recrutement en pause (pause déjeuner, etc.)
- **Slots** : Nombre configurable d'entretiens simultanés (défaut = 1)

### Admin
- **Authentification** : Super-utilisateur via email/password
- **Actions principales** :
  - Créer/modifier/supprimer entreprises et étudiants
  - Modifier n'importe quel statut (override total)
  - Dashboard global avec statistiques temps réel
  - Actions d'urgence (reset global, pause globale)
  - Régénérer tokens entreprises compromis
  - Export CSV des données

---

## Concepts Métier Clés

### Files d'Attente
- **Ordre d'inscription sacré** : Déterminé par timestamp, immuable (R1)
- **Position** : Calculée automatiquement à l'inscription
- **Unicité** : Un étudiant ne peut s'inscrire qu'une fois par entreprise

### Grisage (Concept Central)
- Un étudiant occupé (en entretien ailleurs ou en pause) est **visuellement grisé** dans toutes les files
- Il est **sauté temporairement** mais **conserve sa position**
- Dès qu'il redevient "Disponible", il **reprend sa place d'origine** (R2, R3)
- Le grisage est **non-blocant** : les autres peuvent passer

### Statuts Étudiants
| Statut | Description | Transitions possibles |
|--------|-------------|----------------------|
| `available` | Peut passer des entretiens | → `in_interview` (par étudiant) |
| `in_interview` | En entretien chez X | → `paused` (par entreprise X) |
| `paused` | Entretien terminé, en pause | → `available` (par étudiant) |

### Slots Entreprise
- **max_concurrent_interviews** : Nombre d'étudiants simultanés (défaut = 1)
- **Calcul slots occupés** : `COUNT(étudiants WHERE current_company = X AND is_completed = False)` (R11)
- **Libération** : Dès que l'entreprise clique "Marquer passé" (R12)

### Notifications Temps Réel
- **Quand** : Slot libéré, étudiant devient disponible, inscription immédiate en 1ère position, entreprise reprend recrutement (R13-R16)
- **Qui** : Les N premiers étudiants disponibles (N = slots libres)
- **Contenu** : "Tu peux passer chez X !" ou "Tu peux passer après [nom]"

---

## Règles Métier Critiques

Les 20 règles (R1-R20) sont NON-NÉGOCIABLES. Voici les plus critiques :

| Règle | Description | Implémentation |
|-------|-------------|----------------|
| **R1** | Ordre d'inscription sacré | `position` calculée par `MAX(positions) + 1` à l'insertion |
| **R2** | Grisage non-blocant | Étudiants non-disponibles sautés mais gardent leur position |
| **R3** | Retour à position d'origine | Pas de recalcul de position quand statut change |
| **R6** | Fin entretien par entreprise | Seule l'entreprise peut marquer "passé" |
| **R7** | Passage auto en pause | Statut → `paused` quand marqué "passé" |
| **R10** | Vérification avant entretien | Côté serveur : slots dispo, premier dans file, entreprise en recrutement |
| **R12** | Libération immédiate | Slot libéré dès "Marquer passé", pas au changement de statut étudiant |
| **R17-R20** | Entreprise en pause | Invisible dans liste publique, pas de notifications, boutons désactivés |

---

## Défis Techniques Identifiés

### 1. Temps Réel Performant
- WebSockets via Django Channels + Redis
- Groupes par rôle : `student_{id}`, `company_{id}`, `admin`
- Broadcast ciblé, pas global

### 2. Race Conditions
- Deux étudiants cliquent "Commencer" simultanément pour 1 slot
- Solution : Vérification atomique côté serveur, refus si slot déjà pris
- Transaction DB pour garantir cohérence

### 3. Calcul du "Premier Disponible"
```python
# Pseudo-code
def get_first_available(company_id):
    return Queue.objects.filter(
        company_id=company_id,
        is_completed=False,
        student__status='available',
        student__current_company_id__isnull=True
    ).order_by('position').first()
```

### 4. Grisage et Retour de Position
- La position est fixée à l'inscription et ne change JAMAIS
- Seul le statut de l'étudiant change
- L'affichage filtre dynamiquement les grisés

### 5. Synchronisation Multi-Clients
- Un étudiant sur mobile + entreprise sur desktop
- Tous doivent voir les mêmes données en temps réel
- Invalidation de cache React Query sur événements WebSocket

---

## Stack Technique Validée

### Backend (Django)
- **Django 5+** : Framework principal
- **Django REST Framework** : API REST + serializers + permissions
- **django-rest-framework-simplejwt** : Authentification JWT étudiants/admin
- **Django Channels** : WebSockets temps réel
- **Redis** : Channel layer + pub/sub
- **PostgreSQL** : Base de données relationnelle
- **Daphne** : Serveur ASGI

### Frontend (React)
- **React 18** : UI avec hooks
- **Vite** : Build tool
- **React Router v6** : Routing
- **TailwindCSS** : Styling
- **Axios** : HTTP client avec interceptors JWT
- **React Query (TanStack)** : Cache et synchronisation API
- **Lucide React** : Icônes

### Déploiement
- **Backend** : Render (supporte WebSockets nativement)
- **Frontend** : Vercel
- **Database** : PostgreSQL sur Render
- **Redis** : Redis addon sur Render

---

## Modèle de Données (Résumé)

```
USER (id, email, password_hash, role, created_at)
  ↓ One-to-One
STUDENT (id, user_id, first_name, last_name, status, current_company_id)
  ↓ Many-to-Many via Queue
COMPANY (id, name, access_token, status, max_concurrent_interviews)
  ↑ One-to-Many
QUEUE (id, company_id, student_id, position, is_completed, created_at)
      UNIQUE(company_id, student_id)
```

---

**Document créé** : 2024-12-26  
**Dernière mise à jour** : 2024-12-26
