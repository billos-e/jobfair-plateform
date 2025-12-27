# PLATEFORME JOB FAIR - DOCUMENT OPÉRATIONNEL

**Version :** 1.0  
**Date :** Décembre 2024  
**Statut :** Guide opérationnel complet  
**Prérequis :** Documents P0 (Fondations) et P1 (Conception)

---

## TABLE DES MATIÈRES

1. [Matrices de Décision](#1-matrices-de-décision)
2. [Design System et Guide de Style](#2-design-system-et-guide-de-style)
3. [Plan de Contingence et Gestion des Erreurs](#3-plan-de-contingence-et-gestion-des-erreurs)
4. [Guide de Déploiement](#4-guide-de-déploiement)
5. [Manuels Utilisateurs](#5-manuels-utilisateurs)

---

## 1. MATRICES DE DÉCISION

### 1.1 Objectif des Matrices

Les matrices de décision permettent de :
- Éliminer les ambiguïtés dans l'implémentation
- Fournir des réponses rapides aux développeurs
- Tester exhaustivement tous les cas possibles
- Documenter les choix de conception

### 1.2 Matrice : Quand un Étudiant Peut-il Commencer un Entretien ?

Cette matrice détermine si le bouton "Commencer mon entretien" est actif ou non.

| # | Statut Étudiant | Position dans File | Entreprise Statut | Slots Disponibles | Résultat | Message Affiché |
|---|----------------|-------------------|-------------------|-------------------|----------|----------------|
| 1 | Disponible | Premier disponible | Recrutement | > 0 | ✅ PEUT | "Tu peux passer chez X !" |
| 2 | Disponible | Premier disponible | Recrutement | = 0 | ❌ NE PEUT PAS | "Cette entreprise ne peut pas recevoir plus d'étudiants" |
| 3 | Disponible | Premier disponible | Pause | > 0 | ❌ NE PEUT PAS | "Cette entreprise est en pause" |
| 4 | Disponible | Pas premier | Recrutement | > 0 | ❌ NE PEUT PAS | "Tu peux passer APRÈS [Nom]" |
| 5 | Disponible | Pas premier | Recrutement | = 0 | ❌ NE PEUT PAS | "Il y a X personnes avant toi" |
| 6 | En pause | Premier disponible | Recrutement | > 0 | ❌ NE PEUT PAS | "Repasse disponible pour commencer" |
| 7 | En pause | N'importe | N'importe | N'importe | ❌ NE PEUT PAS | "Repasse disponible pour voir tes opportunités" |
| 8 | En entretien chez Y | N'importe | N'importe | N'importe | ❌ NE PEUT PAS | "Tu es déjà en entretien chez Y" |
| 9 | Disponible | Déjà passé (is_completed=True) | Recrutement | > 0 | ❌ NE PEUT PAS | "Tu es déjà passé chez cette entreprise" |

**Règle générale :** 
```
PEUT = (statut == "available") 
    AND (position == premier_disponible) 
    AND (company.status == "recruiting") 
    AND (slots_disponibles > 0)
    AND (is_completed == False)
```

---

### 1.3 Matrice : Affichage d'un Étudiant dans une File

Cette matrice détermine comment un étudiant apparaît dans la file d'une entreprise.

| # | Statut Étudiant | is_completed | Affichage | Style Visuel | Section |
|---|-----------------|--------------|-----------|--------------|---------|
| 1 | Disponible | False | Position + Nom + 🟢 | Normal | À VENIR |
| 2 | En entretien chez X | False | Nom + Timer | Normal (si X = cette entreprise) | EN ENTRETIEN (si X = cette entreprise) |
| 3 | En entretien chez X | False | Position + Nom + ⚪ | Grisé (si X ≠ cette entreprise) | À VENIR (si X ≠ cette entreprise) |
| 4 | En entretien chez Y | False | Position + Nom + ⚪ | Grisé | À VENIR |
| 5 | En pause | False | Position + Nom + ⚪ | Grisé | À VENIR |
| 6 | Disponible | True | Nom + Heure passage | Badge ✅ | DÉJÀ PASSÉS |
| 7 | En pause | True | Nom + Heure passage | Badge ✅ | DÉJÀ PASSÉS |
| 8 | En entretien chez X | True | Nom + Heure passage | Badge ✅ | DÉJÀ PASSÉS |

**Règle de grisage :**
```
EST_GRISÉ = (statut != "available") OR (is_completed == True)
```

**Règle de section :**
```
SI is_completed == True → DÉJÀ PASSÉS
SINON SI (statut == "in_interview" AND current_company == cette_entreprise) → EN ENTRETIEN
SINON → À VENIR
```

---

### 1.4 Matrice : Notifications Envoyées aux Étudiants

Cette matrice détermine quand et quelles notifications sont envoyées.

| # | Événement Déclencheur | Étudiant Concerné | Condition | Notification Envoyée |
|---|----------------------|-------------------|-----------|---------------------|
| 1 | Étudiant s'inscrit dans file | Cet étudiant | Il devient 1er disponible immédiatement | "🎯 Tu peux passer chez X !" |
| 2 | Étudiant s'inscrit dans file | Cet étudiant | Il n'est PAS 1er | Aucune (attend) |
| 3 | Slot se libère (marquage "passé") | Prochain(s) disponible(s) | Selon nombre de slots libres | "🎯 Tu peux maintenant passer chez X !" |
| 4 | Étudiant A termine son entretien | Étudiant B (suivant) | B est le prochain disponible | "🎯 Tu peux passer chez X !" |
| 5 | Étudiant devant moi devient indisponible | Cet étudiant | Je deviens 1er disponible | "🎯 Tu peux passer chez X !" |
| 6 | Je suis marqué "passé" par entreprise | Cet étudiant | Toujours | "✅ Tu as été marqué passé chez X. Pense à repasser disponible." |
| 7 | Entreprise repasse en "Recrutement" | Premier(s) disponible(s) | Étaient déjà inscrits | "🎯 Tu peux maintenant passer chez X !" |
| 8 | Admin me met "Disponible" | Cet étudiant | J'étais en pause et je deviens 1er | "🎯 Tu peux passer chez X !" |

**Règle de calcul "prochain(s) disponible(s)" :**
```
N = nombre de slots libérés
Liste = étudiants WHERE:
  - company = X
  - is_completed = False
  - statut = "available"
  - current_company IS NULL
  ORDER BY position ASC
  LIMIT N

NOTIFIER chaque étudiant dans Liste
```

---

### 1.5 Matrice : Actions Entreprise et Leurs Effets

Cette matrice liste toutes les actions possibles d'une entreprise et leurs conséquences.

| # | Action Entreprise | Conditions Préalables | Effets Immédiats | Effets Secondaires |
|---|------------------|----------------------|------------------|-------------------|
| 1 | Cliquer "Marquer passé" sur étudiant A | A est dans "EN ENTRETIEN" | • is_completed(A) = True<br>• statut(A) = "paused"<br>• current_company(A) = null<br>• A → section "DÉJÀ PASSÉS" | • Slot libéré<br>• Prochain disponible notifié<br>• A notifié du changement<br>• A grisé dans autres files |
| 2 | Cliquer "Mettre en pause" | Aucune | • company.status = "paused" | • Disparaît de liste publique<br>• Étudiants inscrits voient "(En pause)"<br>• Aucune notification envoyée<br>• Nouveaux ne peuvent s'inscrire |
| 3 | Cliquer "Reprendre recrutement" | Statut = "paused" | • company.status = "recruiting" | • Réapparaît dans liste publique<br>• Notifications reprennent<br>• Boutons étudiants réactivés |
| 4 | Marquer plusieurs étudiants "passés" (batch) | Plusieurs en entretien | Même que #1 pour chacun | • Plusieurs slots libérés<br>• N étudiants notifiés (N=slots libres) |

---

### 1.6 Matrice : Transitions de Statut Étudiant

Cette matrice montre toutes les transitions possibles de statut.

| Statut Actuel | Action / Déclencheur | Statut Suivant | Qui Peut Déclencher | Vérifications |
|--------------|---------------------|----------------|---------------------|---------------|
| Disponible | Clique "Commencer entretien chez X" | En entretien chez X | Étudiant | • Slots disponibles<br>• Premier dans file<br>• Entreprise en recrutement |
| En entretien chez X | Entreprise X clique "Marquer passé" | En pause | Entreprise X | • is_completed passe à True |
| En entretien chez X | Admin force | Disponible | Admin | Aucune (override) |
| En entretien chez X | Admin force | En pause | Admin | Aucune (override) |
| En pause | Clique "Repasser disponible" | Disponible | Étudiant | Aucune |
| En pause | Admin force | Disponible | Admin | Aucune (override) |
| En pause | Admin force | En entretien chez X | Admin | Aucune (bypass validations) |
| Disponible | Admin force | En pause | Admin | Aucune (override) |
| Disponible | Admin force | En entretien chez X | Admin | Aucune (bypass validations) |

**Diagramme de transition :**
```
    ┌──────────────┐
    │  DISPONIBLE  │◄─────────────┐
    └──────┬───────┘              │
           │                      │
           │ Commence             │ Reprend
           │ entretien            │
           ▼                      │
    ┌──────────────────┐          │
    │ EN ENTRETIEN     │          │
    │ (chez X)         │          │
    └──────┬───────────┘          │
           │                      │
           │ Entreprise           │
           │ marque "passé"       │
           ▼                      │
    ┌──────────────┐              │
    │  EN PAUSE    │──────────────┘
    └──────────────┘
    
    (Admin peut forcer n'importe quelle transition)
```

---

### 1.7 Matrice : Calcul du Nombre de Personnes Avant Moi

Cette matrice explique comment calculer "X personnes avant toi qui ne sont pas passées".

| Ma Position | Étudiants Avant Moi (détail) | Comptage | Résultat Affiché |
|-------------|------------------------------|----------|------------------|
| 1 | Aucun | 0 | "Il n'y a personne avant toi" |
| 2 | • Position 1 : Alice (En entretien chez X) | 0 | "Tu peux passer APRÈS Alice" |
| 3 | • Position 1 : Alice (Passée)<br>• Position 2 : Bob (Disponible) | 0 | "Tu peux passer APRÈS Bob" |
| 4 | • Position 1 : Alice (Passée)<br>• Position 2 : Bob (En entretien ailleurs)<br>• Position 3 : Charlie (En pause) | 2 | "Il y a encore 2 personnes avant toi" |
| 5 | • Position 1 : Alice (Passée)<br>• Position 2 : Bob (Passé)<br>• Position 3 : Charlie (En entretien chez X)<br>• Position 4 : David (Disponible) | 0 | "Tu peux passer APRÈS David" |

**Formule exacte :**
```sql
SELECT COUNT(*) 
FROM Queue Q
JOIN Student S ON Q.student_id = S.id
WHERE Q.company_id = cette_entreprise
  AND Q.position < ma_position
  AND Q.is_completed = False
  AND NOT (S.current_company = cette_entreprise)
```

**Explication :**
- Compte les étudiants AVANT ma position
- Qui ne sont PAS encore passés (is_completed = False)
- Qui ne sont PAS actuellement en entretien chez cette entreprise (car déjà en train de passer)

---

### 1.8 Matrice : Gestion des Slots avec max_concurrent_interviews

Cette matrice explique le comportement avec différents nombres de slots.

| max_slots | Actuellement en Entretien | Slots Libres | Qui Peut Commencer | Notification Envoyée À |
|-----------|--------------------------|--------------|-------------------|----------------------|
| 1 | 0 | 1 | Premier disponible | 1 étudiant (le 1er) |
| 1 | 1 (Alice) | 0 | Personne | Personne (attente) |
| 2 | 0 | 2 | 2 premiers disponibles | 2 étudiants |
| 2 | 1 (Alice) | 1 | Prochain disponible après Alice | 1 étudiant (le suivant) |
| 2 | 2 (Alice, Bob) | 0 | Personne | Personne (attente) |
| 3 | 1 (Alice) | 2 | 2 prochains disponibles | 2 étudiants |
| 3 | 2 (Alice, Bob) | 1 | Prochain disponible | 1 étudiant |
| 3 | 3 (Alice, Bob, Charlie) | 0 | Personne | Personne (attente) |

**Règle générale :**
```
slots_libres = max_concurrent_interviews - COUNT(en_entretien)
nombre_notifications = MIN(slots_libres, nombre_disponibles_dans_file)
```

---

## 2. DESIGN SYSTEM ET GUIDE DE STYLE

### 2.1 Philosophie du Design

**Principes directeurs :**
1. **Clarté avant tout** : L'interface doit être compréhensible instantanément
2. **Mobile-first** : Conçu d'abord pour mobile (étudiants), adapté au desktop (entreprises/admin)
3. **Feedback immédiat** : Chaque action doit avoir une réponse visuelle
4. **État avant action** : Toujours montrer l'état actuel avant de proposer une action
5. **Hiérarchie visuelle forte** : Les informations critiques ressortent immédiatement

### 2.2 Palette de Couleurs

#### Couleurs Primaires

**Bleu (Primary)**
```
Nom : Blue
Hex : #3B82F6
RGB : 59, 130, 246
Usage : Boutons principaux, liens, éléments interactifs
Variantes :
  - Light : #60A5FA (#3B82F6 à 80% luminosité)
  - Dark : #2563EB (#3B82F6 à 120% saturation)
```

**Vert (Success)**
```
Nom : Green
Hex : #10B981
RGB : 16, 185, 129
Usage : Statut "Disponible", validations, succès
Icône : 🟢
Variantes :
  - Light : #34D399
  - Dark : #059669
```

**Orange (Warning)**
```
Nom : Orange
Hex : #F59E0B
RGB : 245, 158, 11
Usage : Statut "En entretien", alertes non-critiques
Icône : 🟠
Variantes :
  - Light : #FBBF24
  - Dark : #D97706
```

**Gris (Neutral)**
```
Nom : Gray
Hex : #6B7280
RGB : 107, 114, 128
Usage : Statut "En pause", éléments désactivés, texte secondaire
Icône : ⚪
Variantes :
  - Light : #9CA3AF
  - Dark : #4B5563
  - Très clair : #F3F4F6 (backgrounds)
```

**Rouge (Error)**
```
Nom : Red
Hex : #EF4444
RGB : 239, 68, 68
Usage : Erreurs, alertes critiques, suppressions
Icône : 🔴
Variantes :
  - Light : #F87171
  - Dark : #DC2626
```

#### Couleurs Sémantiques par Statut

| Statut | Couleur | Hex | Usage |
|--------|---------|-----|-------|
| Disponible | Vert | #10B981 | Badge, indicateur, texte |
| En entretien | Orange | #F59E0B | Badge, fond de section |
| En pause | Gris | #6B7280 | Badge, état désactivé |
| Entreprise en pause | Gris + Rouge | #6B7280 + #EF4444 | Badge avec icône 🛑 |
| Déjà passé | Vert foncé | #059669 | Badge avec ✅ |
| Erreur | Rouge | #EF4444 | Messages d'erreur |

---

### 2.3 Typographie

**Police principale : Inter**
```
Raison : Lisibilité optimale sur écran, support excellent des caractères
Source : Google Fonts
Fallback : -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

**Hiérarchie typographique :**

| Élément | Taille | Poids | Line Height | Usage |
|---------|--------|-------|-------------|-------|
| H1 | 32px | Bold (700) | 40px | Titres principaux (Dashboard) |
| H2 | 24px | SemiBold (600) | 32px | Sections (EN ENTRETIEN, À VENIR) |
| H3 | 20px | SemiBold (600) | 28px | Sous-sections |
| Body Large | 16px | Regular (400) | 24px | Texte principal, labels |
| Body | 14px | Regular (400) | 20px | Texte secondaire |
| Small | 12px | Regular (400) | 16px | Annotations, timestamps |
| Button | 16px | Medium (500) | 24px | Texte des boutons |

**Règles de lisibilité :**
- Maximum 60-70 caractères par ligne pour le texte dense
- Contraste minimum 4.5:1 pour texte normal (WCAG AA)
- Contraste minimum 3:1 pour texte large (>18px)

---

### 2.4 Composants Visuels

#### Boutons

**Bouton Primary (CTA principal)**
```
Style :
  - Background : #3B82F6
  - Text : White (#FFFFFF)
  - Padding : 12px 24px
  - Border-radius : 8px
  - Font-weight : 500
  - Shadow : 0 2px 4px rgba(0,0,0,0.1)

Hover :
  - Background : #2563EB
  - Shadow : 0 4px 8px rgba(0,0,0,0.15)

Disabled :
  - Background : #9CA3AF
  - Cursor : not-allowed
  - Opacity : 0.6
```

**Bouton Success (Actions positives)**
```
Style :
  - Background : #10B981
  - Text : White
  - Padding : 10px 20px
  - Border-radius : 6px

Hover :
  - Background : #059669

Usage : "Marquer passé", "Repasser disponible"
```

**Bouton Ghost (Actions secondaires)**
```
Style :
  - Background : Transparent
  - Text : #3B82F6
  - Border : 1px solid #3B82F6
  - Padding : 10px 20px
  - Border-radius : 6px

Hover :
  - Background : #EFF6FF (bleu très léger)

Usage : "Annuler", "Voir plus"
```

**Bouton Danger (Actions destructives)**
```
Style :
  - Background : #EF4444
  - Text : White
  - Padding : 10px 20px
  - Border-radius : 6px

Hover :
  - Background : #DC2626

Usage : "Supprimer", "Reset tous les statuts"
Toujours accompagné d'une confirmation
```

#### Badges de Statut

**Badge Disponible**
```html
<span class="badge badge-success">
  🟢 Disponible
</span>

Style :
  - Background : #D1FAE5 (vert très clair)
  - Text : #059669 (vert foncé)
  - Padding : 4px 12px
  - Border-radius : 12px (pill shape)
  - Font-size : 14px
  - Font-weight : 500
```

**Badge En entretien**
```html
<span class="badge badge-warning">
  🟠 En entretien
</span>

Style :
  - Background : #FEF3C7 (orange très clair)
  - Text : #D97706 (orange foncé)
```

**Badge En pause**
```html
<span class="badge badge-neutral">
  ⚪ En pause
</span>

Style :
  - Background : #F3F4F6 (gris très clair)
  - Text : #4B5563 (gris foncé)
```

**Badge Déjà passé**
```html
<span class="badge badge-completed">
  ✅ Passé
</span>

Style :
  - Background : #D1FAE5
  - Text : #059669
```

#### Cards (Cartes d'information)

**Card Standard**
```
Style :
  - Background : White (#FFFFFF)
  - Border : 1px solid #E5E7EB
  - Border-radius : 12px
  - Padding : 16px
  - Shadow : 0 1px 3px rgba(0,0,0,0.1)

Hover (si cliquable) :
  - Shadow : 0 4px 12px rgba(0,0,0,0.15)
  - Border : 1px solid #3B82F6
  - Cursor : pointer

Usage : Liste des entreprises, liste des étudiants
```

**Card Notification (CTA important)**
```
Style :
  - Background : Linear gradient #3B82F6 to #2563EB
  - Text : White
  - Border-radius : 16px
  - Padding : 24px
  - Shadow : 0 8px 24px rgba(59, 130, 246, 0.3)

Usage : "Tu peux passer chez X !" avec gros bouton
```

**Card Section**
```
Style :
  - Background : #F9FAFB (gris ultra-léger)
  - Border : 2px solid #E5E7EB
  - Border-radius : 12px
  - Padding : 20px

Usage : Sections "EN ENTRETIEN", "À VENIR", "DÉJÀ PASSÉS"
```

#### Listes d'Étudiants

**Item de liste - Disponible**
```
Style :
  - Background : White
  - Border-bottom : 1px solid #E5E7EB
  - Padding : 12px 16px
  - Display : flex, align-items center

Contenu :
  - Position (si pertinent) : Bold, 20px, #1F2937
  - Nom : Regular, 16px, #1F2937
  - Badge statut : À droite
```

**Item de liste - Grisé (indisponible)**
```
Style :
  - Background : #F9FAFB (légèrement gris)
  - Opacity : 0.6
  - Texte : #6B7280 (gris)
  - Border-bottom : 1px solid #E5E7EB

Effet visuel :
  - Semble "en arrière-plan"
  - Texte barré (optionnel)
```

---

### 2.5 Iconographie

**Set d'icônes : Lucide React**
- Cohérent, moderne, open-source
- Taille par défaut : 20px
- Couleur : hérite du texte parent

**Icônes principales :**

| Élément | Icône | Code Lucide | Usage |
|---------|-------|-------------|-------|
| Notification | 🔔 | `<Bell />` | Indicateur de nouvelles notifs |
| Timer | ⏱️ | `<Timer />` | Durée d'entretien |
| Utilisateur | 👤 | `<User />` | Profil, liste étudiants |
| Entreprise | 🏢 | `<Building2 />` | Liste entreprises |
| Checkmark | ✅ | `<CheckCircle2 />` | Validations, "Passé" |
| Pause | ⏸️ | `<Pause />` | Statut pause |
| Play | ▶️ | `<Play />` | Commencer |
| Settings | ⚙️ | `<Settings />` | Configuration admin |
| Search | 🔍 | `<Search />` | Recherche |
| Menu | ☰ | `<Menu />` | Menu mobile |
| Close | ✖️ | `<X />` | Fermer modal |
| Alert | ⚠️ | `<AlertTriangle />` | Alertes |
| Info | ℹ️ | `<Info />` | Informations |

---

### 2.6 Layouts et Grilles

**Grid System (basé sur Tailwind)**
- Container max-width : 1280px
- Gutters : 16px mobile, 24px desktop
- Colonnes : 4 (mobile), 8 (tablet), 12 (desktop)

**Breakpoints :**
```
sm : 640px   → Mobile large / Tablet portrait
md : 768px   → Tablet
lg : 1024px  → Desktop
xl : 1280px  → Large desktop
```

**Espacements standards :**
```
xs : 4px
sm : 8px
md : 16px
lg : 24px
xl : 32px
2xl : 48px
```

---

### 2.7 Animations et Transitions

**Principes :**
- Subtiles et rapides (< 300ms)
- Améliorent la compréhension sans ralentir
- Respectent `prefers-reduced-motion`

**Transitions standards :**

```css
/* Boutons */
transition: all 150ms ease-in-out;

/* Cards hover */
transition: box-shadow 200ms ease, border-color 200ms ease;

/* Modals / Overlays */
transition: opacity 200ms ease, transform 200ms ease;

/* Notifications toast */
animation: slideInRight 300ms ease-out;
```

**Animations spécifiques :**

**Pulse (notification importante)**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
animation: pulse 2s infinite;
```

**Slide in (nouveau dans liste)**
```css
@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateY(-10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
animation: slideIn 300ms ease-out;
```

---

### 2.8 États Interactifs

**Hover**
- Boutons : Changement de couleur + shadow légèrement plus forte
- Cards : Border colorée + shadow plus prononcée
- Liens : Underline apparaît

**Focus (accessibilité clavier)**
```css
outline: 2px solid #3B82F6;
outline-offset: 2px;
```

**Active (pendant le clic)**
```css
transform: scale(0.98);
```

**Disabled**
```css
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
```

**Loading**
- Spinner pour actions rapides (< 2s attendues)
- Skeleton screens pour chargement de listes
- Progress bar pour actions longues

---

### 2.9 Messages et Feedback

#### Notifications Toast

**Succès**
```
Style :
  - Background : #D1FAE5
  - Border-left : 4px solid #10B981
  - Icon : ✅ CheckCircle
  - Text : #059669
  - Duration : 3 secondes

Exemple : "Tu t'es inscrit chez Google !"
```

**Erreur**
```
Style :
  - Background : #FEE2E2
  - Border-left : 4px solid #EF4444
  - Icon : ⚠️ AlertTriangle
  - Text : #DC2626
  - Duration : 5 secondes

Exemple : "Cette entreprise ne peut pas recevoir plus d'étudiants"
```

**Info**
```
Style :
  - Background : #DBEAFE
  - Border-left : 4px solid #3B82F6
  - Icon : ℹ️ Info
  - Text : #2563EB
  - Duration : 4 secondes

Exemple : "Bob est maintenant avant toi dans la file"
```

#### Messages d'Erreur Inline

```html
<div class="error-message">
  <svg class="icon">⚠️</svg>
  <span>Cette action n'est pas possible pour le moment.</span>
</div>

Style :
  - Background : #FEF2F2
  - Border : 1px solid #FCA5A5
  - Padding : 12px 16px
  - Border-radius : 8px
  - Color : #DC2626
```

#### États Vides (Empty States)

```html
<div class="empty-state">
  <svg class="icon-large">📭</svg>
  <h3>Aucun étudiant en attente</h3>
  <p>Les étudiants inscrits apparaîtront ici.</p>
</div>

Style :
  - Text-align : center
  - Padding : 48px
  - Color : #6B7280
  - Icon : 64px, opacity 0.5
```

---

### 2.10 Accessibilité (WCAG 2.1 AA)

**Contrastes respectés :**
- Texte normal sur blanc : minimum 4.5:1
- Texte large (>18px) sur blanc : minimum 3:1
- Éléments interactifs : minimum 3:1

**Navigation clavier :**
- Tous les éléments interactifs accessibles au Tab
- Ordre de tabulation logique
- Focus visible (outline bleu)
- Escape ferme les modals

**Screen readers :**
- Attributs ARIA sur éléments dynamiques
- `aria-label` sur icônes seules
- `role="status"` sur notifications
- Textes alternatifs sur images

**Responsive :**
- Taille de toucher minimum : 44×44px (iOS guidelines)
- Pas de hover-only sur mobile

---

## 3. PLAN DE CONTINGENCE ET GESTION DES ERREURS

### 3.1 Philosophie de la Résilience

**Principe fondamental :** Le système doit continuer de fonctionner même partiellement en cas de problème, avec dégradation gracieuse plutôt qu'échec total.

**Hiérarchie des priorités :**
1. **Protéger les données** : Aucune perte d'inscriptions ou d'entretiens passés
2. **Maintenir le flux** : Les entretiens peuvent continuer même si certaines fonctionnalités sont dégradées
3. **Informer clairement** : Les utilisateurs savent ce qui ne fonctionne pas
4. **Récupération rapide** : Outils pour l'admin pour corriger rapidement

---

### 3.2 Scénarios de Crise et Procédures

#### CRISE NIVEAU 1 : Serveur Backend Down

**Symptômes :**
- API ne répond plus (timeout ou 500)
- Impossible de charger les données
- Notifications ne fonctionnent plus

**Impact :**
- Critique : Tout le système est inutilisable
- Durée estimée : 2-15 minutes (selon cause)

**Procédure immédiate :**

**Étape 1 : Diagnostic (30 secondes)**
```
Admin ouvre : https://jobfair-backend.render.com/health
- Si 200 OK → Problème réseau côté client
- Si timeout → Serveur down
- Si 503 → Serveur en redémarrage
```

**Étape 2 : Activation Plan B (1 minute)**
```
1. Admin annonce verbalement :
   "Problème technique temporaire, continuez les entretiens en cours"
   
2. Admin ouvre export CSV de secours (pré-généré toutes les 30 min)
   Fichier : jobfair_backup_[timestamp].csv
   
3. Admin imprime ou affiche sur grand écran :
   - Liste des étudiants par entreprise
   - Ordre d'inscription
   
4. Mode manuel temporaire :
   - Entreprises cochent sur papier
   - Admin note les changements pour réintégration
```

**Étape 3 : Résolution technique (5-10 minutes)**
```
Si hébergé sur Render :
  1. Aller sur dashboard Render
  2. Vérifier logs : "View Logs"
  3. Si erreur Django : Redémarrer service ("Manual Deploy" > "Clear build cache & deploy")
  4. Si database issue : Vérifier connexion PostgreSQL
  
Si problème persistant :
  1. Rollback au déploiement précédent
  2. Investiguer logs en parallèle
```

**Étape 4 : Retour à la normale (2 minutes)**
```
1. Vérifier que https://jobfair-backend.render.com/health répond 200
2. Tester avec 1 utilisateur test
3. Annoncer verbalement : "Système rétabli"
4. Réintégrer les changements manuels (marquages "passé" faits sur papier)
```

**Prévention :**
- Monitoring actif (UptimeRobot ping toutes les 5 min)
- Health check endpoint qui vérifie DB + Redis
- Alertes par email/SMS si down >2 min

---

#### CRISE NIVEAU 2 : WebSocket Déconnexions Massives

**Symptômes :**
- Utilisateurs voient "Connexion perdue"
- Notifications temps réel ne fonctionnent plus
- Données affichées obsolètes

**Impact :**
- Moyen : API REST fonctionne, mais pas le temps réel
- Durée estimée : 1-5 minutes

**Procédure :**

**Étape 1 : Mode dégradé automatique (immédiat)**
```
Frontend détecte WebSocket down automatiquement
→ Active fallback : Polling toutes les 5 secondes
→ Affiche banner : "Mode dégradé : rafraîchissement automatique toutes les 5s"
```

**Étape 2 : Diagnostic (1 minute)**
```
Admin vérifie :
  1. Redis accessible ? (voir logs Render)
  2. Django Channels processus actif ? (voir Render dashboard)
  3. Trop de connexions simultanées ? (voir métriques)
```

**Étape 3 : Résolution**
```
Cause probable #1 : Redis saturé
  → Upgrade Redis tier (si gratuit → payant)
  → Ou réduire nombre de groupes WebSocket
  
Cause probable #2 : Daphne crashé
  → Redémarrer service backend
  
Cause probable #3 : Trop de connexions
  → Limiter à 200 connexions simultanées
  → Message utilisateurs : "Forte affluence, rechargez si lenteur"
```

**Étape 4 : Retour à la normale**
```
WebSocket reconnecte automatiquement
Frontend affiche : "Connexion rétablie ✅"
Polling s'arrête, temps réel reprend
```

---

#### CRISE NIVEAU 3 : Base de Données Corrompue

**Symptômes :**
- Erreurs 500 aléatoires
- Données incohérentes (étudiant à deux endroits simultanément)
- Impossible d'enregistrer de nouvelles actions

**Impact :**
- Critique : Risque de perte de données
- Durée estimée : 10-30 minutes

**Procédure (ATTENTION : EXPERT SEULEMENT)**

**Étape 1 : STOP IMMÉDIAT (30 secondes)**
```
1. Admin appuie sur bouton "PAUSE GLOBALE"
   → Toutes les entreprises passent en pause
   → Message : "Maintenance technique en cours"
   
2. Backup immédiat de la DB
   → Render : "Create Backup" sur PostgreSQL
   → Attendre confirmation
```

**Étape 2 : Diagnostic (2-5 minutes)**
```
Admin SSH dans le serveur (ou via Render shell)

Commandes de diagnostic :
  python manage.py check --database default
  python manage.py dbshell
  
Vérifier :
  - Tables existantes : \dt
  - Contraintes violées : SELECT * FROM queue WHERE student_id NOT IN (SELECT id FROM student);
  - Doublons : SELECT student_id, company_id, COUNT(*) FROM queue GROUP BY student_id, company_id HAVING COUNT(*) > 1;
```

**Étape 3 : Correction (5-15 minutes)**
```
Si doublons dans Queue :
  DELETE FROM queue WHERE id NOT IN (
    SELECT MIN(id) FROM queue GROUP BY student_id, company_id
  );
  
Si statuts incohérents :
  UPDATE student SET status = 'available' WHERE status = 'in_interview' AND current_company_id IS NULL;
  
Si contraintes cassées :
  python manage.py migrate --run-syncdb
```

**Étape 4 : Vérification (2 minutes)**
```
1. Tests manuels avec compte test
2. Vérifier quelques inscriptions aléatoires
3. Tester un marquage "passé"
```

**Étape 5 : Reprise (1 minute)**
```
1. Admin désactive "PAUSE GLOBALE"
2. Annonce : "Système rétabli, reprise normale"
3. Surveillance étroite pendant 10 minutes
```

**SI ÉCHEC → RESTAURATION BACKUP**
```
1. Render : "Restore Backup" (dernier backup sain)
2. Perte des 30 dernières minutes de données
3. Admin demande aux entreprises de re-marquer manuellement
```

---

#### CRISE NIVEAU 4 : Attaque / Comportement Malveillant

**Symptômes :**
- Inscriptions massives non-légitimes
- Spam de changements de statut
- Tentatives d'accès avec tokens invalides

**Impact :**
- Variable : De gênant à bloquant
- Durée : Dépend de la réponse

**Procédure :**

**Étape 1 : Identification (1 minute)**
```
Admin vérifie logs :
  - IP sources suspectes
  - Patterns répétitifs
  - Tokens d'entreprise volés ?
```

**Étape 2 : Isolation (immédiat)**
```
Si IP identifiée :
  → Bloquer au niveau firewall (Render settings)
  
Si token entreprise compromis :
  → Admin régénère le token immédiatement
  → Envoie nouveau lien à l'entreprise
  
Si étudiant malveillant :
  → Admin bloque le compte (status permanent "banned")
```

**Étape 3 : Nettoyage (5-10 minutes)**
```
Supprimer inscriptions frauduleuses :
  DELETE FROM queue WHERE student_id IN (
    SELECT id FROM student WHERE email LIKE '%spam%'
  );
  
Supprimer comptes fake :
  DELETE FROM student WHERE created_at > NOW() - INTERVAL '10 minutes'
    AND id NOT IN (SELECT DISTINCT student_id FROM queue);
```

**Étape 4 : Renforcement (post-crise)**
```
- Activer rate limiting plus strict
- Ajouter CAPTCHA sur inscription
- Log toutes les actions avec IP
```

---

### 3.3 Messages d'Erreur Utilisateur

**Principe :** Chaque erreur doit avoir un message clair + une action possible.

#### Erreurs Étudiant

| Code | Cause | Message Affiché | Action Suggérée |
|------|-------|----------------|----------------|
| E001 | Slots pleins | "Cette entreprise ne peut pas recevoir plus d'étudiants pour le moment." | "Réessaye dans quelques minutes ou inscris-toi ailleurs." |
| E002 | Pas premier | "Ce n'est pas encore ton tour." | "Tu seras notifié quand tu pourras passer." |
| E003 | Entreprise en pause | "Cette entreprise est en pause actuellement." | "Elle reprendra bientôt le recrutement." |
| E004 | Déjà inscrit | "Tu es déjà inscrit chez cette entreprise." | — |
| E005 | Statut invalide | "Tu dois être disponible pour commencer un entretien." | "Termine d'abord ton entretien en cours ou repasse disponible." |
| E006 | Déjà passé | "Tu es déjà passé chez cette entreprise." | — |
| E007 | Erreur réseau | "Connexion perdue. Vérifie ta connexion internet." | [Bouton Réessayer] |
| E008 | Serveur indisponible | "Le serveur ne répond pas. Nous travaillons à résoudre le problème." | "Réessaye dans quelques minutes." |

#### Erreurs Entreprise

| Code | Cause | Message Affiché | Action Suggérée |
|------|-------|----------------|----------------|
| C001 | Token invalide | "Ce lien n'est plus valide." | "Contacte l'organisateur pour obtenir un nouveau lien." |
| C002 | Étudiant déjà marqué | "Cet étudiant est déjà marqué comme passé." | — |
| C003 | Étudiant pas en entretien | "Cet étudiant n'est pas actuellement en entretien chez toi." | — |
| C004 | Erreur réseau | "Connexion perdue. Vérifie ta connexion internet." | [Bouton Réessayer] |

#### Erreurs Admin

| Code | Cause | Message Affiché | Action Suggérée |
|------|-------|----------------|----------------|
| A001 | Token déjà utilisé | "Ce token existe déjà, génération d'un nouveau..." | Automatique |
| A002 | Contrainte DB | "Impossible de supprimer : des données dépendent de cet élément." | "Supprime d'abord les éléments liés." |
| A003 | Validation échouée | "Données invalides : [détail du champ]" | "Corrige le champ indiqué." |

---

### 3.4 Monitoring et Alertes

**Outils recommandés :**

**UptimeRobot (gratuit)**
- Ping `/health` toutes les 5 minutes
- Alerte par email si down >2 minutes
- Dashboard public pour status

**Sentry (gratuit jusqu'à 5k events/mois)**
- Capture toutes les erreurs JavaScript (frontend)
- Capture toutes les exceptions Django (backend)
- Alertes temps réel sur Slack/Email

**Render Metrics (inclus)**
- CPU / RAM usage
- Temps de réponse
- Nombre de requêtes

**Métriques critiques à surveiller :**
- Temps de réponse API (P95 < 500ms)
- Taux d'erreur 5xx (< 0.1%)
- Connexions WebSocket actives
- Database connections pool usage

---

### 3.5 Checklist de Récupération Post-Crise

Après chaque incident, suivre cette checklist :

**Immédiat (dans l'heure) :**
- [ ] Vérifier que toutes les fonctionnalités sont rétablies
- [ ] Tester avec plusieurs utilisateurs réels
- [ ] Vérifier l'intégrité des données (pas de doublons, pas d'incohérences)
- [ ] Informer tous les utilisateurs que le problème est résolu

**Court terme (jour même) :**
- [ ] Analyser les logs pour comprendre la cause racine
- [ ] Documenter l'incident (heure, cause, résolution, durée)
- [ ] Identifier ce qui peut être amélioré
- [ ] Mettre en place des alertes si inexistantes

**Moyen terme (semaine suivante) :**
- [ ] Débrief avec l'équipe : qu'est-ce qui a bien/mal fonctionné ?
- [ ] Améliorer la documentation (ajouter ce cas dans le plan de contingence)
- [ ] Mettre à jour les procédures si nécessaire
- [ ] Renforcer les points faibles identifiés

---

## 4. GUIDE DE DÉPLOIEMENT

### 4.1 Prérequis

**Comptes nécessaires :**
- [ ] Compte GitHub (pour héberger le code)
- [ ] Compte Vercel (pour frontend)
- [ ] Compte Render (pour backend)

**Outils locaux :**
- [ ] Git installé
- [ ] Node.js 18+ installé
- [ ] Python 3.11+ installé
- [ ] Un éditeur de code (VS Code recommandé)

---

### 4.2 Déploiement du Backend (Django)

#### Étape 1 : Préparation du Code

**Structure attendue :**
```
backend/
├── manage.py
├── requirements.txt
├── core/
│   ├── settings.py
│   ├── urls.py
│   └── asgi.py
├── users/
├── students/
├── companies/
└── queues/
```

**Fichier `requirements.txt` :**
```txt
Django==5.0
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.0
channels==4.0.0
channels-redis==4.1.0
daphne==4.0.0
psycopg2-binary==2.9.9
python-decouple==3.8
```

**Fichier `Procfile` (à créer à la racine backend/) :**
```
web: daphne core.asgi:application --port $PORT --bind 0.0.0.0
```

**Fichier `runtime.txt` :**
```
python-3.11.6
```

#### Étape 2 : Configuration des Variables d'Environnement

**Fichier `.env.example` (à créer) :**
```env
SECRET_KEY=votre-secret-key-django-ici
DEBUG=False
ALLOWED_HOSTS=jobfair-backend.onrender.com
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379
CORS_ALLOWED_ORIGINS=https://jobfair-frontend.vercel.app
```

#### Étape 3 : Push sur GitHub

```bash
cd backend
git init
git add .
git commit -m "Initial backend setup"
git branch -M main
git remote add origin https://github.com/votre-username/jobfair-backend.git
git push -u origin main
```

#### Étape 4 : Déploiement sur Render

**4.1 Créer le service Web**
1. Aller sur render.com → Dashboard → "New +" → "Web Service"
2. Connecter le repository GitHub `jobfair-backend`
3. Configuration :
   - **Name** : `jobfair-backend`
   - **Environment** : Python 3
   - **Build Command** : `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`
   - **Start Command** : (laissé vide, Procfile sera utilisé)
   - **Plan** : Free (pour tests) ou Starter ($7/mois pour production)

**4.2 Créer la base PostgreSQL**
1. "New +" → "PostgreSQL"
2. **Name** : `jobfair-db`
3. **Plan** : Free (pour tests) ou Starter
4. Attendre la création (2-3 minutes)
5. Copier l'"Internal Database URL"

**4.3 Créer Redis**
1. "New +" → "Redis"
2. **Name** : `jobfair-redis`
3. **Plan** : Free (30MB) ou Starter
4. Copier l'"Internal Redis URL"

**4.4 Configurer les variables d'environnement**
Dans le service Web `jobfair-backend` :
- Aller dans "Environment"
- Ajouter :
```
SECRET_KEY = [générer avec: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"]
DEBUG = False
DATABASE_URL = [Internal Database URL de PostgreSQL]
REDIS_URL = [Internal Redis URL]
ALLOWED_HOSTS = jobfair-backend.onrender.com
CORS_ALLOWED_ORIGINS = https://jobfair-frontend.vercel.app
```

**4.5 Déployer**
- Cliquer "Create Web Service"
- Attendre le build (5-10 minutes la première fois)
- Vérifier les logs : doit finir par "Listening on port 10000"

**4.6 Tester**
```bash
curl https://jobfair-backend.onrender.com/health
# Doit retourner : {"status": "ok"}
```

---

### 4.3 Déploiement du Frontend (React)

#### Étape 1 : Préparation du Code

**Structure attendue :**
```
frontend/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── pages/
    ├── components/
    └── services/
        └── api.js
```

**Fichier `package.json` (extrait) :**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0"
  }
}
```

**Fichier `.env.example` :**
```env
VITE_API_URL=https://jobfair-backend.onrender.com/api
VITE_WS_URL=wss://jobfair-backend.onrender.com/ws
```

#### Étape 2 : Configuration de l'API

**Fichier `src/services/api.js` :**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### Étape 3 : Push sur GitHub

```bash
cd frontend
git init
git add .
git commit -m "Initial frontend setup"
git branch -M main
git remote add origin https://github.com/votre-username/jobfair-frontend.git
git push -u origin main
```

#### Étape 4 : Déploiement sur Vercel

**4.1 Via l'interface web**
1. Aller sur vercel.com → Dashboard → "Add New..." → "Project"
2. Connecter GitHub et sélectionner `jobfair-frontend`
3. Configuration :
   - **Framework Preset** : Vite
   - **Root Directory** : `./` (ou `frontend/` si monorepo)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

**4.2 Variables d'environnement**
Dans "Environment Variables" :
```
VITE_API_URL = https://jobfair-backend.onrender.com/api
VITE_WS_URL = wss://jobfair-backend.onrender.com/ws
```

**4.3 Déployer**
- Cliquer "Deploy"
- Attendre le build (2-5 minutes)
- Vercel génère automatiquement une URL : `https://jobfair-frontend.vercel.app`

**4.4 Domaine personnalisé (optionnel)**
- Settings → Domains → Add Domain
- Suivre les instructions pour configurer le DNS

---

### 4.4 Configuration CORS (Backend)

**Une fois le frontend déployé**, mettre à jour la variable d'environnement backend :

```
CORS_ALLOWED_ORIGINS = https://jobfair-frontend.vercel.app
```

Render redémarrera automatiquement le service.

---

### 4.5 Tests Post-Déploiement

**Checklist complète :**

**Backend :**
- [ ] `/health` répond 200 OK
- [ ] `/api/companies/` répond (même si vide)
- [ ] Connexion WebSocket possible (`wss://...`)
- [ ] Base de données accessible (pas d'erreur dans logs)
- [ ] Authentification JWT fonctionne

**Frontend :**
- [ ] Page se charge sans erreur console
- [ ] Connexion étudiant fonctionne
- [ ] Dashboard affiche correctement
- [ ] WebSocket se connecte (voir Network tab)
- [ ] Pas d'erreur CORS

**Intégration :**
- [ ] Créer un étudiant test → doit apparaître en DB
- [ ] S'inscrire chez une entreprise → doit créer une Queue
- [ ] Changer statut → notification temps réel reçue

---

### 4.6 Rollback en Cas de Problème

**Sur Render :**
1. Dashboard → Service → "Manual Deploy"
2. Sélectionner un commit précédent
3. "Deploy"

**Sur Vercel :**
1. Dashboard → Deployments
2. Trouver le déploiement précédent qui fonctionnait
3. "..." → "Promote to Production"

---

### 4.7 Monitoring Post-Déploiement

**Première heure :**
- Surveiller les logs Render en temps réel
- Vérifier métriques (CPU, RAM, temps de réponse)
- Tester avec 5-10 utilisateurs réels

**Première journée :**
- Vérifier Sentry pour erreurs JavaScript/Python
- Tester tous les workflows critiques
- Vérifier que les backups automatiques fonctionnent

**Première semaine :**
- Analyser les performances (temps de réponse, taux d'erreur)
- Optimiser si nécessaire (indexes DB, cache)
- Collecter feedback utilisateurs

---

## 5. MANUELS UTILISATEURS

### 5.1 Manuel Étudiant

**🎯 GUIDE RAPIDE - ÉTUDIANT**

---

#### Avant la Job Fair

**1. Créer ton compte**
- Va sur https://jobfair.votreecole.fr
- Clique "S'inscrire"
- Remplis : Email, Mot de passe, Prénom, Nom
- Clique "Créer mon compte"
- Tu es automatiquement connecté

**💡 Conseil :** Utilise ton email personnel (pas celui de l'école si tu veux garder accès après)

---

#### Le Jour J - Ton Workflow

**2. S'inscrire chez les entreprises**
- Ouvre l'app sur ton téléphone
- Tu verras la liste des entreprises présentes
- Clique "S'inscrire" sur celles qui t'intéressent
- Tu peux t'inscrire chez autant d'entreprises que tu veux

**💡 Conseil :** Inscris-toi d'abord chez tes entreprises prioritaires

**3. Attendre ton tour**
- Tu verras ta position dans chaque file : "2ème", "5ème", etc.
- Quand c'est ton tour, tu reçois une grosse notification : **"🎯 Tu peux passer chez X !"**
- Un gros bouton bleu apparaît : **"COMMENCER MON ENTRETIEN"**

**💡 Important :** Garde l'app ouverte en fond pour recevoir les notifications

**4. Commencer un entretien**
- Quand tu vois la notification, va vers le stand de l'entreprise
- Clique sur **"COMMENCER MON ENTRETIEN"** juste avant d'y entrer
- Ton statut passe à "En entretien chez X"
- Pendant ce temps, tu es "grisé" dans les autres files (les autres savent que tu es occupé)

**💡 Pourquoi cliquer ?** Ça permet aux autres de savoir que tu es occupé et qu'ils peuvent passer ailleurs

**5. Pendant l'entretien**
- Concentre-toi sur ton entretien !
- L'app affiche un timer (juste pour info)
- Attends que l'entreprise te marque "passé"

**6. Après l'entretien**
- L'entreprise clique "Marquer passé"
- Tu reçois une notification : **"✅ Tu as été marqué passé chez X"**
- Ton statut passe automatiquement à **"En pause"**
- Tu vois un gros bouton : **"REPASSER DISPONIBLE"**

**7. Reprendre les entretiens**
- Quand tu es prêt pour un autre entretien, clique **"REPASSER DISPONIBLE"**
- Tu reçois immédiatement les notifications des entreprises où tu peux passer
- Répète les étapes 4-7 !

---

#### Comprendre les Statuts

**🟢 DISPONIBLE** = Tu peux passer des entretiens  
**🟠 EN ENTRETIEN** = Tu es actuellement en entretien  
**⚪ EN PAUSE** = Tu as fini un entretien, repasse disponible pour continuer

---

#### FAQ Étudiant

**Q : J'ai raté ma notification, que faire ?**  
R : Pas de panique ! Va dans ton dashboard, tu verras si tu es toujours premier. Si oui, le bouton "Commencer" sera actif.

**Q : Je suis 1er chez deux entreprises, je fais quoi ?**  
R : Tu choisis ! Clique sur le bouton de l'entreprise que tu préfères. L'autre attendra.

**Q : Le bouton "Commencer" est grisé alors que je suis 1er, pourquoi ?**  
R : Soit l'entreprise est en pause (tu verras la mention), soit elle a déjà quelqu'un en entretien. Attends quelques minutes.

**Q : J'ai oublié de repasser "Disponible", c'est grave ?**  
R : Non, mais tu restes grisé partout. Dès que tu t'en rends compte, repasse disponible.

**Q : Je veux annuler mon inscription chez une entreprise**  
R : Demande à l'organisateur (admin), seul lui peut le faire.

---

### 5.2 Manuel Entreprise

**🏢 GUIDE RAPIDE - ENTREPRISE**

---

#### Avant la Job Fair

**Vous recevrez un email avec un lien unique :**  
`https://jobfair.votreecole.fr/company/abc123xyz456`

**💡 Important :**
- Ne partagez PAS ce lien publiquement
- Gardez-le accessible (favoris, email)
- Si vous le perdez, contactez l'organisateur

---

#### Le Jour J - Votre Interface

**Votre écran est divisé en 3 sections :**

**📊 EN ENTRETIEN MAINTENANT (X/Y)**
- Montre qui est actuellement avec vous
- X = nombre en cours, Y = votre capacité (défini par l'organisateur)
- Vous voyez : Nom, heure d'arrivée, durée écoulée

**📋 À VENIR**
- Liste ordonnée des étudiants inscrits chez vous
- 🟢 Vert = Disponible (peut venir maintenant)
- ⚪ Gris = Occupé ailleurs ou en pause
- L'ordre est l'ordre d'inscription (ne change jamais)

**✅ DÉJÀ PASSÉS**
- Liste de ceux que vous avez déjà reçus
- Pour ne pas avoir de doublon

---

#### Workflow Recommandé

**1. Recevoir un étudiant**
- Regardez la section "À VENIR"
- Appelez le premier 🟢 disponible
- L'étudiant arrive et clique "Commencer mon entretien" sur son téléphone
- Il apparaît automatiquement dans "EN ENTRETIEN MAINTENANT"

**2. Terminer un entretien**
- Quand l'entretien est fini, cliquez **"Marquer passé"** sur l'étudiant
- Il disparaît de "EN ENTRETIEN"
- Il apparaît dans "DÉJÀ PASSÉS"
- Le suivant est automatiquement notifié

**💡 Conseil :** Marquez "passé" dès que l'étudiant quitte votre stand, même si l'entretien était court

**3. Faire une pause (déjeuner, etc.)**
- Cliquez le toggle en haut : **"Mettre en pause"**
- Vous disparaissez de la liste publique
- Les étudiants inscrits voient que vous êtes en pause
- Aucun nouveau ne peut s'inscrire
- Quand vous revenez : **"Reprendre le recrutement"**

---

#### Gérer Plusieurs Slots

Si vous pouvez recevoir 2 étudiants simultanément :
- Vous verrez "EN ENTRETIEN (2/2)" si tous vos slots sont occupés
- Vous pouvez marquer "passé" séparément pour chacun
- Les deux premiers 🟢 disponibles seront notifiés en même temps

---

#### FAQ Entreprise

**Q : Un étudiant ne se présente pas alors qu'il est notifié, que faire ?**  
R : Appelez le suivant. Si le premier revient, vous pouvez le recevoir quand même (l'ordre est indicatif). Contactez l'organisateur si problème persistant.

**Q : On a marqué "passé" par erreur, comment annuler ?**  
R : Contactez l'organisateur immédiatement, seul lui peut corriger.

**Q : Notre lien ne fonctionne plus**  
R : Contactez l'organisateur, il peut régénérer un nouveau lien.

**Q : On voit des étudiants grisés, ça veut dire quoi ?**  
R : Ils sont inscrits chez vous mais occupés ailleurs. Ils reviendront disponibles quand ils auront fini.

**Q : Combien d'étudiants on doit recevoir ?**  
R : Autant que vous voulez ! La liste n'a pas de limite. Recevez selon votre rythme.

---

### 5.3 Manuel Admin

**⚙️ GUIDE COMPLET - ADMINISTRATEUR**

---

#### Avant l'Événement (J-7 à J-1)

**1. Créer les entreprises**
- Dashboard Admin → "Entreprises" → "Créer une entreprise"
- Remplir : Nom, Nombre de slots (par défaut 1)
- Cliquer "Créer"
- Un lien unique est généré automatiquement
- **Copier et envoyer le lien à l'entreprise par email**
- Répéter pour chaque entreprise

**💡 Conseil :** Créez un fichier Excel avec "Nom Entreprise | Lien | Email contact"

**2. Créer les comptes étudiants (optionnel)**
- Si les étudiants ne s'inscrivent pas eux-mêmes
- Dashboard Admin → "Étudiants" → "Créer un étudiant"
- Remplir : Email, Mot de passe temporaire, Prénom, Nom
- Donner les identifiants aux étudiants

**Alternative :** Laisser les étudiants créer leurs propres comptes

**3. Tests pré-événement (J-1)**
- Créer 3 comptes test (2 étudiants, 1 entreprise)
- Tester le workflow complet :
  - Inscription dans file
  - Commencer entretien
  - Marquer passé
  - Vérifier notifications temps réel
- Corriger les problèmes éventuels

---

#### Jour J - Supervision

**Votre Dashboard :**

**📊 Section "VUE D'ENSEMBLE"**
- Nombre total d'étudiants, entreprises, entretiens en cours
- Graphique d'activité en temps réel
- Vous voyez l'intensité du moment

**🔔 Section "ALERTES"**
- Étudiants bloqués depuis >30 min
- Entreprises inactives
- Erreurs système
- **Agissez rapidement sur ces alertes**

**🔍 Barre de recherche**
- Trouvez n'importe quel étudiant ou entreprise instantanément
- Tapez nom ou email

---

#### Actions Courantes

**Corriger un étudiant bloqué**
1. Rechercher l'étudiant
2. Voir son statut actuel
3. Changer à "Disponible" ou "En pause"
4. Confirmer

**Régénérer un lien entreprise**
1. "Entreprises" → Trouver l'entreprise
2. "..." → "Régénérer token"
3. Confirmer (l'ancien lien ne marchera plus)
4. Copier et envoyer le nouveau lien

**Modifier le nombre de slots d'une entreprise**
1. "Entreprises" → Trouver l'entreprise
2. "Modifier"
3. Changer "Nombre de slots" (1, 2, 3...)
4. Sauvegarder

**Supprimer une inscription**
1. Rechercher l'étudiant
2. Voir ses inscriptions
3. "Supprimer" sur l'inscription concernée
4. Confirmer

---

#### Actions d'Urgence

**⚠️ RESET TOUS LES STATUTS**
- Bouton rouge dans le dashboard
- Remet TOUS les étudiants à "Disponible"
- Toutes les entreprises en "Recrutement"
- **Utiliser SEULEMENT en cas de bug critique**
- Double confirmation nécessaire

**⏸️ PAUSE GLOBALE**
- Met toutes les entreprises en pause
- Affiche "Maintenance en cours" aux utilisateurs
- Utiliser pendant intervention technique

**📤 EXPORT CSV**
- Télécharge toutes les données
- Format Excel
- Contient : étudiants, entreprises, inscriptions, entretiens passés
- **Faire un export toutes les 2 heures comme backup**

---

#### Statistiques Post-Événement

**Après la job fair :**
- Export CSV final
- Générer rapport :
  - Nombre total d'entretiens
  - Moyenne par étudiant
  - Entreprise la plus demandée
  - Taux de complétion
- Envoyer aux formateurs

---

#### Troubleshooting Admin

**Problème : Étudiant dit qu'il ne reçoit pas de notifications**
1. Vérifier qu'il est bien "Disponible"
2. Vérifier qu'il est bien premier dans au moins une file
3. Vérifier que l'entreprise n'est pas en pause
4. Lui demander de recharger la page

**Problème : Entreprise ne voit pas un étudiant inscrit**
1. Rechercher l'étudiant
2. Vérifier qu'il est bien inscrit dans cette file (section "Inscriptions")
3. Si non : l'étudiant doit se réinscrire
4. Si oui : demander à l'entreprise de recharger

**Problème : Deux étudiants en entretien chez la même entreprise (slots=1)**
1. C'est un bug critique
2. Mettre l'entreprise en pause immédiatement
3. Vérifier les statuts
4. Corriger manuellement (mettre un des deux en "Disponible")
5. Suivre procédure "Crise Niveau 3" du plan de contingence

---

### 5.4 Carte de Référence Rapide (à imprimer)

**📋 CARTE DE RÉFÉRENCE ADMIN - À AVOIR SOUS LA MAIN LE JOUR J**

```
═══════════════════════════════════════════════════
           JOBFAIR PLATFORM - ADMIN
═══════════════════════════════════════════════════

CONTACTS URGENCE
────────────────
Support Technique : [VOTRE TÉLÉPHONE]
Render Support : help@render.com
Email Organisateur : [VOTRE EMAIL]

URLS ESSENTIELLES
────────────────
Dashboard Admin : https://jobfair.votreecole.fr/admin
Backend Health : https://jobfair-backend.onrender.com/health
Render Dashboard : https://dashboard.render.com

ACTIONS RAPIDES
────────────────
Rechercher étudiant : [Barre recherche] → Nom/Email
Débloquer étudiant : Recherche → "Mettre en pause" ou "Disponible"
Régénérer lien : Entreprises → ... → Régénérer token
Export backup : Dashboard → "Export CSV"

BOUTONS URGENCE (ROUGE)
────────────────
⚠️ Reset statuts : Remet tout à zéro (confirmation requise)
⏸️ Pause globale : Freeze tout le système

SI PROBLÈME CRITIQUE
────────────────
1. Pause globale
2. Export CSV backup
3. Vérifier logs Render
4. Suivre plan de contingence (document P2, section 3)
5. Si bloqué : Appeler support

VÉRIFICATIONS RÉGULIÈRES
────────────────
□ Alertes dashboard (toutes les 10 min)
□ Export CSV backup (toutes les 2h)
□ Vérifier que temps réel fonctionne (test avec compte)

APRÈS L'ÉVÉNEMENT
────────────────
□ Export final CSV
□ Générer statistiques
□ Questionnaire satisfaction
□ Rétrospective équipe

═══════════════════════════════════════════════════
         Garde ce document à portée de main
═══════════════════════════════════════════════════
```

---

## 6. CONCLUSION DU DOCUMENT P2

Ce document opérationnel fournit tous les éléments pour :
- **Prendre les bonnes décisions** (Matrices de décision)
- **Maintenir la cohérence visuelle** (Design System)
- **Gérer les crises** (Plan de contingence)
- **Déployer en production** (Guide de déploiement)
- **Former les utilisateurs** (Manuels)

**Prochaine étape :** Développement avec Google Antigravity en utilisant les 3 documents (P0, P1, P2) comme référence complète.

---

**FIN DU DOCUMENT P2**