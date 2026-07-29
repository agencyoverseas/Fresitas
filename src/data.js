/* ═══ STORAGE ═══ */
const SK="fresita_v8";

/* ═══ PRICING (moteur reprise de racines : tranche x longueur x grosseur) ═══ */
const DEFAULT_PRICING={
  tranches:[
    {max:20,prix:100},{max:30,prix:120},{max:40,prix:130},{max:50,prix:140},
    {max:60,prix:150},{max:70,prix:160},{max:80,prix:170},{max:90,prix:180}
  ],
  zones:[
    {id:"cou",label:"Cou / Nuque",cm:25,pct:-5},
    {id:"epaules",label:"Epaules",cm:40,pct:0},
    {id:"dos",label:"Dos",cm:55,pct:10},
    {id:"basdos",label:"Bas du dos",cm:65,pct:15},
    {id:"fesses",label:"Fesses",cm:70,pct:20},
    {id:"bassin",label:"Bassin+",cm:85,pct:30}
  ],
  grosseurs:[
    {id:"micro",label:"Micro",mm:4,pct:-12},
    {id:"fines",label:"Fines",mm:7,pct:0},
    {id:"moyennes",label:"Moyennes",mm:11,pct:16},
    {id:"larges",label:"Larges",mm:16,pct:36}
  ]
};
const DEFAULT_FORMULES=[
  {id:"fo1",num:"01",title:"RETWIST SEUL",subtitle:"",note:"Supplement coiffure : +20 EUR (Vanilles, Nattes, Petales)",lengths:[{label:"Locks courtes",prix:80},{label:"Locks mi-longues",prix:90},{label:"Locks longues",prix:100},{label:"Locks tres longues",prix:110}]},
  {id:"fo2",num:"02",title:"FORMULE SIMPLE",subtitle:"Shampoing + Retwist",note:"Coiffure incluse (sans supplement)",lengths:[{label:"Locks courtes",prix:125},{label:"Locks mi-longues",prix:145},{label:"Locks longues",prix:165},{label:"Locks tres longues",prix:185}]},
  {id:"fo3",num:"03",title:"FORMULE ESSENTIELLE",subtitle:"Soin + Shampoing + Retwist",note:"Coiffure incluse (sans supplement)",lengths:[{label:"Locks courtes",prix:180},{label:"Locks mi-longues",prix:200},{label:"Locks longues",prix:220},{label:"Locks tres longues",prix:240}]}
];
const DEFAULT_FLYER={
  id:"f1",name:"Dispos Aout 2026",collab:true,
  title:"Les dernieres disponibilites !",
  exclusiveLabel:"COLLABORATION EXCLUSIVE",
  tagline:"UNE SEMAINE POUR PRENDRE SOIN DE VOS LOCKS.",
  bigTitle:"DISPONIBILITES",period:"Aout 2026",
  locName:"1001 LOCKS",locCity:"ROSNY-SOUS-BOIS",cta:"PRENDS TON rendez-vous !",
  logoA:"",logoB:"",
  slots:["11H","13H","15H","17H"],
  days:[
    {date:"2026-08-03",label:"LUNDI 03 AOUT",avail:[true,true,true,false]},
    {date:"2026-08-04",label:"MARDI 04 AOUT",avail:[false,false,false,false]},
    {date:"2026-08-05",label:"MERCREDI 05 AOUT",avail:[true,true,true,true]},
    {date:"2026-08-07",label:"VENDREDI 07 AOUT",avail:[false,true,true,false]},
    {date:"2026-08-08",label:"SAMEDI 08 AOUT",avail:[true,true,true,true]}
  ],
  prestations:["SHAMPOOING","SOINS","ENTRETIEN / RETWIST","COIFFURE SUR LOCKS"],
  acompteTitle:"RESERVATION VALIDEE APRES",
  acompteText:"le reglement de la prestation ou d'un",
  acomptePct:40,
  acompteNote:"Acompte non remboursable en cas d'annulation, de report ou de non-presentation",
  contactText:"RENDEZ-VOUS EN DM INSTAGRAM OU WHATSAPP",
  footer:["1 SEMAINE SEULEMENT","PLACES LIMITEES","EXPERTISE LOCKS","PASSION & SAVOIR-FAIRE"],
  template:"grille",
  plTitle:"TARIFS",plSubtitle:"Fresita Locks",plStyle:"bars",plTheme:"#5A2070",plContact:"@fresitalocks_",plFooter:"Reserve ton creneau en DM",
  plCategories:[
    {id:"pc1",name:"RETWIST SEUL",photo:"",items:[{label:"Locks courtes",prix:80},{label:"Locks mi-longues",prix:90},{label:"Locks longues",prix:100},{label:"Locks tres longues",prix:110}]},
    {id:"pc2",name:"FORMULE SIMPLE",photo:"",items:[{label:"Locks courtes",prix:125},{label:"Locks mi-longues",prix:145},{label:"Locks longues",prix:165},{label:"Locks tres longues",prix:185}]},
    {id:"pc3",name:"FORMULE ESSENTIELLE",photo:"",items:[{label:"Locks courtes",prix:180},{label:"Locks mi-longues",prix:200},{label:"Locks longues",prix:220},{label:"Locks tres longues",prix:240}]}
  ],
  attn:"Ce sont mes derniers creneaux en Guadeloupe pour l'ete ! Apres, je serai en France",
  listBadge:"DERNIERES DISPONIBILITES DU MOIS !",
  listFooter:"Reserve vite ton creneau avant qu'il ne soit pris !",
  promoTheme:"#1A1A1A",promoName:"Fresita Locks",promoTagline:"Salon & Spa",promoPhoto:"",
  promoServices:["Retwist / Entretien","Soins profonds","Coiffure sur locks","Shampoing"],
  promoCTA:"RESERVE MAINTENANT",promoPhone:"",promoIG:"@fresitalocks_",promoFB:"Fresita Locks",promoAddress:""
};
const DEFAULT_PRESTATIONS=[
  {id:"coiffure",nom:"Coiffure",prix:20,duree:45,desc:"Mise en forme apres reprise",cat:"Ajouts"},
  {id:"shampoing",nom:"Shampoing",prix:15,duree:20,desc:"Lavage + soin cuir chevelu",cat:"Soins"},
  {id:"soin",nom:"Soin profond",prix:25,duree:30,desc:"Masque hydratant profond",cat:"Soins"}
];
// prix = tranche(nb locks) x (1+longueur%) x (1+grosseur%)
const calcPrix=(pricing,nbLocks,zoneId,grosseurId)=>{
  if(!pricing)return 0;
  const tr=[...(pricing.tranches||[])].sort((a,b)=>a.max-b.max);
  const hit=tr.find(t=>nbLocks<=t.max);
  const base=hit?hit.prix:(tr.length?tr[tr.length-1].prix:0);
  const z=(pricing.zones||[]).find(x=>x.id===zoneId);
  const g=(pricing.grosseurs||[]).find(x=>x.id===grosseurId);
  const zc=z?1+(z.pct||0)/100:1;
  const gc=g?1+(g.pct||0)/100:1;
  return Math.round(base*zc*gc);
};

