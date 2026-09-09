/* ═══════════════════════════════════════════════════════════
   COMPTE — Profil, Securite, Preferences
   ═══════════════════════════════════════════════════════════ */
import React, { useRef, useState } from 'react';
import { BarreTitre, EnteteMobile } from '../coquilles.jsx';
import { DEF } from '../data.js';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const Cadre = ({ titre, sous, retour, go, estMobile, actions, children, large }) => estMobile
  ? <div className="mbx"><EnteteMobile titre={titre} sous={sous} retour={retour} go={go} />
      <div className="mb-body" style={{ marginTop: 0, paddingTop: 14 }}>{children}</div></div>
  : <section><BarreTitre titre={titre} sous={sous}>{actions}</BarreTitre>
      <div className="content" style={{ maxWidth: large ? undefined : 620 }}>{children}</div></section>;

const Champ = ({ label, ...p }) => <div className="champ"><label>{label}</label><input {...p} /></div>;

/* ─────────── PROFIL ─────────── */
export function Profil({ d, upd, go, estMobile, setToast }) {
  const maj = (k, v) => upd(n => { n.cfg[k] = v; });
  const jours = d.cfg.jours || [1, 2, 3, 4, 5];
  const basculerJour = i => upd(n => {
    const j = new Set(n.cfg.jours || [1, 2, 3, 4, 5]);
    j.has(i) ? j.delete(i) : j.add(i);
    n.cfg.jours = [...j].sort();
  });

  return (
    <Cadre titre="Profil" sous="Ce qui s’affiche sur tes documents et tes flyers" estMobile={estMobile} go={go} large
           actions={<button className="btn btn-p" onClick={() => setToast('Profil enregistré')}>Enregistrer</button>}>
      <div className={estMobile ? '' : 'duo'}>
        <div className="card" style={{ padding: '18px 20px', marginBottom: estMobile ? 12 : 0 }}>
          <div className="sec-t">Identité</div>
          <Champ label="Nom affiché" value={d.cfg.nom || ''} onChange={e => maj('nom', e.target.value)} placeholder="Fresitalocks" />
          <div className="rangee">
            <Champ label="Téléphone" value={d.cfg.tel || ''} onChange={e => maj('tel', e.target.value)} placeholder="0690…" />
            <Champ label="Ville" value={d.cfg.ville || ''} onChange={e => maj('ville', e.target.value)} placeholder="Les Abymes" />
          </div>
          <Champ label="Adresse" value={d.cfg.adresse || ''} onChange={e => maj('adresse', e.target.value)} />
          <div className="rangee">
            <Champ label="Instagram" value={d.cfg.insta || ''} onChange={e => maj('insta', e.target.value)} placeholder="@fresitalocks" />
            <Champ label="WhatsApp" value={d.cfg.wa || ''} onChange={e => maj('wa', e.target.value)} />
          </div>
          <Champ label="SIRET" value={d.cfg.siret || ''} onChange={e => maj('siret', e.target.value)} />
          <div className="champ"><label>TVA</label>
            <select value={d.cfg.tva?.mode || 'franchise'}
                    onChange={e => upd(n => { n.cfg.tva = { mode: e.target.value, taux: 8.5 }; })}>
              <option value="franchise">Franchise — article 293 B du CGI</option>
              <option value="assujetti">Assujettie — 8,5 % (Guadeloupe)</option>
            </select></div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div className="sec-t">Jours d’ouverture</div>
          {JOURS.map((j, i) => (
            <div className="opt" key={j}>
              <div className="t"><b>{j}</b><span>{jours.includes(i) ? `${d.cfg.hDebut || '09:00'} – ${d.cfg.hFin || '18:00'}` : 'Fermé'}</span></div>
              <span className={'bascule' + (jours.includes(i) ? ' on' : '')} onClick={() => basculerJour(i)}><i /></span>
            </div>
          ))}
          <div className="rangee" style={{ marginTop: 12 }}>
            <Champ label="Ouverture" value={d.cfg.hDebut || '09:00'} onChange={e => maj('hDebut', e.target.value)} />
            <Champ label="Fermeture" value={d.cfg.hFin || '18:00'} onChange={e => maj('hFin', e.target.value)} />
          </div>
        </div>
      </div>
    </Cadre>
  );
}

