import React, {useState, useEffect} from 'react';

export default function OfflineBadge() {
  const [online, setOnline] = useState(navigator.onLine);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const up = () => { setOnline(true); setFlash(true); setTimeout(() => setFlash(false), 2500); };
    const down = () => { setOnline(false); setFlash(false); };
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  if (online && !flash) return null;

  return (
    <div className={`pwa-net ${online ? 'on' : 'off'}`}>
      <span className="pwa-dot" />
      {online ? 'De retour en ligne' : 'Mode hors ligne — tout reste accessible'}
    </div>
  );
}
