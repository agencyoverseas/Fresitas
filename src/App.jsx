/* ═══════════════════════════════════════════════════════════
   APP — etat, navigation, choix de la coquille
   ═══════════════════════════════════════════════════════════ */
import React, {useState, useEffect, useCallback} from 'react';
import {sv, ld, DEF} from './data.js';
import useFormat from './format.js';
import useTheme from './theme.js';
import {consulter} from './nav.js';
import {CoquillePC, CoquilleMobile} from './coquilles.jsx';
import {ECRANS, MENU, BAS, PLUS, GROUPES, DEFAUT, actifPour} from './routeur.js';


export default function App() {
  const [d, setD] = useState(() => ld() || DEF);
  // Pile des ecrans visites : le retour d'Android y remonte au lieu
  // de sortir de l'app.
  const [pile, setPile] = useState([{page: DEFAUT, sel: null}]);
  const {page, sel} = pile[pile.length - 1];
  const [sortie, setSortie] = useState(false);   // 2e retour rapproche = on quitte
  const [toast, setToast] = useState('');
  const {format, force, setForce, estMobile} = useFormat();
  const theme = useTheme();

  useEffect(() => { sv(d); }, [d]);

  // Une entree d'historique de reserve : sans elle, le premier retour
  // sortirait de l'app avant meme qu'on puisse l'intercepter.
  useEffect(() => {
    try { history.replaceState({fresitas: 0}, ''); } catch { /* rien */ }
  }, []);

  useEffect(() => {
    const onPop = () => {
      // 1. un ecran veut-il gerer lui-meme ? (tunnel, feuille "Plus")
      if (consulter()) { try { history.pushState({fresitas: -1}, ''); } catch {} return; }
      // 2. sinon on remonte d'un ecran
      let remonte = false;
      setPile(x => { if (x.length > 1) { remonte = true; return x.slice(0, -1); } return x; });
      if (remonte) return;
      // 3. on est sur l'accueil : on previent avant de laisser sortir
      if (!sortie) {
        setSortie(true);
        setToast('Appuie encore sur retour pour quitter');
        try { history.pushState({fresitas: -1}, ''); } catch {}
        setTimeout(() => setSortie(false), 2500);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [sortie]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); }, [toast]);

  // Taille de texte choisie dans les Preferences
  useEffect(() => {
    const z = d?.cfg?.prefs?.zoom;
    document.documentElement.style.fontSize = z ? (z / 100 * 16) + 'px' : '';
  }, [d?.cfg?.prefs?.zoom]);

  const go = useCallback((p, s = null) => {
    setPile(x => {
      const haut = x[x.length - 1];
      if (haut.page === p && haut.sel === s) return x;   // deja dessus
      // On empile une entree d'historique : c'est elle que le geste
      // "retour" consommera, au lieu de quitter la page.
      try { history.pushState({fresitas: x.length}, ''); } catch { /* rien */ }
      return [...x, {page: p, sel: s}];
    });
  }, []);

  const retour = useCallback(() => {
    setPile(x => (x.length > 1 ? x.slice(0, -1) : x));
  }, []);
  const upd = useCallback(fn => setD(p => { const n = JSON.parse(JSON.stringify(p)); fn(n); return n; }), []);

  const exportData = useCallback(() => {
    const b = new Blob([JSON.stringify(d, null, 2)], {type: 'application/json'});
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u; a.download = 'fresitas-sauvegarde-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click(); URL.revokeObjectURL(u); setToast('Sauvegarde téléchargée');
  }, [d]);

  const Ecran = ECRANS[page] || ECRANS[DEFAUT];
  const ctx = {d, setD, upd, go, retour, sel, setToast, profond: pile.length > 1, estMobile, format, force, setForce, theme, exportData};
  const contenu = <Ecran key={page} {...ctx}/>;

  return (
    <div className={'racine fmt-' + format}>
      {toast && <div className="toast">{toast}</div>}
      {estMobile
        ? <CoquilleMobile page={page} go={go} retour={retour} profond={pile.length > 1}
                          bas={BAS} plus={PLUS} actif={actifPour(page)}>{contenu}</CoquilleMobile>
        : <CoquillePC page={page} go={go} retour={retour} profond={pile.length > 1} identite={d.cfg}
                      menu={MENU} groupes={GROUPES} actif={actifPour(page)}>{contenu}</CoquillePC>}
    </div>
  );
}
