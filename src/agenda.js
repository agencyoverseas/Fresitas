/* ═══════════════════════════════════════════════════════════
   AGENDA — durees, chevauchements, grille horaire
   Regle du cadrage : aucun chevauchement accepte.
   ═══════════════════════════════════════════════════════════ */
import { iso, lundi } from './stats.js';

const H_DEBUT = 9, H_FIN = 18;

const min = hhmm => {
  const [h, m] = String(hhmm || '09:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const duree = a => Number(a?.dur) || 120;
const fin = a => min(a.time) + duree(a);

const fmtDuree = m => {
  const h = Math.floor(m / 60), r = m % 60;
  return h ? (r ? `${h}h${String(r).padStart(2, '0')}` : `${h}h00`) : `${r} min`;
};

/* Duree deduite de la prestation choisie, modifiable ensuite */
const dureeSuggeree = (cfg, prestSel = []) => {
  const base = Number(cfg?.dureeBase) || 120;
  const sup = (prestSel || []).reduce((s, id) => {
    const p = (cfg?.prestations || []).find(x => x.id === id);
    return s + (Number(p?.duree) || 0);
  }, 0);
  return base + sup;
};

/* Le coeur de la regle : deux rendez-vous ne peuvent pas se croiser */
const chevauche = (apts, date, debut, dureeMin, ignorerId = null) =>
  (apts || []).some(a => {
    if (a.id === ignorerId || a.date !== date) return false;
    return min(debut) < fin(a) && min(a.time) + dureeMin > min(a.time) && min(debut) + dureeMin > min(a.time);
  });

/* Cases horaires d'un jour, avec ce qui les occupe */
const grilleJour = (apts, date) => {
  const lignes = [];
  for (let h = H_DEBUT; h < H_FIN; h++) {
    const debut = h * 60;
    const dessus = (apts || []).find(a => a.date === date && min(a.time) >= debut && min(a.time) < debut + 60);
    const traverse = (apts || []).find(a => a.date === date && min(a.time) < debut && fin(a) > debut);
    lignes.push({ h: hhmm(debut), debut, apt: dessus || null, occupe: !!(dessus || traverse) });
  }
  return lignes;
};

const jourSemaine = (ref, i) => { const d = lundi(ref); d.setDate(d.getDate() + i); return d; };

/* Jours du mois affiche, cales sur un lundi */
const grilleMois = (ref, apts) => {
  const d = new Date(ref); d.setDate(1);
  const debut = lundi(d);
  const cases = [];
  for (let i = 0; i < 42; i++) {
    const j = new Date(debut); j.setDate(debut.getDate() + i);
    const s = iso(j);
    cases.push({
      date: s, num: j.getDate(),
      horsMois: j.getMonth() !== new Date(ref).getMonth(),
      nb: (apts || []).filter(a => a.date === s).length,
    });
  }
  return cases;
};

const libelleJour = s => {
  const d = new Date(s + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};
const courtJour = s => {
  const d = new Date(s + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
};
const demain = (s, n = 1) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };

/* Qui relancer : acompte manquant, J-1, J-7 */
const relances = (d, maintenant = new Date()) => {
  const auj = iso(maintenant);
  const out = [];
  (d?.apts || []).forEach(a => {
    if (a.date < auj || a.pd) return;
    const c = (d.clients || []).find(x => x.id === a.cid);
    const j = Math.round((new Date(a.date) - new Date(auj)) / 864e5);
    if ((Number(a.dep) || 0) > 0 && !a.dpd) out.push({ apt: a, client: c, motif: 'Acompte non reçu', urgence: 'urgent' });
    else if (j === 1) out.push({ apt: a, client: c, motif: 'Rendez-vous demain', urgence: 'j1' });
    else if (j === 7) out.push({ apt: a, client: c, motif: 'Rendez-vous dans 7 jours', urgence: 'j7' });
  });
  return out;
};

export { H_DEBUT, H_FIN, min, hhmm, duree, fin, fmtDuree, dureeSuggeree, chevauche, grilleJour, grilleMois, jourSemaine, libelleJour, courtJour, demain, relances };