const sv=d=>{try{localStorage.setItem(SK,JSON.stringify(d))}catch(e){}};
const ld=()=>{try{const r=localStorage.getItem(SK);if(!r)return null;const d=JSON.parse(r);if(d&&d.cfg&&!d.cfg.pricing)d.cfg.pricing=JSON.parse(JSON.stringify(DEFAULT_PRICING));if(d&&d.cfg&&!d.cfg.prestations)d.cfg.prestations=JSON.parse(JSON.stringify(DEFAULT_PRESTATIONS));if(d&&d.cfg&&!d.cfg.flyers)d.cfg.flyers=[JSON.parse(JSON.stringify(DEFAULT_FLYER))];
    if(d&&d.cfg&&d.cfg.flyers)d.cfg.flyers.forEach(fl=>{if(!fl.template)fl.template="grille";if(!fl.plStyle)fl.plStyle="bars";if(!fl.plCategories){fl.plTitle="TARIFS";fl.plSubtitle="Fresita Locks";fl.plTheme="#5A2070";fl.plContact="@fresitalocks_";fl.plFooter="Reserve ton creneau en DM";fl.plCategories=JSON.parse(JSON.stringify(DEFAULT_FLYER.plCategories));}if(!fl.attn){fl.attn=DEFAULT_FLYER.attn;fl.listBadge=DEFAULT_FLYER.listBadge;fl.listFooter=DEFAULT_FLYER.listFooter;}if(!fl.promoName){fl.promoTheme=DEFAULT_FLYER.promoTheme;fl.promoName=DEFAULT_FLYER.promoName;fl.promoTagline=DEFAULT_FLYER.promoTagline;fl.promoPhoto="";fl.promoServices=JSON.parse(JSON.stringify(DEFAULT_FLYER.promoServices));fl.promoCTA=DEFAULT_FLYER.promoCTA;fl.promoPhone="";fl.promoIG=DEFAULT_FLYER.promoIG;fl.promoFB=DEFAULT_FLYER.promoFB;fl.promoAddress="";}});if(d&&!d.reservations)d.reservations=[];if(d&&d.cfg&&!d.cfg.formules)d.cfg.formules=JSON.parse(JSON.stringify(DEFAULT_FORMULES));return d}catch(e){return null}};

