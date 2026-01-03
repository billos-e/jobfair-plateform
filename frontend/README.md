# Frontend - Plateforme JobFair

Application frontend React de la plateforme de gestion de files d'attente pour salons de l'emploi.

## 🛠️ Technologies

- **React 18** - Bibliothèque UI
- **Vite** - Build tool moderne et rapide
- **React Router 6** - Routing et navigation
- **TanStack Query** - State management et cache
- **Axios** - Client HTTP avec intercepteurs JWT
- **TailwindCSS** - Framework CSS utility-first
- **Lucide React** - Icônes

## 📋 Prérequis

- Node.js 18+ (recommandé: 20 LTS)
- npm (ou yarn/pnpm)

## 🚀 Installation Locale

### 1. Naviguer vers le frontend

```bash
cd frontend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration (Optionnel)

Créer un fichier `.env` à la racine du dossier frontend :

```env
VITE_API_URL=http://localhost:8000/api
```

**Note** : Si non défini, il utilise `/api` par défaut (même domaine).

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

### 5. Build de production

```bash
npm run build
```

Les fichiers de production seront dans `dist/`.

### 6. Preview de la build

```bash
npm run preview
```

---

## 📁 Structure du Projet

```
frontend/
│
├── src/
│   ├── pages/                      # Pages de l'application
│   │   ├── auth/
│   │   │   ├── Login.jsx          # Page de connexion
│   │   │   └── Register.jsx       # Page d'inscription
│   │   ├── student/
│   │   │   ├── Dashboard.jsx      # Dashboard étudiant
│   │   │   └── Companies.jsx      # Liste des entreprises
│   │   ├── company/
│   │   │   └── Dashboard.jsx      # Dashboard entreprise (token)
│   │   └── admin/
│   │       ├── AdminLayout.jsx    # Layout admin avec sidebar
│   │       ├── Dashboard.jsx      # Stats globales
│   │       ├── Management.jsx     # Gestion entreprises/étudiants
│   │       ├── Students.jsx       # Liste étudiants (obsolète, fusionné dans Management)
│   │       ├── Users.jsx          # Liste utilisateurs
│   │       ├── CompanyDetail.jsx  # Détail entreprise + file
│   │       └── StudentDetail.jsx  # Détail étudiant
│   │
│   ├── components/                 # Composants réutilisables
│   │   ├── layout/
│   │   │   └── MainLayout.jsx     # Layout principal (header)
│   │   └── ui/
│   │       ├── Button.jsx         # Bouton stylisé
│   │       ├── Card.jsx           # Carte
│   │       ├── Modal.jsx          # Modal dialog
│   │       └── Toast.jsx          # Notification toast
│   │
│   ├── contexts/                   # Contextes React
│   │   ├── AuthContext.jsx        # Authentification (JWT)
│   │   ├── WebSocketContext.jsx   # WebSocket temps réel
│   │   └── ToastContext.jsx       # Système de notifications
│   │
│   ├── services/                   # Clients API
│   │   ├── api.js                 # Client Axios + intercepteurs
│   │   └── websocket.js           # WebSocket client
│   │
│   ├── App.jsx                     # Composant racine + routing
│   ├── main.jsx                    # Point d'entrée
│   └── index.css                   # Styles globaux + Tailwind
│
├── public/                         # Fichiers statiques
├── index.html                      # Template HTML
├── vite.config.js                  # Configuration Vite
├── tailwind.config.js              # Configuration Tailwind
├── package.json                    # Dépendances et scripts
└── .env                            # Variables d'environnement
```

---

## 🧭 Routing et Navigation

### Routes Publiques
- `/login` - Connexion
- `/register` - Inscription

### Routes Étudiants (Protected, role: student)
- `/dashboard` - Dashboard étudiant
- `/companies` - Liste des entreprises

### Routes Entreprises (Token-based)
- `/company/:token` - Dashboard entreprise

### Routes Admin (Protected, role: admin)
- `/admin` - Dashboard admin
- `/admin/management` - Gestion entreprises/étudiants
- `/admin/users` - Liste utilisateurs
- `/admin/companies/:id` - Détail entreprise
- `/admin/students/:id` - Détail étudiant

### ProtectedRoute Component

Wrapper pour les routes nécessitant authentification :

```jsx
<ProtectedRoute allowedRoles={['student']}>
  <StudentDashboard />
