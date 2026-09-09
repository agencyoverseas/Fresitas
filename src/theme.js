/* ═══════════════════════════════════════════════════════════
   THEME — clair / sombre, memorise
   Au premier lancement on suit la preference du systeme ;
   des que Fresita choisit, son choix l'emporte.
   ═══════════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback } from 'react';

const CLE = 'fresita_theme';

const lire = () => {
  try {
    const v = localStorage.getItem(CLE);
    if (v === 'clair' || v === 'sombre') return v;
  } catch { /* mode prive */ }
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair';
  } catch { return 'clair'; }
};

export default function useTheme() {
  const [theme, setEtat] = useState(lire);

  useEffect(() => {
    document.body.classList.toggle('sombre', theme === 'sombre');
    // la barre du navigateur suit le fond de l'app
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', theme === 'sombre' ? '#121212' : '#5A2070');
  }, [theme]);

  const setTheme = useCallback(v => {
    setEtat(v);
    try { localStorage.setItem(CLE, v); } catch { /* mode prive */ }
  }, []);

  const basculer = useCallback(() => setTheme(theme === 'sombre' ? 'clair' : 'sombre'), [theme, setTheme]);

  return { theme, setTheme, basculer, sombre: theme === 'sombre' };
}
