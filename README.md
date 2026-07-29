# Fresitalocks CRM v2 — Vite + React, offline-first

CRM locktician. 100% local, zéro serveur, zéro compte. Installable sur iPhone et Android.

---

## 1. Démarrer

```bash
npm install          # une seule fois
npm run dev          # dev, rechargement à chaud → http://localhost:5173
npm run build        # génère dist/ (c'est ça qu'on déploie)
npm run preview      # teste le build de prod en local
```

**Important :** le service worker et l'installation PWA ne s'activent **que sur le build**
(`npm run preview` ou en ligne), pas en `npm run dev`. Teste toujours l'offline via `preview`.

---

## 2. Structure

```
index.html                   coquille HTML (metas iOS, point de montage)
vite.config.js               config Vite + PWA (manifest, service worker)
public/
  icon-192.png icon-512.png  icônes d'installation
src/
  main.jsx                   point d'entrée : polices, CSS, montage React
  App.jsx                    l'application (identique à l'original, juste modularisée)
  data.js                    produits, routines, messages WhatsApp, données par défaut
  app.css                    styles de l'app (ex-constante CSS)
  components/
    InstallPrompt.jsx        bandeau d'installation + volet iOS
    OfflineBadge.jsx         indicateur en ligne / hors ligne
    UpdatePrompt.jsx         bandeau "nouvelle version disponible"
    pwa.css                  styles de ces trois composants
```

Le code métier n'a **pas** été réécrit : il a été découpé mécaniquement depuis l'ancien
`index.html`. Même logique, mêmes calculs, mêmes messages.

---

## 3. Ce qui rend l'offline fiable maintenant

Avant, l'app dépendait de 4 ressources externes au démarrage (React, ReactDOM et Babel
depuis cdnjs, les polices depuis Google Fonts). Un seul échec réseau = écran blanc.

Ce qui a changé :

| Avant | Maintenant |
|---|---|
| React/Babel depuis cdnjs | bundlés dans `dist/assets/` |
| Polices Google Fonts | `@fontsource` → woff2 servis depuis ton propre domaine |
| Babel compilait le JSX à chaque lancement (~3 Mo) | JSX compilé au build, Babel supprimé |
| SW précachait `index.html` seul | **25 fichiers** précachés (JS, CSS, polices, icônes, manifest) |
| Stratégie network-first (lente en réseau faible) | precache-first : le cache répond immédiatement |
| Aucun flux de mise à jour | bandeau "Nouvelle version disponible" |

Le service worker est généré par Workbox à chaque `npm run build`, avec les empreintes de
tous les fichiers. Résultat : l'app fonctionne hors ligne **dès le premier lancement réussi**,
et les données restent dans `localStorage` (clé `fresita_v8`).

---

## 4. Installation sur mobile

**Android / Chrome** — le navigateur émet `beforeinstallprompt`, le bandeau apparaît, un
appui sur « Installer » déclenche la boîte de dialogue native.

**iPhone / Safari** — Apple n'autorise aucune installation programmatique. Le bandeau
détecte iOS et affiche un volet avec les 2 étapes manuelles (Partager → Sur l'écran d'accueil).

Dans les deux cas :
- bandeau masqué automatiquement si l'app est déjà installée (`display-mode: standalone`)
- fermeture par la croix → masqué **7 jours** (constante `DAYS` dans `InstallPrompt.jsx`)

---

## 5. Déployer

Le dossier `dist/` est du statique pur, déployable partout. `base: './'` fait que ça marche
aussi dans un sous-dossier.

**Netlify (drag & drop)** — https://app.netlify.com/drop → glisse le dossier `dist/`.

**Vercel** — https://vercel.com/new → importe le repo, Vercel détecte Vite tout seul.

**Contrainte non négociable : HTTPS.** Le service worker et l'installation PWA sont refusés
en `http://` et en `file://`. Netlify et Vercel fournissent le HTTPS automatiquement.

---

## 6. Sauvegarde des données

Les données vivent dans le `localStorage` du navigateur. Elles sont perdues si Fresita
efface les données du site ou change de téléphone.

Réglages → **Exporter mes données** produit un `fresitalocks-backup.json`.
À faire régulièrement — c'est la seule sauvegarde qui existe dans ce mode 100% local.

---

## 7. Points d'attention connus

- **Composants imbriqués — CORRIGÉ** : `Home`, `ClientsP`, `QuoteP`… étaient définis *dans*
  `App()`, donc recréés à chaque frappe → le champ se démontait et perdait le focus (« le
  clavier saute »). Ils sont maintenant sortis au niveau module (identité stable) et reçoivent
  l'état via props (`<Name {...ctx}/>`). Le focus tient, testé frappe par frappe.
