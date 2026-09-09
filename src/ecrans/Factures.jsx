/* ═══════════════════════════════════════════════════════════
   FACTURES — liste filtrable + detail (echeancier, envois)
   Le PDF est genere puis telecharge : ni wa.me ni mailto ne
   transportent de piece jointe, c'est Fresita qui la joint.
   ═══════════════════════════════════════════════════════════ */
import React, { useState } from 'react';
import { BarreTitre, EnteteMobile } from '../coquilles.jsx';
import { euros } from '../stats.js';
import { STATUTS, statutCalcule, resteDu, totalRegle, construireEcheancier, mentionTVA } from '../factures.js';
import { moyensActifs, construireLien } from '../paiement.js';

const badge = s => (STATUTS.find(x => x.id === s) || STATUTS[0]);

/* Le PDF est fabrique a la demande : jspdf ne pese sur personne
   tant qu'aucun document n'est edite. */
async function genererPDF(f, cfg, setToast) {
  setToast('Génération du PDF…');
  const { jsPDF } = await import('jspdf');
  const p = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 22;
  p.setFontSize(18); p.text(cfg.nom || 'Fresitalocks', 20, y); y += 7;
  p.setFontSize(9);
  [cfg.adresse, cfg.tel, cfg.siret ? 'SIRET ' + cfg.siret : ''].filter(Boolean).forEach(l => { p.text(String(l), 20, y); y += 4.5; });
  y += 8;
  p.setFontSize(14); p.text(`${f.type === 'DEV' ? 'Devis' : f.type === 'REC' ? 'Reçu' : 'Facture'} ${f.num}`, 20, y); y += 6;
  p.setFontSize(9);
  p.text(`Date : ${f.date}`, 20, y); y += 4.5;
  p.text(`Cliente : ${f.clientNom || '—'}`, 20, y); y += 10;
  p.setFontSize(10);
  (f.lignes || []).forEach(l => {
    p.text(String(l.lb), 20, y);
    p.text(`${Number(l.pr) || 0} EUR`, 180, y, { align: 'right' });
    y += 6;
  });
  y += 2; p.line(20, y, 190, y); y += 7;
  p.setFontSize(12);
  p.text('Total', 20, y); p.text(`${f.total} EUR`, 180, y, { align: 'right' }); y += 8;
  p.setFontSize(8);
  p.text(mentionTVA(cfg), 20, y);
  p.save(`${f.num}.pdf`);
  setToast('PDF téléchargé — joins-le à ton message');
}

