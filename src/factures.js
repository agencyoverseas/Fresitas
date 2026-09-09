/* ═══════════════════════════════════════════════════════════
   FACTURATION
   Numerotation DEV / FAC / REC + annee + compteur remis a zero
   au 1er janvier. Une facture n'est jamais supprimee : on emet
   un avoir, sinon la serie aurait un trou.
   ═══════════════════════════════════════════════════════════ */
import { iso } from './stats.js';

const TYPES = { DEV: 'Devis', FAC: 'Facture', REC: 'Reçu' };

const STATUTS = [
  { id: 'brouillon', label: 'Brouillon',  bd: 'bd-n' },
  { id: 'envoyee',   label: 'Envoyée',    bd: 'bd-v' },
  { id: 'partielle', label: 'Partielle',  bd: 'bd-p' },
  { id: 'payee',     label: 'Payée',      bd: 'bd-p' },
  { id: 'retard',    label: 'En retard',  bd: 'bd-a' },
];

const annee = (dt = new Date()) => new Date(dt).getFullYear();

/* Prochain numero de la serie, sans trou */
const prochainNum = (factures, type, dt = new Date()) => {
  const a = annee(dt);
  const n = (factures || [])
    .filter(f => f.type === type && f.num && f.num.includes('-' + a + '-'))
    .map(f => parseInt(f.num.split('-')[2], 10) || 0);
  return `${type}-${a}-${String((n.length ? Math.max(...n) : 0) + 1).padStart(3, '0')}`;
};

const totalLignes = lignes => (lignes || []).reduce((s, l) => s + (Number(l.pr) || 0), 0);
const totalRegle = f => (f?.echeances || []).filter(e => e.paye).reduce((s, e) => s + (Number(e.montant) || 0), 0);
const resteDu = f => Math.max(0, Math.round((Number(f?.total) || 0) - totalRegle(f)));

/* Le statut n'est jamais saisi a la main : il decoule des reglements */
const statutCalcule = (f, maintenant = new Date()) => {
  if (f.type === 'DEV') return f.statut === 'envoyee' ? 'envoyee' : 'brouillon';
  const reste = resteDu(f);
  if (reste <= 0) return 'payee';
  const enRetard = (f.echeances || []).some(e => !e.paye && e.date < iso(maintenant));
  if (enRetard) return 'retard';
  if (totalRegle(f) > 0) return 'partielle';
  return f.statut === 'brouillon' ? 'brouillon' : 'envoyee';
};

/* Echeancier : dates proposees puis modifiables (decision du cadrage).
   Le dernier versement absorbe l'arrondi, sinon la somme tombe a cote. */
const construireEcheancier = (total, nb, dateDepart = iso(new Date())) => {
  const n = Math.max(1, Number(nb) || 1);
  const brut = Math.floor((Number(total) || 0) / n);
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(dateDepart + 'T12:00:00');
    d.setMonth(d.getMonth() + i);
    out.push({
      date: iso(d),
      montant: i === n - 1 ? (Number(total) || 0) - brut * (n - 1) : brut,
      paye: false, moyen: '',
    });
  }
  return out;
};

const creerDocument = ({ factures, type, client, apt, lignes, nbEcheances = 1, tva = null }) => {
  const total = totalLignes(lignes);
  return {
    id: 'f' + Date.now().toString(36),
    num: prochainNum(factures, type),
    type,
    cid: client?.id || null,
    clientNom: client?.n || '',
    aptId: apt?.id || null,
    date: iso(new Date()),
    lignes: lignes || [],
    total,
    tva: tva || null,
    statut: 'brouillon',
    echeances: construireEcheancier(total, nbEcheances),
  };
};

const mentionTVA = cfg => {
  const t = cfg?.tva;
  if (!t || t.mode === 'franchise') return 'TVA non applicable, article 293 B du CGI';
  return `TVA ${t.taux ?? 8.5} %`;
};

export { TYPES, STATUTS, prochainNum, totalLignes, totalRegle, resteDu, statutCalcule, construireEcheancier, creerDocument, mentionTVA, annee };