/* ─────────── SECURITE ─────────── */
export function Securite({ d, setD, go, estMobile, setToast, exportData }) {
  const fichier = useRef(null);
  const [confirme, setConfirme] = useState(false);

  const importer = ev => {
    const f = ev.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        if (!j || !Array.isArray(j.clients) || !Array.isArray(j.apts)) throw new Error('structure');
        setD(j); setToast('Sauvegarde restaurée');
      } catch { setToast('Fichier illisible : ce n’est pas une sauvegarde Fresitas'); }
    };
    r.readAsText(f);
    ev.target.value = '';
  };

  const effacer = () => {
    if (!confirme) { setConfirme(true); return; }
    setD(JSON.parse(JSON.stringify(DEF)));
    setConfirme(false);
    setToast('Tout a été effacé');
  };

  return (
    <Cadre titre="Sécurité" sous="Tes données vivent sur cet appareil, nulle part ailleurs" estMobile={estMobile} go={go} large>
      <div className={estMobile ? '' : 'duo'}>
        <div className="card" style={{ padding: '18px 20px', marginBottom: estMobile ? 12 : 0 }}>
          <div className="sec-t">Sauvegarde</div>
          <p style={{ fontSize: 12, color: 'var(--texte-2)', marginBottom: 14 }}>
            Tout est enregistré dans le navigateur de cet appareil. Si tu le perds, la sauvegarde est la seule copie.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--lavande-50)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>💾</span>
            <div style={{ flex: 1, fontSize: 12 }}>
              <b>{d.clients.length} clientes · {d.apts.length} rendez-vous</b>
              <div style={{ color: 'var(--texte-2)' }}>{(d.factures || []).length} documents de facturation</div>
            </div>
          </div>
          <button className="btn btn-p" style={{ width: '100%', marginBottom: 8 }} onClick={exportData}>Exporter mes données</button>
          <button className="btn btn-s" style={{ width: '100%' }} onClick={() => fichier.current?.click()}>Importer une sauvegarde</button>
          <input ref={fichier} type="file" accept="application/json" style={{ display: 'none' }} onChange={importer} />
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div className="sec-t">Effacer</div>
          <p style={{ fontSize: 12, color: 'var(--texte-2)', marginBottom: 14 }}>
            Supprime clientes, rendez-vous, factures et flyers de cet appareil. Rien n’est récupérable ensuite —
            exporte d’abord.
          </p>
          <button className="btn" style={{ width: '100%', background: 'rgba(192,48,32,.08)', color: 'var(--alerte)', border: '1px solid rgba(192,48,32,.18)' }}
                  onClick={effacer}>
            {confirme ? 'Confirmer : tout effacer définitivement' : 'Tout effacer'}
          </button>
          {confirme && <button className="btn btn-s btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => setConfirme(false)}>Annuler</button>}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: 'var(--bord)' }}>
            <div className="sec-t">Accès</div>
            <p style={{ fontSize: 11.5, color: 'var(--texte-2)' }}>
              L’app s’ouvre directement, sans code. Un code protégerait l’écran, pas les données : le contenu reste
              lisible par qui accède à cet appareil déverrouillé.
            </p>
          </div>
        </div>
      </div>
    </Cadre>
  );
}

/* ─────────── PREFERENCES ─────────── */
export function Preferences({ d, upd, go, estMobile, theme, force, setForce, setToast }) {
  const pref = d.cfg.prefs || {};
  const maj = (k, v) => upd(n => { n.cfg.prefs = { ...(n.cfg.prefs || {}), [k]: v }; });
  const FORMATS = [['mb', 'Mobile'], ['tab', 'Tablette'], ['pc', 'PC'], ['auto', 'Auto']];

  return (
    <Cadre titre="Préférences" sous="Apparence et confort d’utilisation" estMobile={estMobile} go={go} large>
      <div className={estMobile ? '' : 'duo'}>
        <div className="card" style={{ padding: '18px 20px', marginBottom: estMobile ? 12 : 0 }}>
          <div className="sec-t">Apparence</div>
          <div className="opt">
            <div className="t"><b>Thème sombre</b><span>Fond noir, accents violets</span></div>
            <span className={'bascule' + (theme.sombre ? ' on' : '')} onClick={theme.basculer}><i /></span>
          </div>
          <div className="opt">
            <div className="t"><b>Taille du texte</b><span>{pref.zoom || 100} %</span></div>
            <div style={{ display: 'flex', gap: 5 }}>
              <button className="btn btn-s btn-sm" onClick={() => maj('zoom', Math.max(85, (pref.zoom || 100) - 5))}>A−</button>
              <button className="btn btn-s btn-sm" onClick={() => maj('zoom', Math.min(130, (pref.zoom || 100) + 5))}>A+</button>
            </div>
          </div>
          <div style={{ padding: '12px 0', borderTop: 'var(--bord)' }}>
            <b style={{ fontSize: 12.5, display: 'block', marginBottom: 3 }}>Format d’affichage</b>
            <span style={{ fontSize: 11, color: 'var(--texte-2)', display: 'block', marginBottom: 9 }}>
              Détecté automatiquement. Raccourcis Ctrl+1, Ctrl+2, Ctrl+3, et Ctrl+0 pour revenir en auto.
            </span>
            <div className="chips" style={{ padding: 0 }}>
              {FORMATS.map(([v, l]) =>
                <span key={v} className={'chip' + (force === v ? ' on' : '')} onClick={() => setForce(v)}>{l}</span>)}
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div className="sec-t">Retours</div>
          <div className="opt">
            <div className="t"><b>Sons</b><span>Confirmation d’enregistrement</span></div>
            <span className={'bascule' + (pref.sons ? ' on' : '')} onClick={() => maj('sons', !pref.sons)}><i /></span>
          </div>
          <div className="opt">
            <div className="t"><b>Vibrations</b><span>Sans effet sur iPhone — Safari les ignore</span></div>
            <span className={'bascule' + (pref.vibre ? ' on' : '')} onClick={() => maj('vibre', !pref.vibre)}><i /></span>
          </div>
          <div className="opt">
            <div className="t"><b>Rappel de sauvegarde</b><span>Chaque lundi au lancement</span></div>
            <span className={'bascule' + (pref.rappelSauv !== false ? ' on' : '')} onClick={() => maj('rappelSauv', pref.rappelSauv === false)}><i /></span>
          </div>
        </div>
      </div>
    </Cadre>
  );
}
