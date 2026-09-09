/* ═══════════════════════════════════════════════════════════
   PAIEMENT & SIGNATURE
   Signature tracee au doigt, conditions cochees, puis
   enregistrement du reglement. Aucun encaissement automatique :
   les liens ouvrent la page du fournisseur, c'est tout.
   ═══════════════════════════════════════════════════════════ */
import React, { useRef, useState, useEffect } from 'react';
import { BarreTitre, EnteteMobile } from '../coquilles.jsx';
import { iso, euros } from '../stats.js';
import { libelleJour } from '../agenda.js';
import { moyensActifs, construireLien } from '../paiement.js';

/* Zone de signature : un canvas, la souris et le doigt */
function Signature({ onChange }) {
  const ref = useRef(null);
  const [trace, setTrace] = useState(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    // On dessine a la resolution de l'ecran, sinon le trait bave
    const r = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = r.width * dpr; c.height = r.height * dpr;
    const x = c.getContext('2d');
    x.scale(dpr, dpr);
    x.lineWidth = 2.4; x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent-txt').trim() || '#5A2070';
  }, []);

  const pos = ev => {
    const r = ref.current.getBoundingClientRect();
    const p = ev.touches ? ev.touches[0] : ev;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  };
  const debut = ev => {
    ev.preventDefault();
    const x = ref.current.getContext('2d');
    const { x: px, y: py } = pos(ev);
    x.beginPath(); x.moveTo(px, py);
    ref.current.dataset.dessine = '1';
  };
  const bouge = ev => {
    if (ref.current.dataset.dessine !== '1') return;
    ev.preventDefault();
    const x = ref.current.getContext('2d');
    const { x: px, y: py } = pos(ev);
    x.lineTo(px, py); x.stroke();
    if (!trace) { setTrace(true); onChange?.(true); }
  };
  const fin = () => { ref.current.dataset.dessine = '0'; };
  const effacer = () => {
    const c = ref.current, x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    setTrace(false); onChange?.(false);
  };

  return (
    <>
      <div style={{ height: 112, borderRadius: 16, border: '1.5px dashed var(--lavande)', background: 'var(--surface)', overflow: 'hidden', position: 'relative' }}>
        <canvas ref={ref} style={{ width: '100%', height: '100%', touchAction: 'none', display: 'block' }}
                onMouseDown={debut} onMouseMove={bouge} onMouseUp={fin} onMouseLeave={fin}
                onTouchStart={debut} onTouchMove={bouge} onTouchEnd={fin} />
        {!trace && <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', fontSize: 11.5, color: 'var(--texte-2)' }}>
          Signe ici avec le doigt</span>}
      </div>
      <button className="btn btn-s btn-sm" style={{ marginTop: 9 }} onClick={effacer}>Effacer</button>
    </>
  );
}

