# PLATEFORME JOB FAIR - DOCUMENT DE FONDATION

**Version :** 1.0  
**Date :** Décembre 2024  
**Statut :** Spécifications validées

---

## TABLE DES MATIÈRES

1. [Vision du Projet](#1-vision-du-projet)
2. [Spécifications Fonctionnelles](#2-spécifications-fonctionnelles)
3. [Règles Métier](#3-règles-métier)
4. [Workflows et Diagrammes de Flux](#4-workflows-et-diagrammes-de-flux)
5. [Modèle de Données](#5-modèle-de-données)
6. [Matrice des Permissions](#6-matrice-des-permissions)

---

## 1. VISION DU PROJET

### 1.1 Contexte

Les job fairs organisées dans le cadre des formations constituent des événements cruciaux pour la mise en relation entre étudiants et entreprises. Actuellement, ces événements se déroulent de manière non-digitalisée, entraînant plusieurs problématiques :

**Problèmes identifiés :**
- **Chaos organisationnel** : Les étudiants ne savent pas quand c'est leur tour
- **Temps d'attente inefficaces** : Les entreprises ont des temps morts ou sont submergées
- **Perte d'opportunités** : Des étudiants ratent des entretiens par manque d'information
- **Absence de supervision** : Les organisateurs n'ont pas de vue d'ensemble en temps réel
- **Gestion manuelle** : Listes papier, modifications difficiles, pas de traçabilité

### 1.2 Solution Proposée

Une plateforme web en temps réel qui orchestre le flux des entretiens en permettant :
- Aux étudiants de s'inscrire dans des files d'attente virtuelles
- Aux entreprises de gérer leur flux de candidats
- Aux administrateurs de superviser et corriger en temps réel

**Philosophie du système :**
Le système est un **outil d'aide à l'organisation**, pas un système de contrainte rigide. Il informe et suggère, mais la réalité physique de l'événement prime toujours.

### 1.3 Bénéfices Attendus

**Pour les étudiants :**
- Visibilité sur leur position dans chaque file
- Notifications quand c'est leur tour
- Maximisation du nombre d'entretiens possibles
- Transparence totale sur le processus

**Pour les entreprises :**
- Flux continu et organisé de candidats
- Contrôle sur leur rythme (pause possible)
- Vue claire de qui attend et qui est passé
- Réduction des temps morts

**Pour les organisateurs :**
- Supervision en temps réel
- Capacité d'intervention immédiate
- Statistiques et traçabilité
- Réduction du chaos logistique

### 1.4 Objectifs Mesurables

- **Fluidité** : Réduire les temps d'attente inutiles de 40%
- **Efficacité** : Augmenter le nombre moyen d'entretiens par étudiant de 30%
- **Satisfaction** : Taux de satisfaction utilisateurs > 80%
- **Fiabilité** : Zéro blocage critique le jour de l'événement

### 1.5 Contraintes

**Contraintes techniques :**
- Temps réel obligatoire (synchronisation instantanée)
- Scalabilité : 50+ utilisateurs simultanés minimum
- Disponibilité : 99.9% pendant l'événement
- Simplicité d'usage : utilisable sans formation préalable

**Contraintes contextuelles :**
- Événement physique : le système doit refléter la réalité, pas la contraindre
- Pas de créneaux horaires : flux continu et spontané
- Diversité des profils : du tech-savvy au novice

---

## 2. SPÉCIFICATIONS FONCTIONNELLES

### 2.1 Vue d'Ensemble du Système

Le système gère trois types d'acteurs qui interagissent avec des files d'attente virtuelles ordonnées chronologiquement. Chaque étudiant peut s'inscrire dans plusieurs files, et le système notifie intelligemment quand c'est le tour de chacun.

**Diagramme de contexte :**

```
                    ┌─────────────────┐
                    │   ÉTUDIANTS     │
                    │  (Email/Pass)   │
                    └────────┬────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │                                        │
        │      PLATEFORME JOB FAIR               │
        │   (Orchestration temps réel)           │
        │                                        │
        └────────┬───────────────────┬───────────┘
                 │                   │
                 ▼                   ▼
         ┌───────────────┐   ┌──────────────┐
         │  ENTREPRISES  │   │    ADMINS    │
         │ (Lien token)  │   │ (Super-user) │
         └───────────────┘   └──────────────┘
```

### 2.2 Fonctionnalités par Rôle

#### 2.2.1 ÉTUDIANT

**Authentification et profil :**
- S'inscrire avec email et mot de passe
- Se connecter à son compte
- Voir son profil (nom, prénom, email)

**Gestion des inscriptions :**
- Consulter la liste des entreprises en "Recrutement"
- S'inscrire dans une ou plusieurs files d'attente (pas de limite)
- Voir sa position dans chaque file
- Se désinscrire d'une file (si besoin, via admin)

**Gestion du statut personnel :**
- Voir son statut actuel : Disponible / En entretien chez X / En pause
- Passer de "En pause" à "Disponible" (bouton actif)
- **Ne peut PAS** terminer un entretien lui-même (seule l'entreprise décide)

**Notifications contextuelles :**
- Recevoir une notification quand il peut passer chez une entreprise
- Voir combien de personnes non-passées sont avant lui
- Être informé quand il a été marqué "passé" par une entreprise

**Action principale :**
- Cliquer "Commencer mon entretien chez X" quand c'est son tour
  - Condition : être le premier disponible ET slots disponibles
  - Effet : statut passe à "En entretien chez X"

**Dashboard :**
- Liste complète de toutes ses inscriptions avec positions
- Section "Opportunités immédiates" avec notifications actives
- Historique des entretiens passés

#### 2.2.2 ENTREPRISE

**Authentification :**
- Accès direct via lien unique avec token (pas de création de compte)
- Exemple : `https://jobfair.app/company/abc123xyz456`

**Visualisation de la file :**
Trois sections distinctes :

**Section 1 : EN ENTRETIEN MAINTENANT (X/N)**
- Liste des étudiants actuellement en entretien
- Affichage : Nom, heure d'arrivée, durée écoulée
- Action : Bouton "Marquer passé" pour chaque étudiant

**Section 2 : À VENIR**
- Liste ordonnée des étudiants inscrits et pas encore passés
- Affichage : Position, nom, statut (Disponible 🟢 / En entretien ailleurs ⚪ / En pause ⚪)
- Les étudiants grisés sont visuellement atténués (mais restent dans la liste)

**Section 3 : DÉJÀ PASSÉS**
- Liste des étudiants marqués comme "passés"
- Affichage : Nom, heure de passage
- Permet de garder une trace

**Gestion du flux :**
- Marquer un étudiant comme "passé" (action principale)
  - Effet immédiat : étudiant disparaît de "En entretien", apparaît dans "Déjà passés"
  - Effet secondaire : statut de l'étudiant passe automatiquement à "En pause"
  - Conséquence : le slot se libère instantanément
- Possibilité de marquer plusieurs étudiants en même temps (si plusieurs slots)

**Gestion du statut de l'entreprise :**
- Voir son statut actuel : Recrutement / Pause
- Basculer entre "Recrutement en cours" et "En pause"
  - En pause : n'apparaît plus dans la liste publique, aucune notification envoyée

**Configuration :**
- Voir le nombre de slots configurés (ex: "Capacité : 2 entretiens simultanés")
- Ne peut PAS modifier ce nombre (seul l'admin peut)

#### 2.2.3 ADMIN

**Gestion des entreprises :**
- Créer une nouvelle entreprise
  - Renseigner : nom de l'entreprise
  - Le système génère automatiquement un token unique d'accès
  - Afficher le lien complet à communiquer à l'entreprise
- Modifier le nom d'une entreprise
- Supprimer une entreprise (attention : supprime toutes ses inscriptions)
- Régénérer le token d'accès si compromis
- Modifier le statut d'une entreprise (Recrutement / Pause)
- **Modifier le nombre de slots simultanés** (max_concurrent_interviews)

**Gestion des étudiants :**
- Créer un nouvel étudiant (email, mot de passe, nom, prénom)
- Modifier les informations d'un étudiant
- Supprimer un étudiant (attention : supprime toutes ses inscriptions)
- **Modifier le statut de n'importe quel étudiant** (Disponible / En pause / En entretien chez X)

**Gestion des files d'attente :**
- Voir toutes les files de toutes les entreprises
- Supprimer une inscription spécifique
- Marquer un étudiant comme "passé" chez n'importe quelle entreprise
- Réorganiser manuellement une file (cas exceptionnel)

**Dashboard global :**
- Vue d'ensemble en temps réel :
  - Nombre total d'étudiants / entreprises
  - Nombre d'entretiens en cours
  - Nombre d'étudiants disponibles / en pause / en entretien
  - Alertes : étudiants bloqués depuis >30 min
- Statistiques par entreprise :
  - Nombre d'étudiants passés
  - Temps moyen par entretien
  - Taux de complétion
- Historique des actions (log d'audit)

**Actions d'urgence :**
- Bouton "Réinitialiser tous les statuts à Disponible" (panic button)
- Bouton "Mettre toutes les entreprises en pause" (pause globale)
- Export CSV de toutes les données (backup)

### 2.3 Fonctionnalités Transversales

**Temps réel (WebSocket) :**
- Synchronisation instantanée de tous les changements
- Chaque utilisateur voit les mises à jour sans rafraîchir
- Déclencheurs : changement de statut, inscription, marquage "passé"

**Notifications :**
- Push notifications dans l'interface (pas d'emails)
- Types de notifications :
  - "Tu peux passer chez X !" (étudiant)
  - "Tu peux passer chez X APRÈS [nom]" (étudiant)
  - "Tu as été marqué passé chez X, pense à repasser disponible" (étudiant)
  - Mise à jour visuelle instantanée de toutes les listes

**Responsive :**
- Interface adaptée mobile et desktop
- Priorité mobile pour les étudiants (souvent sur téléphone)
- Priorité desktop pour les entreprises (souvent sur ordinateur de stand)

---

## 3. RÈGLES MÉTIER

### 3.1 Règles d'Ordre et de Priorisation

**R1 : Ordre d'inscription sacré**
L'ordre de passage dans une file est déterminé par l'ordre chronologique d'inscription (timestamp). Cet ordre est immuable et ne peut être modifié que par l'admin en cas de correction exceptionnelle.

**R2 : Grisage non-blocant**
Un étudiant dont le statut est "En entretien" ou "En pause" est visuellement grisé dans toutes les files où il est inscrit. Il est **sauté temporairement**, mais conserve sa position. Dès qu'il redevient "Disponible", il reprend sa place d'origine dans toutes les files.

**R3 : Retour à la position d'origine**
Quand un étudiant redevient disponible après avoir été en pause ou en entretien ailleurs, il retrouve exactement sa position initiale dans toutes les files. Il n'a pas perdu sa place, il l'a simplement "gelée" temporairement.

**R4 : Choix explicite si premier sur plusieurs files**
Si un étudiant est le premier disponible chez plusieurs entreprises simultanément, il doit choisir explicitement laquelle prioriser en cliquant sur le bouton "Commencer mon entretien" de l'entreprise de son choix. Il n'y a pas de priorisation alphabétique ou automatique.

### 3.2 Règles de Statuts

**R5 : Autonomie de reprise**
Seul l'étudiant peut faire passer son statut de "En pause" à "Disponible". Personne d'autre (sauf l'admin en override) ne peut le forcer à redevenir disponible. C'est un acte volontaire de l'étudiant.

**R6 : Fin d'entretien contrôlée par l'entreprise**
Seule l'entreprise (ou l'admin) peut marquer un étudiant comme "passé". L'étudiant ne peut PAS terminer son propre entretien. C'est l'entreprise qui décide quand l'entretien est terminé de son point de vue.

**R7 : Passage automatique en pause**
Quand une entreprise clique "Marquer passé", le statut de l'étudiant passe **automatiquement** de "En entretien chez X" à "En pause". L'étudiant doit ensuite activement repasser "Disponible" pour continuer.

**R8 : Override administrateur total**
L'admin peut modifier n'importe quel statut (étudiant ou entreprise) à tout moment, sans restriction. C'est le filet de sécurité du système.

### 3.3 Règles de Slots

**R9 : Slots par défaut**
Chaque entreprise a par défaut `max_concurrent_interviews = 1` (un seul étudiant en entretien à la fois). Ce nombre peut être modifié uniquement par l'admin selon les besoins de l'entreprise (grand stand, plusieurs recruteurs).

**R10 : Vérification avant début d'entretien**
Un étudiant ne peut cliquer "Commencer mon entretien chez X" que si le nombre d'étudiants actuellement en entretien chez X est strictement inférieur au nombre de slots disponibles. Cette vérification se fait côté serveur.

**R11 : Calcul d'occupation de slot**
Un étudiant occupe un slot chez l'entreprise X si et seulement si :
- `current_company = X` (l'étudiant est affecté à cette entreprise)
- ET `is_completed = False` (l'entreprise ne l'a pas encore marqué "passé")

Formule : `slots_occupés = COUNT(étudiants WHERE current_company = X AND is_completed = False)`

**R12 : Libération immédiate**
Dès que l'entreprise clique "Marquer passé", le slot occupé par cet étudiant est **libéré instantanément**, même si l'étudiant n'a pas encore changé son statut. C'est le marquage "passé" qui libère le slot, pas le changement de statut de l'étudiant.

### 3.4 Règles de Notifications

**R13 : Notification des premiers disponibles uniquement**
Seuls les N premiers étudiants disponibles sont notifiés, où N = nombre de slots disponibles. Si une entreprise a 3 slots libres, les 3 premiers disponibles dans la file reçoivent une notification. Le 4ème ne reçoit rien.

**R14 : Déclencheurs de notification**
Une notification est envoyée automatiquement dans ces cas :
- Un slot se libère (entreprise clique "Marquer passé")
- Un étudiant change son statut à "Disponible"
- Un étudiant devant lui est marqué "Absent" (via admin)
- Un étudiant s'inscrit et est immédiatement premier disponible

**R15 : Contenu de la notification**
Une notification indique :
- L'entreprise concernée
- Si l'étudiant peut passer immédiatement ou après quelqu'un
- Le nombre de personnes **non encore passées** avant lui (exclut ceux déjà marqués "passé" et ceux actuellement en entretien chez cette entreprise)

Exemple : "Tu peux passer chez Google, il y a encore 2 personnes avant toi qui ne sont pas passées"
Signification : 2 personnes sont avant lui dans la file, ne sont pas encore passées (is_completed=False), ne sont PAS en entretien chez Google, mais sont soit en pause, soit en entretien ailleurs, soit absentes.

**R16 : Notification après marquage "passé"**
Quand une entreprise marque un étudiant "passé", cet étudiant reçoit une notification : "Tu as été marqué passé chez [Entreprise]. Ton statut est maintenant En pause. Pense à repasser Disponible pour voir tes autres opportunités."

### 3.5 Règles Entreprise en Pause

**R17 : Invisibilité publique**
Une entreprise dont le statut est "Pause" n'apparaît plus dans la liste publique des entreprises disponibles. Aucun nouvel étudiant ne peut s'y inscrire tant qu'elle est en pause.

**R18 : Visibilité pour inscrits**
Les étudiants déjà inscrits dans la file d'une entreprise en pause voient toujours cette entreprise dans leur dashboard, mais avec la mention "(En pause)" et un indicateur visuel (🛑). Ils conservent leur position.

**R19 : Suspension des notifications**
Aucune notification n'est envoyée aux étudiants concernant une entreprise en pause, même s'ils sont premiers dans la file. Les notifications reprennent dès que l'entreprise repasse en "Recrutement".

**R20 : Actions désactivées pendant la pause**
Les étudiants ne peuvent pas cliquer "Commencer mon entretien" chez une entreprise en pause. Le bouton est désactivé avec un message explicatif : "Cette entreprise est actuellement en pause".

---

## 4. WORKFLOWS ET DIAGRAMMES DE FLUX

### 4.1 Workflow Principal : Cycle Complet d'un Entretien

```
ÉTUDIANT consulte les entreprises disponibles
    │
    ├─→ Clique "S'inscrire chez Entreprise X"
    │       │
    │       └─→ Système ajoute en dernière position de la file X
    │               │
    │               └─→ Système vérifie : est-il premier disponible ?
    │                       │
    │                       ├─→ OUI : Notification immédiate
    │                       │         "Tu peux passer chez X !"
    │                       │
    │                       └─→ NON : Attend en position N
    │                                 Pas de notification
    │
    ├─→ Étudiant reçoit notification
    │       │
    │       └─→ Clique "Commencer mon entretien chez X"
    │               │
    │               └─→ Serveur vérifie : slots_disponibles > 0 ?
    │                       │
    │                       ├─→ OUI : Statut = "En entretien chez X"
    │                       │         current_company = X
    │                       │         Broadcast WebSocket
    │                       │         Étudiant grisé partout ailleurs
    │                       │
    │                       └─→ NON : Message d'erreur
    │                                 "Cette entreprise ne peut pas
    │                                  recevoir plus d'étudiants"
    │
    ├─→ ENTRETIEN SE DÉROULE PHYSIQUEMENT
    │       (Durée variable, système affiche timer)
    │
    ├─→ Entreprise clique "Marquer passé"
    │       │
    │       └─→ Système effectue :
    │               • is_completed = True
    │               • Statut étudiant = "En pause" (automatique)
    │               • current_company = null
    │               • Étudiant disparaît de "EN ENTRETIEN"
    │               • Étudiant apparaît dans "DÉJÀ PASSÉS"
    │               • Slot libéré instantanément
    │               • Broadcast WebSocket
    │               • Notification étudiant : "Marqué passé"
    │               • Recherche du prochain disponible
    │               • Notification prochain : "Tu peux passer !"
    │
    └─→ Étudiant (maintenant en pause) reçoit notification
            │
            └─→ Clique "Repasser disponible"
                    │
                    └─→ Statut = "Disponible"
                        Étudiant n'est plus grisé nulle part
                        Notifications si premier ailleurs
```

### 4.2 Workflow : Gestion du Grisage

```
SCÉNARIO : Alice inscrite chez Google, Microsoft, Amazon

État initial : Alice statut = "Disponible"
    │
    └─→ Chez Google : Position 1, notification active ✅
        Chez Microsoft : Position 3, attend
        Chez Amazon : Position 5, attend

Alice clique "Commencer entretien chez Google"
    │
    └─→ Statut Alice = "En entretien chez Google"
        current_company Alice = Google
        │
        └─→ Chez Google : Alice dans "EN ENTRETIEN" ✅
            Chez Microsoft : Alice GRISÉE ⚪
            Chez Amazon : Alice GRISÉE ⚪
            │
            └─→ Prochain chez Microsoft notifié (Bob)
                Prochain chez Amazon notifié (Charlie)

Google termine et clique "Marquer passé"
    │
    └─→ Statut Alice = "En pause" (automatique)
        current_company Alice = null
        is_completed (Google-Alice) = True
        │
        └─→ Chez Google : Alice dans "DÉJÀ PASSÉS" ✅
            Chez Microsoft : Alice TOUJOURS GRISÉE ⚪
            Chez Amazon : Alice TOUJOURS GRISÉE ⚪
            │
            └─→ Bob et Charlie continuent normalement
                (Alice ne bloque personne)

Alice clique "Repasser disponible"
    │
    └─→ Statut Alice = "Disponible"
        │
        └─→ Chez Microsoft : Alice N'EST PLUS GRISÉE ✅
            Chez Amazon : Alice N'EST PLUS GRISÉE ✅
            │
            └─→ Si Alice redevient première disponible :
                Notification à Alice
```

### 4.3 Workflow : Ordre de Passage avec Retours

```
SCÉNARIO : File chez Entreprise X

État initial :
    1. Alice (Disponible)
    2. Bob (En entretien chez Y)
    3. Charlie (Disponible)
    4. David (En pause)
    5. Emma (Disponible)

Qui peut passer ?
    │
    └─→ Alice est première ET disponible
        → Notification Alice : "Tu peux passer !"
        → Charlie notifié : "Tu peux passer APRÈS Alice"

Alice passe et termine
    │
    └─→ Bob est deuxième, mais en entretien ailleurs (grisé)
        → On le saute temporairement
        → Charlie peut maintenant passer
        → Notification Charlie : "Tu peux passer !"
        → Emma notifiée : "Tu peux passer APRÈS Charlie"

Charlie passe et termine
    │
    └─→ Bob est maintenant disponible (a terminé chez Y)
        → Bob REPREND sa position 2
        → Notification Bob : "Tu peux passer !"
        → David grisé (en pause), sauté
        → Emma notifiée : "Tu peux passer APRÈS Bob"

Bob passe et termine
    │
    └─→ David toujours en pause, sauté
        → Emma peut passer
        → Notification Emma : "Tu peux passer !"

Emma passe et termine
    │
    └─→ Si David repasse disponible à ce moment :
        → Notification David : "Tu peux passer !"
```

### 4.4 Workflow : Race Condition (2 étudiants simultanés)

```
CONTEXTE : Google max_slots = 1

T=0.00s : Alice et Bob tous deux disponibles, premiers dans la file
    │
    ├─→ Alice voit : "Tu peux passer !"
    └─→ Bob voit : "Tu peux passer APRÈS Alice"

T=0.50s : Alice clique "Commencer entretien"
    │
    └─→ Requête HTTP vers serveur

T=0.51s : Bob (n'a pas reçu mise à jour) clique aussi
    │
    └─→ Requête HTTP vers serveur

T=0.52s : Serveur reçoit requête Alice
    │
    └─→ Vérification : slots_occupés = 0 < 1 ? OUI ✅
        Statut Alice = "En entretien chez Google"
        current_company Alice = Google
        slots_occupés = 1
        Broadcast WebSocket : "Alice a commencé"

T=0.53s : Serveur reçoit requête Bob
    │
    └─→ Vérification : slots_occupés = 1 < 1 ? NON ❌
        REFUS de la requête
        Réponse : Erreur 400
        Message : "Cette entreprise ne peut pas recevoir plus d'étudiants"

T=0.54s : Bob reçoit broadcast + erreur
    │
    └─→ Interface Bob affiche :
        "Un autre étudiant est déjà en entretien chez Google"
        Bouton désactivé
        Notification : "Tu peux passer APRÈS Alice"

RÉSULTAT : Un seul étudiant en entretien, cohérence garantie ✅
```

### 4.5 Workflow : Entreprise en Pause et Reprise

```
Google : Statut = "Recrutement"
File : Alice (1ère), Bob (2ème), Charlie (3ème)
    │
    └─→ Alice et Bob reçoivent notifications

Google clique "Mettre en pause"
    │
    └─→ Statut Google = "Pause"
        │
        ├─→ N'apparaît plus dans liste publique
        │   (Nouveaux étudiants ne peuvent plus s'inscrire)
        │
        ├─→ Alice, Bob, Charlie voient :
        │   "Google (En pause) 🛑"
        │   Boutons désactivés
        │   Message : "Cette entreprise est en pause"
        │
        └─→ Aucune notification envoyée pendant la pause

[... 30 minutes de pause déjeuner ...]

Google clique "Reprendre le recrutement"
    │
    └─→ Statut Google = "Recrutement"
        │
        ├─→ Réapparaît dans liste publique
        │
        ├─→ Alice, Bob, Charlie voient :
        │   "Google" (sans mention pause)
        │   Boutons réactivés
        │
        └─→ Notifications reprennent :
            Alice : "Tu peux passer chez Google !"
            Bob : "Tu peux passer APRÈS Alice"
```

### 4.6 Workflow : Intervention Admin (Correction d'Urgence)

```
PROBLÈME : Alice bloquée "En entretien chez Google" depuis 45 min
           (Bug ou oubli, Google a déjà marqué passé)

Admin voit alerte dans dashboard : "Alice en entretien depuis 45 min"
    │
    └─→ Admin clique "Corriger" sur Alice
        │
        ├─→ Option 1 : "Mettre en pause"
        │       └─→ Statut Alice = "En pause"
        │           current_company = null
        │           Slot Google libéré
        │           Prochain notifié
        │
        ├─→ Option 2 : "Repasser disponible"
        │       └─→ Statut Alice = "Disponible"
        │           Débloque Alice complètement
        │
        └─→ Option 3 : "Marquer passé chez Google"
                └─→ is_completed = True
                    Statut Alice = "En pause"
                    Slot Google libéré

RÉSULTAT : Problème résolu en <30 secondes
```

---

## 5. MODÈLE DE DONNÉES

### 5.1 Vue d'Ensemble

Le système repose sur 4 entités principales reliées entre elles :
- **User** : Comptes d'authentification
- **Student** : Profils étudiants avec statut
- **Company** : Entreprises participantes
- **Queue** : Inscriptions dans les files d'attente

### 5.2 Entités et Attributs

#### 5.2.1 USER (Table d'authentification)

**Attributs :**
- `id` : Identifiant unique (clé primaire)
- `email` : Email de connexion (unique, obligatoire)
- `password_hash` : Mot de passe chiffré (obligatoire)
- `role` : Type d'utilisateur (obligatoire)
  - Valeurs possibles : `'student'` | `'company'` | `'admin'`
- `created_at` : Date de création du compte (auto)

**Règles :**
- Un email ne peut être utilisé qu'une seule fois
- Le mot de passe n'est jamais stocké en clair
- Le role détermine les permissions

**Relations :**
- Un User peut avoir un Student (si role='student')
- Un User n'a PAS de relation directe avec Company (accès via token)

---

#### 5.2.2 STUDENT (Profil étudiant)

**Attributs :**
- `id` : Identifiant unique (clé primaire)
- `user_id` : Référence vers User (clé étrangère, unique)
- `first_name` : Prénom (obligatoire)
- `last_name` : Nom (obligatoire)
- `status` : État actuel (obligatoire)
  - Valeurs possibles : `'available'` | `'in_interview'` | `'paused'`
  - Valeur par défaut : `'available'`
- `current_company_id` : Entreprise actuelle si en entretien (clé étrangère, nullable)
  - null si status = 'available' ou 'paused'
  - non-null si status = 'in_interview'

**Règles :**
- Un Student est toujours lié à un User (relation One-to-One)
- Si status = 'in_interview', current_company_id DOIT être renseigné
- Si status ≠ 'in_interview', current_company_id DOIT être null

**Relations :**
- Appartient à un User (One-to-One)
- Peut être affecté à une Company temporairement (Many-to-One via current_company_id)
- S'inscrit dans plusieurs Companies (Many-to-Many via Queue)

---

#### 5.2.3 COMPANY (Entreprise participante)

**Attributs :**
- `id` : Identifiant unique (clé primaire)
- `name` : Nom de l'entreprise (obligatoire, unique)
- `access_token` : Token d'accès unique (obligatoire, unique, généré automatiquement)
  - Format : chaîne aléatoire de 32+ caractères
  - Exemple : `f4k9s2d8p1q7m3n5h6j8l0o2a4c6e8g0`
- `status` : État de recrutement (obligatoire)
  - Valeurs possibles : `'recruiting'` | `'paused'`
  - Valeur par défaut : `'recruiting'`
- `max_concurrent_interviews` : Nombre de slots simultanés (obligatoire)
  - Type : Entier positif
  - Valeur par défaut : 1
  - Modifiable uniquement par l'admin

**Règles :**
- Le access_token est généré automatiquement à la création
- Le access_token ne doit jamais être partagé publiquement
- L'admin peut régénérer le token si compromis
- Le nom doit être unique (pas deux entreprises avec le même nom)

**Relations :**
- Peut avoir plusieurs Students en entretien (One-to-Many via current_company_id)
- Reçoit des inscriptions de Students (One-to-Many via Queue)

---

#### 5.2.4 QUEUE (Inscription dans une file)

**Attributs :**
- `id` : Identifiant unique (clé primaire)
- `company_id` : Entreprise concernée (clé étrangère, obligatoire)
- `student_id` : Étudiant inscrit (clé étrangère, obligatoire)
- `position` : Position dans la file (entier, obligatoire)
  - Déterminée par l'ordre d'inscription (auto-incrémenté)
  - Exemple : 1, 2, 3, 4, ...
- `is_completed` : Marqué passé par l'entreprise (booléen, obligatoire)
  - Valeur par défaut : False
  - Passe à True quand l'entreprise clique "Marquer passé"
- `created_at` : Date/heure d'inscription (auto)
  - Utilisé pour déterminer l'ordre si besoin de recalcul

**Règles :**
- **Contrainte unique** : (company_id, student_id)
  - Un étudiant ne peut s'inscrire qu'une seule fois chez une entreprise
- La position est calculée automatiquement à l'insertion
  - position = MAX(positions existantes) + 1
- L'ordre est immuable (sauf intervention admin)

**Relations :**
- Appartient à une Company (Many-to-One)
- Appartient à un Student (Many-to-One)
- Crée une relation Many-to-Many entre Student et Company

---

### 5.3 Diagramme Entité-Association (ERD)

```
┌─────────────────┐
│      USER       │
├─────────────────┤
│ • id            │
│ • email         │◄───┐
│ • password_hash │    │ One-to-One
│ • role          │    │
│ • created_at    │    │
└─────────────────┘    │
                       │
                       │
            ┌──────────┴──────────┐
            │                     │
            │      STUDENT        │
            ├─────────────────────┤
            │ • id                │
            │ • user_id (FK)      │
            │ • first_name        │
            │ • last_name         │
            │ • status            │
            │ • current_company_id│──┐
            └─────────────────────┘  │
                       │             │
                       │             │ Many-to-One
                       │             │ (temporaire)
                       │             │
           Many-to-Many│             │
           (via Queue) │             │
                       │             │
                       ▼             ▼
            ┌─────────────────────────────┐
            │         COMPANY             │
            ├─────────────────────────────┤
            │ • id                        │
            │ • name                      │
            │ • access_token (unique)     │
            │ • status                    │
            │ • max_concurrent_interviews │
            └─────────────────────────────┘
                       ▲
                       │ One-to-Many
                       │
            ┌──────────┴──────────┐
            │                     │
            │       QUEUE         │
            ├─────────────────────┤
            │ • id                │
            │ • company_id (FK)   │
            │ • student_id (FK)   │
            │ • position          │
            │ • is_completed      │
            │ • created_at        │
            └─────────────────────┘
     
     UNIQUE(company_id, student_id)
```

### 5.4 Exemples de Données

#### Exemple 1 : Alice s'inscrit chez Google

**Avant :**
```
USER
├─ id: 1, email: "alice@mail.com", role: "student"

STUDENT
├─ id: 1, user_id: 1, first_name: "Alice", last_name: "Dupont"
├─ status: "available", current_company_id: null

COMPANY
├─ id: 1, name: "Google", access_token: "abc123...", status: "recruiting"
├─ max_concurrent_interviews: 1

QUEUE
└─ (vide)
```

**Après inscription :**
```
QUEUE
└─ id: 1, company_id: 1, student_id: 1, position: 1
   is_completed: False, created_at: "2024-12-22 14:00:00"
```

#### Exemple 2 : Alice commence l'entretien

**Changement dans STUDENT :**
```
STUDENT (id: 1)
├─ status: "in_interview" (était "available")
└─ current_company_id: 1 (était null)
```

**QUEUE reste identique** (is_completed toujours False)

**Calcul côté système :**
```
slots_occupés_chez_Google = COUNT(
  Students WHERE current_company_id = 1 
  AND EXISTS(Queue WHERE student_id = Students.id 
                     AND company_id = 1 
                     AND is_completed = False)
) = 1

slots_disponibles = 1 - 1 = 0
→ Personne d'autre ne peut commencer
```

#### Exemple 3 : Google marque Alice "passé"

**Changements simultanés :**

**Dans QUEUE :**
```
QUEUE (id: 1)
└─ is_completed: True (était False)
```

**Dans STUDENT :**
```
STUDENT (id: 1)
├─ status: "paused" (était "in_interview") ← Automatique
└─ current_company_id: null (était 1) ← Automatique
```

**Calcul côté système :**
```
slots_occupés_chez_Google = 0 (Alice ne compte plus)
slots_disponibles = 1 - 0 = 1
→ Prochain disponible peut commencer
```

---

## 6. MATRICE DES PERMISSIONS

### 6.1 Permissions par Action et par Rôle

| CATÉGORIE | ACTION | ÉTUDIANT | ENTREPRISE | ADMIN |
|-----------|--------|----------|------------|-------|
| **AUTHENTIFICATION** |
| Créer un compte étudiant | ✅ Lui-même | ❌ | ✅ N'importe qui |
| Se connecter avec email/password | ✅ Lui-même | ❌ | ✅ N'importe qui |
| Accéder via token unique | ❌ | ✅ Soi-même | ✅ N'importe laquelle |
| Réinitialiser mot de passe | ✅ Lui-même | ❌ | ✅ N'importe qui |
| **ÉTUDIANTS** |
| Voir son profil (nom, email) | ✅ Lui-même | ❌ | ✅ Tous |
| Modifier son profil | ✅ Lui-même | ❌ | ✅ N'importe qui |
| Voir son statut actuel | ✅ Lui-même | ❌ | ✅ Tous |
| Changer son statut à "Disponible" | ✅ Lui-même (depuis "paused") | ❌ | ✅ N'importe qui |
| Changer son statut à "En pause" | ✅ Lui-même | ❌ | ✅ N'importe qui |
| Changer son statut à "En entretien" | ✅ Via bouton "Commencer" | ❌ | ✅ Direct (bypass) |
| Voir la liste des entreprises | ✅ Toutes publiques | ❌ | ✅ Toutes |
| **INSCRIPTIONS** |
| S'inscrire dans une file | ✅ Lui-même | ❌ | ✅ N'importe qui |
| Voir sa position dans une file | ✅ Ses files | ❌ | ✅ Toutes |
| Se désinscrire d'une file | ❌ (doit demander admin) | ❌ | ✅ |
| Voir qui est inscrit dans une file | ❌ | ✅ Sa file | ✅ Toutes |
| **ENTRETIENS** |
| Commencer un entretien | ✅ Si conditions OK | ❌ | ❌ (n'a pas de sens) |
| Terminer un entretien (soi-même) | ❌ (supprimé) | ❌ | ❌ (n'a pas de sens) |
| Marquer un étudiant "passé" | ❌ | ✅ Dans sa file | ✅ N'importe où |
| Voir qui est en entretien | ❌ | ✅ Chez soi | ✅ Partout |
| Voir qui est déjà passé | ❌ | ✅ Chez soi | ✅ Partout |
| **ENTREPRISES** |
| Créer une entreprise | ❌ | ❌ | ✅ |
| Modifier nom entreprise | ❌ | ❌ | ✅ |
| Supprimer entreprise | ❌ | ❌ | ✅ |
| Voir son token d'accès | ❌ | ❌ (accès direct) | ✅ Tous |
| Régénérer token d'accès | ❌ | ❌ | ✅ |
| Changer statut (Recrutement/Pause) | ❌ | ✅ Soi-même | ✅ N'importe laquelle |
| Voir max_concurrent_interviews | ❌ | ✅ Soi-même | ✅ Tous |
| Modifier max_concurrent_interviews | ❌ | ❌ | ✅ |
| **NOTIFICATIONS** |
| Recevoir notifications personnelles | ✅ Siennes | ❌ | ⚠️ Optionnel |
| Envoyer notification manuelle | ❌ | ❌ | ✅ |
| **DASHBOARD** |
| Voir dashboard étudiant | ✅ Sien | ❌ | ✅ Tous |
| Voir dashboard entreprise | ❌ | ✅ Sien | ✅ Tous |
| Voir dashboard global/stats | ❌ | ❌ | ✅ |
| **EXPORTS** |
| Exporter ses propres données | ⚠️ Future | ❌ | ✅ |
| Exporter toutes les données CSV | ❌ | ❌ | ✅ |
| **ACTIONS D'URGENCE** |
| Reset statut individuel | ❌ | ❌ | ✅ |
| Reset tous les statuts | ❌ | ❌ | ✅ |
| Pause globale (toutes entreprises) | ❌ | ❌ | ✅ |
| Voir logs d'audit | ❌ | ❌ | ✅ |

### 6.2 Légende

- ✅ : Permission accordée
- ❌ : Permission refusée
- ⚠️ : Permission conditionnelle ou future
- "Lui-même" / "Soi-même" : L'utilisateur ne peut agir que sur ses propres données
- "N'importe qui/laquelle" : L'admin peut agir sur n'importe quelle entité
- "Bypass" : L'admin peut contourner les vérifications normales

### 6.3 Notes de Sécurité

**Étudiant :**
- Peut uniquement modifier ses propres données
- Ne voit que ses propres inscriptions et notifications
- Ne peut PAS voir les autres étudiants (sauf dans les files où il est inscrit)
- Ne peut PAS accéder aux fonctionnalités entreprise ou admin

**Entreprise :**
- Accès uniquement via token (pas de password)
- Voit uniquement SA propre file d'attente
- Ne peut PAS voir les autres entreprises
- Ne peut PAS modifier les étudiants (sauf marquer "passé")

**Admin :**
- Accès total sans restriction (super-user)
- Peut modifier n'importe quelle donnée
- Peut bypasser toutes les règles de validation
- Responsabilité de ne pas casser le système

### 6.4 Règles de Validation Côté Serveur

**Pour un étudiant qui clique "Commencer entretien" :**
1. Vérifier que son statut = "available" (pas "paused" ou déjà "in_interview")
2. Vérifier que l'entreprise statut = "recruiting" (pas "paused")
3. Vérifier que slots_disponibles > 0
4. Vérifier qu'il est bien dans la file de cette entreprise (existe dans Queue)
5. Vérifier qu'il n'a pas déjà is_completed = True (déjà passé)

**Pour une entreprise qui clique "Marquer passé" :**
1. Vérifier que l'étudiant est bien dans SA file
2. Vérifier que is_completed = False (pas déjà marqué)
3. Aucune autre restriction (l'entreprise décide)

**Pour un admin :**
- Aucune validation restrictive (peut tout faire)
- Mais logs de toutes les actions pour audit

---

## 7. ANNEXES

### 7.1 Glossaire

**Termes métier :**
- **Job Fair** : Événement de mise en relation étudiants-entreprises
- **File d'attente** : Liste ordonnée d'étudiants inscrits chez une entreprise
- **Slot** : Capacité d'une entreprise à recevoir un entretien simultanément
- **Grisage** : Visualisation d'un étudiant indisponible (en pause ou en entretien ailleurs)
- **Marqué passé** : Étudiant pour qui l'entreprise a terminé l'entretien

**Termes techniques :**
- **WebSocket** : Protocole de communication temps réel bidirectionnel
- **Broadcast** : Envoi d'une information à plusieurs clients simultanément
- **Race condition** : Situation où deux actions concurrentes peuvent créer une incohérence
- **Token** : Chaîne unique d'authentification (pour les entreprises)
- **Timestamp** : Horodatage précis (date + heure)

### 7.2 Contraintes et Limites Connues

**Limites techniques :**
- Nombre maximum d'utilisateurs simultanés : 200 (avec infrastructure de base)
- Latence de synchronisation : < 1 seconde (objectif)
- Durée maximale de connexion WebSocket : 12 heures (reset automatique après)

**Limites fonctionnelles :**
- Pas de système de créneaux horaires (flux continu uniquement)
- Pas de matching automatique étudiant-entreprise (inscription libre)
- Pas