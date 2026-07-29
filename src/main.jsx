import React from 'react';
import {createRoot} from 'react-dom/client';

// Polices auto-hebergees (npm) -> aucune requete Google Fonts, tout est bundle
import '@fontsource/outfit/300.css';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/anton';
import '@fontsource/dancing-script/400.css';
import '@fontsource/dancing-script/700.css';

import './app.css';
import './components/pwa.css';

import App from './App.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import OfflineBadge from './components/OfflineBadge.jsx';
import UpdatePrompt from './components/UpdatePrompt.jsx';

// Pas de StrictMode : evite le double-montage des effets (chrono Jour J, splash)
createRoot(document.getElementById('root')).render(
  <>
    <App />
    <OfflineBadge />
    <UpdatePrompt />
    <InstallPrompt />
  </>
);
