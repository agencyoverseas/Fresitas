/* ═══════════════════════════════════════════════════════════
   RETOUR — le bouton retour d'Android ne doit jamais faire
   sortir de l'app tant qu'il reste un ecran derriere.
   ───────────────────────────────────────────────────────────
   Principe : chaque changement d'ecran empile une entree dans
   l'historique du navigateur. Le geste "retour" declenche
   popstate, qu'on intercepte pour revenir en arriere dans
   l'app au lieu de quitter la page.

   Un ecran peut prendre la main sur le retour (le tunnel
   revient a l'etape precedente, la feuille "Plus" se ferme)
   en s'inscrivant avec useRetour().
   ═══════════════════════════════════════════════════════════ */
import { useEffect } from 'react';

/* Le dernier inscrit est consulte en premier : c'est toujours
   l'element le plus "au-dessus" qui doit repondre au retour. */
const inscrits = [];

const inscrire = fn => {
  inscrits.push(fn);
  return () => {
    const i = inscrits.indexOf(fn);
    if (i > -1) inscrits.splice(i, 1);
  };
};

/* Renvoie true si quelqu'un a traite le retour */
const consulter = () => {
  for (let i = inscrits.length - 1; i >= 0; i--) {
    try { if (inscrits[i]()) return true; } catch { /* on passe au suivant */ }
  }
  return false;
};

/* A utiliser dans un ecran : la fonction renvoie true si elle
   a gere le retour elle-meme, false pour laisser passer. */
export function useRetour(fn, deps = []) {
  useEffect(() => inscrire(fn), deps); // eslint-disable-line react-hooks/exhaustive-deps
}

export { consulter };
