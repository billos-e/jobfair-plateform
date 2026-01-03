# 🔄 Data Flows - Plateforme JobFair

Documentation des flux de données principaux de la plateforme, illustrant comment les données circulent entre le frontend, le backend, et les utilisateurs.

---

## 1. Flux d'Authentification JWT (Étudiant/Admin)

### Connexion

```mermaid
sequenceDiagram
    actor User as Étudiant/Admin
    participant UI as Frontend (LoginPage)
    participant API as Backend API
    participant Auth as AuthService
    participant DB as Database
    
    User->>UI: Saisit email + password
    UI->>API: POST /api/auth/login/
    Note over UI,API: {email, password}
    
    API->>Auth: Validate credentials
    Auth->>DB: Query User by email
    DB-->>Auth: User object
    Auth->>Auth: Verify password hash
    
    alt Credentials Valid
        Auth->>Auth: Generate JWT tokens
        Auth-->>API: {access, refresh}
        API-->>UI: 200 OK + tokens
        UI->>UI: Store in localStorage
        UI->>API: GET /api/auth/me/
        Note over UI,API: Authorization: Bearer {access}
        API->>DB: Fetch user + student
        DB-->>API: User + Student data
        API-->>UI: {user, role, student}
        UI->>UI: Set AuthContext
        UI-->>User: Redirect to dashboard
    else Invalid Credentials
        Auth-->>API: Error
        API-->>UI: 401 Unauthorized
        UI-->>User: Affiche erreur
    end
```

**Données entrantes** :
- `email` : string
- `password` : string (plaintext, hashé côté backend)

**Données sortantes** :
- `access` : JWT access token (30 min)
- `refresh` : JWT refresh token (1 jour)

**Stockage** :
- localStorage : `jobfair_access_token`, `jobfair_refresh_token`

---

### Auto-Refresh Token

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant Axios as Axios Interceptor
    participant API as Backend API
    
    UI->>API: GET /api/students/me/
    Note over UI,API: Authorization: Bearer {expired_access}
    
    API-->>Axios: 401 Unauthorized
    
    Axios->>Axios: Detect 401 + has refresh token
    Axios->>API: POST /api/auth/refresh/
    Note over Axios,API: {refresh: refresh_token}
    
    alt Refresh Valid
        API-->>Axios: {access: new_token}
        Axios->>Axios: Update localStorage
        Axios->>API: Retry original request
        Note over Axios,API: Authorization: Bearer {new_token}
        API-->>Axios: 200 OK + data
        Axios-->>UI: Success
    else Refresh Invalid/Expired
        API-->>Axios: 401 Unauthorized
        Axios->>Axios: clearTokens()
        Axios-->>UI: Redirect to /login
    end
```

**Mécanisme** :
- Interceptor Axios détecte 401
- Tente auto-refresh si `refresh_token` disponible
- Retry de la requête originale avec nouveau token
- Si échec → logout + redirect

---

## 2. Flux d'Inscription à une File d'Attente

```mermaid
sequenceDiagram
    actor Student as Étudiant
    participant UI as Frontend
    participant API as Backend API
    participant QueueService as QueueService
    participant DB as Database
    participant NotifService as NotificationService
    participant WS as WebSocket
    participant CompanyUI as Dashboard Entreprise
    
    Student->>UI: Clique "S'inscrire" sur TechCorp
    UI->>API: POST /api/queues/ {company: 1}
    
    API->>QueueService: Create inscription
    QueueService->>DB: Check existing inscription
    
    alt Already Inscribed
        DB-->>QueueService: Queue exists
        QueueService-->>API: Error
        API-->>UI: 400 "Déjà inscrit"
        UI-->>Student: Toast erreur
    else New Inscription
        DB-->>QueueService: No existing
        QueueService->>DB: Get max position
        DB-->>QueueService: position = 5
        QueueService->>DB: Create Queue (position=6)
        DB-->>QueueService: Queue created
        QueueService-->>API: Queue object
        
        API->>NotifService: on_queue_inscription(queue)
        NotifService->>WS: group_send("company_token1")
        Note over NotifService,WS: type: queue_update
        WS-->>CompanyUI: Nouvelle inscription!
        CompanyUI->>CompanyUI: Refresh queue list
        
        API-->>UI: 201 Created + queue data
        UI-->>Student: Toast "Inscrit en position 6"
        UI->>UI: Refresh queue list
    end
