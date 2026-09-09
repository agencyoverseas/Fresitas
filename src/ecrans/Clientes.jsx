/* ═══════════════════════════════════════════════════════════
   CLIENTES — liste et fiche
   Ce fichier n'est declare nulle part ailleurs : le routeur le
   trouve tout seul grace au bloc "routes" en bas.
   ═══════════════════════════════════════════════════════════ */
import React, { useState } from 'react';
import { BarreTitre, EnteteMobile } from '../coquilles.jsx';
import { initiales, euros, iso } from '../stats.js';
import { libelleJour } from '../agenda.js';

function Clientes({ d, go, estMobile }) {
  const [q, setQ] = useState('');
  const auj = iso(new Date());
  const liste = (d.clients || [])
    .map(c => {
      const rdv = (d.apts || []).filter(a => a.cid === c.id);
      const prochain = rdv.filter(a => a.date >= auj).sort((a, b) => a.date.localeCompare(b.date))[0];
      const total = rdv.filter(a => a.pd).reduce((s, a) => s + (Number(a.pr) || 0), 0);
      return { ...c, nb: rdv.length, prochain, total };
    })
    .filter(c => !q || (c.n || '').toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.n || '').localeCompare(b.n || ''));

  const recherche = (
    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher une cliente…"
           style={{ width: '100%', padding: '11px 14px', borderRadius: 14, border: 'var(--bord)',
                    background: 'var(--surface)', fontFamily: 'inherit', fontSize: 12.5, color: 'var(--texte)' }} />
  );

  const cartes = liste.length ? liste.map(c => (
    <div className="card" key={c.id} style={{ padding: '12px 14px', marginTop: 9, cursor: 'pointer' }}
         onClick={() => go('cliente', c.id)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div className="av">{initiales(c.n)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ fontSize: 12.5 }}>{c.n}</b>
          <div style={{ fontSize: 11, color: 'var(--texte-2)' }}>
            {c.nb} rendez-vous{c.prochain ? ` · prochain le ${c.prochain.date.slice(8)}/${c.prochain.date.slice(5, 7)}` : ''}
          </div>
        </div>
        {c.vip && <span className="bd bd-v">VIP</span>}
      </div>
    </div>
  )) : (
    <div className="card" style={{ padding: 18, fontSize: 12.5, marginTop: 12 }}>
      {q ? 'Aucune cliente à ce nom.' : 'Aucune cliente pour l’instant. Elles se créent depuis le tunnel de réservation.'}
    </div>
  );

  return estMobile ? (
    <div className="mbx">
      <EnteteMobile titre="Clientes" sous={`${(d.clients || []).length} au total`} />
      <div className="mb-body" style={{ marginTop: 0, paddingTop: 12 }}>{recherche}{cartes}</div>
    </div>
  ) : (
    <section>
      <BarreTitre titre="Clientes" sous={`${(d.clients || []).length} clientes enregistrées`}>
        <div style={{ width: 240 }}>{recherche}</div>
      </BarreTitre>
      <div className="content" style={{ maxWidth: 680 }}>{cartes}</div>
    </section>
  );
}

function FicheCliente({ d, go, sel, estMobile }) {
  const c = (d.clients || []).find(x => x.id === sel);
  if (!c) return <div className="content" style={{ padding: 24 }}>Cette cliente n’existe plus.</div>;
  const rdv = (d.apts || []).filter(a => a.cid === c.id).sort((a, b) => b.date.localeCompare(a.date));
  const regle = rdv.filter(a => a.pd).reduce((s, a) => s + (Number(a.pr) || 0), 0);

  const corps = (
    <>
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="av" style={{ width: 46, height: 46, fontSize: 15 }}>{initiales(c.n)}</div>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 14 }}>{c.n}</b>
            <div style={{ fontSize: 11.5, color: 'var(--texte-2)' }}>{c.ph || 'pas de téléphone'}</div>
          </div>
          {c.ph && (
            <button className="btn btn-w btn-sm"
                    onClick={() => window.open(`https://wa.me/${String(c.ph).replace(/\D/g, '')}`, '_blank')}>
              WhatsApp</button>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0 0', marginTop: 9, borderTop: 'var(--bord)', fontSize: 12.5 }}>
          <span>Rendez-vous</span><b>{rdv.length}</b></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12.5 }}>
          <span>Total réglé</span><b className="rdv-p">{euros(regle)}</b></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12.5 }}>
          <span>Fidélité</span><b>{c.loy || 0} / {d.cfg.loyTh}</b></div>
      </div>

      <div className="mb-sec">Historique</div>
      {rdv.length ? (
        <div className="card" style={{ padding: '6px 14px' }}>
          {rdv.map(a => (
            <div className="opt" key={a.id} onClick={() => go('rdv', a.id)} style={{ cursor: 'pointer' }}>
              <div className="t"><b>{libelleJour(a.date)}</b><span>{a.svc}</span></div>
              <b className="rdv-p" style={{ fontSize: 14 }}>{euros(a.pr)}</b>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 16, fontSize: 12.5 }}>Aucun rendez-vous enregistré.</div>
      )}
      <button className="btn btn-p" style={{ width: '100%', marginTop: 14 }}
              onClick={() => go('tunnel', { cid: c.id })}>Nouveau rendez-vous</button>
    </>
  );

  return estMobile ? (
    <div className="mbx">
      <EnteteMobile titre={c.n} sous={`${rdv.length} rendez-vous`} retour="clientes" go={go} />
      <div className="mb-body" style={{ marginTop: 0, paddingTop: 14 }}>{corps}</div>
    </div>
  ) : (
    <section>
      <BarreTitre titre={c.n} sous={`${rdv.length} rendez-vous — ${euros(regle)} réglés`}>
        <button className="btn btn-s" onClick={() => go('clientes')}>Retour à la liste</button>
      </BarreTitre>
      <div className="content" style={{ maxWidth: 620 }}>{corps}</div>
    </section>
  );
}

export default Clientes;

export const routes = [
  { id: 'clientes', titre: 'Clientes', ic: '👥', grp: 'ACTIVITÉ', ordre: 25, composant: Clientes },
  { id: 'cliente',  parent: 'clientes', composant: FicheCliente },
];
