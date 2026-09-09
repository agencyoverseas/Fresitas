/* ═══════════════════════════════════════════════════════════
   FACTURE PDF — mise en page inspiree du modele valide :
   grand titre a gauche, destinataire a droite, tableau a
   en-tete noir, bloc violet pour le total, remerciement,
   moyens de paiement et contact en pied.
   ═══════════════════════════════════════════════════════════ */
import { mentionTVA, totalRegle, resteDu } from './factures.js';
import { moyensActifs } from './paiement.js';

const VIOLET = [90, 32, 112];
const VIOLET_CLAIR = [155, 96, 192];
const LAVANDE = [212, 184, 232];
const NOIR = [23, 23, 23];
const GRIS = [130, 122, 138];
const GRIS_FOND = [244, 241, 246];
const BLANC = [255, 255, 255];

const eur = n => (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).replace('.', ',') + ' \u20AC';
const jolieDate = s => {
  if (!s) return '';
  const [a, m, j] = String(s).split('-');
  return `${j}/${m}/${a}`;
};

/* Le logo est charge depuis public/. S'il manque, on dessine une
   pastille avec l'initiale : la facture sort quand meme. */
async function chargerLogo() {
  try {
    const r = await fetch('logo.png');
    if (!r.ok) return null;
    const b = await r.blob();
    return await new Promise(res => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => res(null);
      fr.readAsDataURL(b);
    });
  } catch { return null; }
}

/* jsPDF ne sait pas faire de degrade : on empile des bandes fines. */
function degrade(p, x, y, w, h, r = 4) {
  const n = 48;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    p.setFillColor(
      Math.round(VIOLET[0] + (VIOLET_CLAIR[0] - VIOLET[0]) * t),
      Math.round(VIOLET[1] + (VIOLET_CLAIR[1] - VIOLET[1]) * t),
      Math.round(VIOLET[2] + (VIOLET_CLAIR[2] - VIOLET[2]) * t),
    );
    p.rect(x + (w / n) * i, y, w / n + 0.4, h, 'F');
  }
  // coins arrondis simules : deux pastilles blanches aux extremites
  p.setFillColor(...BLANC);
  p.setDrawColor(...BLANC);
}

