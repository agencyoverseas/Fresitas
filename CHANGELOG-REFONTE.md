# Fresitas — refonte en dashboard responsive

Fork du zip d'origine. L'app reste 100 % locale : aucune donnée ne sort de l'appareil.

## Ce qui est nouveau

**Trois formats, une seule base de code.** Détection automatique de la largeur
(< 768 mobile, 768–1023 tablette, ≥ 1024 PC), avec forçage mémorisé et raccourcis
`Ctrl+1` `Ctrl+2` `Ctrl+3`, `Ctrl+0` pour revenir en auto. Deux coquilles : rail
latéral sur PC, nav basse et feuille « Plus » sur mobile.

**Grille tarifaire.** Le prix devient `tranche de locks (€) + case de la grille (€)`.
Plus aucun pourcentage. Les 24 cases sont pré-remplies depuis les anciens pourcentages,
et le mode proportionnel reste disponible (`cfg.pricing.mode = "pct"`).

**Moyens de paiement configurables.** Catalogue libre dans Réglages : nom, type,
lien. Trois types — lien portant le montant (gabarit avec `{montant}`), lien fixe,
hors ligne. Aucun format d'URL n'est codé en dur : chacun colle le sien.

> Ne jamais coller de clé secrète dans un gabarit. Une clé posée dans une app qui
> tourne dans un navigateur est lisible par n'importe qui. L'app refuse les gabarits
> qui en contiennent. Ces liens n'en ont pas besoin, c'est tout l'intérêt.

**Bannière de mise à jour, à tous les coups.** Chaque compilation reçoit un
numéro unique (le commit sur Vercel, l'horodatage en local), injecté dans le
paquet. Sans ça, un push qui ne modifie pas le code compilé produisait un
service worker identique et la bannière ne sortait jamais. Le numéro est
visible dans Réglages > Sécurité, pour vérifier quelle version tourne
réellement chez Fresita.

L'app vérifie toutes les minutes et à chaque retour au premier plan. La mise
à jour bascule le service worker et recharge — **elle ne touche jamais à
localStorage**, où vivent clientes, rendez-vous et factures.

**Thème sombre**, suivant la préférence du système au premier lancement.

## Routeur universel

Pour ajouter un écran, il suffit de **déposer un fichier dans `src/ecrans/`**
avec un bloc `routes` à la fin. Rien à déclarer ailleurs : ni dans `App.jsx`,
ni dans le menu.

    export const routes = [
      { id: 'clientes', titre: 'Clientes', ic: '👥', grp: 'ACTIVITÉ',
        bas: 'Clientes', ordre: 25, composant: Clientes },
      { id: 'cliente', parent: 'clientes', composant: FicheCliente },
    ];

- `titre` absent → écran caché, joignable uniquement par `go('id')`
- `bas` → apparaît dans la nav basse mobile (3 places ; le reste passe
  dans la feuille « Plus » automatiquement)
- `parent` → l'écran à rallumer dans le rail quand on est sur un sous-écran
- `ordre` → range l'entrée dans le rail

Un fichier sans bloc `routes` est ignoré, avec un avertissement dans la
console plutôt qu'un écran blanc. Les identifiants en double sont signalés
de la même façon.

Le **retour**, lui, n'a jamais rien à déclarer : chaque `go()` empile une
entrée d'historique, donc tout écran nouveau en hérite. Un écran qui veut
gérer le retour lui-même (le tunnel recule d'une étape) s'inscrit avec
`useRetour()` depuis `src/nav.js`.

## Écrans

Dashboard (8 indicateurs), Bookings (jour en planning horaire, semaine, mois, liste),
tunnel de réservation en 6 étapes, fiche rendez-vous, À relancer, Factures
(DEV/FAC/REC + année, 5 statuts, échéancier 1 à 4 fois), détail de facture avec PDF,
Paiement & signature (signature au doigt), Réglages (6 onglets), Profil, Sécurité,
Préférences, Flyer studio, Clientes et fiche cliente.

## Ce qui n'est PAS fait, volontairement

- **Aucun encaissement automatique.** Les liens ouvrent la page du fournisseur ;
  le règlement est noté à la main. Un vrai encaissement demande un serveur.
- **Les PDF ne s'envoient pas seuls.** `wa.me` transporte du texte et `mailto:`
  n'attache rien : le PDF est téléchargé, puis joint à la main.
- **Pas de rappel automatique.** Sans serveur, rien ne tourne quand l'app est fermée.
  L'écran « À relancer » dresse la liste, l'envoi reste un geste.

## Faire tourner

    npm install
    npm run dev      # développement
    npm run build    # produit dist/

Le PDF (`jspdf`) et l'export d'image (`html2canvas`) sont chargés à la demande :
le paquet de démarrage est passé de 925 Ko à 293 Ko.

## Structure

    src/prix.js       moteur de prix (grille + mode proportionnel)
    src/paiement.js   catalogue de moyens de paiement
    src/format.js     détection et forçage du format
    src/theme.js      clair / sombre
    src/stats.js      les 8 indicateurs, fonctions pures
    src/agenda.js     durées, chevauchements, grilles jour/mois
    src/factures.js   numérotation, statuts, échéancier
    src/coquilles.jsx les deux enveloppes
    src/ecrans/       un fichier par écran
    src/App.legacy.jsx  ancienne app, gardée en référence — supprimable
