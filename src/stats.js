/* ═══════════════════════════════════════════════════════════
   INDICATEURS — fonctions pures, sans React, donc testables
   Toutes les dates sont des chaines "AAAA-MM-JJ".
   ═══════════════════════════════════════════════════════════ */

const iso = dt => {
  const d = new Date(dt);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

/* Lundi de la semaine contenant la date donnee */
const lundi = ref => {
  const d = new Date(ref);
  const j = (d.getDay() + 6) % 7;          // 0 = lundi
  d.setDate(d.getDate() - j);
  d.setHours(0, 0, 0, 0);
  return d;
};

const memeMois = (dateStr, ref) =>
  typeof dateStr === 'string' && dateStr.slice(0, 7) === iso(ref).slice(0, 7);

/* Ce qui reste du a la fin d'un rendez-vous */
const resteDu = a => {
  if (a.pd) return 0;                       // solde regle
  const total = Number(a.pr) || 0;
  const acompte = a.dpd ? (Number(a.dep) || 0) : 0;
  return Math.max(0, total - acompte);
};

const indicateurs = (d, maintenant = new Date()) => {
  const apts = d?.apts || [];
  const clients = d?.clients || [];
  const auj = iso(maintenant);
  const l = lundi(maintenant);
  const finSemaine = new Date(l); finSemaine.setDate(l.getDate() + 6);
  const dansSemaine = s => s >= iso(l) && s <= iso(finSemaine);

  const duMois = apts.filter(a => memeMois(a.date, maintenant));
  const passes = duMois.filter(a => a.date <= auj);

  // Prestation la plus vendue sur le mois
  const compte = {};
  duMois.forEach(a => { if (a.svc) compte[a.svc] = (compte[a.svc] || 0) + 1; });
  const top = Object.entries(compte).sort((a, b) => b[1] - a[1])[0];

  // Clientes dues pour un retwist : dernier RDV honore trop ancien
  const dues = clients.filter(c => {
    if (!c.vis) return false;
    const dernier = apts.filter(a => a.cid === c.id && a.pd).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!dernier) return false;
    const semaines = Math.floor((maintenant - new Date(dernier.date)) / (7 * 864e5));
    return semaines >= (c.rf || 4) - 1;
  });

  return {
    caMois:        passes.reduce((s, a) => s + (Number(a.pr) || 0), 0),
    rdvJour:       apts.filter(a => a.date === auj).length,
    acomptesDus:   apts.filter(a => a.date >= auj && (Number(a.dep) || 0) > 0 && !a.dpd).length,
    acomptesMt:    apts.filter(a => a.date >= auj && (Number(a.dep) || 0) > 0 && !a.dpd)
                       .reduce((s, a) => s + (Number(a.dep) || 0), 0),
    nouvelles:     clients.filter(c => memeMois(c.cr, maintenant)).length,
    dues:          dues.length,
    resteEncaisser: apts.reduce((s, a) => s + resteDu(a), 0),
    rdvSemaine:    apts.filter(a => dansSemaine(a.date)).length,
    topPresta:     top ? top[0] : '—',
    topPrestaNb:   top ? top[1] : 0,
    objectifMois:  Number(d?.cfg?.objectifMois) || 0,
  };
};

/* Remplissage jour par jour de la semaine, pour les barres du dashboard */
const semaine = (d, maintenant = new Date(), capacite = 4) => {
  const l = lundi(maintenant);
  const noms = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  return noms.map((nom, i) => {
    const j = new Date(l); j.setDate(l.getDate() + i);
    const s = iso(j);
    const ouvert = (d?.cfg?.jours || [1, 2, 3, 4, 5]).includes(i);
    const pris = (d?.apts || []).filter(a => a.date === s).length;
    return { nom, date: s, ouvert, pris, capacite, pct: ouvert ? Math.min(100, Math.round(pris / capacite * 100)) : 0 };
  });
};

/* Les prochains rendez-vous, du plus proche au plus lointain */
const prochains = (d, maintenant = new Date(), n = 4) => {
  const auj = iso(maintenant);
  return (d?.apts || [])
    .filter(a => a.date >= auj)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, n)
    .map(a => ({ ...a, client: (d.clients || []).find(c => c.id === a.cid) || null, reste: resteDu(a) }));
};

const initiales = nom => (nom || '?').split(/\s+/).map(m => m.charAt(0)).join('').slice(0, 2).toUpperCase();
const euros = n => (Math.round(Number(n) || 0)).toLocaleString('fr-FR') + ' €';

export { indicateurs, semaine, prochains, resteDu, iso, lundi, memeMois, initiales, euros };