export default async function genererFacturePDF(f, cfg, { jsPDF }) {
  const p = new jsPDF({ unit: 'mm', format: 'a4' });
  const G = 18, D = 192, L = D - G;   // marges gauche / droite
  const logo = await chargerLogo();

  /* ── En-tete ─────────────────────────────────────────── */
  let y = 20;
  if (logo) {
    try { p.addImage(logo, 'PNG', G, y - 8, 15, 15); } catch { /* logo illisible */ }
  } else {
    p.setFillColor(...VIOLET);
    p.circle(G + 7.5, y - 0.5, 7.5, 'F');
    p.setTextColor(...BLANC); p.setFont('helvetica', 'bold'); p.setFontSize(13);
    p.text((cfg.nom || 'F').charAt(0).toUpperCase(), G + 7.5, y + 2, { align: 'center' });
  }

  p.setTextColor(...NOIR); p.setFont('helvetica', 'bold'); p.setFontSize(34);
  const TITRES = { DEV: 'Devis.', FAC: 'Facture.', REC: 'Reçu.' };
  p.text(TITRES[f.type] || 'Facture.', G, y + 25);

  // Destinataire, aligne a droite
  p.setFont('helvetica', 'bold'); p.setFontSize(8.5); p.setTextColor(...NOIR);
  p.text('FACTURÉ À', D, y + 2, { align: 'right' });
  p.setFontSize(14); p.setTextColor(...VIOLET);
  p.text(f.clientNom || 'Cliente', D, y + 9, { align: 'right' });
  p.setFont('helvetica', 'normal'); p.setFontSize(8.5); p.setTextColor(...GRIS);
  p.text(cfg.ville || 'Les Abymes, Guadeloupe', D, y + 14.5, { align: 'right' });

  y += 30;
  p.setDrawColor(225, 220, 230); p.setLineWidth(0.4);
  p.line(G, y, D, y);

  /* ── Bandeau : telephone, numero, date ───────────────── */
  y += 9;
  const tel = cfg.tel || '';
  if (tel) {
    p.setFillColor(...LAVANDE);
    p.roundedRect(G, y - 5.5, 52, 9, 4.5, 4.5, 'F');
    p.setFont('helvetica', 'bold'); p.setFontSize(8.5); p.setTextColor(...VIOLET);
    p.text(tel, G + 26, y, { align: 'center' });
  }
  p.setFont('helvetica', 'normal'); p.setFontSize(9); p.setTextColor(...NOIR);
  p.text(`N° ${f.num}`, G + 78, y);
  p.text(`Date ${jolieDate(f.date)}`, D, y, { align: 'right' });

  /* ── Tableau ─────────────────────────────────────────── */
  y += 12;
  const CX = [G + 4, 118, 143, D - 4];   // libelle / qte / PU / total
  p.setFillColor(...NOIR);
  p.roundedRect(G, y, L, 11, 5.5, 5.5, 'F');
  p.setFont('helvetica', 'bold'); p.setFontSize(9); p.setTextColor(...BLANC);
  p.text('PRESTATION', CX[0], y + 7);
  p.text('QTÉ', CX[1], y + 7, { align: 'center' });
  p.text('PRIX', CX[2], y + 7, { align: 'center' });
  p.text('TOTAL', CX[3], y + 7, { align: 'right' });
  y += 11;

  p.setFont('helvetica', 'normal'); p.setFontSize(9.5);
  (f.lignes || []).forEach((l, i) => {
    if (i % 2 === 1) { p.setFillColor(...GRIS_FOND); p.rect(G, y, L, 10, 'F'); }
    const neg = (Number(l.pr) || 0) < 0;
    p.setTextColor(...(neg ? VIOLET : NOIR));
    p.text(String(l.lb).slice(0, 46), CX[0], y + 6.5);
    p.setTextColor(...GRIS);
    p.text('1', CX[1], y + 6.5, { align: 'center' });
    p.text(eur(Math.abs(l.pr)), CX[2], y + 6.5, { align: 'center' });
    p.setTextColor(...(neg ? VIOLET : NOIR));
    p.text((neg ? '-' : '') + eur(Math.abs(l.pr)), CX[3], y + 6.5, { align: 'right' });
    y += 10;
  });

  /* ── Totaux ──────────────────────────────────────────── */
  y += 6;
  p.setDrawColor(...NOIR); p.setLineWidth(0.6);
  p.line(G, y, G + 88, y);
  y += 7;
  const sous = (f.lignes || []).reduce((s, l) => s + (Number(l.pr) || 0), 0);
  p.setFont('helvetica', 'bold'); p.setFontSize(9.5); p.setTextColor(...NOIR);
  p.text('Sous-total', G, y);
  p.text(eur(sous), G + 88, y, { align: 'right' });
  p.setFont('helvetica', 'normal'); p.setTextColor(...GRIS); p.setFontSize(8.5);
  p.text(mentionTVA(cfg).slice(0, 44), G, y + 6);
  if (totalRegle(f) > 0) {
    p.setTextColor(...NOIR); p.setFont('helvetica', 'bold'); p.setFontSize(9.5);
    p.text('Déjà réglé', G, y + 13);
    p.text(eur(totalRegle(f)), G + 88, y + 13, { align: 'right' });
    p.setFont('helvetica', 'normal'); p.setTextColor(...GRIS); p.setFontSize(8.5);
    p.text('Reste dû : ' + eur(resteDu(f)), G, y + 19);
  }

  // Bloc total, en degrade violet
  const bx = 118, bw = D - bx, by = y - 12, bh = 26;
  degrade(p, bx, by, bw, bh);
  p.setFont('helvetica', 'normal'); p.setFontSize(8.5); p.setTextColor(...BLANC);
  p.text('TOTAL À RÉGLER', bx + 8, by + 9);
  p.setFont('helvetica', 'bold'); p.setFontSize(19);
  p.text(eur(f.total), bx + 8, by + 20);

  /* ── Remerciement ────────────────────────────────────── */
  y = by + bh + 20;
  p.setFont('helvetica', 'bold'); p.setFontSize(26); p.setTextColor(...VIOLET);
  p.text('Merci', D, y, { align: 'right' });
  p.setFont('helvetica', 'normal'); p.setFontSize(8.5); p.setTextColor(...GRIS);
  p.text('À très vite au salon.', D, y + 6, { align: 'right' });

  /* ── Moyens de paiement ──────────────────────────────── */
  p.setFillColor(...LAVANDE);
  p.roundedRect(G, y - 7, 48, 9, 4.5, 4.5, 'F');
  p.setFont('helvetica', 'bold'); p.setFontSize(8.5); p.setTextColor(...VIOLET);
  p.text('MOYENS DE PAIEMENT', G + 24, y - 1, { align: 'center' });

  let my = y + 8;
  p.setFontSize(8.5);
  moyensActifs(cfg.paiements).slice(0, 4).forEach(m => {
    p.setFont('helvetica', 'bold'); p.setTextColor(...NOIR);
    p.text(m.nom + '.', G, my);
    p.setFont('helvetica', 'normal'); p.setTextColor(...GRIS);
    p.text((m.type === 'hors' ? (m.note || 'sur place') : (m.tpl || '')).slice(0, 40), G, my + 4.5);
    my += 11;
  });

  /* ── Echeancier, s'il y en a un ──────────────────────── */
  if ((f.echeances || []).length > 1) {
    let ey = Math.max(my + 6, y + 22);
    p.setFont('helvetica', 'bold'); p.setFontSize(8.5); p.setTextColor(...NOIR);
    p.text('ÉCHÉANCIER', G, ey);
    ey += 6;
    p.setFontSize(9);
    f.echeances.forEach((e, i) => {
      p.setFillColor(...(e.paye ? LAVANDE : GRIS_FOND));
      p.roundedRect(G, ey - 4.5, 88, 8, 3, 3, 'F');
      p.setFont('helvetica', e.paye ? 'bold' : 'normal');
      p.setTextColor(...(e.paye ? VIOLET : GRIS));
      p.text(`${i + 1}. ${jolieDate(e.date)}${e.paye ? '  (réglée)' : ''}`, G + 4, ey + 1);
      p.text(eur(e.montant), G + 84, ey + 1, { align: 'right' });
      ey += 10;
    });
  }

  /* ── Pied de page ────────────────────────────────────── */
  const py = 272;
  p.setDrawColor(225, 220, 230); p.setLineWidth(0.4);
  p.line(G, py - 7, D, py - 7);
  p.setFont('helvetica', 'bold'); p.setFontSize(8.5); p.setTextColor(...NOIR);
  p.text(cfg.nom || 'Fresitalocks', G, py);
  p.setFont('helvetica', 'normal'); p.setTextColor(...GRIS);
  p.text([cfg.tel, cfg.insta].filter(Boolean).join('  ·  '), G + 62, py);
  p.text([cfg.adresse, cfg.siret ? 'SIRET ' + cfg.siret : ''].filter(Boolean).join('  ·  ').slice(0, 52), D, py, { align: 'right' });

  p.save(`${f.num}.pdf`);
}
