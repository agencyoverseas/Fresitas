/* ═══════════════════════════════════════════════════════════
   DASHBOARD — meme donnee, deux rendus
   PC : 8 cartes en 2 rangees de 4, puis prochains RDV et
        disponibilite de la semaine.
   Mobile : cercle de CA, 4 cartes cles, les 4 autres sous un
        depliant, grille d'icones, prochains RDV, dispos.
   ═══════════════════════════════════════════════════════════ */
import React, { useState } from 'react';
import { BarreTitre } from '../coquilles.jsx';
import { indicateurs, semaine, prochains, initiales, euros } from '../stats.js';

const Carte = ({ ic, lab, val, sub, calme }) => (
  <div className={'kpi' + (calme ? ' calme' : '')}>
    <em>{ic}</em>
    <div className="lab">{lab}</div>
    <div className="val">{val}</div>
    {sub && <div className="sub">{sub}</div>}
  </div>
);

const LigneRdv = ({ a, go }) => (
  <div className="rdv" onClick={() => go('rdv', a.id)}>
    <div className="av">{initiales(a.client?.n)}</div>
    <div className="rdv-i">
      <div className="rdv-n">{a.client?.n || 'Cliente supprimée'}</div>
      <div className="rdv-d">{a.date.slice(8)}/{a.date.slice(5, 7)} à {a.time} — {a.svc || 'Prestation'}</div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div className="rdv-p">{euros(a.pr)}</div>
      <span className={'bd ' + (a.pd ? 'bd-p' : a.dpd ? 'bd-p' : 'bd-a')}>
        {a.pd ? 'Réglé' : a.dpd ? 'Acompte payé' : 'Acompte dû'}
      </span>
    </div>
  </div>
);

const Dispos = ({ sem, go }) => (
  <>
    {sem.filter(j => j.nom !== 'Dimanche').map(j => (
      <div className="dispo" key={j.date}>
        <span className="j">{j.nom}</span>
        <div className="bar"><i style={{ width: j.pct + '%' }} /></div>
        <span className="n">{j.ouvert ? `${j.pris}/${j.capacite}` : 'fermé'}</span>
      </div>
    ))}
    <button className="btn btn-s btn-sm" style={{ width: '100%', marginTop: 11 }} onClick={() => go('flyer')}>
      Publier les dispos en flyer
    </button>
  </>
);

