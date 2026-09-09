/* ═══════════════════════════════════════════════════════════
   TUNNEL DE RESERVATION — 6 etapes
   cliente -> devis -> creneau -> recap -> paiement -> confirme
   ═══════════════════════════════════════════════════════════ */
import React, { useState } from 'react';
import { BarreTitre, EnteteMobile } from '../coquilles.jsx';
import { iso, initiales, euros } from '../stats.js';
import { calcPrix, detailPrix } from '../prix.js';
import { moyensActifs, construireLien } from '../paiement.js';
import { H_DEBUT, H_FIN, hhmm, min, duree, fmtDuree, dureeSuggeree, chevauche, libelleJour, demain } from '../agenda.js';
import { creerDocument } from '../factures.js';
import { useRetour } from '../nav.js';

const ETAPES = ['Cliente', 'Devis', 'Créneau', 'Récapitulatif', 'Paiement', 'Confirmé'];

export default function Tunnel({ d, upd, go, sel, estMobile, setToast }) {
  const cfg = d.cfg;
  const [e, setE] = useState(1);
  const [f, setF] = useState({
    cid: '', nom: '', tel: '',
    mode: 'reprise', nbLocks: 30,
    zoneId: cfg.pricing.zones[1]?.id || '', grosseurId: cfg.pricing.grosseurs[1]?.id || '',
    formuleId: cfg.formules?.[0]?.id || '', formuleLi: 0,
    prestSel: [],
    date: sel?.date || iso(new Date()), time: sel?.time || '09:00',
    dur: 120, nbEch: 1, moyenId: '',
  });
  const maj = u => setF(p => ({ ...p, ...u }));

  const client = d.clients.find(c => c.id === f.cid) || null;
  const base = f.mode === 'reprise'
    ? calcPrix(cfg.pricing, Number(f.nbLocks) || 0, f.zoneId, f.grosseurId)
    : Number((cfg.formules.find(x => x.id === f.formuleId)?.lengths || [])[f.formuleLi]?.prix) || 0;
  const presta = f.prestSel.map(id => cfg.prestations.find(p => p.id === id)).filter(Boolean);
  const sousTotal = base + presta.reduce((s, p) => s + (Number(p.prix) || 0), 0);
  const fidelite = client && (client.loy || 0) >= (cfg.loyTh || 5) ? Number(cfg.loyDis) || 0 : 0;
  const total = Math.max(0, sousTotal - fidelite);
  const acompte = Math.round(total * (Number(cfg.depPct) || 55)) / 100;
  const dureeAuto = dureeSuggeree(cfg, f.prestSel);
  const collision = chevauche(d.apts, f.date, f.time, Number(f.dur) || dureeAuto);
  const moyens = moyensActifs(cfg.paiements);

  // Le geste retour recule d'une etape au lieu de quitter le tunnel
  useRetour(() => {
    if (e > 1 && e < 6) { setE(e - 1); return true; }
    return false;
  }, [e]);

  const libelle = f.mode === 'reprise'
    ? `Reprise ${f.nbLocks} locks`
    : (cfg.formules.find(x => x.id === f.formuleId)?.title || 'Formule');

  const valider = () => {
    const id = 'a' + Date.now().toString(36);
    upd(n => {
      let cid = f.cid;
      if (!cid && f.nom.trim()) {
        cid = 'c' + Date.now().toString(36);
        n.clients.push({ id: cid, n: f.nom.trim(), ph: f.tel, em: '', cr: iso(new Date()), vis: 0, vip: false, tr: false, rf: 4, ref: null, photos: [], diag: [], loy: 0, rev: [] });
      }
      n.apts.push({
        id, cid, date: f.date, time: f.time, dur: Number(f.dur) || dureeAuto,
        svc: [libelle, ...presta.map(p => p.nom)].join(' + '),
        pr: total, dep: acompte, dpd: false, dm: (moyens.find(m => m.id === f.moyenId) || {}).nom || '', pd: false,
      });
      n.factures = n.factures || [];
      n.factures.push(creerDocument({
        factures: n.factures, type: 'FAC', client: n.clients.find(c => c.id === cid),
        apt: { id }, nbEcheances: Number(f.nbEch) || 1,
        lignes: [{ lb: libelle, pr: base }, ...presta.map(p => ({ lb: p.nom, pr: Number(p.prix) || 0 })),
                 ...(fidelite ? [{ lb: 'Fidélité', pr: -fidelite }] : [])],
      }));
    });
    setToast('Rendez-vous créé');
    setE(6);
  };

  /* ─── contenu de chaque étape ─── */
  const etape = () => {
    if (e === 1) return <>
      <div className="champ"><label>Cliente déjà connue</label>
        <select value={f.cid} onChange={ev => maj({ cid: ev.target.value })}>
          <option value="">— Nouvelle cliente —</option>
          {d.clients.map(c => <option key={c.id} value={c.id}>{c.n}</option>)}
        </select></div>
      {!f.cid && <>
        <div className="champ"><label>Nom</label>
          <input value={f.nom} onChange={ev => maj({ nom: ev.target.value })} placeholder="Prénom et initiale" /></div>
        <div className="champ"><label>Téléphone</label>
          <input value={f.tel} onChange={ev => maj({ tel: ev.target.value })} placeholder="0690…" /></div>
      </>}
      {client && <div className="card" style={{ padding: '12px 14px', background: 'var(--lavande-50)' }}>
        <b style={{ fontSize: 12.5 }}>{client.n}</b>
        <div style={{ fontSize: 11, color: 'var(--texte-2)' }}>
          {client.vis || 0} rendez-vous · fidélité {client.loy || 0}/{cfg.loyTh}
          {fidelite > 0 && ` · remise ${euros(fidelite)} acquise`}
        </div>
      </div>}
    </>;

    if (e === 2) return <>
      <div className="chips" style={{ padding: '0 0 10px' }}>
        <span className={'chip' + (f.mode === 'reprise' ? ' on' : '')} onClick={() => maj({ mode: 'reprise' })}>Reprise</span>
        <span className={'chip' + (f.mode === 'formule' ? ' on' : '')} onClick={() => maj({ mode: 'formule' })}>Formule</span>
      </div>
      {f.mode === 'reprise' ? <>
        <div className="champ"><label>Nombre de locks</label>
          <input inputMode="numeric" value={f.nbLocks} onChange={ev => maj({ nbLocks: ev.target.value.replace(/\D/g, '') })} /></div>
        <div className="rangee">
          <div className="champ"><label>Longueur</label>
            <select value={f.zoneId} onChange={ev => maj({ zoneId: ev.target.value })}>
              {cfg.pricing.zones.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}</select></div>
          <div className="champ"><label>Grosseur</label>
            <select value={f.grosseurId} onChange={ev => maj({ grosseurId: ev.target.value })}>
              {cfg.pricing.grosseurs.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}</select></div>
        </div>
      </> : <>
        <div className="champ"><label>Formule</label>
          <select value={f.formuleId} onChange={ev => maj({ formuleId: ev.target.value, formuleLi: 0 })}>
            {(cfg.formules || []).map(x => <option key={x.id} value={x.id}>{x.title}</option>)}</select></div>
        <div className="champ"><label>Longueur</label>
          <select value={f.formuleLi} onChange={ev => maj({ formuleLi: Number(ev.target.value) })}>
            {((cfg.formules.find(x => x.id === f.formuleId) || {}).lengths || []).map((l, i) =>
              <option key={i} value={i}>{l.label} — {euros(l.prix)}</option>)}</select></div>
      </>}
      <div className="mb-sec" style={{ marginTop: 6 }}>Prestations en plus</div>
      <div className="card" style={{ padding: '2px 16px' }}>
        {(cfg.prestations || []).map(p => (
          <div key={p.id} className={'coche' + (f.prestSel.includes(p.id) ? ' on' : '')}
               onClick={() => maj({ prestSel: f.prestSel.includes(p.id) ? f.prestSel.filter(x => x !== p.id) : [...f.prestSel, p.id] })}>
            <span className="b">✓</span>
            <div className="t">{p.nom}<span>{p.duree} min</span></div>
            <b>{euros(p.prix)}</b>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--texte-2)', marginTop: 10 }}>
        {f.mode === 'reprise' ? detailPrix(cfg.pricing, Number(f.nbLocks) || 0, f.zoneId, f.grosseurId).replace(/EUR/g, '€') : 'Prix de la formule choisie'}
      </p>
    </>;

    if (e === 3) return <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button className="btn btn-s btn-sm" onClick={() => maj({ date: demain(f.date, -1) })}>‹</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 12.5, alignSelf: 'center', textTransform: 'capitalize' }}>{libelleJour(f.date)}</div>
        <button className="btn btn-s btn-sm" onClick={() => maj({ date: demain(f.date, 1) })}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
        {[...Array(H_FIN - H_DEBUT)].map((_, i) => {
          const t = hhmm((H_DEBUT + i) * 60);
          const pris = chevauche(d.apts, f.date, t, Number(f.dur) || dureeAuto);
          return <button key={t} disabled={pris}
            className={'btn ' + (f.time === t ? 'btn-p' : 'btn-s') + ' btn-sm'}
            style={{ opacity: pris ? .35 : 1 }}
            onClick={() => maj({ time: t })}>{t}</button>;
        })}
      </div>
      <div className="rangee" style={{ marginTop: 12 }}>
        <div className="champ"><label>Durée (min)</label>
          <input inputMode="numeric" value={f.dur} onChange={ev => maj({ dur: ev.target.value.replace(/\D/g, '') })} /></div>
        <div className="champ"><label>Suggérée</label>
          <input readOnly value={fmtDuree(dureeAuto)} /></div>
      </div>
      {collision && <div className="card" style={{ padding: '11px 13px', background: 'rgba(192,48,32,.07)', border: '1px solid rgba(192,48,32,.18)', fontSize: 12 }}>
        Ce créneau chevauche un rendez-vous existant. Choisis une autre heure ou raccourcis la durée.
      </div>}
    </>;

    if (e === 4) return <div className="card" style={{ padding: '14px 16px', background: 'var(--lavande-50)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0' }}>
        <span>{libelle}</span><b>{euros(base)}</b></div>
      {presta.map(p => <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0' }}>
        <span>{p.nom}</span><b>{euros(p.prix)}</b></div>)}
      {fidelite > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0', color: 'var(--paye)' }}>
        <span>Fidélité</span><b>−{euros(fidelite)}</b></div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0 0', marginTop: 6, borderTop: 'var(--bord)' }}>
        <b style={{ fontSize: 13 }}>Total</b><b className="rdv-p" style={{ fontSize: 18 }}>{euros(total)}</b></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--texte-2)', paddingTop: 3 }}>
        <span>Acompte {cfg.depPct} %</span><span>{acompte.toFixed(2)} €</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--texte-2)', paddingTop: 3 }}>
        <span>{libelleJour(f.date)} à {f.time}</span><span>{fmtDuree(Number(f.dur) || dureeAuto)}</span></div>
    </div>;

    if (e === 5) return <>
      <div className="champ"><label>Payable en</label>
        <select value={f.nbEch} onChange={ev => maj({ nbEch: Number(ev.target.value) })}>
          <option value={1}>une fois</option><option value={2}>2 fois</option>
          <option value={3}>3 fois</option><option value={4}>4 fois</option>
        </select></div>
      <div className="champ"><label>Moyen de paiement</label>
        <select value={f.moyenId} onChange={ev => maj({ moyenId: ev.target.value })}>
          <option value="">— à choisir plus tard —</option>
          {moyens.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
        </select></div>
      {(() => {
        const m = moyens.find(x => x.id === f.moyenId);
        const lien = m ? construireLien(m, { montant: acompte, client: client?.n || f.nom }) : '';
        if (!m) return <p style={{ fontSize: 11.5, color: 'var(--texte-2)' }}>
          Tu peux enregistrer le rendez-vous sans choisir : le règlement se note plus tard.</p>;
        if (m.type === 'hors') return <p style={{ fontSize: 11.5, color: 'var(--texte-2)' }}>
          {m.nom} : rien à envoyer, tu noteras le règlement quand il arrive.</p>;
        if (!lien) return <p style={{ fontSize: 11.5, color: 'var(--alerte)' }}>
          Aucun lien enregistré pour {m.nom}. Ajoute-le dans Réglages · Moyens de paiement.</p>;
        return <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--texte-2)', marginBottom: 5 }}>Lien à envoyer</div>
          <div style={{ fontSize: 11.5, wordBreak: 'break-all' }}>{lien}</div>
          <button className="btn btn-s btn-sm" style={{ width: '100%', marginTop: 9 }}
                  onClick={() => { navigator.clipboard?.writeText(lien); setToast('Lien copié'); }}>Copier le lien</button>
        </div>;
      })()}
    </>;

    return <div style={{ textAlign: 'center', padding: '26px 10px' }}>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: 'var(--accent-txt)' }}>Rendez-vous créé</div>
      <p style={{ fontSize: 12.5, color: 'var(--texte-2)', marginTop: 8 }}>
        {libelleJour(f.date)} à {f.time} — {euros(total)}, acompte {acompte.toFixed(2)} €.<br />La facture est créée en brouillon.
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        <button className="btn btn-s" onClick={() => go('bookings')}>Voir le planning</button>
        <button className="btn btn-p" onClick={() => go('invoices')}>Voir la facture</button>
      </div>
    </div>;
  };

  const peutAvancer = () => {
    if (e === 1) return !!f.cid || f.nom.trim().length > 1;
    if (e === 2) return total > 0;
    if (e === 3) return !collision;
    return true;
  };

  const pieds = e < 6 && (
    <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
      <button className="btn btn-s" style={{ flex: 1 }} onClick={() => e === 1 ? go('bookings') : setE(e - 1)}>
        {e === 1 ? 'Annuler' : 'Retour'}</button>
      <button className="btn btn-p" style={{ flex: 2, opacity: peutAvancer() ? 1 : .45 }}
              disabled={!peutAvancer()}
              onClick={() => e === 5 ? valider() : setE(e + 1)}>
        {e === 5 ? 'Enregistrer le rendez-vous' : 'Continuer'}</button>
    </div>
  );

  const jauge = <div className="etapes" style={{ marginTop: 11 }}>
    {ETAPES.map((_, i) => <i key={i} className={i < e ? 'on' : ''} />)}</div>;

  /* Le total suit chaque coche, chaque changement de longueur ou de
     grosseur. Il reste visible a toutes les etapes : sans ca, on ne
     decouvre le prix qu'au recapitulatif. */
  const totalMobile = (
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div style={{ fontSize: 9.5, opacity: .75, letterSpacing: .6 }}>TOTAL</div>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>
        {euros(total)}</div>
      <div style={{ fontSize: 10, opacity: .75 }}>acompte {acompte.toFixed(2)} €</div>
    </div>
  );
  const totalPC = (
    <div style={{ textAlign: 'right', padding: '2px 16px', borderRadius: 14, background: 'var(--lavande-100)' }}>
      <div style={{ fontSize: 9.5, color: 'var(--texte-2)', letterSpacing: .6 }}>TOTAL</div>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: 'var(--accent-txt)', lineHeight: 1.15 }}>
        {euros(total)}</div>
      <div style={{ fontSize: 10.5, color: 'var(--texte-2)' }}>acompte {acompte.toFixed(2)} €</div>
    </div>
  );

  if (estMobile) return (
    <div className="mbx">
      <EnteteMobile titre="Nouvelle réservation" sous={`Étape ${e} sur 6 — ${ETAPES[e - 1]}`}
                    retour="bookings" go={go} droite={e < 6 ? totalMobile : null}>{jauge}</EnteteMobile>
      <div className="mb-body" style={{ marginTop: 0, paddingTop: 14 }}>{etape()}{pieds}</div>
    </div>
  );

  return (
    <section>
      <BarreTitre titre="Nouvelle réservation" sous={`Étape ${e} sur 6 — ${ETAPES[e - 1]}`}>
        {e < 6 && totalPC}
      </BarreTitre>
      <div className="content" style={{ maxWidth: 560 }}>
        <div className="etapes" style={{ marginBottom: 16 }}>
          {ETAPES.map((_, i) => <i key={i} className={i < e ? 'on' : ''} style={{ background: i < e ? 'var(--violet-600)' : 'var(--lavande-100)' }} />)}
        </div>
        {etape()}{pieds}
      </div>
    </section>
  );
}

