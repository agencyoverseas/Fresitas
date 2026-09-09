/* ═══════════════════════════════════════════════════════════
   REGLAGES — un menu, plusieurs panneaux
   Menu lateral sur PC, liste qui defile sur mobile.
   ═══════════════════════════════════════════════════════════ */
import React, { useState } from 'react';
import { BarreTitre, EnteteMobile } from '../coquilles.jsx';
import { euros } from '../stats.js';
import { calcPrix, detailPrix, grilleDepuisPct, cle } from '../prix.js';
import { TYPES as TYPES_PAIEMENT, nouveauMoyen, construireLien, verifierMoyen } from '../paiement.js';

const ONGLETS = [
  ['grille', 'Grille tarifaire'], ['tranches', 'Tranches de locks'], ['prestations', 'Prestations'],
  ['formules', 'Formules'], ['paiement', 'Moyens de paiement'], ['acompte', 'Acompte & fidélité'],
];

const Champ = ({ label, ...p }) => (
  <div className="champ"><label>{label}</label><input {...p} /></div>
);

/* ─────────── GRILLE TARIFAIRE ─────────── */
function Grille({ d, upd, estMobile, setToast }) {
  const p = d.cfg.pricing;
  const [sim, setSim] = useState({ n: 30, z: p.zones[1]?.id, g: p.grosseurs[1]?.id });
  const set = (z, g, v) => upd(n => {
    n.cfg.pricing.grille = n.cfg.pricing.grille || {};
    n.cfg.pricing.grille[cle(z, g)] = v === '' || v === '-' ? 0 : Math.round(Number(v.replace(',', '.')) || 0);
  });
  const val = (z, g) => (p.grille || {})[cle(z, g)] ?? 0;
  const prix = calcPrix(p, Number(sim.n) || 0, sim.z, sim.g);

  const simulateur = (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div className="sec-t">Vérifier un prix</div>
      <Champ label="Nombre de locks" inputMode="numeric" value={sim.n}
             onChange={e => setSim({ ...sim, n: e.target.value.replace(/\D/g, '') })} />
      <div className="rangee">
        <div className="champ"><label>Longueur</label>
          <select value={sim.z} onChange={e => setSim({ ...sim, z: e.target.value })}>
            {p.zones.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}</select></div>
        <div className="champ"><label>Grosseur</label>
          <select value={sim.g} onChange={e => setSim({ ...sim, g: e.target.value })}>
            {p.grosseurs.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}</select></div>
      </div>
      <div style={{ background: 'var(--lavande-50)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--texte-2)', flex: 1, lineHeight: 1.35 }}>
          {detailPrix(p, Number(sim.n) || 0, sim.z, sim.g).replace(/EUR/g, '€')}</span>
        <b className="rdv-p" style={{ fontSize: 20 }}>{euros(prix)}</b>
      </div>
    </div>
  );

  const boutons = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
      <button className="btn btn-s btn-sm" onClick={() => { upd(n => { n.cfg.pricing.grille = grilleDepuisPct(n.cfg.pricing); }); setToast('Grille remise sur tes pourcentages'); }}>
        Repartir des pourcentages</button>
      <button className="btn btn-s btn-sm" onClick={() => { upd(n => { n.cfg.pricing.mode = n.cfg.pricing.mode === 'pct' ? 'grille' : 'pct'; }); setToast('Mode : ' + (p.mode === 'pct' ? 'grille' : 'pourcentages')); }}>
        {p.mode === 'pct' ? 'Passer en grille' : 'Revenir aux pourcentages'}</button>
    </div>
  );

  if (estMobile) return <>
    <div className="card" style={{ padding: '13px 15px' }}>
      <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
        Prix final = <b>tranche de locks</b> + <b>case de la grille</b>. Tout est en euros.
      </div>
    </div>
    {p.zones.map(z => (
      <React.Fragment key={z.id}>
        <div className="mb-sec">{z.label}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--texte-2)', fontFamily: "'Outfit',sans-serif", fontWeight: 400 }}>{z.cm} cm</span></div>
        <div className="card" style={{ padding: '2px 16px' }}>
          {p.grosseurs.map(g => (
            <div className="opt" key={g.id}>
              <div className="t"><b>{g.label}</b><span>{g.mm} mm</span></div>
              <input value={val(z.id, g.id)} inputMode="numeric" onChange={e => set(z.id, g.id, e.target.value)}
                     style={{ width: 82, textAlign: 'center', padding: '7px 4px', borderRadius: 9, border: 'var(--bord)', background: 'var(--fond)', fontFamily: 'inherit', fontSize: 12.5, color: 'var(--texte)' }} />
            </div>
          ))}
        </div>
      </React.Fragment>
    ))}
    <div className="mb-sec">Vérifier un prix</div>
    {simulateur}{boutons}
  </>;

  return (
    <div className="duo" style={{ gridTemplateColumns: '1fr 300px' }}>
      <div className="card" style={{ padding: '18px 20px' }}>
        <div className="sec-t">Supplément par combinaison</div>
        <p style={{ fontSize: 11.5, color: 'var(--texte-2)', marginBottom: 14 }}>
          Ces montants s’ajoutent au prix de la tranche. Un montant négatif fait baisser le prix.</p>
        <table className="tbl">
          <thead><tr><th>LONGUEUR</th>
            {p.grosseurs.map(g => <th key={g.id} style={{ textAlign: 'center' }}>{g.label.toUpperCase()}
              <div style={{ fontWeight: 400, letterSpacing: 0, color: 'var(--texte-2)', fontSize: 9 }}>{g.mm} mm</div></th>)}
          </tr></thead>
          <tbody>
            {p.zones.map(z => (
              <tr key={z.id}>
                <td><b style={{ fontSize: 12.5 }}>{z.label}</b>
                  <div style={{ fontSize: 10.5, color: 'var(--texte-2)' }}>{z.cm} cm</div></td>
                {p.grosseurs.map(g => (
                  <td key={g.id} style={{ textAlign: 'center' }}>
                    <input value={val(z.id, g.id)} inputMode="numeric" onChange={e => set(z.id, g.id, e.target.value)}
                           style={{ width: 74, textAlign: 'center', padding: '7px 4px', borderRadius: 9, border: 'var(--bord)', background: 'var(--fond)', fontFamily: 'inherit', fontSize: 12.5, color: 'var(--texte)' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {boutons}
      </div>
      {simulateur}
    </div>
  );
}

/* ─────────── MOYENS DE PAIEMENT ─────────── */
function Paiements({ d, upd, setToast }) {
  const liste = d.cfg.paiements || [];
  const maj = (id, champ, v) => upd(n => {
    const m = n.cfg.paiements.find(x => x.id === id);
    if (champ === 'defaut') n.cfg.paiements.forEach(x => { x.defaut = x.id === id; });
    else m[champ] = v;
  });
  const ajouter = () => upd(n => { n.cfg.paiements.push(nouveauMoyen()); });
  const supprimer = id => upd(n => { n.cfg.paiements = n.cfg.paiements.filter(x => x.id !== id); });

  return (
    <>
      <div className="card" style={{ padding: '13px 15px', marginBottom: 14 }}>
        <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          Ajoute ce que tu veux : Revolut, PayPal, SumUp, Lydia, un virement. Trois formes seulement — un lien qui
          porte la somme, un lien fixe où la cliente tape la somme, ou hors ligne.
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--alerte)', marginTop: 8 }}>
          Ne colle jamais de clé secrète ici : elle serait lisible par n’importe qui.
        </div>
      </div>

      {liste.map(m => {
        const erreurs = verifierMoyen(m);
        const apercu = construireLien(m, { montant: 71.5, ref: 'FAC-2026-001', client: 'Naëlle A.' });
        return (
          <div className="card" key={m.id} style={{ padding: '14px 16px', marginBottom: 11 }}>
            <div className="rangee">
              <Champ label="Nom" value={m.nom} onChange={e => maj(m.id, 'nom', e.target.value)} placeholder="Revolut, PayPal…" />
              <div className="champ"><label>Type</label>
                <select value={m.type} onChange={e => maj(m.id, 'type', e.target.value)}>
                  {TYPES_PAIEMENT.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--texte-2)', marginTop: -4, marginBottom: 10 }}>
              {(TYPES_PAIEMENT.find(t => t.id === m.type) || {}).aide}</p>
            {m.type !== 'hors' && (
              <Champ label={m.type === 'montant' ? 'Gabarit du lien (avec {montant})' : 'Lien'}
                     value={m.tpl} onChange={e => maj(m.id, 'tpl', e.target.value)}
                     placeholder={m.type === 'montant' ? 'https://…/{montant}EUR' : 'https://…'} />
            )}
            {m.type !== 'hors' && apercu && (
              <div style={{ background: 'var(--lavande-50)', borderRadius: 10, padding: '9px 11px', fontSize: 11, wordBreak: 'break-all', marginBottom: 10 }}>
                Aperçu pour 71,50 € : {apercu}
              </div>
            )}
            {erreurs.map((x, i) => <div key={i} style={{ fontSize: 11.5, color: 'var(--alerte)', marginBottom: 6 }}>{x}</div>)}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                Actif <span className={'bascule' + (m.actif ? ' on' : '')} onClick={() => maj(m.id, 'actif', !m.actif)}><i /></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                Par défaut <span className={'bascule' + (m.defaut ? ' on' : '')} onClick={() => maj(m.id, 'defaut', true)}><i /></span>
              </div>
              <button className="btn btn-sm" style={{ marginLeft: 'auto', background: 'rgba(192,48,32,.08)', color: 'var(--alerte)' }}
                      onClick={() => { supprimer(m.id); setToast('Moyen supprimé'); }}>Supprimer</button>
            </div>
          </div>
        );
      })}
      <button className="btn btn-p" style={{ width: '100%' }} onClick={ajouter}>+ Ajouter un moyen de paiement</button>
    </>
  );
}

/* ─────────── LISTES SIMPLES ─────────── */
function Tranches({ d, upd }) {
  const t = d.cfg.pricing.tranches;
  const maj = (i, champ, v) => upd(n => { n.cfg.pricing.tranches[i][champ] = Math.round(Number(v) || 0); });
  return <div className="card" style={{ padding: '6px 16px' }}>
    {t.map((x, i) => (
      <div className="opt" key={i}>
        <div className="t"><b>jusqu’à {x.max} locks</b><span>prix de base</span></div>
        <input value={x.prix} inputMode="numeric" onChange={e => maj(i, 'prix', e.target.value)}
               style={{ width: 76, textAlign: 'center', padding: '7px 4px', borderRadius: 9, border: 'var(--bord)', background: 'var(--fond)', fontFamily: 'inherit', fontSize: 12.5, color: 'var(--texte)' }} />
      </div>
    ))}
  </div>;
}

function Prestations({ d, upd }) {
  const maj = (i, champ, v) => upd(n => { n.cfg.prestations[i][champ] = champ === 'nom' || champ === 'cat' ? v : Math.round(Number(v) || 0); });
  const ajouter = () => upd(n => { n.cfg.prestations.push({ id: 'p' + Date.now().toString(36), nom: '', prix: 0, duree: 30, desc: '', cat: '' }); });
  const suppr = i => upd(n => { n.cfg.prestations.splice(i, 1); });
  return <>
    <div className="card" style={{ padding: '6px 16px', marginBottom: 12 }}>
      {(d.cfg.prestations || []).map((p, i) => (
        <div key={p.id} style={{ padding: '11px 0', borderTop: i ? 'var(--bord)' : 'none' }}>
          <div className="rangee">
            <Champ label="Nom" value={p.nom} onChange={e => maj(i, 'nom', e.target.value)} />
            <Champ label="Prix (€)" value={p.prix} inputMode="numeric" onChange={e => maj(i, 'prix', e.target.value)} />
            <Champ label="Durée (min)" value={p.duree} inputMode="numeric" onChange={e => maj(i, 'duree', e.target.value)} />
          </div>
          <button className="btn btn-sm" style={{ background: 'rgba(192,48,32,.08)', color: 'var(--alerte)' }} onClick={() => suppr(i)}>Supprimer</button>
        </div>
      ))}
    </div>
    <button className="btn btn-p" style={{ width: '100%' }} onClick={ajouter}>+ Ajouter une prestation</button>
  </>;
}

function Formules({ d, upd }) {
  const maj = (i, j, v) => upd(n => { n.cfg.formules[i].lengths[j].prix = Math.round(Number(v) || 0); });
  return <>{(d.cfg.formules || []).map((f, i) => (
    <div className="card" key={f.id} style={{ padding: '14px 16px', marginBottom: 11 }}>
      <div className="sec-t" style={{ marginBottom: 4 }}>{f.title}</div>
      <p style={{ fontSize: 11.5, color: 'var(--texte-2)', marginBottom: 10 }}>{f.subtitle || f.note}</p>
      {(f.lengths || []).map((l, j) => (
        <div className="opt" key={j}>
          <div className="t"><b>{l.label}</b></div>
          <input value={l.prix} inputMode="numeric" onChange={e => maj(i, j, e.target.value)}
                 style={{ width: 76, textAlign: 'center', padding: '7px 4px', borderRadius: 9, border: 'var(--bord)', background: 'var(--fond)', fontFamily: 'inherit', fontSize: 12.5, color: 'var(--texte)' }} />
        </div>
      ))}
    </div>
  ))}</>;
}

function Acompte({ d, upd }) {
  const maj = (champ, v) => upd(n => { n.cfg[champ] = Math.round(Number(v) || 0); });
  return <div className="card" style={{ padding: '14px 16px' }}>
    <div className="rangee">
      <Champ label="Acompte (%)" value={d.cfg.depPct} inputMode="numeric" onChange={e => maj('depPct', e.target.value)} />
      <Champ label="Fidélité : à partir de" value={d.cfg.loyTh} inputMode="numeric" onChange={e => maj('loyTh', e.target.value)} />
      <Champ label="Remise fidélité (€)" value={d.cfg.loyDis} inputMode="numeric" onChange={e => maj('loyDis', e.target.value)} />
    </div>
    <p style={{ fontSize: 11.5, color: 'var(--texte-2)' }}>
      L’acompte s’applique au total du devis. La remise de fidélité se déclenche à partir du nombre de rendez-vous indiqué.
    </p>
  </div>;
}

export default function Reglages({ d, upd, go, sel, estMobile, setToast }) {
  const [onglet, setOnglet] = useState(sel || null);
  const ctx = { d, upd, estMobile, setToast };
  const panneau = o => ({
    grille: <Grille {...ctx} />, tranches: <Tranches {...ctx} />, prestations: <Prestations {...ctx} />,
    formules: <Formules {...ctx} />, paiement: <Paiements {...ctx} />, acompte: <Acompte {...ctx} />,
  }[o]);

  /* Mobile : la liste, puis un écran par onglet */
  if (estMobile) {
    if (!onglet) return (
      <div className="mbx">
        <EnteteMobile titre="Réglages" sous="Prix, paiement, prestations" />
        <div className="mb-body" style={{ marginTop: 0, paddingTop: 12 }}>
          <div className="card" style={{ padding: '4px 14px' }}>
            {ONGLETS.map(([id, lb]) => (
              <div className="opt" key={id} onClick={() => setOnglet(id)}>
                <div className="t"><b>{lb}</b><span>{
                  id === 'grille' ? `${(d.cfg.pricing.zones.length) * (d.cfg.pricing.grosseurs.length)} prix définis` :
                  id === 'tranches' ? `de ${euros(d.cfg.pricing.tranches[0].prix)} à ${euros(d.cfg.pricing.tranches.slice(-1)[0].prix)}` :
                  id === 'prestations' ? `${(d.cfg.prestations || []).length} prestations` :
                  id === 'formules' ? `${(d.cfg.formules || []).length} formules` :
                  id === 'paiement' ? `${(d.cfg.paiements || []).filter(m => m.actif).length} moyens actifs` :
                  `acompte ${d.cfg.depPct} %`}</span></div>
                <span style={{ color: 'var(--texte-2)' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    return (
      <div className="mbx">
        <div className="mb-hdr">
          <div className="bk" onClick={() => setOnglet(null)}>‹ Réglages</div>
          <h2>{(ONGLETS.find(o => o[0] === onglet) || [])[1]}</h2>
        </div>
        <div className="mb-body" style={{ marginTop: 0, paddingTop: 14 }}>{panneau(onglet)}</div>
      </div>
    );
  }

  /* PC : menu à gauche, panneau à droite */
  const actif = onglet || 'grille';
  return (
    <section>
      <BarreTitre titre="Réglages" sous="Tout ce qui pilote les prix, le paiement et l’agenda" />
      <div className="content">
        <div className="duo" style={{ gridTemplateColumns: '210px 1fr', alignItems: 'start' }}>
          <div className="card" style={{ padding: 9 }}>
            {ONGLETS.map(([id, lb]) => (
              <a key={id} href="#" onClick={e => { e.preventDefault(); setOnglet(id); }}
                 style={{
                   display: 'block', padding: '9px 12px', borderRadius: 10, fontSize: 12.5, textDecoration: 'none',
                   background: id === actif ? 'var(--lavande-100)' : 'transparent',
                   color: id === actif ? 'var(--accent-txt)' : 'var(--texte-2)',
                   fontWeight: id === actif ? 600 : 400,
                 }}>{lb}</a>
            ))}
          </div>
          <div>{panneau(actif)}</div>
        </div>
      </div>
    </section>
  );
}


export const routes = [
  { id: 'reglages', titre: 'Réglages', ic: '⚙️', grp: 'COMPTE', ordre: 60, composant: Reglages },
];
