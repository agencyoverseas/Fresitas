/* ═══════════════════════════════════════════════════════════
   BOOKINGS — jour (planning horaire), semaine, mois, liste
   Un creneau libre ouvre le tunnel, un bloc occupe ouvre la fiche.
   ═══════════════════════════════════════════════════════════ */
import React, { useState } from 'react';
import { BarreTitre, EnteteMobile } from '../coquilles.jsx';
import { iso, initiales, euros } from '../stats.js';
import { H_DEBUT, H_FIN, min, duree, fmtDuree, grilleJour, grilleMois, jourSemaine, libelleJour, courtJour, demain, relances } from '../agenda.js';

const CASE = 46; // hauteur d'une heure, en pixels

function Planning({ d, date, go, compact }) {
  const lignes = grilleJour(d.apts, date);
  return (
    <div className="plan" style={compact ? { gridTemplateColumns: '44px 1fr' } : undefined}>
      {lignes.map(l => (
        <React.Fragment key={l.h}>
          <div className="h">{l.h}</div>
          <div className={'slot' + (l.occupe ? '' : ' libre')}
               onClick={() => l.occupe ? null : go('tunnel', { date, time: l.h })}>
            {l.apt && (() => {
              const c = d.clients.find(x => x.id === l.apt.cid);
              const haut = Math.max(28, duree(l.apt) / 60 * CASE - 6);
              const decal = (min(l.apt.time) % 60) / 60 * CASE;
              const attente = !l.apt.pd && !l.apt.dpd;
              return (
                <div className={'ev' + (attente ? ' tenue' : '')}
                     style={{ height: haut, top: 3 + decal }}
                     onClick={e => { e.stopPropagation(); go('rdv', l.apt.id); }}>
                  <b>{c?.n || 'Cliente'}</b>
                  <span>{l.apt.svc} · {fmtDuree(duree(l.apt))}{attente ? ' · acompte dû' : ''}</span>
                </div>
              );
            })()}
            {!l.occupe && <span className="add">+</span>}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function Semaine({ d, date, go }) {
  const jours = [...Array(6)].map((_, i) => iso(jourSemaine(new Date(date), i)));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gap: 8 }}>
      {jours.map(j => {
        const liste = d.apts.filter(a => a.date === j).sort((a, b) => a.time.localeCompare(b.time));
        return (
          <div key={j} className="card" style={{ padding: '10px 9px', minHeight: 150 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 7 }}>{courtJour(j)}</div>
            {liste.length ? liste.map(a => (
              <div key={a.id} onClick={() => go('rdv', a.id)}
                   style={{ background: 'var(--lavande-100)', borderRadius: 9, padding: '6px 8px', marginBottom: 5, cursor: 'pointer' }}>
                <b style={{ fontSize: 10.5, display: 'block' }}>{a.time}</b>
                <span style={{ fontSize: 10, color: 'var(--texte-2)' }}>
                  {(d.clients.find(c => c.id === a.cid)?.n || '').split(' ')[0]}
                </span>
              </div>
            )) : (
              <button className="btn btn-q btn-sm" style={{ width: '100%' }} onClick={() => go('tunnel', { date: j })}>+</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Mois({ d, date, go }) {
  const cases = grilleMois(new Date(date), d.apts);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 4, marginBottom: 6 }}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((j, i) =>
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--texte-2)' }}>{j}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 4 }}>
        {cases.map(c => (
          <div key={c.date} onClick={() => go('bookings', { date: c.date, vue: 'jour' })}
               style={{
                 aspectRatio: '1', borderRadius: 10, padding: 5, cursor: 'pointer',
                 background: c.nb ? 'var(--lavande-100)' : 'var(--surface)',
                 border: c.date === iso(new Date()) ? '1.5px solid var(--violet-600)' : 'var(--bord)',
                 opacity: c.horsMois ? .35 : 1,
               }}>
            <div style={{ fontSize: 11, fontWeight: c.nb ? 600 : 400 }}>{c.num}</div>
            {c.nb > 0 && <div style={{ fontSize: 9, color: 'var(--accent-txt)' }}>{c.nb} RDV</div>}
          </div>
        ))}
      </div>
    </>
  );
}

function Liste({ d, go }) {
  const liste = [...d.apts].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  if (!liste.length) return <div style={{ padding: 20, fontSize: 12.5, color: 'var(--texte-2)' }}>Aucun rendez-vous enregistré.</div>;
  return (
    <table className="tbl">
      <thead><tr><th>DATE</th><th>HEURE</th><th>CLIENTE</th><th>PRESTATION</th><th>MONTANT</th><th>ÉTAT</th></tr></thead>
      <tbody>
        {liste.map(a => (
          <tr key={a.id} onClick={() => go('rdv', a.id)} style={{ cursor: 'pointer' }}>
            <td>{a.date.slice(8)}/{a.date.slice(5, 7)}</td>
            <td>{a.time}</td>
            <td>{d.clients.find(c => c.id === a.cid)?.n || '—'}</td>
            <td>{a.svc}</td>
            <td className="num">{euros(a.pr)}</td>
            <td><span className={'bd ' + (a.pd ? 'bd-p' : a.dpd ? 'bd-v' : 'bd-a')}>
              {a.pd ? 'Réglé' : a.dpd ? 'Acompte payé' : 'Acompte dû'}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Bookings({ d, go, sel, estMobile }) {
  const [vue, setVue] = useState(sel?.vue || 'jour');
  const [date, setDate] = useState(sel?.date || iso(new Date()));
  const jour = d.apts.filter(a => a.date === date);
  const matin = jour.filter(a => min(a.time) < 12 * 60);
  const aprem = jour.filter(a => min(a.time) >= 12 * 60);
  const mn = l => l.reduce((s, a) => s + duree(a), 0);
  const encaisse = jour.reduce((s, a) => s + (a.pd ? Number(a.pr) || 0 : a.dpd ? Number(a.dep) || 0 : 0), 0);
  const reste = jour.reduce((s, a) => s + (a.pd ? 0 : (Number(a.pr) || 0) - (a.dpd ? Number(a.dep) || 0 : 0)), 0);
  const rel = relances(d);
  const VUES = [['jour', 'Jour'], ['semaine', 'Semaine'], ['mois', 'Mois'], ['liste', 'Liste']];

  const corps = () => {
    if (vue === 'jour') return <Planning d={d} date={date} go={go} compact={estMobile} />;
    if (vue === 'semaine') return <Semaine d={d} date={date} go={go} />;
    if (vue === 'mois') return <Mois d={d} date={date} go={go} />;
    return <Liste d={d} go={go} />;
  };

  if (estMobile) return (
    <div className="mbx">
      <EnteteMobile titre="Bookings" sous={`${libelleJour(date)} — ${jour.length} rendez-vous`} />
      <div className="mb-body" style={{ marginTop: 0, paddingTop: 10 }}>
        <div className="chips">
          {VUES.map(([v, l]) =>
            <span key={v} className={'chip' + (vue === v ? ' on' : '')} onClick={() => setVue(v)}>{l}</span>)}
        </div>
        <div style={{ display: 'flex', gap: 6, margin: '10px 0' }}>
          <button className="btn btn-s btn-sm" onClick={() => setDate(demain(date, -1))}>‹</button>
          <button className="btn btn-s btn-sm" style={{ flex: 1 }} onClick={() => setDate(iso(new Date()))}>Aujourd’hui</button>
          <button className="btn btn-s btn-sm" onClick={() => setDate(demain(date, 1))}>›</button>
        </div>
        <div className="card" style={{ padding: '12px 13px' }}>{corps()}</div>
        <div className="mb-sec">Résumé du jour</div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
            <span>Matin</span><b>{matin.length} RDV · {fmtDuree(mn(matin))}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
            <span>Après-midi</span><b>{aprem.length} RDV · {fmtDuree(mn(aprem))}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0 0', marginTop: 6, borderTop: 'var(--bord)' }}>
            <span style={{ fontSize: 12.5 }}>Reste à encaisser</span><b className="rdv-p">{euros(reste)}</b></div>
        </div>
        {rel.length > 0 && <>
          <div className="mb-sec">À relancer <a href="#" className="lien" onClick={e => { e.preventDefault(); go('relances'); }}>Tout voir</a></div>
          <div className="card" style={{ padding: '13px 15px' }} onClick={() => go('relances')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div className="av">{initiales(rel[0].client?.n)}</div>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 12.5 }}>{rel[0].client?.n}</b>
                <div style={{ fontSize: 11, color: 'var(--texte-2)' }}>{rel[0].motif}</div>
              </div>
              <span className={'bd ' + (rel[0].urgence === 'urgent' ? 'bd-a' : 'bd-v')}>
                {rel[0].urgence === 'urgent' ? 'Urgent' : rel[0].urgence.toUpperCase()}</span>
            </div>
          </div>
        </>}
      </div>
    </div>
  );

  return (
    <section>
      <BarreTitre titre="Bookings" sous={libelleJour(date)}>
        <div className="seg" style={{ background: 'var(--lavande-100)', padding: 3 }}>
          {VUES.map(([v, l]) => (
            <button key={v} onClick={() => setVue(v)}
                    style={{ fontSize: 11.5, padding: '6px 13px', borderRadius: 9, color: vue === v ? '#fff' : 'var(--accent-txt)', background: vue === v ? 'var(--violet-800)' : 'transparent' }}>
              {l}</button>
          ))}
        </div>
        <button className="btn btn-p" onClick={() => go('tunnel', { date })}>+ Nouvelle réservation</button>
      </BarreTitre>
      <div className="content">
        <div className="duo" style={{ gridTemplateColumns: '1fr 300px' }}>
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span className="sec-t" style={{ margin: 0, textTransform: 'capitalize' }}>{libelleJour(date)}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button className="btn btn-s btn-sm" onClick={() => setDate(demain(date, vue === 'mois' ? -30 : vue === 'semaine' ? -7 : -1))}>‹</button>
                <button className="btn btn-s btn-sm" onClick={() => setDate(iso(new Date()))}>Aujourd’hui</button>
                <button className="btn btn-s btn-sm" onClick={() => setDate(demain(date, vue === 'mois' ? 30 : vue === 'semaine' ? 7 : 1))}>›</button>
              </div>
            </div>
            {corps()}
            {vue === 'jour' && <p style={{ fontSize: 11, color: 'var(--texte-2)', marginTop: 12 }}>
              Un créneau libre ouvre le tunnel avec la date et l’heure déjà remplies. Aucun chevauchement n’est accepté.
            </p>}
          </div>
          <div>
            <div className="card" style={{ padding: '15px 16px', marginBottom: 14 }}>
              <div className="sec-t">Résumé du jour</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12.5 }}>
                <span>Matin</span><b>{matin.length} RDV · {fmtDuree(mn(matin))}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12.5 }}>
                <span>Après-midi</span><b>{aprem.length} RDV · {fmtDuree(mn(aprem))}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0 0', marginTop: 7, borderTop: 'var(--bord)', fontSize: 12.5 }}>
                <span>Encaissé</span><b className="rdv-p" style={{ fontSize: 14 }}>{euros(encaisse)}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
                <span>Reste à encaisser</span><b className="rdv-p" style={{ fontSize: 14 }}>{euros(reste)}</b></div>
            </div>
            <div className="card" style={{ padding: '15px 16px' }}>
              <div className="sec-t">À relancer</div>
              {rel.length ? rel.slice(0, 3).map((r, i) => (
                <div key={i} style={{ fontSize: 12, padding: '7px 0', borderBottom: i < 2 ? 'var(--bord)' : 'none' }}>
                  <b>{r.client?.n || '—'}</b>
                  <div style={{ color: 'var(--texte-2)', fontSize: 11 }}>{r.motif}</div>
                </div>
              )) : <div style={{ fontSize: 12, color: 'var(--texte-2)' }}>Personne à relancer aujourd’hui.</div>}
              {rel.length > 0 && <button className="btn btn-s btn-sm" style={{ width: '100%', marginTop: 11 }} onClick={() => go('relances')}>
                {rel.length > 1 ? `Voir les ${rel.length} relances` : 'Voir la relance'}</button>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── À RELANCER ─────────── */
export function Relances({ d, go, estMobile }) {
  const rel = relances(d);
  const msg = r => encodeURIComponent(
    `Bonjour ${(r.client?.n || '').split(' ')[0]}, je te confirme ton rendez-vous du ${libelleJour(r.apt.date)} à ${r.apt.time}.` +
    ((Number(r.apt.dep) || 0) > 0 && !r.apt.dpd ? ` L'acompte de ${euros(r.apt.dep)} n'est pas encore reçu.` : ''));
  const ouvrir = r => window.open(
    r.client?.ph ? `https://wa.me/${String(r.client.ph).replace(/\D/g, '')}?text=${msg(r)}` : `https://wa.me/?text=${msg(r)}`, '_blank');

  const liste = rel.length ? rel.map((r, i) => (
    <div className="card" key={i} style={{ padding: '13px 15px', marginBottom: 9 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div className="av">{initiales(r.client?.n)}</div>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 12.5 }}>{r.client?.n || '—'}</b>
          <div style={{ fontSize: 11, color: 'var(--texte-2)' }}>{r.motif} — {libelleJour(r.apt.date)}</div>
        </div>
        <span className={'bd ' + (r.urgence === 'urgent' ? 'bd-a' : 'bd-v')}>
          {r.urgence === 'urgent' ? 'Urgent' : r.urgence.toUpperCase()}</span>
      </div>
      <button className="btn btn-w btn-sm" style={{ width: '100%', marginTop: 10 }} onClick={() => ouvrir(r)}>
        Ouvrir WhatsApp</button>
    </div>
  )) : <div className="card" style={{ padding: 18, fontSize: 12.5 }}>
        Personne à relancer. Les rappels apparaissent la veille et une semaine avant, et dès qu’un acompte manque.
      </div>;

  const intro = <p style={{ fontSize: 11.5, color: 'var(--texte-2)', margin: '0 2px 12px' }}>
    Rien ne part tout seul : l’app dresse la liste, tu ouvres WhatsApp d’un geste.</p>;

  return estMobile
    ? <div className="mbx">
        <EnteteMobile titre="À relancer" sous={`${rel.length} cliente${rel.length > 1 ? 's' : ''}`} retour="bookings" go={go} />
        <div className="mb-body" style={{ marginTop: 0, paddingTop: 14 }}>{intro}{liste}</div>
      </div>
    : <section>
        <BarreTitre titre="À relancer" sous={`${rel.length} cliente${rel.length > 1 ? 's' : ''} — rappels J-1 et J-7`} />
        <div className="content" style={{ maxWidth: 620 }}>{intro}{liste}</div>
      </section>;
}