</ProtectedRoute>
```

- Redirige vers `/login` si non authentifié
- Vérifie le rôle de l'utilisateur
- Affiche un loader pendant vérification

---

## 🔄 Contextes

### AuthContext

Gère l'authentification et l'état utilisateur.

**Fonctions** :
- `login(email, password)` : Connexion
- `register(data)` : Inscription
- `logout()` : Déconnexion
- `user` : Utilisateur connecté
- `isAuthenticated` : Boolean
- `isLoading` : Chargement

**Utilisation** :
```jsx
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const { user, login, logout } = useAuth()
  
  if (user) {
    return <div>Bonjour {user.email}</div>
  }
}
```

---

### WebSocketContext

Gère la connexion WebSocket pour notifications temps réel.

**Fonctions** :
- `socket` : Instance WebSocket
- `isConnected` : État connexion
- `addMessageHandler(type, handler)` : Écouter événements
- `removeMessageHandler(type, handler)` : Retirer listener
- `sendMessage(data)` : Envoyer message

**Utilisation** :
```jsx
import { useWebSocket } from './contexts/WebSocketContext'

function Dashboard() {
  const { addMessageHandler, removeMessageHandler } = useWebSocket()
  
  useEffect(() => {
    const handler = (data) => {
      console.log("Queue updated:", data)
    }
    
    addMessageHandler('queue_update', handler)
    return () => removeMessageHandler('queue_update', handler)
  }, [])
}
```

**Auto-reconnexion** :
- Reconnexion automatique si la connexion est perdue
- Reconnexion quand l'utilisateur revient sur l'onglet (visibilitychange)
- Heartbeat automatique pour maintenir la connexion

**Événements** :
- `connection_established` : Connexion réussie
- `notification` : Notification générique
- `queue_update` : File mise à jour
- `status_change` : Statut changé
- `interview_started` : Entretien démarré
- `interview_completed` : Entretien terminé
- `can_start` : C'est votre tour (URGENT)

---

### ToastContext

Affiche des notifications toast.

**Fonctions** :
- `toast.success(message)` : Toast vert
- `toast.error(message)` : Toast rouge
- `toast.info(message)` : Toast bleu
- `toast.warning(message)` : Toast orange

**Utilisation** :
```jsx
import { useToast } from './contexts/ToastContext'

function MyComponent() {
  const { toast } = useToast()
  
  const handleSuccess = () => {
    toast.success("Opération réussie!")
  }
}
```

---

## 🌐 Services API

### Client Axios (services/api.js)

Axios configuré avec :
- Base URL : `VITE_API_URL` ou `/api`
- Intercepteur request : Ajoute JWT token
- Intercepteur response : Auto-refresh token sur 401

**Modules** :
- `authAPI` : Login, register, refresh, me
- `studentAPI` : Profile, status
- `companyAPI` : Liste entreprises (publique)
- `companyDashboardAPI` : Dashboard entreprise (token)
- `queueAPI` : Inscriptions, start, opportunities
- `adminAPI` : CRUD students, companies, stats

**Exemple** :
```javascript
import { studentAPI } from './services/api'

// GET /api/students/me/
const { data } = await studentAPI.getProfile()
console.log(data) // {id, first_name, last_name, status, ...}
```

### Gestion des Tokens

**Stockage** : localStorage
- `jobfair_access_token` : JWT access (30 min)
- `jobfair_refresh_token` : JWT refresh (1 jour)

**Auto-refresh** :
- Interceptor détecte 401
- Appelle `/api/auth/refresh/`
- Retry requête originale avec nouveau token
- Si échec → logout + redirect `/login`

---

## 🎨 UI Components

### Button
```jsx
<Button variant="primary" onClick={handleClick}>
  Cliquez ici
