/* ═══════════════════════════════════════════════════════════
   APP — etat, navigation, choix de la coquille
   ═══════════════════════════════════════════════════════════ */
import React, {useState, useEffect, useCallback} from 'react';
import {sv, ld, DEF} from './data.js';
import useFormat from './format.js';
import useTheme from './theme.js';
import {CoquillePC, CoquilleMobile} from './coquilles.jsx';
import Dashboard from './ecrans/Dashboard.jsx';
import Bookings, {Relances} from './ecrans/Bookings.jsx';
import Tunnel, {FicheRdv} from './ecrans/Tunnel.jsx';
import Factures, {DetailFacture} from './ecrans/Factures.jsx';
import PaiementEcran from './ecrans/Paiement.jsx';
import Reglages from './ecrans/Reglages.jsx';
import {Profil, Securite, Preferences} from './ecrans/Compte.jsx';
import FlyerStudio from './ecrans/FlyerStudio.jsx';

const ECRANS = {
  dashboard: Dashboard, bookings: Bookings, relances: Relances,
  tunnel: Tunnel, rdv: FicheRdv,
  invoices: Factures, facture: DetailFacture, paiement: PaiementEcran,
  reglages: Reglages, profil: Profil, securite: Securite, prefs: Preferences,
  flyer: FlyerStudio,
};

export default function App() {
  const [d, setD] = useState(() => ld() || DEF);
  const [page, setPage] = useState('dashboard');
  const [sel, setSel] = useState(null);
  const [toast, setToast] = useState('');
  const {format, force, setForce, estMobile} = useFormat();
  const theme = useTheme();

  useEffect(() => { sv(d); }, [d]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); }, [toast]);

  // Taille de texte choisie dans les Preferences
  useEffect(() => {
    const z = d?.cfg?.prefs?.zoom;
    document.documentElement.style.fontSize = z ? (z / 100 * 16) + 'px' : '';
  }, [d?.cfg?.prefs?.zoom]);

  const go = useCallback((p, s = null) => { setPage(p); setSel(s); }, []);
  const upd = useCallback(fn => setD(p => { const n = JSON.parse(JSON.stringify(p)); fn(n); return n; }), []);

  const exportData = useCallback(() => {
    const b = new Blob([JSON.stringify(d, null, 2)], {type: 'application/json'});
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u; a.download = 'fresitas-sauvegarde-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click(); URL.revokeObjectURL(u); setToast('Sauvegarde téléchargée');
  }, [d]);

  const Ecran = ECRANS[page] || Dashboard;
  const ctx = {d, setD, upd, go, sel, setToast, estMobile, format, force, setForce, theme, exportData};
  const contenu = <Ecran key={page} {...ctx}/>;

  return (
    <div className={'racine fmt-' + format}>
      {toast && <div className="toast">{toast}</div>}
      {estMobile
        ? <CoquilleMobile page={page} go={go}>{contenu}</CoquilleMobile>
        : <CoquillePC page={page} go={go} identite={d.cfg}>{contenu}</CoquillePC>}
    </div>
  );
}
