/* ═══════════════════════════════════════════════════════════
   ROUTEUR UNIVERSEL
   ───────────────────────────────────────────────────────────
   Depose un fichier dans src/ecrans/, il est detecte tout seul :
   route, entree de menu, nav basse, ecran parent pour le retour.
   Rien a declarer ailleurs.

   Dans le fichier de l'ecran, ajoute simplement :

     export const routes = [
       { id: 'clientes', titre: 'Clientes', ic: '👥',
         grp: 'ACTIVITÉ', bas: 'Clientes', composant: Clientes },
       { id: 'fiche-cliente', composant: FicheCliente, parent: 'clientes' },
     ];

   Champs :
     id         obligatoire, unique — c'est ce que go('id') attend
     composant  obligatoire
     titre      libelle du rail ; absent = ecran cache, joignable
                seulement par go()
     ic         emoji du rail
     grp        'ACTIVITÉ' | 'CRÉATION' | 'COMPTE'
     bas        libelle dans la nav basse mobile (3 maxi, le reste
                bascule dans la feuille "Plus")
     parent     l'ecran a rallumer dans le rail quand on est ici
     ordre      pour ranger dans le rail (defaut 100)
   ═══════════════════════════════════════════════════════════ */

// eager : tout est dans le paquet principal. Les ecrans sont petits ;
// seuls jspdf et html2canvas restent charges a la demande.
const modules = import.meta.glob('./ecrans/*.jsx', { eager: true });

const ROUTES = [];
const soucis = [];

for (const [chemin, mod] of Object.entries(modules)) {
  const declarees = mod.routes;
  if (!declarees) {
    soucis.push(`${chemin} n'exporte pas "routes" — écran ignoré`);
    continue;
  }
  for (const r of [].concat(declarees)) {
    if (!r || !r.id) { soucis.push(`${chemin} : une route sans id`); continue; }
    if (!r.composant) { soucis.push(`${chemin} : la route "${r.id}" n'a pas de composant`); continue; }
    if (ROUTES.some(x => x.id === r.id)) {
      soucis.push(`id en double : "${r.id}" (${chemin}) — le premier déclaré gagne`);
      continue;
    }
    ROUTES.push({ ordre: 100, grp: 'COMPTE', ...r, fichier: chemin });
  }
}

ROUTES.sort((a, b) => (a.ordre - b.ordre) || String(a.id).localeCompare(String(b.id)));

// Les soucis se voient tout de suite plutot que par un ecran blanc
if (soucis.length && typeof console !== 'undefined') {
  soucis.forEach(m => console.warn('[routeur] ' + m));
}

/* Tables pretes a l'emploi */
const ECRANS = Object.fromEntries(ROUTES.map(r => [r.id, r.composant]));
const MENU = ROUTES.filter(r => r.titre);                  // visibles dans le rail
const BAS = ROUTES.filter(r => r.bas).slice(0, 3);         // nav basse mobile
const PLUS = MENU.filter(r => !BAS.some(b => b.id === r.id));
const PARENT = Object.fromEntries(ROUTES.filter(r => r.parent).map(r => [r.id, r.parent]));
const GROUPES = ['ACTIVITÉ', 'CRÉATION', 'COMPTE'].filter(g => MENU.some(r => r.grp === g));
const DEFAUT = (ROUTES.find(r => r.defaut) || MENU[0] || ROUTES[0] || {}).id || 'dashboard';

/* L'ecran a rallumer dans le rail quand on est sur un sous-ecran */
const actifPour = id => PARENT[id] || id;

export { ROUTES, ECRANS, MENU, BAS, PLUS, PARENT, GROUPES, DEFAUT, soucis, actifPour };
