import React from 'react';
import {useRegisterSW} from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="pwa-upd">
      <span className="pwa-upd-tx">Nouvelle version disponible</span>
      <button className="pwa-upd-go" onClick={() => updateServiceWorker(true)}>Mettre a jour</button>
      <button className="pwa-x" onClick={() => setNeedRefresh(false)} aria-label="Plus tard">&times;</button>
    </div>
  );
}
