/* ═══════════════════════════════════════════════════════════
   MOYENS DE PAIEMENT — catalogue libre, edite dans les Reglages
   ───────────────────────────────────────────────────────────
   Aucun format d'URL n'est code en dur : Fresita colle ses
   propres liens. Trois types seulement.

   "montant"  le lien porte la somme -> gabarit avec {montant}
              ex. https://paypal.me/fresita/{montant}EUR
   "fixe"     toujours la meme adresse, le client tape la somme
              ex. https://revolut.me/fresita
   "hors"     rien a ouvrir : especes, virement, cheque.
              On enregistre seulement le reglement.

   AUCUNE CLE SECRETE ne doit etre saisie ici. Une cle posee
   dans une app qui tourne dans un navigateur est lisible par
   n'importe qui. Ces liens n'en demandent aucune : c'est
   precisement pourquoi ils fonctionnent sans serveur.
   ═══════════════════════════════════════════════════════════ */

const TYPES = [
  { id: "montant", label: "Lien avec le montant", aide: "Le gabarit contient {montant}. Le lien est fabrique pour chaque cliente." },
  { id: "fixe",    label: "Lien fixe",            aide: "Toujours la meme adresse. La cliente saisit elle-meme la somme." },
  { id: "hors",    label: "Hors ligne",           aide: "Rien a ouvrir. On note simplement que la cliente a regle." },
];

/* Depart volontairement neutre : des exemples a completer, pas des
   liens inventes. Revolut est en "fixe" parce qu'un lien revolut.me
   est un lien de profil : c'est le payeur qui entre la somme. */
const DEFAULT_PAIEMENTS = [
  { id: "especes",  nom: "Especes",   type: "hors",    tpl: "",  actif: true,  defaut: true,  note: "" },
  { id: "virement", nom: "Virement",  type: "hors",    tpl: "",  actif: true,  defaut: false, note: "IBAN a renseigner" },
  { id: "revolut",  nom: "Revolut",   type: "fixe",    tpl: "",  actif: false, defaut: false, note: "Colle ton lien revolut.me" },
  { id: "paypal",   nom: "PayPal",    type: "montant", tpl: "",  actif: false, defaut: false, note: "Gabarit du type .../{montant}EUR" },
  { id: "sumup",    nom: "SumUp",     type: "fixe",    tpl: "",  actif: false, defaut: false, note: "Colle le lien cree dans SumUp" },
];

const nouveauMoyen = () => ({
  id: "mp" + Date.now().toString(36),
  nom: "", type: "fixe", tpl: "", actif: true, defaut: false, note: "",
});

/* Formats acceptes dans un gabarit :
   {montant}   19.50      {montant_entier}  20
   {centimes}  1950       {ref}             FAC-2026-009
   {devise}    EUR        {client}          Naelle A.          */
const construireLien = (moyen, { montant = 0, ref = "", client = "", devise = "EUR" } = {}) => {
  if (!moyen || moyen.type === "hors") return "";
  if (moyen.type === "fixe") return (moyen.tpl || "").trim();
  const n = Number(montant) || 0;
  return (moyen.tpl || "")
    .replace(/\{montant\}/g, n.toFixed(2))
    .replace(/\{montant_entier\}/g, String(Math.round(n)))
    .replace(/\{centimes\}/g, String(Math.round(n * 100)))
    .replace(/\{ref\}/g, encodeURIComponent(ref))
    .replace(/\{client\}/g, encodeURIComponent(client))
    .replace(/\{devise\}/g, devise)
    .trim();
};

/* Verifications avant enregistrement — messages destines a Fresita */
const verifierMoyen = m => {
  const e = [];
  if (!m.nom || !m.nom.trim()) e.push("Donne un nom a ce moyen de paiement.");
  if (m.type !== "hors") {
    const t = (m.tpl || "").trim();
    if (!t) e.push("Colle le lien, sinon rien ne s'ouvrira.");
    else if (!/^https:\/\//i.test(t)) e.push("Le lien doit commencer par https://");
    if (m.type === "montant" && t && !/\{montant(_entier)?\}|\{centimes\}/.test(t))
      e.push("Ce gabarit ne contient pas {montant} : la somme ne sera pas transmise.");
  }
  if (/(secret|sk_live|sk_test|api[_-]?key|bearer)/i.test(m.tpl || ""))
    e.push("Ceci ressemble a une cle secrete. Ne la mets jamais ici : elle serait lisible par tout le monde.");
  return e;
};

const moyensActifs = liste => (liste || []).filter(m => m.actif);
const moyenParDefaut = liste => moyensActifs(liste).find(m => m.defaut) || moyensActifs(liste)[0] || null;

export { TYPES, DEFAULT_PAIEMENTS, nouveauMoyen, construireLien, verifierMoyen, moyensActifs, moyenParDefaut };
