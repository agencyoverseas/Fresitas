/* ═══════════════════════════════════════════════════════════
   FORMAT D'AFFICHAGE — detection auto + forcage memorise
   ───────────────────────────────────────────────────────────
   Seuils valides au cadrage : < 768 mobile, 768-1023 tablette,
   >= 1024 PC. Le forcage est garde d'une session a l'autre, et
   "auto" rend la main a la largeur reelle.
   Raccourcis : Ctrl+1 mobile, Ctrl+2 tablette, Ctrl+3 PC,
   Ctrl+0 retour en auto.
   ═══════════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback } from 'react';

const CLE = 'fresita_format';
const SEUIL_TAB = 768;
const SEUIL_PC = 1024;

const mesurer = () => {
  const w = typeof window === 'undefined' ? 1200 : window.innerWidth;
  if (w >= SEUIL_PC) return 'pc';
  if (w >= SEUIL_TAB) return 'tab';
  return 'mb';
};

const lireForce = () => {
  try {
    const v = localStorage.getItem(CLE);
    return v === 'mb' || v === 'tab' || v === 'pc' ? v : 'auto';
  } catch { return 'auto'; }
};

export default function useFormat() {
  const [force, setForceEtat] = useState(lireForce);
  const [auto, setAuto] = useState(mesurer);

  // On suit la largeur meme quand un format est force : si Fresita
  // revient en auto, l'affichage est deja juste.
  useEffect(() => {
    const onResize = () => setAuto(mesurer());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  const setForce = useCallback(v => {
    setForceEtat(v);
    try {
      if (v === 'auto') localStorage.removeItem(CLE);
      else localStorage.setItem(CLE, v);
    } catch { /* mode prive : on garde au moins la session */ }
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (!e.ctrlKey || e.altKey || e.metaKey) return;
      const map = { '1': 'mb', '2': 'tab', '3': 'pc', '0': 'auto' };
      const v = map[e.key];
      if (v) { e.preventDefault(); setForce(v); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setForce]);

  const format = force === 'auto' ? auto : force;
  return { format, force, setForce, auto, estMobile: format === 'mb', estPC: format !== 'mb' };
}

export { SEUIL_TAB, SEUIL_PC, mesurer };
