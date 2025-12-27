# PLATEFORME JOB FAIR - DOCUMENT DE CONCEPTION

**Version :** 1.0  
**Date :** Décembre 2024  
**Statut :** Spécifications de conception validées  
**Prérequis :** Document P0 - Fondations du Projet

---

## TABLE DES MATIÈRES

1. [Personas Utilisateurs](#1-personas-utilisateurs)
2. [User Stories (Backlog Agile)](#2-user-stories-backlog-agile)
3. [Architecture Technique](#3-architecture-technique)
4. [Wireframes et Interfaces](#4-wireframes-et-interfaces)
5. [Plan de Tests et Validation](#5-plan-de-tests-et-validation)

---

## 1. PERSONAS UTILISATEURS

### 1.1 Pourquoi les Personas ?

Les personas nous permettent de :
- Concevoir des interfaces adaptées à de vrais besoins
- Prioriser les fonctionnalités selon l'impact utilisateur
- Éviter de développer des features inutiles
- Tester avec empathie (se mettre à la place de...)

### 1.2 Persona 1 : Alice Dupont - L'Étudiante Motivée

**Photo/Illustration :** Jeune femme, 23 ans, sourire confiant, avec ordinateur portable

**Profil :**
- **Âge :** 23 ans
- **Formation :** Master 2 Marketing Digital
- **Situation :** Recherche activement un stage de fin d'études de 6 mois
- **Objectif personnel :** Décrocher au moins 3 entretiens dans des entreprises tech
- **Niveau tech :** Très à l'aise avec les applications web et mobiles

**Contexte Job Fair :**
Alice a identifié 8 entreprises qui l'intéressent parmi les 12 présentes. Elle veut maximiser ses chances en passant chez toutes ces entreprises, mais elle ne veut pas perdre de temps à attendre inutilement.

**Frustrations actuelles (système papier) :**
- "Je ne sais jamais quand c'est mon tour, je reste debout à attendre"
- "J'ai raté Google parce que j'étais chez Microsoft et je ne savais pas que c'était mon tour"
- "Je perds du temps à faire la queue alors que je pourrais passer ailleurs"
- "Impossible de savoir combien de personnes sont avant moi"

**Besoins identifiés :**
1. **Visibilité** : Savoir en temps réel où elle en est dans chaque file
2. **Notifications** : Être alertée quand c'est bientôt son tour
3. **Optimisation** : Pouvoir s'inscrire chez plusieurs entreprises simultanément
4. **Simplicité** : Interface intuitive, pas besoin de tutorial
5. **Mobile-first** : Consulter sur son téléphone en se déplaçant

**Citation représentative :**
> "Je veux passer un maximum d'entretiens sans stress. Si je sais que je suis 5ème chez Google et 2ème chez Microsoft, je peux gérer mon temps intelligemment."

**Scénario d'usage type :**
1. Arrive à 9h à la job fair
2. Sort son téléphone, ouvre l'app
3. S'inscrit chez Google, Microsoft, Amazon, Meta, Apple (5 entreprises)
4. Voit qu'elle est 1ère chez Apple → clique "Commencer mon entretien"
5. Pendant l'entretien chez Apple, reçoit notification "Tu seras bientôt 1ère chez Google"
6. Termine chez Apple, repasse "Disponible"
7. Voit qu'elle est maintenant 1ère chez Google → y va directement
8. Répète le processus toute la matinée

**Fonctionnalités clés pour Alice :**
- Dashboard avec toutes ses inscriptions
- Notifications push claires
- Gros bouton "Commencer mon entretien" visible
- Indication "Tu es 1ère !" ou "Encore 3 personnes avant toi"

---

### 1.3 Persona 2 : Marc Leblanc - Le Recruteur Débordé

**Photo/Illustration :** Homme, 35 ans, costume décontracté, debout devant un stand d'entreprise

**Profil :**
- **Âge :** 35 ans
- **Poste :** Senior Recruiter chez Google
- **Contexte :** Représente Google à la job fair avec une collègue RH
- **Objectif :** Rencontrer 20-25 étudiants dans la journée, identifier 5-6 profils intéressants
- **Niveau tech :** À l'aise avec les outils web classiques, mais pas développeur

**Contexte Job Fair :**
Marc et sa collègue partagent le stand Google. Ils peuvent recevoir 2 étudiants simultanément (2 slots). Ils veulent un flux continu sans temps mort, mais aussi pouvoir prendre une pause déjeuner sans chaos.

**Frustrations actuelles (système papier) :**
- "Les étudiants arrivent de manière anarchique, on ne sait pas qui est le prochain"
- "On perd du temps entre chaque étudiant à chercher qui attend"
- "Impossible de prendre une vraie pause, les étudiants continuent d'arriver"
- "Pas de trace de qui on a déjà vu, on se répète parfois"

**Besoins identifiés :**
1. **File ordonnée** : Voir clairement qui attend dans l'ordre
2. **Visibilité statut** : Savoir qui est disponible maintenant vs occupé ailleurs
3. **Contrôle du flux** : Pouvoir mettre en pause quand nécessaire
4. **Traçabilité** : Voir qui est déjà passé pour ne pas refaire d'entretien
5. **Simplicité** : Pas besoin de créer un compte, accès rapide

**Citation représentative :**
> "Je veux voir qui m'attend, appeler le suivant quand je suis prêt, et pouvoir faire une pause sans que ça devienne le chaos. C'est tout."

**Scénario d'usage type :**
1. Arrive à 8h30, installe le stand
2. Reçoit un lien de l'organisateur : `jobfair.app/company/google123`
3. Ouvre le lien, voit l'interface Google avec 3 sections
4. Voit "À VENIR : 0 étudiants" (personne encore inscrit)
5. 9h : les inscriptions commencent à arriver
6. Voit "À VENIR : Alice (Disponible 🟢), Bob (Disponible 🟢), Charlie (En entretien ailleurs ⚪)"
7. Appelle Alice, elle arrive
8. Pendant l'entretien, clique "Alice" → "Marquer passé"
9. Alice disparaît, Bob est notifié automatiquement
10. 12h : clique "Mettre en pause" → va déjeuner tranquille
11. 13h : clique "Reprendre" → les notifications reprennent

**Fonctionnalités clés pour Marc :**
- Vue claire des 3 sections (En entretien / À venir / Passés)
- Bouton "Marquer passé" bien visible
- Indicateur visuel de qui est disponible (code couleur)
- Toggle "Recrutement / Pause" facile d'accès

---

### 1.4 Persona 3 : Sophie Martin - L'Organisatrice Stressée

**Photo/Illustration :** Femme, 40 ans, clipboard à la main, air concentré

**Profil :**
- **Âge :** 40 ans
- **Poste :** Formatrice et coordinatrice pédagogique
- **Responsabilité :** Organiser la job fair pour 50 étudiants et 10 entreprises
- **Objectif :** Que tout se passe bien, sans chaos, avec un maximum d'entretiens réalisés
- **Niveau tech :** Bonne maîtrise des outils bureautiques, mais pas technique

**Contexte Job Fair :**
Sophie a organisé cette job fair pendant 2 mois. C'est le jour J, elle doit superviser, régler les problèmes, et s'assurer que tout le monde (étudiants + entreprises) est satisfait.

**Frustrations actuelles (système papier) :**
- "Je cours partout pour résoudre des problèmes que je découvre trop tard"
- "Impossible de savoir si un étudiant a déjà passé 5 entretiens ou zéro"
- "Les entreprises me sollicitent sans arrêt pour des petits bugs"
- "Pas de vue d'ensemble, je suis aveugle sur ce qui se passe réellement"
- "En fin de journée, impossible de savoir si c'était un succès ou non (pas de stats)"

**Besoins identifiés :**
1. **Vue globale** : Dashboard avec statistiques temps réel
2. **Intervention rapide** : Pouvoir corriger n'importe quel problème en 30 secondes
3. **Alertes** : Être notifiée si quelque chose bloque (étudiant coincé, entreprise inactive)
4. **Contrôle total** : Pouvoir modifier n'importe quel statut
5. **Statistiques** : Voir le taux de complétion, nombre d'entretiens, etc.
6. **Traçabilité** : Logs de ce qui s'est passé pour débriefing post-événement

**Citation représentative :**
> "J'ai besoin de VOIR ce qui se passe en temps réel et de pouvoir intervenir immédiatement si ça coince quelque part. Le jour J, chaque minute compte."

**Scénario d'usage type :**
1. 8h : Se connecte au dashboard admin depuis son ordinateur
2. Voit : "10 entreprises créées, 50 étudiants inscrits, 0 entretien en cours"
3. 9h : L'événement démarre
4. Dashboard se met à jour : "3 entretiens en cours, 12 étudiants en attente"
5. 10h : Alerte rouge "Alice en entretien chez Google depuis 45 min"
6. Clique sur Alice → "Mettre en pause" → Problème résolu en 10 secondes
7. 11h : Google l'appelle "Notre lien ne marche plus"
8. Va dans "Entreprises" → "Régénérer token Google" → Envoie nouveau lien
9. 12h : Voit "5 entreprises en pause (déjeuner)" → Normal
10. 17h : Fin de journée, clique "Export CSV"
11. Voit les stats : "127 entretiens réalisés, moyenne 2.5 par étudiant"

**Fonctionnalités clés pour Sophie :**
- Dashboard global avec KPIs en temps réel
- Liste des alertes (étudiants bloqués, entreprises inactives)
- Recherche rapide (trouver un étudiant en 2 secondes)
- Boutons d'action rapide (Reset, Forcer statut)
- Export des données pour rapport

---

### 1.5 Tableau Comparatif des Besoins

| Besoin | Alice (Étudiant) | Marc (Entreprise) | Sophie (Admin) |
|--------|------------------|-------------------|----------------|
| **Interface prioritaire** | Mobile | Desktop | Desktop |
| **Usage fréquence** | Toute la journée | Toute la journée | Ponctuel (intervention) |
| **Complexité acceptée** | Très simple | Simple | Peut être complexe |
| **Notifications** | Critiques (push) | Passives (visuel) | Alertes uniquement |
| **Personnalisation** | Faible | Moyenne | Élevée |
| **Besoin #1** | Savoir où j'en suis | Voir qui attend | Vue d'ensemble |
| **Besoin #2** | Être notifié | Marquer passé | Corriger problèmes |
| **Besoin #3** | Optimiser mon temps | Contrôler mon flux | Statistiques |

---

## 2. USER STORIES (BACKLOG AGILE)

### 2.1 Format des User Stories

Chaque story suit le format standard :
```
En tant que [RÔLE],
Je veux [ACTION],
Afin de [BÉNÉFICE].

Critères d'acceptation :
- Condition 1
- Condition 2
- Condition 3
```

Les stories sont priorisées selon la méthode MoSCoW :
- **P0 (Must Have)** : Indispensable pour le MVP
- **P1 (Should Have)** : Important mais pas bloquant
- **P2 (Could Have)** : Nice to have, si le temps le permet
- **P3 (Won't Have)** : Exclu du scope actuel

### 2.2 Stories Étudiant

#### US-E01 : Inscription avec email (P0)

**Story :**
En tant qu'étudiant,
Je veux créer un compte avec mon email et un mot de passe,
Afin de pouvoir accéder à la plateforme le jour de la job fair.

**Critères d'acceptation :**
- Formulaire d'inscription avec : email, password, confirmation password, prénom, nom
- Validation : email valide, password >8 caractères
- Message d'erreur si email déjà utilisé
- Redirection automatique vers le dashboard après inscription

**Priorité :** P0 (MVP)

---

#### US-E02 : Voir la liste des entreprises disponibles (P0)

**Story :**
En tant qu'étudiant,
Je veux voir la liste de toutes les entreprises présentes et en recrutement,
Afin de choisir chez qui m'inscrire.

**Critères d'acceptation :**
- Liste affichée avec nom de l'entreprise
- Indicateur "Recrutement en cours" visible (couleur verte)
- Les entreprises en "Pause" ne sont PAS affichées dans cette liste
- Bouton "S'inscrire" pour chaque entreprise
- Liste triée alphabétiquement

**Priorité :** P0 (MVP)

---

#### US-E03 : S'inscrire dans une file d'attente (P0)

**Story :**
En tant qu'étudiant,
Je veux m'inscrire dans la file d'attente d'une entreprise,
Afin de signaler mon intérêt et obtenir une place.

**Critères d'acceptation :**
- Clic sur "S'inscrire chez X" ajoute l'étudiant en dernière position
- Message de confirmation : "Tu es inscrit chez X en position N"
- Si déjà inscrit, bouton grisé avec mention "Déjà inscrit"
- Notification immédiate si l'étudiant devient 1er disponible

**Priorité :** P0 (MVP)

---

#### US-E04 : Voir ma position dans chaque file (P0)

**Story :**
En tant qu'étudiant,
Je veux voir ma position dans chaque file où je suis inscrit,
Afin de savoir où j'en suis et prioriser mes déplacements.

**Critères d'acceptation :**
- Dashboard affiche la liste de toutes mes inscriptions
- Pour chaque inscription : nom entreprise, ma position (ex: "3ème")
- Indication visuelle si je suis 1er (ex: badge doré "TU ES LE PROCHAIN")
- Mise à jour en temps réel (WebSocket)

**Priorité :** P0 (MVP)

---

#### US-E05 : Recevoir notification quand je peux passer (P0)

**Story :**
En tant qu'étudiant,
Je veux recevoir une notification quand c'est mon tour,
Afin de ne pas rater mon opportunité.

**Critères d'acceptation :**
- Notification push dans l'interface : "🎯 Tu peux passer chez X !"
- Notification visible même si je suis sur une autre page
- Son léger (si autorisé par l'utilisateur)
- Badge rouge sur l'icône si notification non lue

**Priorité :** P0 (MVP)

---

#### US-E06 : Commencer un entretien (P0)

**Story :**
En tant qu'étudiant,
Je veux cliquer sur un bouton pour démarrer mon entretien,
Afin d'informer le système que je suis maintenant occupé.

**Critères d'acceptation :**
- Gros bouton "Commencer mon entretien chez X" dans la notification
- Clic change mon statut à "En entretien chez X"
- Message d'erreur si l'entreprise n'a plus de slots disponibles
- Redirection vers page "Entretien en cours" avec timer
- Je suis automatiquement grisé dans toutes les autres files

**Priorité :** P0 (MVP)

---

#### US-E07 : Repasser disponible après pause (P0)

**Story :**
En tant qu'étudiant,
Je veux repasser mon statut à "Disponible" quand je suis prêt,
Afin de pouvoir passer d'autres entretiens.

**Critères d'acceptation :**
- Quand mon statut = "En pause", bouton "Repasser disponible" visible
- Clic change mon statut à "Disponible"
- Je ne suis plus grisé dans les files
- Notifications reprennent si je suis premier quelque part

**Priorité :** P0 (MVP)

---

#### US-E08 : Voir combien de personnes avant moi (P1)

**Story :**
En tant qu'étudiant,
Je veux savoir combien de personnes non-passées sont avant moi,
Afin d'estimer mon temps d'attente.

**Critères d'acceptation :**
- Notification indique : "Il y a encore N personnes avant toi"
- N = nombre d'étudiants avant moi qui ne sont pas encore passés (is_completed=False)
- Exclut ceux déjà en entretien chez cette entreprise
- Si N=0 : "Il n'y a personne avant toi"

**Priorité :** P1 (Important)

---

#### US-E09 : Voir notification "Tu peux passer APRÈS [nom]" (P1)

**Story :**
En tant qu'étudiant,
Je veux savoir si quelqu'un passe avant moi,
Afin de me préparer à être le suivant.

**Critères d'acceptation :**
- Si je suis 2ème et que le 1er est en entretien, je vois : "Tu peux passer chez X APRÈS Alice"
- Mise à jour en temps réel quand Alice termine
- Devient "Tu peux passer chez X !" dès qu'Alice a terminé

**Priorité :** P1 (Important)

---

#### US-E10 : Voir mon historique d'entretiens (P2)

**Story :**
En tant qu'étudiant,
Je veux voir la liste des entreprises où je suis déjà passé,
Afin de me rappeler chez qui j'ai postulé.

**Critères d'acceptation :**
- Section "Mes entretiens passés" dans le dashboard
- Liste : nom entreprise, heure de passage
- Tri chronologique (plus récent en premier)

**Priorité :** P2 (Nice to have)

---

### 2.3 Stories Entreprise

#### US-C01 : Accéder via lien unique (P0)

**Story :**
En tant qu'entreprise,
Je veux accéder à mon interface via un lien unique,
Afin de ne pas avoir à créer de compte.

**Critères d'acceptation :**
- URL format : `jobfair.app/company/[TOKEN]`
- Accès direct sans login
- Si token invalide : message d'erreur clair
- Pas besoin de mémoriser le lien (peut être envoyé par email)

**Priorité :** P0 (MVP)

---

#### US-C02 : Voir ma file d'attente ordonnée (P0)

**Story :**
En tant qu'entreprise,
Je veux voir la liste ordonnée des étudiants qui attendent,
Afin de savoir qui recevoir en priorité.

**Critères d'acceptation :**
- Section "À VENIR" affiche la liste ordonnée par position
- Affichage : Position, Nom étudiant, Statut (icône + couleur)
- Disponible 🟢 / En entretien ailleurs ⚪ / En pause ⚪
- Les étudiants grisés sont visuellement atténués
- Mise à jour temps réel (WebSocket)

**Priorité :** P0 (MVP)

---

#### US-C03 : Voir qui est en entretien chez moi (P0)

**Story :**
En tant qu'entreprise,
Je veux voir qui occupe actuellement mes slots,
Afin de savoir quand je serai disponible pour le suivant.

**Critères d'acceptation :**
- Section "EN ENTRETIEN MAINTENANT (X/N)" en haut de page
- X = nombre actuel en entretien, N = max_slots
- Liste des étudiants en entretien avec heure d'arrivée
- Timer visible : "depuis 8 min"

**Priorité :** P0 (MVP)

---

#### US-C04 : Marquer un étudiant comme passé (P0)

**Story :**
En tant qu'entreprise,
Je veux marquer un étudiant comme "passé",
Afin de libérer mon slot et faire venir le suivant.

**Critères d'acceptation :**
- Bouton "Marquer passé" pour chaque étudiant en entretien
- Clic déplace l'étudiant vers "DÉJÀ PASSÉS"
- Statut de l'étudiant passe automatiquement à "En pause"
- Slot libéré instantanément
- Prochain disponible notifié automatiquement

**Priorité :** P0 (MVP)

---

#### US-C05 : Mettre mon stand en pause (P0)

**Story :**
En tant qu'entreprise,
Je veux mettre mon recrutement en pause,
Afin de prendre une pause déjeuner sans être dérangé.

**Critères d'acceptation :**
- Toggle "Recrutement / Pause" visible en haut
- Quand "Pause" : je disparais de la liste publique
- Les étudiants inscrits voient "(En pause)" sur mon entreprise
- Aucune notification envoyée pendant la pause
- Je peux repasser en "Recrutement" à tout moment

**Priorité :** P0 (MVP)

---

#### US-C06 : Voir qui est déjà passé (P1)

**Story :**
En tant qu'entreprise,
Je veux voir la liste des étudiants déjà passés,
Afin d'éviter les doublons et garder une trace.

**Critères d'acceptation :**
- Section "DÉJÀ PASSÉS" en bas de page
- Liste : Nom, Heure de passage
- Tri chronologique inversé (plus récent en premier)
- Badge ✅ pour chaque étudiant passé

**Priorité :** P1 (Important)

---

#### US-C07 : Voir mon nombre de slots disponibles (P1)

**Story :**
En tant qu'entreprise,
Je veux voir clairement combien de slots j'ai et combien sont occupés,
Afin de savoir si je peux recevoir quelqu'un d'autre.

**Critères d'acceptation :**
- Affichage clair : "Capacité : 2 entretiens simultanés"
- Indicateur visuel : "EN ENTRETIEN (1/2)" avec barre de progression
- Couleur verte si slots disponibles, rouge si full

**Priorité :** P1 (Important)

---

### 2.4 Stories Admin

#### US-A01 : Créer une entreprise avec lien auto-généré (P0)

**Story :**
En tant qu'admin,
Je veux créer une entreprise et obtenir automatiquement son lien d'accès,
Afin de pouvoir le communiquer à l'entreprise.

**Critères d'acceptation :**
- Formulaire : Nom entreprise, Nombre de slots (default=1)
- Clic "Créer" génère automatiquement un token unique
- Affichage du lien complet : `jobfair.app/company/abc123...`
- Bouton "Copier le lien" pour faciliter le partage
- Confirmation : "Entreprise créée avec succès"

**Priorité :** P0 (MVP)

---

#### US-A02 : Créer un étudiant (P0)

**Story :**
En tant qu'admin,
Je veux créer un compte étudiant,
Afin d'inscrire des étudiants qui n'ont pas pu le faire eux-mêmes.

**Critères d'acceptation :**
- Formulaire : Email, Password, Prénom, Nom
- Validation identique à l'inscription classique
- Confirmation : "Étudiant créé avec succès"
- Option : Envoyer email avec identifiants (facultatif)

**Priorité :** P0 (MVP)

---

#### US-A03 : Modifier le statut de n'importe qui (P0)

**Story :**
En tant qu'admin,
Je veux pouvoir forcer le statut de n'importe quel étudiant,
Afin de débloquer des situations problématiques.

**Critères d'acceptation :**
- Liste de tous les étudiants avec leur statut actuel
- Dropdown pour changer le statut : Disponible / En pause / En entretien chez X
- Changement instantané avec broadcast WebSocket
- Logs de l'action (qui, quand, quoi)

**Priorité :** P0 (MVP)

---

#### US-A04 : Dashboard global avec KPIs (P0)

**Story :**
En tant qu'admin,
Je veux voir un dashboard avec les statistiques clés en temps réel,
Afin de superviser l'événement.

**Critères d'acceptation :**
- Affichage : Nombre total étudiants, entreprises, entretiens en cours
- Graphique : Évolution du nombre d'entretiens dans le temps
- Liste des alertes : étudiants bloqués, entreprises inactives
- Mise à jour automatique toutes les 10 secondes

**Priorité :** P0 (MVP)

---

#### US-A05 : Régénérer le token d'une entreprise (P1)

**Story :**
En tant qu'admin,
Je veux pouvoir régénérer le lien d'accès d'une entreprise,
Afin de réagir si le lien a été compromis ou perdu.

**Critères d'acceptation :**
- Bouton "Régénérer token" sur chaque entreprise
- Confirmation : "Êtes-vous sûr ? L'ancien lien ne fonctionnera plus"
- Génération d'un nouveau token
- Affichage du nouveau lien avec bouton "Copier"

**Priorité :** P1 (Important)

---

#### US-A06 : Export CSV de toutes les données (P1)

**Story :**
En tant qu'admin,
Je veux exporter toutes les données en CSV,
Afin de faire un rapport post-événement.

**Critères d'acceptation :**
- Bouton "Export CSV" dans le dashboard
- Génère un fichier avec : étudiants, entreprises, inscriptions, entretiens passés
- Colonnes : ID, Nom, Email, Entreprise, Position, Heure passage, Statut
- Download automatique du fichier

**Priorité :** P1 (Important)

---

#### US-A07 : Recherche rapide d'un étudiant (P1)

**Story :**
En tant qu'admin,
Je veux pouvoir rechercher un étudiant par nom ou email,
Afin de le trouver rapidement en cas de problème.

**Critères d'acceptation :**
- Barre de recherche en haut du dashboard
- Recherche en temps réel (dès la 3ème lettre)
- Affichage : Nom, Email, Statut actuel, Inscriptions
- Clic sur le résultat ouvre la fiche complète

**Priorité :** P1 (Important)

---

#### US-A08 : Bouton panic "Reset tous les statuts" (P2)

**Story :**
En tant qu'admin,
Je veux pouvoir remettre tous les étudiants à "Disponible" en un clic,
Afin de récupérer d'un bug critique.

**Critères d'acceptation :**
- Bouton rouge "RESET TOUS LES STATUTS" dans le dashboard
- Double confirmation : "Êtes-vous VRAIMENT sûr ?"
- Tous les étudiants passent à "Disponible"
- Toutes les entreprises passent à "Recrutement"
- Log de l'action

**Priorité :** P2 (Safety net)

---

### 2.5 Récapitulatif des Priorités

**P0 (MVP) - 15 stories :**
- Étudiants : 7 stories (inscription, inscription file, voir position, notifications, commencer entretien, repasser disponible)
- Entreprises : 5 stories (accès lien, voir file, voir en entretien, marquer passé, pause)
- Admin : 3 stories (créer entreprise, créer étudiant, modifier statuts, dashboard)

**P1 (Important) - 8 stories :**
- Étudiants : 2 stories
- Entreprises : 2 stories
- Admin : 4 stories

**P2 (Nice to have) - 2 stories :**
- Étudiants : 1 story
- Admin : 1 story

**Total : 25 user stories**

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Vue d'Ensemble de l'Architecture

Le système suit une architecture **client-serveur classique** avec une couche temps réel ajoutée via WebSockets.

```
┌──────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                     (React + Vite)                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │      │
│  │   Étudiant   │  │  Entreprise  │  │    Admin     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Composants partagés                        │     │
│  │  • Notifications • Listes • Boutons • Timer        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Services                              │     │
│  │  • API Client (Axios) • WebSocket Client           │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────┬───────────────────────────┬───────────────────┘
               │ HTTP/HTTPS                │ WebSocket (wss://)
               │ (API REST)                │ (Temps réel)
               ▼                           ▼
┌──────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│              (Django + Django REST Framework)                │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │              API REST (DRF)                        │     │
│  │  • Authentication (JWT)                            │     │
│  │  • Students endpoints                              │     │
│  │  • Companies endpoints                             │     │
│  │  • Queues endpoints                                │     │
│  │  • Admin endpoints                                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │         WebSocket (Django Channels)                │     │
│  │  • Real-time updates                               │     │
│  │  • Broadcast to groups                             │     │
│  │  • Queue updates                                   │     │
│  │  • Status changes                                  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │           Business Logic Layer                     │     │
│  │  • QueueService (calcul prochain disponible)      │     │
│  │  • NotificationService (trigger notifications)     │     │
│  │  • ValidationService (vérif slots, statuts)        │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────┬───────────────────────────┬───────────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│      PostgreSQL          │  │         Redis            │
│   (Base de données)      │  │  (Channel Layer pour     │
│                          │  │   Django Channels)       │
│  • Users                 │  │                          │
│  • Students              │  │  • Pub/Sub messaging     │
│  • Companies             │  │  • Session storage       │
│  • Queues                │  │                          │
└──────────────────────────┘  └──────────────────────────┘
```

### 3.2 Stack Technique Détaillée

#### 3.2.1 Frontend

**Framework principal :**
- **React 18** : Bibliothèque UI avec hooks
- **Vite** : Build tool moderne (plus rapide que Create React App)
- **TypeScript** (optionnel mais recommandé) : Typage statique

**Routing :**
- **React Router v6** : Navigation entre pages
  - `/` : Page d'accueil / connexion
  - `/student/dashboard` : Dashboard étudiant
  - `/company/:token` : Interface entreprise (dynamique)
  - `/admin/dashboard` : Dashboard admin
  - `/admin/companies` : Gestion entreprises
  - `/admin/students` : Gestion étudiants

**Styling :**
- **TailwindCSS** : Utility-first CSS pour rapidité de développement
- Pas de CSS-in-JS (pour garder la simplicité)

**State Management :**
- **React Context API** : Pour le state global (user authentifié, notifications)
- **React Query (TanStack Query)** : Pour le cache des données API
  - Gère automatiquement : cache, invalidation, refetch
  - Réduit les appels API inutiles

**WebSocket Client :**
- **Native WebSocket API** ou **socket.io-client** (selon backend)
- Connexion persistante pour recevoir les mises à jour temps réel

**HTTP Client :**
- **Axios** : Pour les appels API REST
  - Interceptors pour ajouter automatiquement le JWT token
  - Gestion centralisée des erreurs

**Librairies complémentaires :**
- **lucide-react** : Icônes modernes
- **react-hot-toast** : Notifications toast élégantes
- **date-fns** : Manipulation de dates

#### 3.2.2 Backend

**Framework principal :**
- **Django 5** : Framework web Python robuste
- **Django REST Framework (DRF)** : Pour créer l'API REST
  - Serializers pour validation
  - ViewSets pour CRUD automatique
  - Permissions classes pour sécurité

**Authentification :**
- **djangorestframework-simplejwt** : JSON Web Tokens
  - Access token (15 min de validité)
  - Refresh token (24h de validité)
- **Token-based auth** pour les entreprises (pas de JWT, juste le token unique)

**Temps réel :**
- **Django Channels** : Extension de Django pour WebSockets
  - ASGI au lieu de WSGI
  - Consumers pour gérer les connexions WebSocket
- **Redis** : Message broker pour Channels
  - Pub/Sub pour broadcast
  - Session storage

**Base de données :**
- **PostgreSQL** : BDD relationnelle robuste
  - Support des transactions ACID
  - Indexes pour performance
  - Contraintes pour intégrité

**Serveur ASGI :**
- **Daphne** : Serveur ASGI pour Django Channels
  - Gère HTTP et WebSocket simultanément

**Librairies complémentaires :**
- **django-cors-headers** : Gestion CORS pour autoriser le frontend
- **python-decouple** : Gestion des variables d'environnement
- **psycopg2** : Driver PostgreSQL pour Python

#### 3.2.3 Déploiement

**Frontend :**
- **Vercel** (recommandé) :
  - Déploiement automatique depuis GitHub
  - CDN global
  - HTTPS automatique
  - Gratuit jusqu'à 100GB/mois
- Alternative : Netlify, Cloudflare Pages

**Backend :**
- **Render** (recommandé) :
  - Supporte WebSockets nativement
  - PostgreSQL inclus
  - Redis addon disponible
  - HTTPS automatique
  - Tier gratuit disponible (limité mais suffisant pour tests)
- Alternative : Railway, Fly.io

**Base de données :**
- PostgreSQL fourni par Render (ou Railway)
- Backup automatique quotidien

**Redis :**
- Redis addon sur Render
- Alternative : Redis Cloud (tier gratuit 30MB)

**Configuration DNS :**
- Domaine personnalisé (optionnel) : ex: `jobfair.votreecole.fr`

### 3.3 Flux de Données Détaillés

#### 3.3.1 Flux HTTP (API REST)

**Exemple : Étudiant s'inscrit dans une file**

```
1. Frontend (React)
   └─→ User clique "S'inscrire chez Google"
       └─→ Composant appelle `api.joinQueue(companyId)`

2. API Client (Axios)
   └─→ POST /api/queues/
       Headers: { Authorization: "Bearer [JWT_TOKEN]" }
       Body: { company_id: 1 }

3. Backend Django (DRF)
   └─→ Reçoit requête
       └─→ Middleware vérifie JWT token
           └─→ View QueueViewSet.create()
               └─→ Validation :
                   • User est authentifié ?
                   • Company existe ?
                   • User pas déjà inscrit ?
               └─→ Business Logic (QueueService)
                   • Calcul position = MAX(positions) + 1
                   • Création Queue en DB
                   • Vérification : est-il premier disponible ?
                   • Si oui : trigger notification
               └─→ Réponse JSON 201 Created
                   { id: 123, company_id: 1, student_id: 5, position: 3 }

4. Frontend reçoit réponse
   └─→ React Query met à jour le cache
       └─→ Interface se rafraîchit automatiquement
           └─→ User voit : "Tu es inscrit en position 3"
```

#### 3.3.2 Flux WebSocket (Temps Réel)

**Exemple : Entreprise marque un étudiant "passé"**

```
1. Frontend Entreprise
   └─→ Clique "Marquer Alice passé"
       └─→ POST /api/queues/123/mark_completed/

2. Backend Django
   └─→ Reçoit requête
       └─→ Validation :
           • Company token valide ?
           • Queue appartient bien à cette company ?
           • is_completed pas déjà True ?
       └─→ Business Logic :
           • is_completed = True
           • statut Alice = "paused" (auto)
           • current_company Alice = null
           • Calcul du prochain disponible
           • Trigger NotificationService
       └─→ Broadcast WebSocket via Channels :
           
           • À Alice :
             {
               type: "status_changed",
               student_id: 5,
               new_status: "paused",
               message: "Tu as été marqué passé chez Google"
             }
           
           • À Google (entreprise) :
             {
               type: "queue_updated",
               company_id: 1,
               action: "student_completed",
               student_id: 5
             }
           
           • À Bob (prochain disponible) :
             {
               type: "notification",
               message: "Tu peux maintenant passer chez Google !",
               company_id: 1
             }
           
           • À tous les étudiants inscrits chez Google :
             {
               type: "queue_updated",
               company_id: 1
             }

3. Frontend (tous les clients connectés)
   └─→ WebSocket onMessage() reçoit les broadcasts
       └─→ React components écoutent ces events
           └─→ Mise à jour automatique de l'UI
               • Alice : voit notification + statut "En pause"
               • Google : Alice disparaît de "En entretien", apparaît dans "Passés"
               • Bob : voit notification + bouton activé
               • Autres : voient mise à jour des positions
```

### 3.4 Sécurité

**Authentification :**
- JWT pour étudiants/admin (stocké dans localStorage ou httpOnly cookie)
- Token unique pour entreprises (dans l'URL, comme invitation)
- Pas de CSRF nécessaire (API stateless)

**Autorisation :**
- Permissions classes Django DRF :
  - `IsAuthenticated` : Pour toutes les routes étudiants
  - `IsAdmin` : Pour routes admin
  - `CompanyTokenPermission` : Custom permission pour entreprises

**Validation :**
- Toutes les entrées validées côté serveur (never trust the client)
- Serializers DRF pour validation automatique
- Business rules vérifiées dans les services

**Rate Limiting :**
- Django middleware pour limiter :
  - 100 requêtes/min par user (étudiants)
  - 200 requêtes/min par company token
  - 500 requêtes/min pour admin

**HTTPS :**
- Obligatoire en production (fourni automatiquement par Vercel/Render)
- WebSocket sur wss:// (WebSocket Secure)

**CORS :**
- Configuration stricte : uniquement le domaine frontend autorisé
- Pas de wildcard `*` en production

---

## 4. WIREFRAMES ET INTERFACES

### 4.1 Principes de Design

**Design System :**
- **Couleurs principales :**
  - Primaire : Bleu (#3B82F6) - Actions principales
  - Succès : Vert (#10B981) - Disponible, validation
  - Warning : Orange (#F59E0B) - En entretien
  - Neutre : Gris (#6B7280) - En pause, désactivé
  - Danger : Rouge (#EF4444) - Erreurs, alertes
  
- **Typographie :**
  - Titres : Inter Bold, 24-32px
  - Corps : Inter Regular, 14-16px
  - Boutons : Inter Medium, 14-16px

- **Espacements :**
  - Padding cards : 16-24px
  - Marges entre sections : 32px
  - Gap entre éléments : 8-16px

### 4.2 Wireframes Dashboard Étudiant (Mobile)

```
┌─────────────────────────────────────────┐
│  ☰  JobFair Platform        Alice D. 🔔│ ← Header
├─────────────────────────────────────────┤
│                                         │
│  💡 OPPORTUNITÉS IMMÉDIATES             │
│  ┌───────────────────────────────────┐  │
│  │ 🎯 Google                        │  │
│  │ Tu peux passer maintenant !      │  │
│  │                                  │  │
│  │ [🚀 COMMENCER MON ENTRETIEN]    │  │ ← Bouton CTA énorme
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Microsoft                        │  │
│  │ Tu peux passer APRÈS Bob        │  │
│  │ (1 personne avant toi)          │  │
│  │                                  │  │
│  │ [ Attendre mon tour ]  (grisé)  │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│  📋 MES INSCRIPTIONS (5)                │
│  ┌───────────────────────────────────┐  │
│  │ ✅ Apple                          │  │
│  │ Position : Déjà passé            │  │
│  │ Passé à 10:24                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Amazon                           │  │
│  │ Position : 3ème                  │  │
│  │ 2 personnes avant toi            │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Meta (En pause) 🛑               │  │
│  │ Position : 1ère                  │  │
│  │ Entreprise en pause              │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│  [+ S'inscrire chez une entreprise]    │ ← Footer action
└─────────────────────────────────────────┘
```

**Interactions :**
- Swipe down pour refresh
- Tap sur une card pour voir détails
- Notifications apparaissent en toast en haut
- Badge rouge sur 🔔 si notifications non lues

---

### 4.3 Wireframes Page "En Entretien" (Mobile)

```
┌─────────────────────────────────────────┐
│  ← Retour              En entretien     │
├─────────────────────────────────────────┤
│                                         │
│           ⏱️                            │
│                                         │
│      EN ENTRETIEN CHEZ                  │
│          GOOGLE                         │
│                                         │
│         depuis 8 min                    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                  │  │
│  │  ✅ L'entreprise te marquera     │  │
│  │     "passé" quand vous aurez     │  │
│  │     terminé.                     │  │
│  │                                  │  │
│  │  Ton statut passera alors en     │  │
│  │  "Pause" automatiquement.        │  │
│  │                                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  💡 Pendant ce temps, tu es grisé      │
│     dans les autres files.             │
│                                         │
│                                         │
│                                         │
│  (Aucune action possible ici)          │
│                                         │
└─────────────────────────────────────────┘
```

**Note :** Pas de bouton "Terminer", l'étudiant attend que l'entreprise marque "passé".

---

### 4.4 Wireframes Page "En Pause" (Mobile)

```
┌─────────────────────────────────────────┐
│  ☰  JobFair Platform        Alice D. 🔔│
├─────────────────────────────────────────┤
│                                         │
│           ⏸️                            │
│                                         │
│       TU ES EN PAUSE                    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ✅ Ton entretien chez Google      │  │
│  │    est terminé                    │  │
│  │                                  │  │
│  │ Repasse "Disponible" pour voir   │  │
│  │ tes prochaines opportunités !    │  │
│  └───────────────────────────────────┘  │
│                                         │
│                                         │
│  [🚀 REPASSER DISPONIBLE]              │ ← Gros bouton CTA
│                                         │
│                                         │
│  💡 Tant que tu es en pause, tu es     │
│     grisé dans toutes les files.       │
│                                         │
└─────────────────────────────────────────┘
```

---

### 4.5 Wireframes Dashboard Entreprise (Desktop)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  JobFair Platform                     GOOGLE              [ Pause ▼]  Déco │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  📊 CAPACITÉ : 2 entretiens simultanés                                     │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ EN ENTRETIEN MAINTENANT (1/2)                          slots libres  │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                      │  │
│  │  👤 Alice Dupont                    Arrivée : 10:15 (il y a 8 min)  │  │
│  │                                                                      │  │
│  │     [ ✅ Marquer passé ]                                            │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ À VENIR (4 étudiants)                                                │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                      │  │
│  │  1. Bob Martin                                    Disponible 🟢     │  │
│  │                                                                      │  │
│  │  2. Charlie Léon                        En entretien ailleurs ⚪     │  │
│  │                                                                      │  │
│  │  3. David Roux                                     En pause ⚪       │  │
│  │                                                                      │  │
│  │  4. Emma Bernard                                  Disponible 🟢     │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ DÉJÀ PASSÉS (12 étudiants)                                   ▼ Voir  │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  ✅ Fatima Kader - 10:05                                            │  │
│  │  ✅ George Petit - 09:50                                            │  │
│  │  ✅ Hélène Dubois - 09:35                                           │  │
│  │  ...                                                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Interactions :**
- Toggle "Recrutement/Pause" en haut à droite
- Clic sur "Marquer passé" → confirmation rapide → action
- Hover sur étudiant grisé → tooltip "Cet étudiant est actuellement indisponible"
- Auto-refresh toutes les 2 secondes

---

### 4.6 Wireframes Dashboard Admin (Desktop)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  JobFair Admin                                          Sophie M.     Déco │
├─────────┬──────────────────────────────────────────────────────────────────┤
│ 📊 Stats│                                                                  │
│ 👥 Étud.│  📊 VUE D'ENSEMBLE                                              │
│ 🏢 Entr.│                                                                  │
│ 📋 Files│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│ 📤 Export  │  Étudiants   │  │ Entreprises  │  │  Entretiens  │          │
│         │  │      50      │  │      10      │  │  en cours: 8 │          │
└─────────┤  └──────────────┘  └──────────────┘  └──────────────┘          │
          │                                                                  │
          │  🔔 ALERTES (2)                                                  │
          │  ┌──────────────────────────────────────────────────────────┐   │
          │  │ ⚠️ Alice Dupont en entretien chez Google depuis 45 min  │   │
          │  │    [ Mettre en pause ]  [ Marquer passé ]                │   │
          │  └──────────────────────────────────────────────────────────┘   │
          │  ┌──────────────────────────────────────────────────────────┐   │
          │  │ ⚠️ Microsoft inactive depuis 30 min (en pause)          │   │
          │  │    [ Contacter l'entreprise ]                            │   │
          │  └──────────────────────────────────────────────────────────┘   │
          │                                                                  │
          │  📈 ACTIVITÉ TEMPS RÉEL                                          │
          │  ┌──────────────────────────────────────────────────────────┐   │
          │  │     Entretiens                                           │   │
          │  │  15 │                                    ╱╲              │   │
          │  │     │                          ╱╲      ╱  ╲             │   │
          │  │  10 │                ╱╲      ╱  ╲    ╱    ╲            │   │
          │  │     │      ╱╲      ╱  ╲    ╱    ╲  ╱      ╲           │   │
          │  │   5 │    ╱  ╲    ╱    ╲  ╱      ╲╱        ╲          │   │
          │  │     └────────────────────────────────────────────→      │   │
          │  │         9h    10h   11h   12h   13h   14h   15h         │   │
          │  └──────────────────────────────────────────────────────────┘   │
          │                                                                  │
          │  🔍 RECHERCHE RAPIDE                                             │
          │  [ Chercher un étudiant ou une entreprise...        ]  🔍       │
          │                                                                  │
          │  ⚡ ACTIONS RAPIDES                                              │
          │  [ Reset tous les statuts ]  [ Pause globale ]  [ Export CSV ]  │
          │                                                                  │
          └──────────────────────────────────────────────────────────────────┘
```

---

### 4.7 Design Patterns Importants

**Pattern 1 : Code couleur universel**
- 🟢 Vert = Disponible, actif, succès
- 🟠 Orange = En cours, attention
- ⚪ Gris = Indisponible temporairement, neutre
- 🔴 Rouge = Erreur, alerte critique
- 🔵 Bleu = Information, action principale

**Pattern 2 : Feedback immédiat**
- Chaque action affiche un toast de confirmation
- Les boutons montrent un loader pendant le traitement
- Les erreurs sont affichées inline avec explication

**Pattern 3 : Progressive disclosure**
- Les sections se déplient/replient (ex: "Déjà passés")
- Les détails apparaissent au hover ou au clic
- On ne montre que l'essentiel par défaut

---

## 5. PLAN DE TESTS ET VALIDATION

### 5.1 Stratégie de Tests

**Pyramide de tests :**
```
           /\
          /  \    E2E Tests (5%)
         /────\   
        / Integ \  Integration Tests (20%)
       /  ration \
      /──────────\
     /   Unit      \  Unit Tests (75%)
    /   Tests      \
   /________________\
```

### 5.2 Tests Fonctionnels (Scénarios Utilisateur)

#### Scénario 1 : Cycle Complet d'Alice

**Objectif :** Vérifier le parcours nominal d'un étudiant

**Prérequis :**
- Alice a un compte créé
- Google et Microsoft sont en "Recrutement"
- Aucun autre étudiant inscrit

**Étapes :**
1. Alice se connecte
2. Alice s'inscrit chez Google
3. Vérifie qu'elle voit "Position : 1ère"
4. Vérifie qu'elle reçoit notification "Tu peux passer chez Google !"
5. Alice clique "Commencer mon entretien"
6. Vérifie que son statut passe à "En entretien chez Google"
7. Google voit Alice dans "EN ENTRETIEN MAINTENANT"
8. Google clique "Marquer passé"
9. Vérifie que statut Alice passe à "En pause"
10. Vérifie qu'Alice reçoit notification "Marqué passé chez Google"
11. Alice clique "Repasser disponible"
12. Vérifie que statut Alice passe à "Disponible"

**Résultat attendu :** ✅ Tous les changements de statut fonctionnent, notifications reçues

---

#### Scénario 2 : Race Condition (Bob et Charlie)

**Objectif :** Vérifier qu'un seul étudiant peut passer si max_slots=1

**Prérequis :**
- Bob et Charlie tous deux "Disponible"
- Google max_slots = 1
- Bob position 1, Charlie position 2

**Étapes :**
1. Bob et Charlie voient tous deux le bouton "Commencer"
2. Bob clique "Commencer" à T=0.00s
3. Charlie clique "Commencer" à T=0.01s (quasi-simultané)
4. Vérifier côté serveur :
   - Requête Bob arrive en premier → acceptée
   - Requête Charlie arrive ensuite → refusée
5. Vérifier côté frontend :
   - Bob voit "En entretien chez Google"
   - Charlie voit message d'erreur + bouton désactivé
6. Vérifier que Google voit seulement Bob dans "EN ENTRETIEN"

**Résultat attendu :** ✅ Un seul en entretien, pas de doublon

---

#### Scénario 3 : Admin Corrige un Problème

**Objectif :** Vérifier que l'admin peut débloquer une situation

**Prérequis :**
- Alice bloquée "En entretien chez Google" depuis 60 min
- Google a déjà marqué Alice "passée" mais Alice n'a pas changé son statut

**Étapes :**
1. Admin se connecte au dashboard
2. Voit alerte "Alice en entretien depuis 60 min"
3. Cherche "Alice" dans la barre de recherche
4. Ouvre la fiche Alice
5. Change statut à "En pause" (ou "Disponible")
6. Vérifie que Alice n'est plus dans "EN ENTRETIEN" chez Google
7. Vérifie que le prochain étudiant (Bob) est notifié

**Résultat attendu :** ✅ Problème résolu en <30 secondes

---

#### Scénario 4 : Entreprise en Pause et Reprise

**Objectif :** Vérifier le comportement pause/reprise

**Prérequis :**
- Google en "Recrutement" avec 3 étudiants inscrits
- Alice position 1 (Disponible), Bob position 2 (Disponible)

**Étapes :**
1. Alice reçoit notification "Tu peux passer chez Google"
2. Google clique "Mettre en pause"
3. Vérifier :
   - Google disparaît de la liste publique
   - Alice voit "Google (En pause)" avec bouton désactivé
   - Aucune nouvelle inscription possible
4. Attendre 10 minutes
5. Google clique "Reprendre le recrutement"
6. Vérifier :
   - Google réapparaît dans la liste publique
   - Alice reçoit à nouveau notification
   - Bouton Alice réactivé

**Résultat attendu :** ✅ Pause fonctionne, reprise restaure les notifications

---

#### Scénario 5 : Ordre de Passage avec Retours

**Objectif :** Vérifier que les étudiants reprennent leur position d'origine

**Prérequis :**
- File Google : Alice (1), Bob (2), Charlie (3)
- Tous disponibles initialement

**Étapes :**
1. Alice passe et termine (marquée passée)
2. Bob (maintenant 1er disponible) est notifié
3. AVANT que Bob ne clique, il s'inscrit chez Microsoft et y va
4. Statut Bob = "En entretien chez Microsoft"
5. Bob est grisé chez Google
6. Charlie (maintenant 1er disponible après Bob) est notifié
7. Charlie passe chez Google
8. Bob termine chez Microsoft, repasse "Disponible"
9. Vérifier que Bob reçoit notification "Tu peux passer chez Google"
10. Vérifier que Bob est bien avant Charlie dans l'ordre réel

**Résultat attendu :** ✅ Bob reprend sa position 2, n'a pas perdu sa place

---

### 5.3 Tests de Charge

**Objectif :** Vérifier que le système tient la charge

**Scénarios de charge :**

**Test 1 : 50 utilisateurs simultanés**
- 40 étudiants + 10 entreprises
- Tous se connectent en même temps (pic initial)
- 100 inscriptions en 5 minutes
- Vérifier :
  - Temps de réponse API < 500ms
  - WebSocket ne déconnecte pas
  - Aucune perte de données

**Test 2 : 200 actions/minute**
- Simulation d'activité intense :
  - 50 inscriptions
  - 30 changements de statut
  - 20 marquages "passé"
  - 100 lectures de dashboard
- Vérifier :
  - Serveur ne crashe pas
  - Base de données tient la charge
  - Redis ne sature pas

**Test 3 : Connexion WebSocket prolongée**
- 50 clients connectés pendant 8 heures continues
- Vérifier :
  - Pas de memory leak
  - Pas de déconnexion intempestive
  - Latence stable

**Outils :**
- **Locust** (Python) pour simulation de charge HTTP
- **Artillery** pour test WebSocket
- **Django Debug Toolbar** pour profiling

---

### 5.4 Tests Edge Cases

**Edge Case 1 : Étudiant s'inscrit chez entreprise qui passe en pause juste après**
- Action : Alice clique "S'inscrire" pendant que Google clique "Pause" (quasi-simultané)
- Résultat attendu : Inscription réussit MAIS Alice voit immédiatement "(En pause)"

**Edge Case 2 : Entreprise marque "passé" un étudiant qui vient de se déconnecter**
- Action : Alice ferme l'app, Google clique "Marquer passé"
- Résultat attendu : Changement de statut fonctionne, Alice verra la màj à la reconnexion

**Edge Case 3 : Admin supprime une entreprise pendant qu'un étudiant y est en entretien**
- Action : Alice en entretien chez Google, admin supprime Google
- Résultat attendu : Cascade delete, statut Alice repasse à "Disponible" (via signal Django)

**Edge Case 4 : Tous les étudiants d'une file sont grisés**
- Setup : 5 étudiants inscrits chez Google, tous en pause ou en entretien ailleurs
- Résultat attendu : Google voit "Aucun étudiant disponible actuellement"

**Edge Case 5 : max_slots passe de 2 à 1 pendant que 2 étudiants sont en entretien**
- Action : Admin change max_slots de 2 à 1 alors que Alice ET Bob sont en entretien
- Résultat attendu : Les 2 restent en entretien (grandfathering), mais 3ème ne peut pas commencer

---

### 5.5 Critères d'Acceptation Globaux

**Performance :**
- ✅ Temps de chargement page < 2 secondes
- ✅ Latence API < 300ms (P95)
- ✅ Notification reçue en < 1 seconde après l'événement
- ✅ WebSocket reconnexion automatique en < 5 secondes si déconnexion

**Fiabilité :**
- ✅ Aucun double entretien simultané (si max_slots=1)
- ✅ Aucune perte de position dans les files
- ✅ Aucune perte de notification critique

**Utilisabilité :**
- ✅ Interface compréhensible sans tutorial
- ✅ Actions principales faisables en < 3 clics
- ✅ Messages d'erreur clairs et actionnables

**Accessibilité :**
- ✅ Contrastes respectent WCAG 2.1 niveau AA
- ✅ Navigation possible au clavier
- ✅ Screen readers compatibles (attributs ARIA)

---

### 5.6 Checklist Jour J

**48h avant :**
- [ ] Déploiement sur production
- [ ] Test complet avec 5 utilisateurs réels
- [ ] Vérification des variables d'environnement
- [ ] Backup de la base de données
- [ ] Test de charge avec 100 utilisateurs simulés

**24h avant :**
- [ ] Création de tous les comptes entreprises
- [ ] Envoi des liens d'accès aux entreprises
- [ ] Création des comptes étudiants (ou auto-inscription ouverte)
- [ ] Test de connexion avec 3 entreprises réelles
- [ ] Vérification monitoring (logs, erreurs)

**Le matin même :**
- [ ] Connexion admin dashboard : vérifier que tout fonctionne
- [ ] Test rapide : 1 inscription, 1 entretien, 1 marquage passé
- [ ] Vérification WebSocket : notifications temps réel OK
- [ ] Numéro de téléphone admin visible pour support

**Pendant l'événement :**
- [ ] Admin dashboard ouvert en permanence
- [ ] Surveillance des alertes
- [ ] Intervention rapide si problème (<2 min)
- [ ] Export CSV toutes les 2 heures (backup)

**Après l'événement :**
- [ ] Export final de toutes les données
- [ ] Génération des statistiques
- [ ] Questionnaire de satisfaction
- [ ] Rétrospective : qu'est-ce qui a bien/mal fonctionné ?

---

## 6. CONCLUSION DU DOCUMENT P1

Ce document de conception fournit tous les éléments nécessaires pour :
- **Comprendre les utilisateurs** (Personas)
- **Planifier le développement** (User Stories priorisées)
- **Architecturer le système** (Stack + Flux de données)
- **Designer les interfaces** (Wireframes)
- **Valider la qualité** (Plan de tests)

**Prochaine étape :** Document P2 (Documentation opérationnelle et guides utilisateurs)