export default function Factures({ d, upd, go, estMobile, setToast }) {
  const [filtre, setFiltre] = useState('tout');
  const liste = (d.factures || [])
    .map(f => ({ ...f, st: statutCalcule(f) }))
    .filter(f => filtre === 'tout' || f.st === filtre)
    .sort((a, b) => (b.date + b.num).localeCompare(a.date + a.num));
  const enAttente = (d.factures || []).reduce((s, f) => s + resteDu(f), 0);

  const filtres = [['tout', 'Tout'], ...STATUTS.map(s => [s.id, s.label])];

  if (estMobile) return (
    <div className="mbx">
      <EnteteMobile titre="Factures" sous={`${euros(enAttente)} en attente sur ${(d.factures || []).length} documents`} />
      <div className="mb-body" style={{ marginTop: 0, paddingTop: 10 }}>
        <div className="chips">
          {filtres.map(([id, lb]) =>
            <span key={id} className={'chip' + (filtre === id ? ' on' : '')} onClick={() => setFiltre(id)}>{lb}</span>)}
        </div>
        {liste.length ? liste.map(f => (
          <div className="card" key={f.id} style={{ padding: '12px 14px', marginTop: 9 }} onClick={() => go('facture', f.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 12.5 }}>{f.num}</b>
                <div style={{ fontSize: 11, color: 'var(--texte-2)' }}>{f.clientNom || '—'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="rdv-p">{euros(f.total)}</div>
                <span className={'bd ' + badge(f.st).bd}>{badge(f.st).label}</span>
              </div>
            </div>
          </div>
        )) : <div className="card" style={{ padding: 18, fontSize: 12.5, marginTop: 12 }}>
              Aucun document ici. Une facture est créée dès qu’un rendez-vous est enregistré.
            </div>}
      </div>
    </div>
  );

  return (
    <section>
      <BarreTitre titre="Factures" sous={`${(d.factures || []).length} documents — ${euros(enAttente)} en attente`} />
      <div className="content">
        <div className="chips" style={{ paddingBottom: 14 }}>
          {filtres.map(([id, lb]) =>
            <span key={id} className={'chip' + (filtre === id ? ' on' : '')} onClick={() => setFiltre(id)}>{lb}</span>)}
        </div>
        <div className="card" style={{ padding: '16px 6px 8px' }}>
          {liste.length ? (
            <table className="tbl">
              <thead><tr><th>NUMÉRO</th><th>CLIENTE</th><th>DATE</th><th>MONTANT</th><th>RESTE</th><th>STATUT</th></tr></thead>
              <tbody>
                {liste.map(f => (
                  <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => go('facture', f.id)}>
                    <td className="num">{f.num}</td>
                    <td>{f.clientNom || '—'}</td>
                    <td>{f.date.slice(8)}/{f.date.slice(5, 7)}</td>
                    <td className="num">{euros(f.total)}</td>
                    <td className="num">{euros(resteDu(f))}</td>
                    <td><span className={'bd ' + badge(f.st).bd}>{badge(f.st).label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div style={{ padding: 20, fontSize: 12.5, color: 'var(--texte-2)' }}>
                Aucun document. Une facture est créée automatiquement à chaque rendez-vous enregistré.
              </div>}
        </div>
      </div>
    </section>
  );
}

/* ─────────── DETAIL D'UNE FACTURE ─────────── */
export function DetailFacture({ d, upd, go, sel, estMobile, setToast }) {
  const f = (d.factures || []).find(x => x.id === sel) || (d.factures || [])[0];
  if (!f) return <div className="content" style={{ padding: 24 }}>Aucune facture à afficher.</div>;
  const st = statutCalcule(f);
  const moyens = moyensActifs(d.cfg.paiements);

  const changerNb = nb => upd(n => {
    const x = n.factures.find(y => y.id === f.id);
    x.echeances = construireEcheancier(x.total, nb, x.date);
  });
  const basculerPaye = i => upd(n => {
    const x = n.factures.find(y => y.id === f.id);
    x.echeances[i].paye = !x.echeances[i].paye;
  });
  const changerDate = (i, v) => upd(n => { n.factures.find(y => y.id === f.id).echeances[i].date = v; });

  const msg = encodeURIComponent(`Bonjour ${f.clientNom}, voici ta facture ${f.num} d'un montant de ${f.total} €.`);

  const corps = <>
    <div className="card" style={{ padding: '14px 16px' }}>
      {(f.lignes || []).map((l, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0', color: l.pr < 0 ? 'var(--paye)' : undefined }}>
          <span>{l.lb}</span><b>{l.pr < 0 ? '−' : ''}{euros(Math.abs(l.pr))}</b></div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0 0', marginTop: 6, borderTop: 'var(--bord)' }}>
        <b style={{ fontSize: 13 }}>Total</b><b className="rdv-p" style={{ fontSize: 17 }}>{euros(f.total)}</b></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--texte-2)', paddingTop: 4 }}>
        <span>TVA</span><span>{mentionTVA(d.cfg)}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--texte-2)', paddingTop: 3 }}>
        <span>Déjà réglé</span><span>{euros(totalRegle(f))} — reste {euros(resteDu(f))}</span></div>
    </div>

    <div className="mb-sec">Échéancier <span className={'bd ' + badge(st).bd} style={{ marginLeft: 'auto' }}>{badge(st).label}</span></div>
    <div className="chips" style={{ padding: '0 0 10px' }}>
      {[1, 2, 3, 4].map(n =>
        <span key={n} className={'chip' + ((f.echeances || []).length === n ? ' on' : '')} onClick={() => changerNb(n)}>
          {n === 1 ? 'En une fois' : n + ' fois'}</span>)}
    </div>
    <div className="card" style={{ padding: '6px 16px' }}>
      {(f.echeances || []).map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: i ? 'var(--bord)' : 'none' }}>
          <span onClick={() => basculerPaye(i)} style={{
            width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, cursor: 'pointer', flexShrink: 0,
            background: e.paye ? 'var(--paye-bg)' : 'var(--lavande-100)', color: e.paye ? 'var(--paye)' : 'var(--accent-txt)',
          }}>{e.paye ? '✓' : i + 1}</span>
          <input value={e.date} onChange={ev => changerDate(i, ev.target.value)}
                 style={{ flex: 1, padding: '6px 9px', borderRadius: 9, border: 'var(--bord)', background: 'var(--fond)', fontFamily: 'inherit', fontSize: 12, color: 'var(--texte)' }} />
          <b className="rdv-p">{euros(e.montant)}</b>
        </div>
      ))}
    </div>

    <div className="mb-sec">Envoyer</div>
    <p style={{ fontSize: 11.5, color: 'var(--texte-2)', margin: '0 2px 11px' }}>
      Le PDF est généré puis téléchargé. Le message part prérempli — tu joins le fichier toi-même.</p>
    <button className="btn btn-p" style={{ width: '100%', marginBottom: 8 }} onClick={() => genererPDF(f, d.cfg, setToast)}>
      Générer le PDF</button>
    <button className="btn btn-w" style={{ width: '100%', marginBottom: 8 }}
            onClick={() => window.open('https://wa.me/?text=' + msg, '_blank')}>Message WhatsApp prérempli</button>
    <button className="btn btn-s" style={{ width: '100%', marginBottom: 8 }}
            onClick={() => window.open(`mailto:?subject=${encodeURIComponent(f.num)}&body=${msg}`)}>E-mail prérempli</button>
    {moyens.filter(m => m.type !== 'hors').map(m => {
      const lien = construireLien(m, { montant: resteDu(f), ref: f.num, client: f.clientNom });
      if (!lien) return null;
      return <button key={m.id} className="btn btn-s" style={{ width: '100%', marginBottom: 8 }}
                     onClick={() => { navigator.clipboard?.writeText(lien); setToast('Lien ' + m.nom + ' copié'); }}>
        Copier le lien {m.nom}</button>;
    })}
  </>;

  return estMobile
    ? <div className="mbx"><EnteteMobile titre={f.num} sous={f.clientNom} retour="invoices" go={go} />
        <div className="mb-body" style={{ marginTop: 0, paddingTop: 14 }}>{corps}</div></div>
    : <section><BarreTitre titre={f.num} sous={`${f.clientNom} — ${f.date}`}>
        <button className="btn btn-s" onClick={() => go('invoices')}>Retour</button></BarreTitre>
        <div className="content" style={{ maxWidth: 620 }}>{corps}</div></section>;
}