/* ═══ LOCATION ═══ */
const LOC={commune:"Les Abymes",map:"https://maps.google.com/?q=Les+Abymes,+Guadeloupe"};

/* ═══ PRODUCTS ═══ */
const P=[
  {id:"jojoba",n:"Huile de jojoba",b:"Generique",t:["base","sec","pellicules","gras"]},
  {id:"mango",n:"Macerat Mango Pouss",b:"Mango Butterfull",t:["base","chute","cassees","alopecie","calvitie","amincissement"]},
  {id:"avocat",n:"Huile d'avocat",b:"Generique",t:["sec","seches"]},
  {id:"nigelle",n:"Huile de nigelle",b:"Generique",t:["pellicules"]},
  {id:"noisette",n:"Huile de noisette",b:"Generique",t:["gras"]},
  {id:"ppspray",n:"Spray PurePOUSS",b:"PurePOUSS",t:["base"]},
  {id:"actspray",n:"Spray Actidetox",b:"Activilong",t:["demangeaisons","pellicules"]},
  {id:"bishp",n:"Shampooing hydratant",b:"Beaute Insolente",t:["base","sec","seches","chute","cassees"]},
  {id:"actshp",n:"Shampooing Actidetox",b:"Activilong",t:["gras","pellicules","buildup","demangeaisons"]},
  {id:"afrok",n:"Serum Romarin Gingembre",b:"Afro K",t:["demangeaisons","pellicules","chute","alopecie","calvitie"]},
  {id:"azserum",n:"Serum anti-chute",b:"Aroma-Zone",t:["alopecie","calvitie","amincissement"]},
  {id:"ppelixir",n:"Elixir Pousse",b:"PurePOUSS",t:["chute","amincissement"]},
  {id:"aloe",n:"Gel d'aloe vera",b:"Jardin",t:["demangeaisons","pellicules","sec"]},
  {id:"hibiscus",n:"Gel d'hibiscus",b:"Jardin",t:["seches","cassees","chute","alopecie","calvitie"]},
  {id:"raquette",n:"Gel de raquette",b:"Jardin",t:["sec","pellicules","demangeaisons"]},
  {id:"gombo",n:"Gel de gombo",b:"Jardin",t:["seches","base"]},
];
const PROBS=[{id:"sec",l:"Cuir chevelu sec"},{id:"gras",l:"Cuir chevelu gras"},{id:"pellicules",l:"Pellicules"},{id:"demangeaisons",l:"Demangeaisons"},{id:"chute",l:"Debut de chute"},{id:"alopecie",l:"Alopecie"},{id:"calvitie",l:"Calvitie"},{id:"seches",l:"Locks seches"},{id:"cassees",l:"Locks cassees"},{id:"buildup",l:"Residus"},{id:"amincissement",l:"Amincissement"}];
const RT={
  base:{l:"Routine de base",s:["Spray hydratant (eau OU PurePOUSS)","Huile pour sceller : Mango Pouss OU jojoba","Shampooing Beaute Insolente"]},
  sec:{l:"Cuir chevelu sec",s:["Gel raquette OU aloe pre-shampooing (15-20 min)","Spray hydratant","Shampooing Beaute Insolente","Huile d'avocat pour sceller"]},
  gras:{l:"Cuir chevelu gras",s:["Spray hydratant leger","Shampooing Actidetox","Huile de noisette (tres peu)"]},
  pellicules:{l:"Pellicules",s:["Gel raquette pre-shampooing (15-20 min)","Shampooing Actidetox","Brume OU Spray Actidetox","Huile de nigelle","Serum Afro K (1x/jour en cure)"]},
  demangeaisons:{l:"Demangeaisons",s:["Gel aloe pre-shampooing (15-20 min)","Shampooing Actidetox","Serum Afro K (1x/jour)","Spray Actidetox","Huile de jojoba"]},
  chute:{l:"Debut de chute",s:["Gel hibiscus pre-shampooing (20-30 min)","Spray PurePOUSS","Shampooing Beaute Insolente","Mango Pouss","Elixir Pousse PurePOUSS"]},
  alopecie:{l:"Alopecie",s:["Gel hibiscus pre-shampooing (20-30 min)","Spray PurePOUSS","Shampooing adapte","Serum Aroma-Zone (1x/jour)","Serum Afro K","Mango Pouss"]},
  calvitie:{l:"Calvitie",s:["Gel hibiscus pre-shampooing (20-30 min)","Spray PurePOUSS","Shampooing adapte","Serum Aroma-Zone (1x/jour)","Serum Afro K"]},
  seches:{l:"Locks seches",s:["Gel hibiscus pre-shampooing (20-30 min)","Spray PurePOUSS","Shampooing Beaute Insolente","Huile d'avocat","Rincage gel gombo"]},
  cassees:{l:"Locks cassees",s:["Gel hibiscus pre-shampooing (20-30 min)","Spray PurePOUSS","Shampooing Beaute Insolente","Mango Pouss"]},
  buildup:{l:"Residus",s:["Shampooing Actidetox uniquement"]},
  amincissement:{l:"Amincissement",s:["Gel hibiscus pre-shampooing (20-30 min)","Spray PurePOUSS","Shampooing adapte","Serum Aroma-Zone (1x/jour)","Elixir PurePOUSS","Mango Pouss"]},
};