```

**Données entrantes** :
- `company` : ID entreprise

**Données sortantes** :
- `id` : ID queue entry
- `position` : Position dans la file
- `can_start` : boolean
- `reason` : string

**Side effects** :
- Notification WebSocket → Dashboard entreprise
- Position auto-calculée (max + 1)

---

## 3. Flux de Démarrage d'Entretien

```mermaid
sequenceDiagram
    actor Student as Étudiant
    participant UI as Student Dashboard
    participant API as Backend API
    participant QueueService as QueueService
    participant StudentModel as Student Model
    participant CompanyModel as Company Model
    participant DB as Database
    participant NotifService as NotificationService
    participant WS as WebSocket
    participant CompanyUI as Dashboard Entreprise
    
    Student->>UI: Clique "Commencer mon entretien"
    UI->>API: POST /api/queues/10/start/
    
    API->>QueueService: can_start_interview(queue)
    
    QueueService->>StudentModel: Check student.status
    StudentModel-->>QueueService: status = 'available'
    
    QueueService->>CompanyModel: has_available_slots()
    CompanyModel->>DB: Count in_interview students
    DB-->>CompanyModel: count = 1
    CompanyModel->>CompanyModel: max=2, count=1 → slots=1
    CompanyModel-->>QueueService: True (1 slot available)
    
    QueueService->>QueueService: Check position & completed
    
    alt Validation OK
        QueueService-->>API: (True, None)
        API->>QueueService: start_interview(queue)
        
        QueueService->>StudentModel: start_interview(company)
        StudentModel->>DB: UPDATE status='in_interview'
        StudentModel->>DB: UPDATE current_company=1
        DB-->>StudentModel: Updated
        
        QueueService-->>API: Success
        
        API->>NotifService: on_interview_started(queue)
        NotifService->>WS: Notify company
        WS-->>CompanyUI: interview_started event
        CompanyUI->>CompanyUI: Update queue display
        
        NotifService->>WS: Notify student
        WS-->>UI: status_change event
        
        API-->>UI: 200 OK {message, status}
        UI-->>Student: Toast "Entretien démarré"
        UI->>UI: Update UI (status badge)
    else No Slots
        QueueService-->>API: (False, "Pas de slots disponibles")
        API-->>UI: 400 Bad Request
        UI-->>Student: Toast erreur
    else Not First
        QueueService-->>API: (False, "3 personnes avant toi")
        API-->>UI: 400 Bad Request
        UI-->>Student: Toast erreur
    end
```

**Validations** :
1. Étudiant en statut `available`
2. Pas déjà `current_company` ailleurs
3. Entreprise a des slots disponibles
4. Position correcte dans la file (premiers non-complétés)

**Données sortantes** :
- `message` : Confirmation
- `status` : Nouveau statut (`in_interview`)
- `company` : Nom de l'entreprise

---

## 4. Flux de Completion d'Entretien

```mermaid
sequenceDiagram
    actor Company as Entreprise
    participant CompanyUI as Dashboard Entreprise
    participant API as Backend API
    participant QueueService as QueueService
    participant QueueModel as Queue Model
    participant StudentModel as Student Model
    participant DB as Database
    participant NotifService as NotificationService
    participant WS as WebSocket
    participant StudentUI as Dashboard Étudiant
    participant NextStudentsUI as Prochains Étudiants
    
    Company->>CompanyUI: Clique "Marquer passé" pour Alice
    CompanyUI->>API: POST /company/token/queues/10/complete/
    
    API->>QueueService: complete_interview(queue)
    
    QueueService->>QueueModel: mark_completed()
    QueueModel->>DB: UPDATE is_completed=True
    QueueModel->>DB: UPDATE completed_at=NOW()
    
    QueueModel->>StudentModel: end_interview()
    StudentModel->>DB: UPDATE status='paused'
    StudentModel->>DB: UPDATE current_company=NULL
    DB-->>StudentModel: Updated
    
    QueueService->>QueueModel: get_next_available(company, slots)
    Note over QueueService,QueueModel: Cherche étudiants available, non-complétés
    QueueModel->>DB: Query next available
    DB-->>QueueModel: [Bob (pos=2), Charlie (pos=4)]
    
    QueueService-->>API: {completed_student, next_available[2]}
    
    API->>NotifService: on_interview_completed(...)
    
    par Notify Completed Student
        NotifService->>WS: Send to student_5 (Alice)
        WS-->>StudentUI: interview_completed event
        StudentUI-->>StudentUI: Status → paused
        StudentUI-->>StudentUI: Toast "Entretien terminé"
    and Notify Next Students
        NotifService->>WS: Send to student_7 (Bob)
        WS-->>NextStudentsUI: can_start event (URGENT)
        NextStudentsUI-->>NextStudentsUI: Toast "C'est votre tour!"
        
        NotifService->>WS: Send to student_9 (Charlie)
        WS-->>NextStudentsUI: can_start event (URGENT)
    and Update Company Dashboard
        NotifService->>WS: Broadcast to company_token
        WS-->>CompanyUI: queue_update event
        CompanyUI->>CompanyUI: Refresh queue
        CompanyUI->>CompanyUI: Update slot count
    end
    
    API-->>CompanyUI: 200 OK {message, next_count}
    CompanyUI-->>Company: Toast "Alice marquée comme passée"