export default function Paiement({ d, upd, go, sel, estMobile, setToast }) {
  const apt = d.apts.find(a => a.id === sel) || d.apts.find(a => !a.pd) || d.apts[0];
  const client = apt ? d.clients.find(c => c.id === apt.cid) : null;
  const moyens = moyensActifs(d.cfg.paiements);
  const [cgv, setCgv] = useState(false);
  const [signe, setSigne] = useState(false);
  const reste = apt ? (apt.pd ? 0 : (Number(apt.pr) || 0) - (apt.dpd ? Number(apt.dep) || 0 : 0)) : 0;
  const [montant, setMontant] = useState(String(reste));
  const [moyenId, setMoyenId] = useState((moyens[0] || {}).id || '');
  const moyen = moyens.find(m => m.id === moyenId);
  const lien = moyen ? construireLien(moyen, { montant: Number(montant) || 0, ref: apt?.id, client: client?.n }) : '';

  if (!apt) return (
    <div className="content" style={{ padding: 24 }}>
      <div className="card" style={{ padding: 20, maxWidth: 460 }}>
        <div className="sec-t">Rien à encaisser</div>
        <p style={{ fontSize: 12.5 }}>Aucun rendez-vous enregistré. Crée-en un, puis reviens ici pour faire signer et noter le règlement.</p>
      </div>
    </div>
  );

  const enregistrer = () => {
    const m = Number(montant) || 0;
    upd(n => {
      const a = n.apts.find(x => x.id === apt.id);
      if (!a.dpd) a.dpd = true;
      if (m >= reste) a.pd = true;
      a.dm = moyen?.nom || a.dm;
      a.signe = signe ? iso(new Date()) : a.signe;
      const f = (n.factures || []).find(x => x.aptId === apt.id);
      if (f) { const e = (f.echeances || []).find(y => !y.paye); if (e) { e.paye = true; e.moyen = moyen?.nom || ''; } }
    });
    setToast('Règlement enregistré');
    go('rdv', apt.id);
  };

  const corps = <>
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0' }}>
        <span>{apt.svc}</span><b>{euros(apt.pr)}</b></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--texte-2)', padding: '3px 0' }}>
        <span>{libelleJour(apt.date)} à {apt.time}</span><span>{client?.n || '—'}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0 0', marginTop: 6, borderTop: 'var(--bord)' }}>
        <b style={{ fontSize: 13 }}>Reste à régler</b><b className="rdv-p" style={{ fontSize: 18 }}>{euros(reste)}</b></div>
    </div>

    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 2px', cursor: 'pointer' }} onClick={() => setCgv(!cgv)}>
      <span style={{
        width: 19, height: 19, borderRadius: 5, border: '1.5px solid var(--violet-600)', display: 'grid', placeItems: 'center',
        fontSize: 11, flexShrink: 0, background: cgv ? 'var(--violet-600)' : 'transparent', color: cgv ? '#fff' : 'transparent',
      }}>✓</span>
      <span style={{ fontSize: 12 }}>J’accepte les conditions de réservation et la politique d’annulation.</span>
    </div>

    <div className="mb-sec">Signature</div>
    <Signature onChange={setSigne} />

    <div className="mb-sec">Enregistrer le règlement</div>
    <div className="card" style={{ padding: '14px 16px' }}>
      <div className="rangee">
        <div className="champ"><label>Montant</label>
          <input inputMode="decimal" value={montant} onChange={e => setMontant(e.target.value.replace(/[^\d.,]/g, ''))} /></div>
        <div className="champ"><label>Moyen</label>
          <select value={moyenId} onChange={e => setMoyenId(e.target.value)}>
            {moyens.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select></div>
      </div>
      {moyen && moyen.type !== 'hors' && (
        lien
          ? <button className="btn btn-s" style={{ width: '100%', marginBottom: 9 }}
                    onClick={() => window.open(lien, '_blank')}>Ouvrir le paiement {moyen.nom}</button>
          : <p style={{ fontSize: 11.5, color: 'var(--alerte)', marginBottom: 9 }}>
              Aucun lien enregistré pour {moyen.nom}. Ajoute-le dans Réglages · Moyens de paiement.</p>
      )}
      <button className="btn btn-p" style={{ width: '100%', opacity: cgv && signe ? 1 : .45 }}
              disabled={!(cgv && signe)} onClick={enregistrer}>
        Valider et enregistrer</button>
      {!(cgv && signe) && <p style={{ fontSize: 11, color: 'var(--texte-2)', marginTop: 8 }}>
        Il manque {[!cgv && 'la case des conditions', !signe && 'la signature'].filter(Boolean).join(' et ')}.</p>}
    </div>

    <p style={{ fontSize: 11, color: 'var(--texte-2)', marginTop: 12 }}>
      Aucun encaissement n’a lieu dans l’app : le lien ouvre la page de ton fournisseur, et c’est toi qui notes le règlement une fois reçu.
    </p>
  </>;

  return estMobile
    ? <div className="mbx"><EnteteMobile titre="Paiement & signature" sous={client?.n} retour="bookings" go={go} />
        <div className="mb-body" style={{ marginTop: 0, paddingTop: 14 }}>{corps}</div></div>
    : <section><BarreTitre titre="Paiement & signature" sous={`${client?.n || ''} — ${libelleJour(apt.date)}`} />
        <div className="content" style={{ maxWidth: 560 }}>{corps}</div></section>;
}


export const routes = [
  { id: 'paiement', titre: 'Paiement & signature', ic: '✍️', grp: 'ACTIVITÉ', ordre: 35, composant: Paiement },
];
