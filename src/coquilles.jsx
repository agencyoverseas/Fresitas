/* ═══════════════════════════════════════════════════════════
   COQUILLES — deux enveloppes, un seul contenu
   ───────────────────────────────────────────────────────────
   PC / tablette : rail lateral + barre de titre.
   Mobile        : en-tete + nav basse + feuille "Plus".
   Le contenu de chaque ecran est rendu par le parent : les
   coquilles ne connaissent que la navigation.
   ═══════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';

/* Un seul endroit ou se declarent les ecrans */
const MENU = [
  { id: 'dashboard', label: 'Dashboard',            ic: '🏠', grp: 'ACTIVITÉ', bas: 'Accueil' },
  { id: 'bookings',  label: 'Bookings',             ic: '📅', grp: 'ACTIVITÉ', bas: 'Bookings' },
  { id: 'invoices',  label: 'Factures',             ic: '🧾', grp: 'ACTIVITÉ', bas: 'Factures' },
  { id: 'paiement',  label: 'Paiement & signature', ic: '✍️', grp: 'ACTIVITÉ' },
  { id: 'relances',  label: 'À relancer',           ic: '🔄', grp: 'ACTIVITÉ' },
  { id: 'flyer',     label: 'Flyer studio',         ic: '🎨', grp: 'CRÉATION' },
  { id: 'reglages',  label: 'Réglages',             ic: '⚙️', grp: 'COMPTE' },
  { id: 'profil',    label: 'Profil',               ic: '👤', grp: 'COMPTE' },
  { id: 'securite',  label: 'Sécurité',             ic: '🔒', grp: 'COMPTE' },
  { id: 'prefs',     label: 'Préférences',          ic: '🎚️', grp: 'COMPTE' },
];

/* Un sous-ecran garde son parent allume dans le rail */
const PARENT = {
  grille: 'reglages', 'reglages-presta': 'reglages',
  tunnel: 'bookings', rdv: 'bookings',
  facture: 'invoices',
};

const GROUPES = ['ACTIVITÉ', 'CRÉATION', 'COMPTE'];
const BAS = MENU.filter(m => m.bas);
const PLUS = MENU.filter(m => !m.bas);

function Rail({ page, go, identite }) {
  const actif = PARENT[page] || page;
  const initiales = (identite?.nom || 'Fresita').trim().slice(0, 2).toUpperCase();
  return (
    <nav className="rail">
      <div className="rail-logo">
        <i>{(identite?.nom || 'F').trim().charAt(0).toUpperCase()}</i>
        <div><b>{identite?.nom || 'Fresitas'}</b><span>{(identite?.ville || 'Les Abymes').toUpperCase()}</span></div>
      </div>
      {GROUPES.map(g => (
        <React.Fragment key={g}>
          <div className="rail-sec">{g}</div>
          {MENU.filter(m => m.grp === g).map(m => (
            <a key={m.id} href="#" className={m.id === actif ? 'on' : ''}
               onClick={e => { e.preventDefault(); go(m.id); }}>
              <em>{m.ic}</em><span>{m.label}</span>
            </a>
          ))}
        </React.Fragment>
      ))}
      <div className="rail-user">
        <i>{initiales}</i>
        <div><b>{identite?.nom || 'Fresita'}</b><span>{identite?.metier || 'Locticienne'}</span></div>
      </div>
    </nav>
  );
}

export function CoquillePC({ page, go, identite, children }) {
  return (
    <div className="shell shell-pc">
      <Rail page={page} go={go} identite={identite} />
      <main className="main">{children}</main>
    </div>
  );
}

/* Barre de titre d'un ecran PC : titre, sous-titre, actions a droite */
export function BarreTitre({ titre, sous, children }) {
  return (
    <div className="topbar">
      <div><h1>{titre}</h1>{sous && <p>{sous}</p>}</div>
      <div className="sp" />
      {children}
    </div>
  );
}

export function CoquilleMobile({ page, go, children }) {
  const [feuille, setFeuille] = useState(false);
  const actif = PARENT[page] || page;

  // Retour materiel Android / geste iOS : on ferme la feuille avant de quitter
  useEffect(() => {
    if (!feuille) return;
    const onKey = e => { if (e.key === 'Escape') setFeuille(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [feuille]);

  const aller = id => { setFeuille(false); go(id); };

  return (
    <div className="shell shell-mb">
      {children}
      <div className={'voile' + (feuille ? ' on' : '')} onClick={() => setFeuille(false)} />
      <div className={'sheet' + (feuille ? ' on' : '')} role="dialog" aria-label="Plus d'écrans" aria-hidden={!feuille}>
        <div className="poignee" />
        {PLUS.map(m => (
          <a key={m.id} href="#" onClick={e => { e.preventDefault(); aller(m.id); }}>
            <em>{m.ic}</em>{m.label}<span>›</span>
          </a>
        ))}
      </div>
      <div className="bnav">
        {BAS.slice(0, 2).map(m => (
          <button key={m.id} className={'bn' + (m.id === actif ? ' on' : '')} onClick={() => aller(m.id)}>
            <em>{m.ic}</em><span>{m.bas}</span>
          </button>
        ))}
        <div style={{ width: 56 }} />
        {BAS.slice(2).map(m => (
          <button key={m.id} className={'bn' + (m.id === actif ? ' on' : '')} onClick={() => aller(m.id)}>
            <em>{m.ic}</em><span>{m.bas}</span>
          </button>
        ))}
        <button className={'bn' + (PLUS.some(m => m.id === actif) || feuille ? ' on' : '')} onClick={() => setFeuille(v => !v)}>
          <em>⋯</em><span>Plus</span>
        </button>
      </div>
      <button className="bn-plus" aria-label="Nouvelle réservation" onClick={() => aller('tunnel')}>+</button>
    </div>
  );
}

/* En-tete mobile secondaire, avec fleche de retour optionnelle */
export function EnteteMobile({ titre, sous, retour, go, children }) {
  return (
    <div className="mb-hdr">
      {retour && <div className="bk" onClick={() => go(retour)}>‹ Retour</div>}
      <h2>{titre}</h2>
      {sous && <p>{sous}</p>}
      {children}
    </div>
  );
}

export { MENU, PARENT };
