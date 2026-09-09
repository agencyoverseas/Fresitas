/* ═══════════════════════════════════════════════════════════
   COQUILLES — deux enveloppes, un seul contenu
   ───────────────────────────────────────────────────────────
   PC / tablette : rail lateral + barre de titre.
   Mobile        : en-tete + nav basse + feuille "Plus".
   Le contenu de chaque ecran est rendu par le parent : les
   coquilles ne connaissent que la navigation.
   ═══════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { useRetour } from './nav.js';




/* Bouton retour visible. Il n'apparait que s'il y a vraiment un
   ecran derriere : un bouton qui ne fait rien est pire que pas de bouton. */
function BoutonRetour({ retour, profond, mobile }) {
  if (!profond) return null;
  const base = {
    position: 'absolute', zIndex: 90, display: 'flex', alignItems: 'center', gap: 5,
    border: 'none', borderRadius: 22, cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 12.5, fontWeight: 500, padding: '8px 14px 8px 11px',
    boxShadow: '0 3px 14px rgba(40,20,55,.18)',
  };
  const style = mobile
    ? { ...base, top: 10, left: 12, background: 'rgba(255,255,255,.18)', color: '#fff', backdropFilter: 'blur(8px)' }
    : { ...base, top: 22, left: 26, background: 'var(--surface)', color: 'var(--accent-txt)', border: '1.5px solid var(--lavande)' };
  return <button style={style} onClick={retour} aria-label="Revenir à l'écran précédent">‹ Retour</button>;
}

function Rail({ actif, go, identite, menu, groupes }) {
  const initiales = (identite?.nom || 'Fresita').trim().slice(0, 2).toUpperCase();
  return (
    <nav className="rail">
      <div className="rail-logo">
        <i>{(identite?.nom || 'F').trim().charAt(0).toUpperCase()}</i>
        <div><b>{identite?.nom || 'Fresitas'}</b><span>{(identite?.ville || 'Les Abymes').toUpperCase()}</span></div>
      </div>
      {groupes.map(g => (
        <React.Fragment key={g}>
          <div className="rail-sec">{g}</div>
          {menu.filter(m => m.grp === g).map(m => (
            <a key={m.id} href="#" className={m.id === actif ? 'on' : ''}
               onClick={e => { e.preventDefault(); go(m.id); }}>
              <em>{m.ic}</em><span>{m.titre}</span>
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

export function CoquillePC({ page, go, retour, profond, identite, menu, groupes, actif, children }) {
  return (
    <div className="shell shell-pc">
      <Rail actif={actif} go={go} identite={identite} menu={menu} groupes={groupes} />
      <main className="main" style={{ position: 'relative' }}>
        <BoutonRetour retour={retour} profond={profond} />
        <div style={profond ? { paddingTop: 34 } : undefined}>{children}</div>
      </main>
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

export function CoquilleMobile({ page, go, retour, profond, bas, plus, actif, children }) {
  const [feuille, setFeuille] = useState(false);

  // Le geste retour ferme d'abord la feuille, il ne quitte pas l'ecran
  useRetour(() => {
    if (!feuille) return false;
    setFeuille(false);
    return true;
  }, [feuille]);

  useEffect(() => {
    if (!feuille) return;
    const onKey = e => { if (e.key === 'Escape') setFeuille(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [feuille]);

  const aller = id => { setFeuille(false); go(id); };

  return (
    <div className="shell shell-mb">
      <BoutonRetour retour={retour} profond={profond} mobile />
      {children}
      <div className={'voile' + (feuille ? ' on' : '')} onClick={() => setFeuille(false)} />
      <div className={'sheet' + (feuille ? ' on' : '')} role="dialog" aria-label="Plus d'écrans" aria-hidden={!feuille}>
        <div className="poignee" />
        {plus.map(m => (
          <a key={m.id} href="#" onClick={e => { e.preventDefault(); aller(m.id); }}>
            <em>{m.ic}</em>{m.titre}<span>›</span>
          </a>
        ))}
      </div>
      <div className="bnav">
        {bas.slice(0, 2).map(m => (
          <button key={m.id} className={'bn' + (m.id === actif ? ' on' : '')} onClick={() => aller(m.id)}>
            <em>{m.ic}</em><span>{m.bas}</span>
          </button>
        ))}
        <div style={{ width: 56 }} />
        {bas.slice(2).map(m => (
          <button key={m.id} className={'bn' + (m.id === actif ? ' on' : '')} onClick={() => aller(m.id)}>
            <em>{m.ic}</em><span>{m.bas}</span>
          </button>
        ))}
        <button className={'bn' + (plus.some(m => m.id === actif) || feuille ? ' on' : '')} onClick={() => setFeuille(v => !v)}>
          <em>⋯</em><span>Plus</span>
        </button>
      </div>
      <button className="bn-plus" aria-label="Nouvelle réservation" onClick={() => aller('tunnel')}>+</button>
    </div>
  );
}

/* En-tete mobile secondaire, avec fleche de retour optionnelle */
export function EnteteMobile({ titre, sous, retour, go, droite, children }) {
  return (
    <div className="mb-hdr" style={{ position: 'relative' }}>
      {retour && <div className="bk" onClick={() => go(retour)}>‹ Retour</div>}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>{titre}</h2>
          {sous && <p>{sous}</p>}
        </div>
        {droite}
      </div>
      {children}
    </div>
  );
}