/* ─────────── FICHE RENDEZ-VOUS ─────────── */
export function FicheRdv({ d, upd, go, sel, estMobile, setToast }) {
  const a = d.apts.find(x => x.id === sel);
  if (!a) return <div className="content" style={{ padding: 24 }}>Ce rendez-vous n’existe plus.</div>;
  const c = d.clients.find(x => x.id === a.cid);
  const reste = a.pd ? 0 : (Number(a.pr) || 0) - (a.dpd ? Number(a.dep) || 0 : 0);

  const marquer = champ => upd(n => { const x = n.apts.find(y => y.id === a.id); x[champ] = true; if (champ === 'pd') x.dpd = true; });
  const supprimer = () => { upd(n => { n.apts = n.apts.filter(y => y.id !== a.id); }); setToast('Rendez-vous annulé'); go('bookings'); };
  const reporter = j => { upd(n => { const x = n.apts.find(y => y.id === a.id); x.date = demain(x.date, j); }); setToast('Reporté de ' + j + ' jour(s)'); };

  const corps = <>
    <div className="card" style={{ padding: '14px 16px' }}>
      {[['Prestation', a.svc], ['Durée', fmtDuree(duree(a))], ['Date', `${libelleJour(a.date)} à ${a.time}`]].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
          <span style={{ color: 'var(--texte-2)' }}>{k}</span><b style={{ textAlign: 'right' }}>{v}</b></div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
        <span style={{ color: 'var(--texte-2)' }}>Statut</span>
        <span className={'bd ' + (a.pd ? 'bd-p' : a.dpd ? 'bd-p' : 'bd-a')}>
          {a.pd ? 'Réglé' : a.dpd ? 'Acompte payé' : 'Acompte dû'}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0 0', marginTop: 6, borderTop: 'var(--bord)' }}>
        <b style={{ fontSize: 13 }}>Total</b><b className="rdv-p" style={{ fontSize: 17 }}>{euros(a.pr)}</b></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--texte-2)', paddingTop: 3 }}>
        <span>Reste à encaisser</span><span>{euros(reste)}</span></div>
    </div>
    <div className="mb-sec">Actions</div>
    {!a.dpd && <button className="btn btn-p" style={{ width: '100%', marginBottom: 8 }} onClick={() => { marquer('dpd'); setToast('Acompte enregistré'); }}>
      Enregistrer l’acompte</button>}
    {!a.pd && <button className="btn btn-p" style={{ width: '100%', marginBottom: 8 }} onClick={() => go('paiement', a.id)}>
      Encaisser le solde</button>}
    <button className="btn btn-w" style={{ width: '100%', marginBottom: 8 }}
            onClick={() => window.open(c?.ph ? `https://wa.me/${String(c.ph).replace(/\D/g, '')}` : 'https://wa.me/', '_blank')}>
      Message WhatsApp</button>
    <button className="btn btn-s" style={{ width: '100%', marginBottom: 8 }} onClick={() => reporter(7)}>Reporter d’une semaine</button>
    <button className="btn" style={{ width: '100%', background: 'rgba(192,48,32,.08)', color: 'var(--alerte)', border: '1px solid rgba(192,48,32,.18)' }}
            onClick={supprimer}>Annuler le rendez-vous</button>
  </>;

  return estMobile
    ? <div className="mbx"><EnteteMobile titre={c?.n || 'Rendez-vous'} sous={`${libelleJour(a.date)} — ${a.time}`} retour="bookings" go={go} />
        <div className="mb-body" style={{ marginTop: 0, paddingTop: 14 }}>{corps}</div></div>
    : <section><BarreTitre titre={c?.n || 'Rendez-vous'} sous={`${libelleJour(a.date)} à ${a.time}`}>
        <button className="btn btn-s" onClick={() => go('bookings')}>Retour au planning</button></BarreTitre>
        <div className="content" style={{ maxWidth: 520 }}>{corps}</div></section>;
}


export const routes = [
  { id: 'tunnel', parent: 'bookings', composant: Tunnel },
  { id: 'rdv',    parent: 'bookings', composant: FicheRdv },
];
