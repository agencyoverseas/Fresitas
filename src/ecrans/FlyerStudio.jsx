/* ═══════════════════════════════════════════════════════════
   FLYER STUDIO — l'editeur est redessine, le rendu ne bouge pas.
   Chargement a la demande : jspdf et html2canvas ne pesent sur
   personne tant que Fresita n'ouvre pas cet ecran.
   ═══════════════════════════════════════════════════════════ */
import React, {Suspense, lazy} from 'react';
import {BarreTitre, EnteteMobile} from '../coquilles.jsx';

const FlyerLegacy = lazy(() => import('../components/Flyer.jsx'));

const Attente = () => (
  <div className="card" style={{padding:22, maxWidth:420}}>
    <div className="sec-t">Chargement de l’éditeur…</div>
    <p style={{fontSize:12.5, color:'var(--texte-2)'}}>
      Les outils d’export d’image se chargent maintenant, pas au démarrage de l’app.
    </p>
  </div>
);

export default function FlyerStudio({d, upd, go, estMobile}) {
  const editeur = (
    <Suspense fallback={<Attente/>}>
      <FlyerLegacy d={d} upd={upd} go={go}/>
    </Suspense>
  );
  return estMobile
    ? <div className="mbx"><EnteteMobile titre="Flyer studio" sous="Dispos, price list, promo"/>
        <div className="mb-body" style={{marginTop:0, paddingTop:10}}>{editeur}</div></div>
    : <section><BarreTitre titre="Flyer studio" sous="L’éditeur est redessiné, le rendu des flyers est conservé"/>
        <div className="content">{editeur}</div></section>;
}


export const routes = [
  { id: 'flyer', titre: 'Flyer studio', ic: '🎨', grp: 'CRÉATION', ordre: 50, composant: FlyerStudio },
];