</Button>
```

Variants : `primary`, `secondary`, `danger`, `ghost`

---

### Card
```jsx
<Card>
  <Card.Header>Titre</Card.Header>
  <Card.Body>Contenu</Card.Body>
</Card>
```

---

### Modal
```jsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <Modal.Header>Titre</Modal.Header>
  <Modal.Body>Contenu</Modal.Body>
  <Modal.Footer>
    <Button>Confirmer</Button>
  </Modal.Footer>
</Modal>
```

---

## 📊 State Management

### TanStack Query (React Query)

Utilisé pour le cache et la synchronisation des données.

**Exemples** :
```jsx
import { useQuery } from '@tanstack/react-query'
import { companyAPI } from './services/api'

function CompaniesList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyAPI.list()
  })
  
  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>
  
  return (
    <div>
      {data.data.map(company => (
        <div key={company.id}>{company.name}</div>
      ))}
    </div>
  )
}
```

**Avantages** :
- Cache automatique
- Refetch en background
- Gestion erreurs
- Optimistic updates

---

## 🎯 Patterns et Best Practices

### 1. Composition de Composants
```jsx
// Mauvais
function BigComponent() {
  // 500 lignes de code
}

// Bon
function StudentDashboard() {
  return (
    <>
      <StatusCard />
      <QueueList />
      <OpportunitiesList />
    </>
  )
}
```

### 2. Custom Hooks
```jsx
function useStudentProfile() {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: studentAPI.getProfile
  })
}

// Usage
const { data: student } = useStudentProfile()
```

### 3. Error Handling
```jsx
try {
  await queueAPI.join(companyId)
  toast.success("Inscription réussie")
  queryClient.invalidateQueries(['queues'])
} catch (error) {
  const message = error.response?.data?.detail || "Erreur inconnue"
  toast.error(message)
}
```

---

## 🚀 Déploiement

### Build de Production

```bash
npm run build
```

Génère `dist/` avec :
- HTML minifié
- CSS minifié et purgé (Tailwind)
- JS bundle optimisé et code-splitted
- Assets optimisés

### Variables d'Environnement

Créer `.env.production` :
```env
VITE_API_URL=https://api.votredomaine.com/api
```

**Note** : Les variables doivent commencer par `VITE_`

### Serveur Static

Les fichiers de `dist/` peuvent être servis par :
- Nginx
- Apache
- Netlify
- Vercel
- Firebase Hosting

**Nginx exemple** :
```nginx
server {
    listen 80;
    server_name votredomaine.com;
    root /var/www/jobfair/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

---

## 🔧 Configuration

### Vite (vite.config.js)

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

### Tailwind (tailwind.config.js)

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  }
}
```

---

## 🧪 Tests (À configurer)

### Installation

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Configuration vitest.config.js

```javascript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js'
  }
})
```

### Exemple de Test

```javascript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

---

## 🐛 Debugging

### React DevTools

Installer l'extension Chrome/Firefox pour inspecter les composants et le state.

### Vite Dev Server

Le serveur de dev offre :
- Hot Module Replacement (HMR)
- Messages d'erreur détaillés
- Source maps

### Console Logs

```javascript
// Voir les requêtes API
axios.interceptors.request.use(config => {
  console.log('Request:', config.method, config.url)
  return config
})
```

---

## 📝 Scripts NPM

```json
{
  "scripts": {
    "dev": "vite",                    // Serveur de dev
    "build": "vite build",            // Build production
    "preview": "vite preview",        // Preview build
    "lint": "eslint .",               // Linter
    "test": "vitest"                  // Tests (à configurer)
  }
}
```

---

## 📚 Ressources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/)
- [TailwindCSS](https://tailwindcss.com/)

---

## 🔗 Liens avec Backend

L'application frontend communique avec le backend via :

1. **REST API** : Requêtes HTTP pour CRUD operations
2. **WebSocket** : Notifications temps réel

Voir [API_REFERENCE.md](../API_REFERENCE.md) pour documentation complète des endpoints.

---

Pour toute question sur le frontend, consultez également [ARCHITECTURE.md](../ARCHITECTURE.md) et [DATA_FLOWS.md](../DATA_FLOWS.md).