export default function Dashboard({ d, go, estMobile, exportData }) {
  const [deplie, setDeplie] = useState(false);
  const k = indicateurs(d);
  const sem = semaine(d);
  const proch = prochains(d);
  const libres = sem.filter(j => j.ouvert && j.pris < j.capacite).length;
  const prenom = (d?.cfg?.nom || 'Fresita').split(' ')[0];
  const auj = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const cartes = [
    { ic: '💰', lab: 'CA DU MOIS', val: euros(k.caMois), sub: k.objectifMois ? `objectif ${euros(k.objectifMois)}` : 'ce mois-ci' },
    { ic: '📅', lab: 'RDV DU JOUR', val: k.rdvJour, sub: k.rdvJour ? 'aujourd’hui' : 'aucun rendez-vous' },
    { ic: '⏳', lab: 'ACOMPTES EN ATTENTE', val: k.acomptesDus, sub: `${euros(k.acomptesMt)} à recevoir` },
    { ic: '👤', lab: 'NOUVELLES CLIENTES', val: k.nouvelles, sub: 'ce mois-ci' },
    { ic: '🔄', lab: 'DUES POUR RETWIST', val: k.dues, sub: 'à relancer', calme: true },
    { ic: '💶', lab: 'RESTE À ENCAISSER', val: euros(k.resteEncaisser), sub: 'tous rendez-vous', calme: true },
    { ic: '🗓️', lab: 'RDV DE LA SEMAINE', val: k.rdvSemaine, sub: `${libres} jour${libres > 1 ? 's' : ''} avec du libre`, calme: true },
    { ic: '⭐', lab: 'PRESTATION LA PLUS VENDUE', val: k.topPresta, sub: k.topPrestaNb ? `${k.topPrestaNb} fois ce mois-ci` : '—', calme: true },
  ];

  /* ─────────── MOBILE ─────────── */
  if (estMobile) {
    const pct = k.objectifMois ? Math.min(100, k.caMois / k.objectifMois) : 0.66;
    const circonf = 2 * Math.PI * 42;
    return (
      <div className="mbx">
        <div className="hero">
          <div className="ph" />
          <div className="tx">
            <div className="sal">{auj}</div>
            <h2>Bonjour {prenom}</h2>
          </div>
          <div className="cloche" onClick={() => go('relances')}>🔔</div>
          {k.dues > 0 && <div className="pt" />}
        </div>
        <div className="mb-body">
          <div className="ca-carte">
            <div className="ca-c">
              <svg viewBox="0 0 96 96" aria-hidden="true">
                <circle className="bgc" cx="48" cy="48" r="42" />
                <circle className="fgc" cx="48" cy="48" r="42"
                        strokeDasharray={circonf} strokeDashoffset={circonf * (1 - pct)} />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div className="ca-v">{euros(k.caMois)}</div>
                <div className="ca-l">CA DU MOIS</div>
              </div>
            </div>
            <div className="ca-side">
              <div className="l"><b>{k.rdvJour}</b><span>rendez-vous aujourd’hui</span></div>
              <div className="l"><b>{k.acomptesDus}</b><span>acomptes en attente</span></div>
            </div>
          </div>

          <div className="mb-kpis">
            {cartes.slice(0, 4).map(c => (
              <div className="mb-kpi" key={c.lab}>
                <em>{c.ic}</em><div className="lab">{c.lab}</div><div className="val">{c.val}</div>
              </div>
            ))}
          </div>
          {deplie && (
            <div className="mb-kpis">
              {cartes.slice(4).map(c => (
                <div className="mb-kpi" key={c.lab}>
                  <em>{c.ic}</em><div className="lab">{c.lab}</div><div className="val">{c.val}</div>
                </div>
              ))}
            </div>
          )}
          <button className="deplier" onClick={() => setDeplie(!deplie)}>
            {deplie ? 'Masquer les 4 autres chiffres ⌃' : 'Voir les 4 autres chiffres ⌄'}
          </button>

          <div className="icones">
            <div className="ic" onClick={() => go('bookings')}><i>📅</i><span>Planning</span></div>
            <div className="ic" onClick={() => go('invoices')}><i>🧾</i><span>Factures</span></div>
            <div className="ic" onClick={() => go('flyer')}><i>🎨</i><span>Flyer</span></div>
            <div className="ic" onClick={() => go('reglages')}><i>⚙️</i><span>Réglages</span></div>
          </div>

          <div className="mb-sec">Prochains rendez-vous <a href="#" className="lien" onClick={e => { e.preventDefault(); go('bookings'); }}>Tout voir</a></div>
          {proch.length ? (
            <div className="card" style={{ padding: '6px 4px' }}>
              {proch.map(a => <LigneRdv key={a.id} a={a} go={go} />)}
            </div>
          ) : (
            <div className="card" style={{ padding: '16px', fontSize: 12.5 }}>
              Aucun rendez-vous à venir. Touche le bouton + pour en créer un.
            </div>
          )}

          <div className="mb-sec">Disponibilité de la semaine</div>
          <div className="card" style={{ padding: '12px 16px' }}><Dispos sem={sem} go={go} /></div>
        </div>
      </div>
    );
  }

  /* ─────────── PC / TABLETTE ─────────── */
  return (
    <section>
      <BarreTitre titre={`Bonjour ${prenom}`} sous={`${auj} — ${k.rdvJour} rendez-vous aujourd’hui`}>
        <button className="btn btn-s" onClick={exportData}>Exporter</button>
        <button className="btn btn-p" onClick={() => go('tunnel')}>+ Nouvelle réservation</button>
      </BarreTitre>
      <div className="content">
        <div style={{ display: 'flex', gap: 9, marginBottom: 18, flexWrap: 'wrap' }}>
          <button className="btn btn-q" onClick={() => go('bookings')}>Ouvrir le planning</button>
          <button className="btn btn-q" onClick={() => go('paiement')}>Encaisser un solde</button>
          <button className="btn btn-q" onClick={() => go('flyer')}>Créer un flyer</button>
          <button className="btn btn-q" onClick={() => go('relances')}>Relancer les clientes</button>
        </div>

        <div className="kpis">{cartes.map(c => <Carte key={c.lab} {...c} />)}</div>

        <div className="duo">
          <div className="card" style={{ padding: '16px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px 4px' }}>
              <span className="sec-t" style={{ margin: 0 }}>Prochains rendez-vous</span>
              <a href="#" className="lien" style={{ marginLeft: 'auto' }} onClick={e => { e.preventDefault(); go('bookings'); }}>Tout voir</a>
            </div>
            {proch.length ? proch.map(a => <LigneRdv key={a.id} a={a} go={go} />) : (
              <div style={{ padding: '18px 14px', fontSize: 12.5, color: 'var(--texte-2)' }}>
                Aucun rendez-vous à venir. Crée-en un avec le bouton en haut à droite.
              </div>
            )}
          </div>
          <div className="card" style={{ padding: '16px 18px' }}>
            <div className="sec-t">Disponibilité de la semaine</div>
            <Dispos sem={sem} go={go} />
          </div>
        </div>
      </div>
    </section>
  );
}


/* Declaration lue par le routeur : rien a inscrire ailleurs. */
export const routes = [
  { id: 'dashboard', titre: 'Dashboard', ic: '🏠', grp: 'ACTIVITÉ', bas: 'Accueil', ordre: 10, defaut: true, composant: Dashboard },
];