/* ═══ SLOTS ═══ */
const MO=["Jan","Fev","Mar","Avr","Mai","Juin","Juil","Aout","Sep","Oct","Nov","Dec"];
const DAYNAMES=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const getSlots=(apts,slots)=>{const t=new Date(),o=[];for(let i=1;i<29;i++){const d2=new Date(t);d2.setDate(d2.getDate()+i);const s=slots.find(x=>x.day===d2.getDay());if(!s)continue;const ds=d2.toISOString().slice(0,10);const lb=DAYNAMES[d2.getDay()]+" "+d2.getDate()+" "+MO[d2.getMonth()];const bk=apts.filter(x=>x.date===ds);const av=s.ts.filter(t2=>!bk.some(b=>t2.startsWith(b.time?.split(":")[0])));if(av.length>0)o.push({label:lb,date:ds,times:av});}return o.slice(0,8);};
const fmtSlots=(a,s)=>{const sl=getSlots(a,s);return sl.length?sl.map(x=>x.label+" : "+x.times.join(" ou ")).join("\n"):"Contacte-moi pour mes dispos !";};
const dlICS=(title,date,time)=>{const dt=date.replace(/-/g,"");const h=(time.split(":")[0]||"09").padStart(2,"0");const m=time.split(":")[1]||"00";const eh=String(Math.min(23,parseInt(h)+2)).padStart(2,"0");const ics="BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:"+dt+"T"+h+m+"00\nDTEND:"+dt+"T"+eh+m+"00\nSUMMARY:"+title+"\nLOCATION:Les Abymes Guadeloupe\nBEGIN:VALARM\nTRIGGER:-PT24H\nACTION:DISPLAY\nDESCRIPTION:RDV demain\nEND:VALARM\nEND:VEVENT\nEND:VCALENDAR";const b=new Blob([ics],{type:"text/calendar"});const u=URL.createObjectURL(b);const a2=document.createElement("a");a2.href=u;a2.download="rdv-"+date+".ics";a2.click();URL.revokeObjectURL(u);};

