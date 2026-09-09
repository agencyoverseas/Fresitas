/* ═══════════════════════════════════════════════════════════
   MOTEUR DE PRIX — deux modes qui cohabitent
   ───────────────────────────────────────────────────────────
   mode "pct"     : ancien calcul, tranche x (1+long%) x (1+gros%)
   mode "grille"  : nouveau, tranche(EUR) + case de la grille(EUR)

   La grille est un objet plat : { "zoneId|grosseurId": montant }
   Un montant negatif fait baisser le prix, c'est voulu.
   ═══════════════════════════════════════════════════════════ */

/* Reference utilisee pour convertir les anciens % en euros.
   140 EUR = milieu de l'echelle des tranches (100 -> 180). */
const REF_CONVERSION = 140;

const cle = (zoneId, grosseurId) => zoneId + "|" + grosseurId;

/* Prix de base : la tranche qui correspond au nombre de locks */
const tranchePour = (pricing, nbLocks) => {
  const tr = [...(pricing?.tranches || [])].sort((a, b) => a.max - b.max);
  if (!tr.length) return 0;
  const hit = tr.find(t => nbLocks <= t.max);
  return hit ? hit.prix : tr[tr.length - 1].prix;
};

/* Fabrique une grille en euros a partir des pourcentages existants.
   Sert au pre-remplissage : personne ne saisit 24 cases a la main. */
const grilleDepuisPct = (pricing, ref = REF_CONVERSION) => {
  const g = {};
  (pricing?.zones || []).forEach(z => {
    (pricing?.grosseurs || []).forEach(gr => {
      const coef = (1 + (z.pct || 0) / 100) * (1 + (gr.pct || 0) / 100);
      g[cle(z.id, gr.id)] = Math.round(ref * (coef - 1));
    });
  });
  return g;
};

/* Le supplement d'une combinaison. 0 si la case n'existe pas encore. */
const suppGrille = (pricing, zoneId, grosseurId) => {
  const g = pricing?.grille || {};
  const v = g[cle(zoneId, grosseurId)];
  return typeof v === "number" ? v : 0;
};

/* Ancien calcul, garde pour pouvoir revenir en arriere */
const calcPrixPct = (pricing, nbLocks, zoneId, grosseurId) => {
  const base = tranchePour(pricing, nbLocks);
  const z = (pricing?.zones || []).find(x => x.id === zoneId);
  const gr = (pricing?.grosseurs || []).find(x => x.id === grosseurId);
  const zc = z ? 1 + (z.pct || 0) / 100 : 1;
  const gc = gr ? 1 + (gr.pct || 0) / 100 : 1;
  return Math.round(base * zc * gc);
};

/* Nouveau calcul : additif, tout en euros */
const calcPrixGrille = (pricing, nbLocks, zoneId, grosseurId) => {
  const total = tranchePour(pricing, nbLocks) + suppGrille(pricing, zoneId, grosseurId);
  return Math.max(0, Math.round(total));
};

/* Point d'entree unique : route selon le mode enregistre */
const calcPrix = (pricing, nbLocks, zoneId, grosseurId) => {
  if (!pricing) return 0;
  return pricing.mode === "pct"
    ? calcPrixPct(pricing, nbLocks, zoneId, grosseurId)
    : calcPrixGrille(pricing, nbLocks, zoneId, grosseurId);
};

/* Detail lisible, pour l'afficher sous le simulateur et dans le devis */
const detailPrix = (pricing, nbLocks, zoneId, grosseurId) => {
  const base = tranchePour(pricing, nbLocks);
  const z = (pricing?.zones || []).find(x => x.id === zoneId);
  const gr = (pricing?.grosseurs || []).find(x => x.id === grosseurId);
  if (pricing?.mode === "pct") {
    return `tranche ${base} EUR x longueur ${z ? (z.pct >= 0 ? "+" : "") + z.pct : 0} % x grosseur ${gr ? (gr.pct >= 0 ? "+" : "") + gr.pct : 0} %`;
  }
  const s = suppGrille(pricing, zoneId, grosseurId);
  const lbl = [z?.label, gr?.label].filter(Boolean).join(" x ") || "aucune combinaison";
  return `tranche ${base} EUR + grille ${lbl} ${s >= 0 ? "+" : ""}${s} EUR`;
};

export { calcPrix, calcPrixPct, calcPrixGrille, detailPrix, grilleDepuisPct, suppGrille, tranchePour, cle, REF_CONVERSION };
