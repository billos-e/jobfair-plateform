# JOURNAL DES DÉCISIONS - JOBFAIR PLATFORM

## Format

Chaque décision suit ce template :

**DEC-XXX : [Titre de la décision]**
- **Date** : [Date]
- **Contexte** : [Pourquoi cette décision était nécessaire]
- **Options considérées** : 
  1. Option A : [Avantages / Inconvénients]
  2. Option B : [Avantages / Inconvénients]
- **Décision** : [Option choisie]
- **Justification** : [Pourquoi ce choix]
- **Impact** : [Sur quoi ça impacte]

---

## Décisions

### DEC-001 : Structure des apps Django
- **Date** : 2024-12-26
- **Contexte** : Besoin de définir comment organiser le backend Django pour maintenir clarté et séparation des responsabilités.
- **Options considérées** :
  1. **Monolithique** : Une seule app avec tous les modèles
     - ✅ Simple à démarrer
     - ❌ Devient ingérable à l'échelle
  2. **Par entité métier** : Une app par entité (users, students, companies, queues, notifications)
     - ✅ Séparation claire
     - ✅ Tests isolés par domaine
     - ❌ Plus de fichiers
- **Décision** : Option 2 - Une app par entité métier
- **Justification** : Cohérent avec les bonnes pratiques Django, facilite tests et maintenance
- **Impact** : Structure du projet, imports entre apps

---

### DEC-002 : Logique métier dans Services
- **Date** : 2024-12-26
- **Contexte** : Où placer la logique métier complexe (calcul premier disponible, vérification slots, déclenchement notifications) ?
- **Options considérées** :
  1. **Dans les Views** : Logique directement dans ViewSets DRF
     - ✅ Moins de fichiers
     - ❌ Views deviennent énormes
     - ❌ Difficile à tester
  2. **Dans les Models** : Méthodes sur les modèles
     - ✅ Proche des données
     - ❌ Mélange responsabilités
     - ❌ Models trop gros
  3. **Dans des Services** : Classes dédiées (QueueService, NotificationService)
     - ✅ Testable isolément
     - ✅ Views restent minces
     - ✅ Réutilisable
- **Décision** : Option 3 - Classes Service dédiées
- **Justification** : Les 20 règles métier sont complexes et critiques, elles méritent leur propre couche testable
- **Impact** : Création d'un dossier `services/` dans chaque app, views appellent services

---

### DEC-003 : Authentification Entreprise par Token dans URL
- **Date** : 2024-12-26
- **Contexte** : Comment authentifier les entreprises sachant qu'elles n'ont pas de compte (specs P0) ?
- **Options considérées** :
  1. **Token dans header Authorization** : Bearer token classique
     - ✅ Standard REST
     - ❌ Nécessite config client complexe
     - ❌ Lien non partageable directement
  2. **Token dans URL** : `/company/{token}/`
     - ✅ Lien unique partageable
     - ✅ Pas de login requis
     - ❌ Token exposé dans URL
- **Décision** : Option 2 - Token dans URL
- **Justification** : Cohérent avec specs P0 ("lien unique à communiquer à l'entreprise"), simplicité d'usage
- **Impact** : Routing différent pour entreprises, token de 32+ caractères aléatoires

---

### DEC-004 : React Query pour Cache API
- **Date** : 2024-12-26
- **Contexte** : Comment gérer le cache des données API et la synchronisation avec le serveur ?
- **Options considérées** :
  1. **Redux** : Store global classique
     - ✅ Très flexible
     - ❌ Beaucoup de boilerplate
     - ❌ Gestion cache manuelle
  2. **Context API seul** : State React natif
     - ✅ Simple, pas de dépendance
     - ❌ Pas de cache automatique
     - ❌ Refetch manuel
  3. **React Query (TanStack Query)** : Cache intelligent
     - ✅ Cache automatique
     - ✅ Invalidation facile
     - ✅ Refetch en arrière-plan
     - ✅ Moins de boilerplate
- **Décision** : Option 3 - React Query
- **Justification** : Parfait pour app data-driven, invalidation facile sur événements WebSocket
- **Impact** : Dépendance `@tanstack/react-query`, patterns de query dans composants

---

### DEC-005 : Stockage JWT dans localStorage
- **Date** : 2024-12-26
- **Contexte** : Où stocker le JWT access token côté frontend ?
- **Options considérées** :
  1. **httpOnly cookie** : Cookie sécurisé
     - ✅ Plus sécurisé (pas accessible JS)
     - ❌ Nécessite configuration CSRF
     - ❌ Pas accessible pour WebSocket auth
  2. **localStorage** : Stockage navigateur
     - ✅ Simple
     - ✅ Accessible pour WebSocket auth
     - ❌ Vulnérable XSS
  3. **Memory only** : Variable JS
     - ✅ Très sécurisé
     - ❌ Perdu au refresh
     - ❌ Mauvaise UX
- **Décision** : Option 2 - localStorage
- **Justification** : Nécessaire pour passer token au WebSocket (techniquement requis), refresh token court (24h) mitige le risque
- **Impact** : Attention XSS dans le code React, validation serveur stricte

---

### DEC-006 : Monorepo vs Repos Séparés
- **Date** : 2024-12-26
- **Contexte** : Le projet a-t-il un seul repo ou deux ?
- **Options considérées** :
  1. **Monorepo** : Un seul repo avec dossiers backend/ et frontend/
     - ✅ Simplicité de gestion
     - ✅ Versioning unifié
     - ❌ Build/deploy plus complexe
  2. **Repos séparés** : Un repo par application
     - ✅ Déploiement indépendant
     - ❌ Coordination versions
- **Décision** : Option 1 - Monorepo (structure existante)
- **Justification** : Les dossiers backend/ et frontend/ existent déjà dans le workspace
- **Impact** : Configuration Render et Vercel pour pointer vers les bons dossiers

---

**Document créé** : 2024-12-26  
**Dernière mise à jour** : 2024-12-26