/* ═══ MESSAGES ═══ */
const MSG={
  photo:n=>(n?"Coucou "+n+" !":"Bonjour !")+"\n\nPour te faire un devis personnalise, j'aurais besoin de :\n\n- Une photo ou video de tes locks de DOS\n- Une photo ou video de COTE\n- Si tu as des locks a reparer, montre-les moi et dis-moi combien il y en a\n\nJe te reponds rapidement !\n\n-- Fresita",
  devis:(n,base,ll,sty,styP,rep,repP,tot,dep,loyD)=>(n?"Coucou "+n+" !":"Bonjour !")+"\n\nTon devis Fresitalocks :\n\nRetwist (locks "+ll+") -- "+base+"EUR"+(sty?"\nCoiffure -- "+styP+"EUR":"")+(rep>0?"\nReparations ("+rep+" lock"+(rep>1?"s":"")+") -- "+repP+"EUR":"")+(loyD>0?"\nReduction fidelite -- -"+loyD+"EUR":"")+"\n\nTotal : "+tot+"EUR"+(dep>0?"\n\nAcompte "+dep+"EUR (50%) pour confirmer.\nNon remboursable (conserve prochain RDV).\nPaiement : PayPal, Sumeria, Wero ou especes.\n\nPour reserver :\n- Nom prenom\n- Telephone\n- Email\n- Acompte "+dep+"EUR\n\nDes reception = creneau reserve !":"\nOn se dit quand ?")+"\n\n-- Fresita",
  devis2:(n,lines,tot,dep,depPct)=>(n?"Coucou "+n+" !":"Bonjour !")+"\n\nTon devis Fresitalocks :\n\n"+lines.join("\n")+"\n\nTotal : "+tot+"EUR"+(dep>0?"\n\nAcompte "+dep+"EUR ("+depPct+"%) pour confirmer.\nNon remboursable (conserve prochain RDV).\nPaiement : PayPal, Sumeria, Wero ou especes.\n\nPour reserver :\n- Nom prenom\n- Telephone\n- Email\n- Acompte "+dep+"EUR\n\nDes reception = creneau reserve !":"\nOn se dit quand ?")+"\n\n-- Fresita",
  confirm:(n,date,time,price,dep,svc)=>(n?"Coucou "+n+" !":"Bonjour !")+"\n\nTon RDV Fresitalocks est confirme !\n\nDate : "+date+" a "+time+"\nPrestation : "+(svc||"Retwist")+"\nTotal : "+price+"EUR\nAcompte recu : "+dep+"EUR\nSolde jour J : "+(price-dep)+"EUR\n\nAdresse : Les Abymes, Guadeloupe\n"+LOC.map+"\n\nPrepare-toi :\n- Fais ton shampooing la veille ou le jour meme\n- Prevois 2h a 2h30\n- Diagnostic capillaire complet inclus\n- Photos avant/apres incluses\n- Routine perso + produits recommandes\n\nPas d'accompagnateurs ni d'enfants non prevus.\n+15 min retard = annulation (+20EUR maintien).\nJoignable par message/WhatsApp uniquement.\n\nA tres vite !\nFresita",
  j1:(n,t)=>(n?"Coucou "+n+" !":"Bonjour !")+"\n\nRappel : on se voit demain a "+t+" !\n\nShampooing ce soir ou demain matin.\n+15 min = annulation.\nPas d'accompagnateurs non prevus.\n\nAdresse : Les Abymes\n"+LOC.map+"\n\nA demain !\n-- Fresita",
  retwist:(n,f,s)=>(n?"Hey "+n+" !":"Bonjour !")+"\n\nCa fait "+f+" semaines, c'est le moment !\n\nMes dispos :\n"+s+"\n\nTu veux quel creneau ?\n-- Fresita",
  routine:(n,r,prods,f)=>(n?"Coucou "+n+" !":"Bonjour !")+"\n\nMerci pour ta visite !\n\nTa routine :\n"+r.s.map((s,i)=>(i+1)+". "+s).join("\n")+"\n\nProchain retwist dans "+f+" semaines.\n\nProduits :\n"+prods.map(p=>"- "+p.n+" ("+p.b+")").join("\n")+"\n\nJamais lait/beurre/gel sur locks !\n-- Fresita",
  j3:n=>(n?"Coucou "+n+" !":"Bonjour !")+"\n\nComment vont tes locks ? La routine se passe bien ?\n\n-- Fresita",
  avis:n=>(n?"Coucou "+n+" !":"Bonjour !")+"\n\nTon avis me ferait plaisir !\n- Note 1 a 5\n- Un petit mot\n\nMerci !\n-- Fresita",
  birthday:n=>"Joyeux anniversaire "+(n||"")+" !\n\n-10EUR sur ta prochaine prestation ce mois-ci !\n\n-- Fresita",
  nego:"Merci !\n\nMes tarifs = temps + produits naturels + expertise.\nNon negociables.\n\nEn echange :\n- Diagnostic perso\n- Routine adaptee\n- Suivi photo\n- Fidelite (-15EUR au 5e)\n\nBien plus qu'un retwist !\n-- Fresita",
};