```

**Side effects** :
1. Queue entry : `is_completed = True`, `completed_at = NOW()`
2. Student : `status = 'paused'`, `current_company = NULL`
3. Slot libéré immédiatement
4. Notifications multiples via WebSocket :
   - Étudiant complété → info completion
   - Prochains étudiants → notification urgente
   - Dashboard entreprise → mise à jour file

**Données sortantes** :
- `student_id` : ID étudiant marqué
- `is_completed` : true
- `next_available_count` : Nombre de prochains étudiants

---

## 5. Flux de Notifications en Temps Réel (WebSocket)

### Connexion WebSocket

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant WS as WebSocket Client
    participant Server as Django Channels
    participant Consumer as NotificationConsumer
    participant Middleware as JWTAuthMiddleware
    participant DB as Database
    
    UI->>UI: User logged in (has access_token)
    UI->>WS: Create WebSocket connection
    Note over UI,WS: ws://localhost:8000/ws/notifications/?token={jwt}
    
    WS->>Server: WebSocket handshake
    Server->>Middleware: Extract & validate token
    Middleware->>Middleware: Decode JWT
    Middleware->>DB: Get User from JWT
    DB-->>Middleware: User object
    Middleware->>Middleware: Set scope['user']
    Middleware-->>Server: Authenticated
    
    Server->>Consumer: connect()
    Consumer->>Consumer: Check auth_type
    
    alt JWT Auth (Student/Admin)
        Consumer->>DB: Get student_id from user
        DB-->>Consumer: student.id = 5
        Consumer->>Consumer: Add to group "student_5"
        
        alt User is Admin
            Consumer->>Consumer: Add to group "admin"
        end
    else Company Token Auth
        Consumer->>Consumer: Add to group "company_{token}"
    end
    
    Consumer->>WS: accept()
    Consumer->>WS: Send connection_established
    WS-->>UI: {type: "connection_established", groups: ["student_5"]}
    UI->>UI: Connection active
    
    Note over UI,WS: Heartbeat every 30s
    loop Every 30 seconds
        UI->>WS: {type: "ping"}
        WS->>Consumer: receive_json
        Consumer->>WS: {type: "pong"}
        WS-->>UI: Pong received
    end
```

---

### Envoi de Notification

```mermaid
sequenceDiagram
    participant BackendCode as Backend Code
    participant NotifService as NotificationService
    participant ChannelLayer as Redis Channel Layer
    participant Consumer as NotificationConsumer
    participant WS as WebSocket
    participant UI as Frontend
    
    BackendCode->>NotifService: notify_student(5, "can_start", {...})
    NotifService->>ChannelLayer: group_send("student_5", event)
    Note over NotifService,ChannelLayer: {type: "can_start", data: {...}}
    
    ChannelLayer->>Consumer: Route to all consumers in group
    Consumer->>Consumer: Handle can_start(event)
    Consumer->>WS: send_json({...})
    WS-->>UI: Message received
    
    UI->>UI: Parse event type
    alt type = "can_start"
        UI->>UI: Show urgent toast
        UI->>UI: Play notification sound
        UI->>UI: Update opportunities list
    else type = "queue_update"
        UI->>UI: Refresh queue data
    else type = "status_change"
        UI->>UI: Update status badge
    end
```

**Types d'événements** :
- `notification` : Notification générique
- `queue_update` : File d'attente modifiée
- `status_change` : Statut changé
- `interview_started` : Entretien démarré
- `interview_completed` : Entretien terminé
- `can_start` : C'est votre tour (URGENT)

---

## 6. Flux Admin : Création d'Entreprise

```mermaid
sequenceDiagram
    actor Admin as Administrateur
    participant UI as Admin Panel
    participant API as Backend API
    participant CompanyModel as Company Model
    participant DB as Database
    
    Admin->>UI: Remplit formulaire nouvelle entreprise
    Note over Admin,UI: name, max_concurrent_interviews
    UI->>API: POST /api/companies/admin/companies/
    Note over UI,API: Authorization: Bearer {admin_token}
    
    API->>API: Check IsAdmin permission
    
    API->>CompanyModel: Create company
    CompanyModel->>CompanyModel: generate_access_token()
    Note over CompanyModel: Token = secrets.token_urlsafe(24)
    
    CompanyModel->>DB: INSERT company
    Note over CompanyModel,DB: name, token, status='recruiting', max=1
    DB-->>CompanyModel: Company created
    
    CompanyModel-->>API: Company object (with token)
    API-->>UI: 201 Created + company data
    
    UI->>UI: Affiche token généré
    UI-->>Admin: Toast "Entreprise créée"
    UI-->>Admin: Affiche URL: /company/{token}
    
    Admin->>Admin: Copie URL pour l'entreprise
```