- **Champ numérique bloqué à 0 — CORRIGÉ** : les champs contrôlés (nb de locks du simulateur, réparations
  du devis) faisaient `parseInt(...)||0` → vider le champ le remettait à `0`, impossible à effacer.
  Maintenant un champ vide reste vide (`""`), et le calcul traite le vide comme 0. Les champs des Réglages
  (tranches/zones/grosseurs) sont non-contrôlés, donc déjà effaçables.
- **Import/restauration** : l'export JSON existe, pas encore l'import. À ajouter si tu veux
  un vrai cycle de sauvegarde/restauration.
- **`localStorage` a une limite** (~5 Mo) et est synchrone. Suffisant ici. Si tu ajoutes un
  jour des photos en base64, il faudra passer à IndexedDB.

## 8. Moteur de prix — Reprise de racines (phase 3a)

Repris du pilotage Locks by Afro, épuré pour un usage non-technique.

**Le calcul** (`calcPrix` dans `src/data.js`) :
```
prix = prix_de_base(nb de locks) × (1 + effet_longueur%) × (1 + effet_grosseur%)
```

Tout se configure dans **Réglages** :
- **Prix de base (nb de locks)** : tranches « jusqu'à X locks = Y € », ajoutables/supprimables
- **Longueur (zones)** : chaque zone a un libellé, un repère en cm, et un effet en %
- **Grosseur (diamètre)** : chaque grosseur a un libellé, un repère en mm, et un effet en %
- **Simulateur en direct** : nb locks + zone + grosseur → le prix s'affiche. C'est l'outil qui rend les %
  compréhensibles sans parler de « coefficient ».

Les coefficients d'origine sont convertis en % : coef 1.1 = +10 %, coef 0.88 = −12 %. La règle
linéaire diamètre (réf 7 mm, pas 0.04/mm) a été remplacée par un effet % direct par grosseur, plus simple à régler.

**Migration** : les installations existantes sans bloc `pricing` sont complétées automatiquement au
chargement (valeurs par défaut), sans perte de données.