const FAQ=[
  {q:"Tarifs ?",a:"Courts 70EUR / Moyens 80EUR / Longs 90EUR\nCoiffure +20EUR\nReparations 6EUR/lock (reduit des 11, max 100EUR)"},
  {q:"Comment reserver ?",a:"1. Photo locks (dos+cote)\n2. Devis\n3. Infos + acompte 50%\n4. Confirme !"},
  {q:"Paiement ?",a:"PayPal, Sumeria, Wero ou especes"},
  {q:"Acompte ?",a:"50% pour confirmer. Non remboursable (conserve prochain RDV)"},
  {q:"Annulation ?",a:"Acompte conserve prochain RDV.\n+15 min = annulation (+20EUR maintien)"},
  {q:"Duree ?",a:"Courts ~2h / Moyens ~2h30 / Longs ~3h\n+coiffure +30min-1h"},
  {q:"Frequence ?",a:"4 sem (plupart) / 6-8 sem / 2-3 mois"},
  {q:"Produits ?",a:"Mango Butterfull, PurePOUSS, Beaute Insolente, Actidetox, Afro K, Aroma-Zone, jojoba + soins jardin\nJamais lait/beurre/gel !"},
];

/* ═══ DEFAULT DATA ═══ */
const DEF={
  clients:[
    {id:"c1",n:"Anais M.",ph:"+590690123456",em:"",cr:"2026-01-10",bday:"",vis:4,vip:true,tr:true,rf:4,ref:null,photos:[{d:"2026-03-15"}],diag:[{d:"2026-03-15",lt:"Medium",lk:"Fine",ls:4,pr:["sec"],fr:4,no:"OK"}],loy:4,rev:[{d:"2026-03-16",st:5,tx:"Au top ! Mes locks sont magnifiques"}]},
    {id:"c2",n:"Kevin D.",ph:"+590690987654",em:"",cr:"2026-03-01",bday:"",vis:1,vip:false,tr:false,rf:6,ref:"c1",photos:[],diag:[],loy:1,rev:[]},
    {id:"c3",n:"Stephanie L.",ph:"+590691111111",em:"",cr:"2025-11-15",bday:"03-15",vis:6,vip:true,tr:true,rf:4,ref:null,photos:[{d:"2026-03-22"}],diag:[{d:"2026-03-22",lt:"Long",lk:"Epaisse",ls:3,pr:["demangeaisons","seches"],fr:4,no:"Amelioration"}],loy:6,rev:[{d:"2026-02-21",st:5,tx:"Mes demangeaisons ont diminue !"}]},
  ],
  apts:[
    {id:"a1",cid:"c2",date:"2026-04-05",time:"09:00",svc:"Retwist moyen",pr:80,dep:40,dpd:true,dm:"PayPal",pd:false},
    {id:"a2",cid:"c1",date:"2026-04-12",time:"09:00",svc:"Retwist moyen+coiffure",pr:100,dep:50,dpd:true,dm:"Wero",pd:false},
    {id:"a3",cid:"c3",date:"2026-04-12",time:"13:00",svc:"Retwist long",pr:90,dep:0,dpd:true,dm:"Confiance",pd:false},
  ],
  slots:[{day:6,lb:"Sam",ts:["9h-11h30","13h-15h30"]},{day:3,lb:"Mer",ts:["14h-16h30"]}],
  cfg:{short:70,med:80,lng:90,sty:20,rpl:6,rpd:5,rpc:100,depPct:50,loyTh:5,loyDis:15,refDis:10,pricing:DEFAULT_PRICING,prestations:DEFAULT_PRESTATIONS,flyers:[DEFAULT_FLYER],formules:DEFAULT_FORMULES},
  flow:{step:1,fn:"",len:"med",sty:false,rep:0,mode:"reprise",nbLocks:30,zoneId:"",grosseurId:"",formuleId:"",formuleLi:0,prestSel:[],cName:"",cPhone:"",cMail:"",date:"",time:"09:00",exId:null,svc:"",tot:0,dep:0},
  reservations:[],
};

export {SK, sv, ld, LOC, P, PROBS, RT, MO, DAYNAMES, getSlots, fmtSlots, dlICS, MSG, FAQ, DEF, calcPrix, DEFAULT_PRICING, DEFAULT_FLYER};
