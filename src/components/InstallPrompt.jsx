import React, {useState, useEffect} from 'react';

const DKEY = 'fresita_pwa_dismissed';
const DAYS = 7;

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const isIOS = () => {
  const ua = navigator.userAgent || '';
  const classic = /iPad|iPhone|iPod/.test(ua);
  const ipadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return classic || ipadOS;
};

const dismissedRecently = () => {
  try {
    const v = localStorage.getItem(DKEY);
    return v ? Date.now() - parseInt(v, 10) < DAYS * 864e5 : false;
  } catch { return false; }
};

const remember = () => {
  try { localStorage.setItem(DKEY, String(Date.now())); } catch { /* quota */ }
};

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);
  const [sheet, setSheet] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    if (isStandalone() || dismissedRecently()) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    const onInstalled = () => { setDeferred(null); remember(); setVisible(false); };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // iOS n'emet jamais beforeinstallprompt -> on affiche le bandeau nous-memes
    let t;
    if (ios) t = setTimeout(() => setVisible(true), 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(t);
    };
  }, [ios]);

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setVisible(false);
    } else if (ios) {
      setSheet(true);
    }
  };

  const close = () => { remember(); setVisible(false); };

  if (!visible) return null;

  return (
    <>
      <div className="pwa-banner" role="dialog" aria-label="Installer l'application Fresitalocks">
        <span className="pwa-ic">
          <svg viewBox="0 0 24 24"><path d="M12 15.6l-4.2-4.2 1.4-1.4 1.8 1.8V3h2v8.8l1.8-1.8 1.4 1.4L12 15.6zM5 19h14v2H5z"/></svg>
        </span>
        <div className="pwa-tx">
          <div className="pwa-tt">Installer Fresitalocks</div>
          <div className="pwa-sb">
            {ios && !deferred ? 'Ajouter en 2 etapes (Safari)' : "Acces direct depuis l'ecran d'accueil"}
          </div>
        </div>
        <button className="pwa-cta" onClick={install}>
          {ios && !deferred ? 'Voir comment' : 'Installer'}
        </button>
        <button className="pwa-x" onClick={close} aria-label="Fermer">&times;</button>
      </div>

      {sheet && (
        <div className="pwa-ov" onClick={(e) => { if (e.target === e.currentTarget) setSheet(false); }}>
          <div className="pwa-sheet">
            <div className="pwa-grab" />
            <div className="pwa-sh-tt">Ajouter a l'ecran d'accueil</div>
            <div className="pwa-sh-sb">2 etapes, dans Safari</div>

            <div className="pwa-step">
              <span className="pwa-num">1</span>
              <span className="pwa-st-tx">
                Appuie sur <b>Partager</b>{' '}
                <span className="pwa-shr">
                  <svg viewBox="0 0 24 24"><path d="M12 3l3.5 3.5-1.4 1.4L13 5.8V14h-2V5.8L9.9 7.9 8.5 6.5 12 3zM7 10h2v9h6v-9h2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/></svg>
                </span>{' '}
                en bas de l'ecran
              </span>
            </div>

            <div className="pwa-step">
              <span className="pwa-num">2</span>
              <span className="pwa-st-tx">
                Choisis <b>Sur l'ecran d'accueil</b>, puis <b>Ajouter</b>
              </span>
            </div>

            <button className="pwa-done" onClick={() => setSheet(false)}>Compris</button>
          </div>
        </div>
      )}
    </>
  );
}