**⚠️ Limite phase 3a** : le devis (l'écran « + ») utilise encore l'ancien calcul (courts/moyens/longs).
Le simulateur des Réglages et le devis ne sont **pas encore reliés**. C'est l'objet de la **phase 3b** :
brancher le devis sur ce moteur (choix nb locks + zone + grosseur au lieu de courts/moyens/longs).

## 9. Agenda — vue calendrier (refonte)

Écran Agenda repensé en calendrier de prise de RDV (inspiré d'une maquette fournie), aux couleurs du projet.

- **En-tête violet** : titre, navigation par mois (`< Mois AAAA >` → décale d'une semaine), bandeau des 7 jours
  de la semaine (Lu…Di) avec les dates, tappables. Jour sélectionné = pastille blanche, aujourd'hui = contour.
- **Créneaux horaires** groupés **Matin** (9-11h) / **Après-midi** (12-19h) :
  - créneau **libre** → clic démarre le devis (le flux « + ») avec **date + heure pré-remplies**
  - créneau **occupé** → pastille violette avec le prénom de la cliente (non cliquable)
- **RDV du jour choisi** : liste client + heure + prestation + prix, avec suppression.
- **Créneaux types** (tes disponibilités récurrentes) : conservés en bas, inchangés.

Le « Choose Hair specialist » de la maquette a été retiré (tu travailles seule).

## 10. Prestations — catalogue de services (Réglages)

Un espace **Prestations** dans Réglages pour gérer les services en plus de la reprise (shampoing, soin, coiffure…).

- Chaque prestation : **nom + prix fixe (€) + durée (min) + catégorie + description**
- **Ajouter / modifier / supprimer** librement (tous les champs sont effaçables — mêmes règles que le reste)
- Seeds de départ (éditables/supprimables) : Coiffure (20€), Shampoing (15€), Soin profond (25€)
- Pas de photo (choix assumé — évite de saturer le stockage local)
- Stocké dans `cfg.prestations` ; migration automatique pour les installations existantes

**⚠️ À venir (phase 3b)** : rendre ces prestations **cochables dans le devis** (pour s'ajouter à un RDV) et
migrer la **coiffure / les réparations** actuelles du devis vers ce système. Pour l'instant c'est le catalogue
seul ; le devis n'y est pas encore relié.

## 11. Générateur de flyer (menu Plus)

Une page **Flyer** pour créer des visuels type « dernières disponibilités » et les exporter.

- **Plusieurs flyers** enregistrés (sélecteur + Nouveau/Dupliquer/Supprimer)
- **Preview en direct** : le flyer se met à jour pendant que tu tapes
- **Tout est réécrivable** : titre, accroche, grand titre, période, lieu, prestations, acompte, contact, bas de page
- **Solo ou collab** : interrupteur ; 1 ou 2 **logos uploadables** (image)
- **Grille de dispos** : jours ajoutés un par un (date + libellé), créneaux modifiables (ajout/retrait).
  Bouton **« Remplir depuis mon agenda »** (dispo = aucun RDV à cette heure) + coche/décoche manuelle
- **Prestations** pré-remplies, bouton « Reprendre mon catalogue »
- **Export PNG + PDF** (rendu à 3× pour la netteté), fonctionne hors ligne

Style **approché au plus proche** du modèle fourni (fonts Anton + Dancing Script, palette cream/rust) ;
les dessins faits main (chevelure, feuilles, texture) sont des approximations — tu pourras uploader tes
propres éléments plus tard. Stocké dans `cfg.flyers`, migration automatique.

Note : les polices et les libs d'export alourdissent le 1er chargement (~1,4 Mo mis en cache une fois).
Les logos sont stockés en base64 dans le téléphone — garde-les légers.

## 12. Réservation depuis le flyer + onglet RDV client

Sur le flyer (Plus > Flyer), **taper une pastille disponible** ouvre un formulaire de réservation.

- Champs : **Prénom, Nom, Numéro, Email (obligatoires)** + Prestation (au choix) + Note + Lien d'acompte
- Valider crée d'un coup : **un client**, **un RDV**, **bloque le créneau dans l'Agenda**, et la **pastille passe à « pris »**
- Onglet **RDV client** (menu Plus) : liste des réservations, **statut** cliquable (En attente → Confirmé → Payé),
  **lien d'acompte par réservation** (tu colles ton propre lien Stripe/PayPal), suppression

**⚠️ Synchro en ligne — PAS ENCORE FAITE.** Aujourd'hui l'onglet RDV client est **local** (ce téléphone
uniquement). La synchro Supabase (pour que ce soit visible sur tous tes appareils) est l'**étape suivante** :
elle a besoin de **ton projet Supabase (URL + clé)** et se teste sur tes appareils — impossible à tester
depuis l'environnement de dev. Le reste (saisie, création, blocage créneau) est 100% fonctionnel en local.

## 13. Formules — tarifs par longueur (Réglages)

Section **Formules** dans Réglages : des blocs tarifaires type menu (RETWIST SEUL, FORMULE SIMPLE, FORMULE ESSENTIELLE).

- Chaque formule : **numéro (badge) + titre + sous-titre + note** + une liste de **longueurs (label + prix) modifiables**
- **Ajouter / supprimer** des formules ET des longueurs librement
- 3 formules de départ reprises de la maquette (80→110 / 125→185 / 180→240 €)
- Coexiste avec le moteur Reprise (locks×zone×grosseur) et le catalogue Prestations — choix assumé (« le moteur reste, les formules en plus »)

**Étape suivante** : le **poster Tarifs exportable** (3e modèle de flyer) s'appuiera sur ces formules, en même
temps que le **2e modèle de flyer** (liste solo). Le système de choix de modèle de flyer arrive à ce moment-là.

## 14. Modèles de flyer (sélecteur) + modèle Price list

Le flyer a maintenant un **sélecteur de modèle dans l'en-tête** (le bouton demandé) : tu choisis le design par flyer.

- **2 modèles pour l'instant** :
  - **Grille dispos** — l'existant (créneaux cliquables → réservation)
  - **Price list** — nouveau, flexible : couvre les styles des images 2/4/5/6/7 + tes tarifs (image 9)
- **Price list** entièrement réglable : **titre + sous-titre + couleur du thème** + **catégories** (nom + **photo ronde optionnelle** + lignes **label / prix** en ajout/suppression). Bouton **« Reprendre mes formules »** pour pré-remplir depuis la section Formules.
- **Preview en direct** sur les deux modèles, **export PNG + PDF**.

Approche **flexible** (pas 8 clones figés) : un même modèle Price list, configuré différemment (couleurs, catégories, photos), reproduit n'importe laquelle de tes price lists.

**À venir** : les 2 autres familles de modèles — **Liste dispos** (image 8, style vertical) et **Promo vitrine**
(images 1/3, photo + services + contact). Et en attente de ta précision sur « prestations à rajouter dans la
section RDV ».

## 15. Modèle "Liste dispos" + sélecteur de modèle (rangée)

Ajout du **3e modèle de flyer** et du **sélecteur en rangée** (le bouton demandé, juste au-dessus de « Mes flyers »).

- **Sélecteur "Modèle du flyer"** : boutons **Grille dispos / Liste dispos / Price list** (le modèle actif est surligné). Dispo aussi dans l'en-tête.
- **Liste dispos** (repris de ta maquette Juillet, image 4) : logo, DISPONIBILITÉS + période, encadré **ATTENTION**, liste verticale des jours avec les créneaux (dispo = en couleur **cliquable pour réserver**, pris = **barré**), badge rond, phrase du bas, accroche finale.
- Il **partage les mêmes jours/créneaux** que la Grille : tu remplis une fois, tu bascules l'affichage grille ↔ liste. **Réservation** identique (tape un créneau dispo).
- Preview live + export PNG/PDF.

**État des modèles** : Grille dispos ✓, Liste dispos ✓, Price list ✓ (couvre images 1/3/5/6/8 + tes tarifs).
**Restant** : **Promo vitrine** (images 2 et 7 : photo + services + contact). On continue un par un.

## 16. Modèle "Promo vitrine" + slider de modèles

- **Slider horizontal** (glisse gauche-droite) pour choisir le modèle, dans la carte « Modèle du flyer » : **Grille dispos · Liste dispos · Price list · Promo vitrine**.
- **Promo vitrine** (style images Thando's / Amina) : **photo** uploadable, **couleur de fond** réglable, nom (script) + sous-titre, bloc **NOS SERVICES** (liste en ajout/suppression), bouton CTA, bloc **contact** (Facebook, téléphone, Instagram, adresse).
- Preview live + export PNG/PDF.

**4 modèles disponibles** : Grille ✓, Liste ✓, Price list ✓, Promo ✓. Les autres price lists (Beauty Salon, Auréa, Beauty Spot, Nails by Princess) = **styles du modèle Price list**, ajoutés un par un.

**Important** : pense à **repousser sur GitHub** (le script Termux) pour que Vercel mette à jour ton site en ligne avec ces modèles.

## 17. Styles du Price list (un par un)

Le modèle **Price list** a maintenant un **sélecteur de Style** (dans « Price list — en-tete ») pour matcher tes différentes maquettes sans casser le contenu :
- **Barres couleur** — le style d'origine (en-têtes de catégorie colorés).
- **Minimal (photos)** — style Beauty Salon : **photo ronde à gauche** de chaque catégorie, titre noir souligné, lignes à pointillés, fond gris clair, monochrome.

Le contenu (catégories/prix) est partagé entre les styles — tu changes juste l'apparence. « Reprendre mes formules » pré-remplit depuis tes Formules.

- **Aurea 2 col** — style Auréa : beige, titre serif italique, **2 colonnes** de cartes arrondies, en-tête de catégorie en pilule, sans photo.

- **Beauty Spot** — doré chic : ivoire, titre bordeaux serif, **2 colonnes**, en-têtes de catégorie en **dégradé bordeaux→or**, sans photo.

- **Nails Princess** — rose : en-têtes de catégorie en **script sur pastille rose**, **photo ronde** par catégorie, 2 colonnes.

**Les 5 designs sont faits.** Chaque flyer garde sa mise en page ; tu changes **textes, prix, photos** (via l'éditeur) et la **couleur** (sélecteur « Couleur (theme) »).

## 18. Devis branché sur les vrais prix (phase 3b)

L'étape **Devis** du flux de réservation (bouton +) utilise maintenant tes vrais systèmes de prix, au lieu de l'ancien courts/moyens/longs :

- **Base du prix, au choix** :
  - **Reprise** → nb de locks + zone (longueur) + grosseur → prix calculé par le moteur (tranche × coef zone × coef grosseur)
  - **Formule** → choix d'une formule + longueur → prix de la formule
- **Prestations en plus** : cases à cocher (depuis ton catalogue Prestations), chacune ajoute son prix fixe
- **Total** = base + prestations − fidélité ; **acompte** = total × %acompte
- Le **message WhatsApp/devis** liste la base + chaque prestation + la réduction, et la **création du RDV** enregistre le bon libellé et le bon prix

Testé : Reprise 30 locks/Épaules/Fines = 120€, + prestation = 140€, Formule RETWIST courtes = 80€, RDV créé au bon prix.

**Note** : la page **Devis** autonome (menu Plus) utilise encore l'ancien calcul simple — je peux l'aligner sur ce système au besoin (c'est le flux + qui est le chemin principal).

## 19. Logo Fresita Locks (icônes + démarrage)

- **icon-192.png** et **icon-512.png** = logo centré sur **fond TRANSPARENT** (plus de carré blanc), déclaration `maskable` retirée du manifest.
- **logo.png** (transparent) ajouté et affiché sur l'**écran de démarrage** de l'app (à la place du texte "Fresitalocks"), sous-titre "Locktician" conservé.
- `logo.png` mis en cache (offline) via la config PWA.

**Résolution** : ton logo source fait 249×107 px une fois rogné — l'icône 512 est donc un peu douce en agrandissant. Pour des icônes bien nettes, fournis un logo plus grand (idéalement carré ~1024×1024) et je régénère.

**Important après déploiement** : si tu avais déjà "installé" l'app sur ton écran d'accueil, l'ancienne icône peut rester en cache. **Retire l'app de l'écran d'accueil et rajoute-la** pour voir la nouvelle icône.
