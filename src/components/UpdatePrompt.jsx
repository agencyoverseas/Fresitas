/* ═══════════════════════════════════════════════════════════
   BANNIERE DE MISE A JOUR
   Apparait des qu'une nouvelle version est en ligne, sans qu'il
   faille recharger la page a la main.

   ┌───────────────────────────────────────────────────────┐
   │ Cette banniere vide UNIQUEMENT le cache des fichiers   │
   │ de l'app (Cache Storage). Elle ne touche JAMAIS a      │
   │ localStorage : c'est la que vivent les clientes, les   │
   │ rendez-vous et les factures, et il n'en existe aucune  │
   │ autre copie. Ne rajoute jamais localStorage.clear()    │
   │ ici, meme "pour etre sur".                             │
   └───────────────────────────────────────────────────────┘
   ═══════════════════════════════════════════════════════════ */
import React, {useState} from 'react';
import {useRegisterSW} from 'virtual:pwa-register/react';

const INTERVALLE = 60 * 1000;   // on regarde toutes les minutes

export default function UpdatePrompt() {
  const [enCours, setEnCours] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(url, sw) {
      if (!sw) return;
      const verifier = () => {
        if (navigator.onLine === false) return;   // inutile de sonner dans le vide
        sw.update().catch(() => {});
      };
      setInterval(verifier, INTERVALLE);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') verifier();
      });
    },
  });

  if (!needRefresh) return null;

  const mettreAJour = async () => {
    setEnCours(true);
    // On NE vide PAS les caches ici. Le nouveau service worker a deja
    // telecharge ses fichiers ; les effacer maintenant detruirait ce
    // qu'il vient d'installer et l'ancienne version resterait a l'ecran.
    // Le menage des anciens caches est fait par workbox
    // (cleanupOutdatedCaches) au moment de l'activation.
    // localStorage n'est jamais touche : les donnees restent.
    updateServiceWorker(true);
    // Filet : si la bascule n'a pas recharge la page au bout de 6 s,
    // on recharge nous-memes plutot que de laisser Fresita bloquee.
    setTimeout(() => window.location.reload(), 6000);
  };

  const S = {
    boite: {
      position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 9999,
      maxWidth: 460, margin: '0 auto',
      background: 'var(--surface,#fff)', borderRadius: 18, padding: '13px 14px',
      border: '1px solid var(--lavande,#D4B8E8)',
      boxShadow: '0 8px 30px rgba(40,20,55,.22)',
      display: 'flex', alignItems: 'center', gap: 11,
      fontFamily: "'Outfit',system-ui,sans-serif", color: 'var(--texte,#2A1A3A)',
    },
    pastille: {
      width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'grid', placeItems: 'center',
      background: 'linear-gradient(135deg,#5A2070,#9B60C0)', color: '#fff', fontSize: 17,
    },
    bouton: {
      background: 'linear-gradient(135deg,#5A2070,#9B60C0)', color: '#fff', border: 'none',
      borderRadius: 12, padding: '9px 15px', fontSize: 12.5, fontWeight: 500,
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: enCours ? .6 : 1,
    },
    croix: {background: 'none', border: 'none', fontSize: 16, color: 'var(--texte-2,#A09080)', cursor: 'pointer', padding: '0 2px'},
  };

  return (
    <div style={S.boite} role="status">
      <div style={S.pastille}>↻</div>
      <div style={{flex: 1, minWidth: 0}}>
        <b style={{fontSize: 12.5, display: 'block'}}>Nouvelle version disponible</b>
        <span style={{fontSize: 10.5, color: 'var(--texte-2,#A09080)'}}>
          {enCours ? 'Installation en cours…' : 'Tes données sont conservées'}
        </span>
      </div>
      <button style={S.bouton} onClick={mettreAJour} disabled={enCours}>
        {enCours ? 'Patiente…' : 'Mettre à jour'}
      </button>
      {!enCours && (
        <button style={S.croix} onClick={() => setNeedRefresh(false)} aria-label="Plus tard">×</button>
      )}
    </div>
  );
}