**Données générées** :
- `access_token` : Token unique 32 chars (auto-généré)
- URL entreprise : `https://jobfair.com/company/{token}`

**Sécurité** :
- Token généré cryptographiquement sûr (`secrets.token_urlsafe`)
- Unique constraint sur DB
- Régénérable par admin si compromis

---

## 7. Flux Entreprise : Accès Dashboard (Token-based)

```mermaid
sequenceDiagram
    actor Company as Entreprise
    participant Browser as Navigateur
    participant UI as Company Dashboard
    participant API as Backend API
    participant Middleware as CompanyTokenMiddleware
    participant DB as Database
    
    Company->>Browser: Ouvre URL reçue
    Note over Company,Browser: https://jobfair.com/company/abc123def456
    
    Browser->>UI: Navigate to /company/abc123def456
    UI->>UI: Extract token from URL params
    
    UI->>API: GET /api/companies/abc123def456/
    API->>Middleware: Extract token from path
    Middleware->>DB: Query Company by access_token
    
    alt Token Valid
        DB-->>Middleware: Company found
        Middleware->>Middleware: Set request.company
        Middleware-->>API: Continue
        
        API->>DB: Fetch company + queue
        DB-->>API: {company, queue[], stats}
        API-->>UI: 200 OK + dashboard data
        
        UI->>UI: Render dashboard
        UI->>UI: Connect WebSocket
        Note over UI: ?company_token=abc123def456
        
        UI-->>Company: Dashboard affiché
    else Token Invalid
        DB-->>Middleware: No company found
        Middleware-->>API: Error
        API-->>UI: 404 Not Found
        UI-->>Company: "Token invalide"
    end
```

**Particularités** :
- Pas de compte User
- Token dans l'URL uniquement
- Pas de login/logout classique
- WebSocket authentifié via même token

---

## 8. Flux Étudiant : Repasser Disponible

```mermaid
sequenceDiagram
    actor Student as Étudiant (en pause)
    participant UI as Student Dashboard
    participant API as Backend API
    participant StudentModel as Student Model
    participant DB as Database
    participant WS as WebSocket
    
    Note over Student,UI: Statut actuel: PAUSED
    
    Student->>UI: Clique "Repasser disponible"
    UI->>API: PATCH /api/students/me/status/
    Note over UI,API: {status: "available"}
    
    API->>API: Check IsStudent permission
    API->>StudentModel: set_available()
    
    StudentModel->>StudentModel: Check current status
    
    alt Status is PAUSED
        StudentModel->>DB: UPDATE status='available'
        StudentModel->>DB: UPDATE current_company=NULL
        DB-->>StudentModel: Updated
        
        StudentModel-->>API: Success
        API->>WS: Broadcast status_change
        API-->>UI: 200 OK {status: "available"}
        
        UI->>UI: Update status badge
        UI->>UI: Enable "Commencer" buttons
        UI-->>Student: Toast "Vous êtes disponible"
    else Status is NOT PAUSED
        StudentModel-->>API: Error "Invalid transition"
        API-->>UI: 400 Bad Request
        UI-->>Student: Toast erreur
    end
```

**Règle métier** :
- Seul l'étudiant peut faire cette action (R5)
- Uniquement depuis statut `paused`
- `in_interview` → `available` impossible (doit passer par completion)

---

## Résumé des Patterns

### 1. Validation en Cascade
Toutes les actions critiques passent par :
1. Permission check (DRF)
2. Service method (business logic)
3. Model method (data integrity)
4. Database operation

### 2. Notifications Asynchrones
Après chaque modification importante :
1. Opération DB commit
2. `NotificationService` appelé
3. Events envoyés via Channel Layer
4. Consumers broadcast aux groups
5. Frontend reçoit et réagit

### 3. Auto-Refresh Frontend
- React Query pour cache + refetch automatique
- WebSocket pour updates push instantanés
- Optimistic updates quand pertinent

### 4. Gestion d'Erreur
Backend :
```python
try:
    QueueService.start_interview(queue)
except ValueError as e:
    return Response({'detail': str(e)}, status=400)
```

Frontend :
```javascript
try {
    await queueAPI.startInterview(queueId)
    toast.success("Entretien démarré")
} catch (error) {
    toast.error(error.response?.data?.detail || "Erreur")
}
```

---

Cette documentation des flux permet de comprendre comment les données circulent dans le système et comment les différents composants interagissent.
