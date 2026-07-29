import React, {useState, useEffect, useRef} from 'react';
import {SK, sv, ld, LOC, P, PROBS, RT, MO, DAYNAMES, getSlots, fmtSlots, dlICS, MSG, FAQ, DEF, calcPrix} from './data.js';
import FlyerP from './components/Flyer.jsx';

function App(){
  const[d,setD]=useState(()=>ld()||DEF);
  const[pg,setPg]=useState("splash");
  const[sel,setSel]=useState(null);
  const[ct,setCt]=useState("info");
  const[more,setMore]=useState(false);
  const[toast,setToast]=useState("");

  useEffect(()=>{sv(d)},[d]);
  useEffect(()=>{const t=setTimeout(()=>setPg("home"),2000);return()=>clearTimeout(t)},[]);
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(""),3000);return()=>clearTimeout(t)}},[toast]);

  const go=p=>{setPg(p);setSel(null);setCt("info");setMore(false);if(p!=="flow")setD(prev=>({...prev,flow:DEF.flow}))};
  const wa=(m,ph)=>{const u=ph?"https://wa.me/"+ph.replace(/\+/g,"")+"?text="+encodeURIComponent(m):"https://wa.me/?text="+encodeURIComponent(m);window.open(u,"_blank")};
  const cp=t=>{const ta=document.createElement("textarea");ta.value=t;ta.style.cssText="position:fixed;left:-9999px";document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);setToast("Copie !")};
  const upd=fn=>setD(p=>{const n=JSON.parse(JSON.stringify(p));fn(n);return n});
  const setFlow=u=>setD(p=>({...p,flow:{...p.flow,...u}}));
  const f=d.flow;

  const rtAlerts=(()=>{const now=new Date();return d.clients.filter(c=>{if(!c.vis)return false;const la=d.apts.filter(a=>a.cid===c.id&&a.pd).sort((a,b)=>b.date.localeCompare(a.date))[0];if(!la)return false;return Math.floor((now-new Date(la.date))/(7*24*60*60*1000))>=c.rf-1})})();
  const bdAlerts=(()=>{const now=new Date();const md=String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");return d.clients.filter(c=>c.bday===md)})();

  const exportData=()=>{const b=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="fresitalocks-backup.json";a.click();URL.revokeObjectURL(u);setToast("Donnees exportees !")};

  /* ═══ SPLASH ═══ */
  if(pg==="splash")return(<div className="app" style={{alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#FBF7F2,#F0E8F8)"}}>
    <div style={{textAlign:"center",animation:"fadeIn 1s ease"}}>
      <div style={{fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:700,color:"#5A2070",marginBottom:8}}>Fresitalocks</div>
      <div style={{fontSize:11,letterSpacing:4,textTransform:"uppercase",color:"#7B3FA0",opacity:.5}}>Locktician</div>
    </div>
  </div>);

  /* ═══ RENDER ═══ */
  const ctx={d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData};
  return(<div className="app">
    {toast&&<div className="toast">{toast}</div>}

    {pg==="home"&&<Home {...ctx}/>}
    {pg==="flow"&&<FlowP {...ctx}/>}
    {pg==="jourj"&&<JourJP {...ctx}/>}
    {pg==="agenda"&&<AgendaP {...ctx}/>}
    {pg==="clients"&&(sel?<ClientDetP {...ctx}/>:<ClientsP {...ctx}/>)}
    {pg==="diagnostic"&&<DiagP {...ctx}/>}
    {pg==="quote"&&<QuoteP {...ctx}/>}
    {pg==="payments"&&<PayP {...ctx}/>}
    {pg==="loyalty"&&<LoyP {...ctx}/>}
    {pg==="messages"&&<MsgP {...ctx}/>}
    {pg==="story"&&<StoryP {...ctx}/>}
    {pg==="reviews"&&<RevP {...ctx}/>}
    {pg==="stats"&&<StatsP {...ctx}/>}
    {pg==="faq"&&<FaqP {...ctx}/>}
    {pg==="settings"&&<SetP {...ctx}/>}
    {pg==="flyer"&&<FlyerP {...ctx}/>}
    {pg==="rdvclient"&&<RdvClientP {...ctx}/>}

    {/* Bottom Nav */}
    {pg!=="splash"&&<><div className="bnav">
      <button className="bn-i" onClick={()=>go("home")}><span className={`bn-ic ${pg==="home"?"on":""}`}>🏠</span><span className={`bn-lb ${pg==="home"?"on":""}`}>Accueil</span></button>
      <button className="bn-i" onClick={()=>go("agenda")}><span className={`bn-ic ${pg==="agenda"?"on":""}`}>📅</span><span className={`bn-lb ${pg==="agenda"?"on":""}`}>Agenda</span></button>
      <div style={{width:54}}/>
      <button className="bn-i" onClick={()=>go("clients")}><span className={`bn-ic ${pg==="clients"?"on":""}`}>👤</span><span className={`bn-lb ${pg==="clients"?"on":""}`}>Clientes</span></button>
      <button className="bn-i" onClick={()=>setMore(true)}><span className="bn-ic">⋯</span><span className="bn-lb">Plus</span></button>
    </div>
    <div className="bn-ctr" onClick={()=>go("flow")}><span>+</span></div></>}

    {/* More sheet */}
    {more&&<div className="more-overlay" onClick={()=>setMore(false)}><div className="more-sheet" onClick={e=>e.stopPropagation()}>
      <div style={{width:40,height:4,background:"#D4B8E8",borderRadius:2,margin:"0 auto 16px"}}/>
      {[["Jour J","jourj"],["Devis","quote"],["Messages","messages"],["Diagnostic","diagnostic"],["Paiements","payments"],["Fidelite","loyalty"],["Story","story"],["Avis","reviews"],["Statistiques","stats"],["FAQ","faq"],["Flyer","flyer"],["RDV client","rdvclient"],["Reglages","settings"]].map(([l,p])=>
        <div key={p} className="more-item" onClick={()=>go(p)}>{l}</div>
      )}
    </div></div>}
  </div>);
}


/* ═══ PAGES (hors App : identite stable => focus preserve) ═══ */

  const RdvClientP=({d,upd,go})=>{
    const R=d.reservations||[];
    const cyc={attente:"confirme",confirme:"paye",paye:"attente"};
    const lbl={attente:"En attente",confirme:"Confirme",paye:"Paye"};
    const col={attente:"#C08A20",confirme:"#5A2070",paye:"#3F6B32"};
    return(<div className="pg fade">
      <div className="hdr hdr-sm" style={{display:"flex",alignItems:"center",gap:10}}><span onClick={()=>go("home")} style={{cursor:"pointer",fontSize:22,opacity:.85}}>&lsaquo;</span><h1 style={{margin:0}}>RDV client</h1></div>
      <div style={{padding:16}}>
        {R.length===0&&<p style={{color:"#A09080",fontSize:13,textAlign:"center",marginTop:20}}>Aucune reservation. Depuis Plus &gt; Flyer, tape une pastille dispo pour reserver.</p>}
        {R.map((r,ri)=>(
          <div key={r.id} className="card" style={{margin:"0 0 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <b>{r.prenom} {r.nom}</b>
              <span onClick={()=>upd(x=>{x.reservations[ri].status=cyc[x.reservations[ri].status]||"confirme";})} className="badge-s" style={{background:col[r.status]+"22",color:col[r.status],cursor:"pointer"}}>{lbl[r.status]||r.status}</span>
            </div>
            <div style={{fontSize:12,color:"#504030",margin:"4px 0"}}>{r.dayLabel||r.date} &middot; {r.slot} &middot; {r.prestation||"-"}</div>
            <div style={{fontSize:11,color:"#7A6488"}}>{r.tel} &middot; {r.email}</div>
            {r.note&&<div style={{fontSize:11,color:"#7A6488",marginTop:4,fontStyle:"italic"}}>{r.note}</div>}
            <div className="fg" style={{margin:"8px 0 0"}}><span className="fl">Lien d'acompte</span><input className="fi" value={r.depositLink||""} onChange={e=>upd(x=>{x.reservations[ri].depositLink=e.target.value;})} placeholder="https://..."/></div>
            <button className="btn btn-d sm" style={{marginTop:8}} onClick={()=>upd(x=>{x.reservations.splice(ri,1);})}>Supprimer la reservation</button>
          </div>))}
      </div>
    </div>);
  }
  const Home=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{
    const ca=d.apts.filter(a=>a.pd).reduce((s,a)=>s+a.pr,0);const pend=d.apts.filter(a=>!a.pd).reduce((s,a)=>s+a.pr,0);
    const pct=Math.min(ca/3000*100,100);const circ=Math.PI*2*52;const off=circ-(circ*pct/100);
    return(<div className="pg fade">
      <div className="hdr">
        <h1 style={{fontFamily:"'Fraunces',serif"}}>Bonjour Fresita</h1>
        <p>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
      </div>
      <div className="search"><span style={{opacity:.4}}>O</span><input placeholder="Rechercher une cliente..." onFocus={()=>go("clients")}/></div>

      {bdAlerts.map(c=><div key={c.id} className="card" style={{background:"#F8E8F0",border:"1px solid rgba(200,80,120,.15)",cursor:"pointer"}} onClick={()=>wa(MSG.birthday(c.n.split(" ")[0]),c.ph)}>Anniversaire de <b>{c.n}</b> !</div>)}
      {rtAlerts.length>0&&<div className="card" style={{background:"#F8F0E8",border:"1px solid rgba(184,144,48,.15)",cursor:"pointer"}} onClick={()=>go("clients")}><b>{rtAlerts.length}</b> cliente{rtAlerts.length>1?"s":""} due{rtAlerts.length>1?"s":""} pour retwist</div>}

      <div className="ca-wrap">
        <div className="ca-circle">
          <svg viewBox="0 0 120 120"><circle className="ca-bg" cx="60" cy="60" r="52"/><circle className="ca-fg" cx="60" cy="60" r="52" strokeDasharray={circ} strokeDashoffset={off}/></svg>
          <div className="ca-v">{ca}EUR</div>
          <div className="ca-l">Encaisse</div>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><b>{pend}EUR</b><span>A venir</span></div>
        <div className="stat"><b>{d.clients.length}</b><span>Clientes</span></div>
        <div className="stat"><b>{d.clients.flatMap(c=>c.rev).length}</b><span>Avis</span></div>
      </div>

      <div className="icons">
        {[["Jour J","jourj"],["Agenda","agenda"],["Devis","quote"],["Fidelite","loyalty"],["Messages","messages"],["Diagnostic","diagnostic"],["Paiements","payments"],["Avis","reviews"]].map(([l,p])=>
          <button key={p} className="icon-btn" onClick={()=>go(p)}>
            <div className="ic-circle">{{"jourj":"*","agenda":"#","quote":"$","loyalty":"!","messages":"\"","diagnostic":"+","payments":"=","reviews":"*"}[p]}</div>
            <label>{l}</label>
          </button>
        )}
      </div>

      <div className="sec">Prochains RDV</div>
      <div className="rdv">{d.apts.filter(a=>!a.pd).sort((a,b)=>a.date.localeCompare(b.date)).map(a=>{const c=d.clients.find(x=>x.id===a.cid);return(
        <div key={a.id} className="rdv-c" onClick={()=>go("jourj")}>
          <div className="av">{c?.n.charAt(0)}</div>
          <div className="rdv-i"><div className="rdv-n">{c?.n}</div><div className="rdv-d">{a.date} {a.time} - {a.svc}</div></div>
          <div style={{textAlign:"right"}}><div className="rdv-p">{a.pr}EUR</div><div className="badge-s">Confirme</div></div>
        </div>)})}</div>
    </div>);
  };

  /* ═══ FLOW ═══ */
  const FlowP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{
    const ec=f.exId?d.clients.find(c=>c.id===f.exId):null;
    const loyE=ec&&ec.loy>=d.cfg.loyTh&&ec.loy%d.cfg.loyTh===0;const loyD=loyE?d.cfg.loyDis:0;
    const pr=d.cfg; const P=pr.pricing; const FORMS=pr.formules||[]; const PREST=pr.prestations||[]; const mode=f.mode||"reprise";
    const nb=(f.nbLocks===""||f.nbLocks==null)?"":f.nbLocks;
    const zid=f.zoneId||(P&&P.zones[0]?P.zones[0].id:""); const gid=f.grosseurId||(P&&P.grosseurs[0]?P.grosseurs[0].id:"");
    const fo=FORMS.find(x=>x.id===f.formuleId)||FORMS[0]; const li=fo?Math.min(f.formuleLi||0,fo.lengths.length-1):0;
    let base=0, baseLabel="";
    if(mode==="formule"){const ln=fo&&fo.lengths[li];base=ln?ln.prix:0;baseLabel=fo?(fo.title+(ln?" ("+ln.label+")":"")):"Formule";}
    else{base=calcPrix(P,(parseInt(nb)||0),zid,gid);const z=P&&P.zones.find(x=>x.id===zid);const g=P&&P.grosseurs.find(x=>x.id===gid);baseLabel="Reprise "+(parseInt(nb)||0)+" locks"+(z?" "+z.label:"")+(g?" "+g.label:"");}
    const prestSel=f.prestSel||[]; const presList=PREST.filter(p=>prestSel.includes(p.id)); const presTot=presList.reduce((s,p)=>s+(p.prix||0),0);
    const tot=Math.max(0,base+presTot-loyD);const dep=ec?.tr?0:Math.round(tot*pr.depPct/100);
    const dn=ec?ec.n.split(" ")[0]:"";
    const matches=f.fn.length>=2?d.clients.filter(c=>c.n.toLowerCase().includes(f.fn.toLowerCase())):[];
    const titles=["Demande photo","Devis","Infos + Acompte","Confirmation"];
    const dmLines=[baseLabel+" -- "+base+"EUR",...presList.map(p=>p.nom+" -- "+p.prix+"EUR"),...(loyD>0?["Reduction fidelite -- -"+loyD+"EUR"]:[])];
    const dmsg=MSG.devis2(dn,dmLines,tot,dep,pr.depPct);
    const svc=baseLabel+(presList.length?" + "+presList.map(p=>p.nom).join(", "):"");

    return(<div className="pg fade">
      <div className="hdr hdr-sm" style={{textAlign:"center"}}>
        <div className="hdr-back" onClick={()=>go("home")}>Retour</div>
        <h1 style={{fontSize:18}}>{titles[f.step-1]||"Termine"}</h1>
        <div className="stepper">
          {[1,2,3,4].map(i=><React.Fragment key={i}>
            {i>1&&<div className={`st-line ${f.step>=i?"st-line-d":"st-line-f"}`}/>}
            <div className={`st-dot ${f.step>i?"st-done":f.step===i?"st-cur":"st-fut"}`}>{f.step>i?"v":i}</div>
          </React.Fragment>)}
        </div>
      </div>

      <div style={{padding:20}}>
        {f.step===1&&<div className="card" style={{margin:0}}>
          <div className="fg"><span className="fl">Client existant ?</span><input className="fi" value={f.fn} onChange={e=>setFlow({fn:e.target.value,exId:null})} placeholder="Rechercher..."/></div>
          {matches.length>0&&<div style={{marginBottom:12}}>{matches.map(c=><div key={c.id} style={{padding:"8px 12px",background:"#F8F4FC",borderRadius:12,marginBottom:4,cursor:"pointer",fontSize:12}} onClick={()=>setFlow({fn:c.n.split(" ")[0],exId:c.id,cName:c.n,cPhone:c.ph})}><b>{c.n}</b> ({c.vis} vis.)</div>)}</div>}
          <div className="wa-box"><div className="wa-msg">{MSG.photo(dn)}</div></div>
          <div style={{display:"flex",gap:8,marginTop:14}}><button className="btn btn-w sm" style={{flex:1}} onClick={()=>wa(MSG.photo(dn),ec?.ph)}>WhatsApp</button><button className="btn btn-s sm" style={{flex:1}} onClick={()=>cp(MSG.photo(dn))}>Copier</button></div>
          <button className="btn btn-p full" style={{marginTop:12}} onClick={()=>setFlow({step:2})}>Photo recue &rarr;</button>
        </div>}

        {f.step===2&&<div className="card" style={{margin:0}}>
          <div className="fg"><span className="fl">Base du prix</span><div style={{display:"flex",gap:6,marginTop:4}}><button className={`btn sm ${mode==="reprise"?"btn-p":"btn-s"}`} onClick={()=>setFlow({mode:"reprise"})}>Reprise (locks)</button><button className={`btn sm ${mode==="formule"?"btn-p":"btn-s"}`} onClick={()=>setFlow({mode:"formule"})}>Formule</button></div></div>
          {mode==="reprise"?<>
            <div className="fg"><span className="fl">Nb de locks</span><input className="fi" type="number" value={nb} onChange={e=>setFlow({nbLocks:e.target.value===""?"":parseInt(e.target.value)||0})}/></div>
            <div className="fr"><div className="fg"><span className="fl">Longueur (zone)</span><select className="fi" value={zid} onChange={e=>setFlow({zoneId:e.target.value})}>{(P?P.zones:[]).map(z=><option key={z.id} value={z.id}>{z.label}</option>)}</select></div>
            <div className="fg"><span className="fl">Grosseur</span><select className="fi" value={gid} onChange={e=>setFlow({grosseurId:e.target.value})}>{(P?P.grosseurs:[]).map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></div></div>
          </>:<>
            <div className="fg"><span className="fl">Formule</span><select className="fi" value={fo?fo.id:""} onChange={e=>setFlow({formuleId:e.target.value,formuleLi:0})}>{FORMS.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></div>
            <div className="fg"><span className="fl">Longueur</span><select className="fi" value={li} onChange={e=>setFlow({formuleLi:parseInt(e.target.value)})}>{(fo?fo.lengths:[]).map((l,i)=><option key={i} value={i}>{l.label} - {l.prix}EUR</option>)}</select></div>
          </>}
          <div className="fg"><span className="fl">Prestations en plus</span><div style={{marginTop:4}}>{PREST.map(p=><label key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",fontSize:13}}><input type="checkbox" checked={prestSel.includes(p.id)} onChange={e=>setFlow({prestSel:e.target.checked?[...prestSel,p.id]:prestSel.filter(x=>x!==p.id)})}/>{p.nom}<span style={{color:"#7A6488",marginLeft:"auto"}}>+{p.prix}EUR</span></label>)}{PREST.length===0&&<div style={{fontSize:11,color:"#A09080"}}>Aucune (ajoute-les dans Reglages)</div>}</div></div>
          {loyD>0&&<div style={{padding:10,background:"#F0E4FA",borderRadius:12,margin:"8px 0",fontSize:12}}>Fidelite : -{loyD}EUR</div>}
          <div style={{background:"linear-gradient(135deg,#5A2070,#9B60C0)",borderRadius:18,padding:18,color:"#fff",textAlign:"center",margin:"12px 0"}}><div style={{fontSize:10,opacity:.7,letterSpacing:1,textTransform:"uppercase"}}>Total</div><div style={{fontFamily:"'Fraunces',serif",fontSize:36,fontWeight:700}}>{tot}EUR</div>{dep>0&&<div style={{fontSize:11,opacity:.8,marginTop:4}}>Acompte {dep}EUR</div>}</div>
          <div className="wa-box"><div className="wa-msg">{dmsg}</div></div>
          <div style={{display:"flex",gap:8,marginTop:14}}><button className="btn btn-w sm" style={{flex:1}} onClick={()=>wa(dmsg,ec?.ph)}>WhatsApp</button><button className="btn btn-s sm" style={{flex:1}} onClick={()=>cp(dmsg)}>Copier</button></div>
          <button className="btn btn-p full" style={{marginTop:12}} onClick={()=>setFlow({step:3})}>Accepte &rarr;</button>
        </div>}

        {f.step===3&&<div className="card" style={{margin:0}}>
          {!ec&&<><div className="fr"><div className="fg"><span className="fl">Nom complet</span><input className="fi" value={f.cName} onChange={e=>setFlow({cName:e.target.value})}/></div><div className="fg"><span className="fl">Telephone</span><input className="fi" value={f.cPhone} onChange={e=>setFlow({cPhone:e.target.value})}/></div></div>
          <div className="fg"><span className="fl">Email</span><input className="fi" value={f.cMail} onChange={e=>setFlow({cMail:e.target.value})}/></div></>}
          {ec&&<div style={{padding:10,background:"#F0E4FA",borderRadius:12,marginBottom:12,fontSize:12}}>{ec.n} - {ec.ph}</div>}
          <div className="fr"><div className="fg"><span className="fl">Date RDV</span><input className="fi" type="date" value={f.date} onChange={e=>setFlow({date:e.target.value})}/></div><div className="fg"><span className="fl">Heure</span><input className="fi" type="time" value={f.time} onChange={e=>setFlow({time:e.target.value})}/></div></div>
          <button className="btn btn-p full" onClick={()=>{setFlow({step:4,svc,tot,dep});upd(x=>{let cid=f.exId;if(!cid){cid="c"+Date.now();x.clients.push({id:cid,n:f.cName||f.fn,ph:f.cPhone,em:f.cMail,cr:new Date().toISOString().slice(0,10),bday:"",vis:0,vip:false,tr:false,rf:4,ref:null,photos:[],diag:[],loy:0,rev:[]});}x.apts.push({id:"a"+Date.now(),cid,date:f.date,time:f.time,svc,pr:tot,dep,dpd:true,dm:"",pd:false});x.flow.step=4;x.flow.svc=svc;x.flow.tot=tot;x.flow.dep=dep})}}>Creer RDV &rarr;</button>
        </div>}

        {f.step===4&&<div className="card" style={{margin:0}}>
          <div className="wa-box"><div className="wa-msg">{MSG.confirm(f.cName?.split(" ")[0]||f.fn||ec?.n.split(" ")[0]||"",f.date,f.time,f.tot||tot,f.dep||dep,f.svc)}</div></div>
          <div style={{display:"flex",gap:8,marginTop:14}}><button className="btn btn-w" style={{flex:1}} onClick={()=>wa(MSG.confirm(f.cName?.split(" ")[0]||f.fn||"",f.date,f.time,f.tot||tot,f.dep||dep,f.svc),f.cPhone||ec?.ph)}>WhatsApp</button><button className="btn btn-s" style={{flex:1}} onClick={()=>cp(MSG.confirm(f.cName?.split(" ")[0]||f.fn||"",f.date,f.time,f.tot||tot,f.dep||dep,f.svc))}>Copier</button></div>
          <button className="btn btn-g full" style={{marginTop:8}} onClick={()=>dlICS("Fresitalocks "+(f.cName||f.fn),f.date,f.time)}>Calendrier</button>
          <button className="btn btn-p full" style={{marginTop:8}} onClick={()=>setFlow({step:5})}>Envoye !</button>
        </div>}

        {f.step>=5&&<div style={{textAlign:"center",padding:30}}><div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700,color:"#5A2070"}}>RDV confirme !</div><button className="btn btn-p" style={{marginTop:16}} onClick={()=>go("home")}>Accueil</button></div>}
      </div>
    </div>);
  };

  /* ═══ JOUR J ═══ */
  const JourJP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{
    const[sa,setSa]=useState(null);const[os,setOs]=useState(0);const[dn2,setDn2]=useState([]);
    const[jp,setJp]=useState([]);const[jls,setJls]=useState(3);const[jfr,setJfr]=useState(4);const[jno,setJno]=useState("");const[jlt,setJlt]=useState("Medium");
    const[pm,setPm]=useState("Especes");const[ch,setCh]=useState(0);const[run,setRun]=useState(false);const tr=useRef(null);
    useEffect(()=>{if(run)tr.current=setInterval(()=>setCh(c=>c+1),1000);else clearInterval(tr.current);return()=>clearInterval(tr.current)},[run]);
    const fc=s=>Math.floor(s/60).toString().padStart(2,"0")+":"+String(s%60).padStart(2,"0");
    const apt=sa?d.apts.find(a=>a.id===sa):null;const cl=apt?d.clients.find(c=>c.id===apt.cid):null;
    const md=i=>{if(!dn2.includes(i))setDn2([...dn2,i]);setOs(i+1)};
    const prob=jp[0]||"base";const rt=RT[prob]||RT.base;const rp=P.filter(p=>jp.some(pr=>p.t.includes(pr)));

    if(!apt)return(<div className="pg fade">
      <div className="hdr hdr-sm"><h1>Jour J</h1></div>
      <div style={{padding:20}}>{d.apts.filter(a=>!a.pd).sort((a,b)=>a.date.localeCompare(b.date)).map(a=>{const c=d.clients.find(x=>x.id===a.cid);return(
        <div key={a.id} className="rdv-c" onClick={()=>{setSa(a.id);setOs(0);setDn2([]);setCh(0);setRun(false);setJp([]);setJfr(c?.rf||4)}}>
          <div className="av">{c?.n.charAt(0)}</div><div className="rdv-i"><div className="rdv-n">{c?.n}</div><div className="rdv-d">{a.date} {a.time} - {a.svc}</div></div>
          <button className="btn btn-p sm">Go</button>
        </div>)})}{d.apts.filter(a=>!a.pd).length===0&&<div style={{textAlign:"center",padding:30,color:"#A09080"}}>Aucun RDV</div>}</div>
    </div>);

    const steps=["Photos avant","Diagnostic","Prestation","Photos apres","Paiement","Routine"];
    return(<div className="pg fade">
      <div className="hdr hdr-sm"><div className="hdr-back" onClick={()=>{setSa(null);setRun(false)}}>Retour</div><h1 style={{fontSize:18}}>{cl?.n}</h1><p>{apt.svc} - {apt.pr}EUR</p></div>
      <div className="jj-bar"><div className="jj-bg"><div className="jj-fg" style={{width:(dn2.length/6*100)+"%"}}/></div><div className="jj-labels">{steps.map((s,i)=><span key={i} style={dn2.includes(i)?{color:"#5A2070",fontWeight:600}:{}}>{i+1}</span>)}</div></div>

      <div style={{padding:"0 20px"}}>
        {/* Step content based on os */}
        {os===0&&<div className="card" style={{margin:"8px 0"}}><b>Photos AVANT</b><p style={{fontSize:12,color:"#A09080",margin:"6px 0"}}>Dos + Cote + Cuir chevelu</p><button className="btn btn-p full" onClick={()=>md(0)}>Suivant</button></div>}
        {os===1&&<div className="card" style={{margin:"8px 0"}}><b>Diagnostic</b>
          <div className="fr" style={{margin:"10px 0"}}><div className="fg"><span className="fl">Type</span><select className="fi" value={jlt} onChange={e=>setJlt(e.target.value)}><option>Court</option><option>Medium</option><option>Long</option></select></div><div className="fg"><span className="fl">Freq</span><select className="fi" value={jfr} onChange={e=>setJfr(+e.target.value)}>{[3,4,5,6,8,10,12].map(f2=><option key={f2} value={f2}>{f2} sem</option>)}</select></div></div>
          <div className="fg"><span className="fl">Etat locks</span><div style={{display:"flex",gap:4}}>{[1,2,3,4,5].map(i=><span key={i} onClick={()=>setJls(i)} style={{fontSize:22,cursor:"pointer",color:i<=jls?"#B89030":"#EDE8F4"}}>*</span>)}</div></div>
          <div className="fg"><span className="fl">Problemes</span>{PROBS.map(p=><div key={p.id} className={`diag-btn ${jp.includes(p.id)?"sel":""}`} onClick={()=>setJp(pr=>pr.includes(p.id)?pr.filter(x=>x!==p.id):[...pr,p.id])}><span style={{flex:1}}>{p.l}</span>{jp.includes(p.id)&&<b style={{color:"#5A2070"}}>X</b>}</div>)}</div>
          <button className="btn btn-p full" onClick={()=>{if(cl)upd(x=>{const c=x.clients.find(c2=>c2.id===cl.id);if(c){c.diag.push({d:new Date().toISOString().slice(0,10),lt:jlt,lk:"",ls:jls,pr:jp.length?jp:["base"],fr:jfr,no:jno});c.rf=jfr}});md(1);setRun(true)}}>Lancer prestation</button>
        </div>}
        {os===2&&<div className="card" style={{margin:"8px 0",textAlign:"center"}}>
          <div className="chrono-ring"><svg viewBox="0 0 140 140" style={{position:"absolute",inset:0}}><circle cx="70" cy="70" r="60" fill="none" stroke="#EDE8F4" strokeWidth="6"/><circle cx="70" cy="70" r="60" fill="none" stroke="#7B3FA0" strokeWidth="6" strokeLinecap="round" strokeDasharray="377" strokeDashoffset={377-Math.min(377,ch/120*377)} style={{transform:"rotate(-90deg)",transformOrigin:"center"}}/></svg><div className="chrono-v">{fc(ch)}</div></div>
          <div className="chrono-l">{run?"En cours...":"Pause"}</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:14}}><button className={`btn ${run?"btn-s":"btn-p"} sm`} onClick={()=>setRun(!run)}>{run?"Pause":"Reprendre"}</button><button className="btn btn-g sm" onClick={()=>{setRun(false);md(2)}}>Terminee</button></div>
        </div>}
        {os===3&&<div className="card" style={{margin:"8px 0"}}><b>Photos APRES</b><p style={{fontSize:12,color:"#A09080",margin:"6px 0"}}>Dos + Cote + Face</p><button className="btn btn-p full" onClick={()=>{if(cl)upd(x=>{const c=x.clients.find(c2=>c2.id===cl.id);if(c)c.photos.push({d:new Date().toISOString().slice(0,10)})});md(3)}}>Suivant</button></div>}
        {os===4&&<div className="card" style={{margin:"8px 0"}}><b>Paiement</b>
          <div style={{padding:12,background:"#F8F4FC",borderRadius:14,margin:"10px 0"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:14}}>Total <b>{apt.pr}EUR</b></div><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#508040"}}>Acompte <span>-{apt.dep}EUR</span></div><div style={{borderTop:"2px solid #EDE8F4",marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:700,color:"#5A2070"}}>Solde <span>{apt.pr-apt.dep}EUR</span></div></div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{["Especes","PayPal","Sumeria","Wero"].map(m=><button key={m} className={`btn sm ${pm===m?"btn-p":"btn-s"}`} onClick={()=>setPm(m)}>{m}</button>)}</div>
          <button className="btn btn-g full" onClick={()=>{upd(x=>{const a=x.apts.find(a2=>a2.id===apt.id);if(a){a.pd=true;a.dm=pm}const c=x.clients.find(c2=>c2.id===apt.cid);if(c){c.vis+=1;c.loy+=1}});md(4)}}>{apt.pr-apt.dep}EUR encaisse</button>
        </div>}
        {os===5&&<div className="card" style={{margin:"8px 0"}}><b>Routine + Produits</b>
          <div style={{padding:10,background:"#F8F4FC",borderRadius:12,margin:"8px 0"}}><b style={{fontSize:12,color:"#5A2070"}}>{rt.l}</b>{rt.s.map((s,i)=><div key={i} style={{fontSize:12,padding:"3px 0"}}>{i+1}. {s}</div>)}</div>
          {rp.length>0&&<div style={{padding:8,background:"#E8F4E0",borderRadius:12,marginBottom:8}}><b style={{fontSize:10,color:"#508040"}}>Produits :</b>{rp.map(p=><div key={p.id} style={{fontSize:11}}>{p.n} ({p.b})</div>)}</div>}
          <div className="wa-box"><div className="wa-msg">{MSG.routine(cl?.n.split(" ")[0]||"",rt,rp,jfr)}</div></div>
          <div style={{display:"flex",gap:8,marginTop:10}}><button className="btn btn-w" style={{flex:1}} onClick={()=>{if(cl)wa(MSG.routine(cl.n.split(" ")[0],rt,rp,jfr),cl.ph);md(5)}}>WhatsApp</button><button className="btn btn-s" style={{flex:1}} onClick={()=>{cp(MSG.routine(cl?.n.split(" ")[0]||"",rt,rp,jfr));md(5)}}>Copier</button></div>
        </div>}
        {dn2.length>=6&&<div style={{textAlign:"center",padding:20}}><div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"#5A2070"}}>Termine ! {fc(ch)}</div>
          <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}>
            {cl&&<button className="btn btn-w sm" onClick={()=>wa(MSG.j3(cl.n.split(" ")[0]),cl.ph)}>J+3</button>}
            {cl&&<button className="btn btn-s sm" onClick={()=>wa(MSG.avis(cl.n.split(" ")[0]),cl.ph)}>Avis</button>}
            <button className="btn btn-p sm" onClick={()=>setSa(null)}>OK</button>
          </div></div>}
      </div>
    </div>);
  };

  /* ═══ CLIENTS ═══ */
  const ClientsP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{const[s,setS]=useState("");const fi2=d.clients.filter(c=>c.n.toLowerCase().includes(s.toLowerCase()));
    return(<div className="pg fade"><div className="hdr hdr-sm"><h1>Clientes</h1></div>
      <div className="search"><input placeholder="Rechercher..." value={s} onChange={e=>setS(e.target.value)} style={{width:"100%"}}/></div>
      {fi2.map(c=>{const due=rtAlerts.some(a=>a.id===c.id);return(<div key={c.id} className="rdv-c" style={{margin:"0 20px 8px"}} onClick={()=>{setSel(c.id);setCt("info")}}>
        <div className="av">{c.n.charAt(0)}</div><div className="rdv-i"><div className="rdv-n">{c.n}</div><div className="rdv-d">{c.vis} vis. / {c.rf} sem.</div></div>
        {due&&<span className="badge-s" style={{background:"#F8F0E8",color:"#B89030"}}>Retwist</span>}
        {c.vip&&<span className="badge-s" style={{background:"#F0E4FA",color:"#5A2070"}}>VIP</span>}
      </div>)})}
    </div>);
  };

  const ClientDetP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{const cl=d.clients.find(c=>c.id===sel);if(!cl)return null;
    const ld2=cl.diag[cl.diag.length-1];const prob=ld2?.pr[0]||"base";const rt=RT[prob]||RT.base;const rp=P.filter(p=>ld2?.pr.some(pr=>p.t.includes(pr)));
    const[ed,setEd]=useState(false);const[en,setEn]=useState(cl.n);const[ep,setEp]=useState(cl.ph);const[eb,setEb]=useState(cl.bday||"");
    return(<div className="pg fade">
      <div className="hdr" style={{textAlign:"center"}}><div className="hdr-back" onClick={()=>setSel(null)}>Retour</div>
        <div className="av" style={{width:60,height:60,fontSize:22,margin:"0 auto 6px",border:"3px solid #fff"}}>{cl.n.charAt(0)}</div>
        <h1 style={{fontSize:20}}>{cl.n}</h1>
        <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:6}}>{cl.vip&&<span style={{fontSize:9,background:"rgba(255,255,255,.2)",padding:"3px 10px",borderRadius:10}}>VIP</span>}{cl.tr&&<span style={{fontSize:9,background:"rgba(255,255,255,.2)",padding:"3px 10px",borderRadius:10}}>Confiance</span>}<span style={{fontSize:9,background:"rgba(255,255,255,.2)",padding:"3px 10px",borderRadius:10}}>{cl.vis} vis.</span></div>
      </div>
      <div className="c-tabs">{["Infos","Routine","Historique","Avis"].map(t=><div key={t} className={`c-tab ${ct===t.toLowerCase().slice(0,4)?"on":""}`} onClick={()=>setCt(t.toLowerCase().slice(0,4))}>{t}</div>)}</div>
      <div style={{padding:20}}>
        {ct==="info"&&<><div className="card" style={{margin:"0 0 12px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div><div className="fl">Tel</div><div>{cl.ph}</div></div><div><div className="fl">Retwist</div><div>/{cl.rf} sem.</div></div>
            <div><div className="fl">Fidelite</div><div>{cl.loy%d.cfg.loyTh}/{d.cfg.loyTh}</div></div><div><div className="fl">Anniversaire</div><div>{cl.bday||"--"}</div></div>
          </div>
        </div>
        <div className="card" style={{margin:"0 0 12px"}}><div style={{fontWeight:600,fontSize:13,color:"#5A2070",marginBottom:8}}>Carte fidelite</div>
          <div className="loy-flowers">{[1,2,3,4,5].map(i=><span key={i} className="loy-f" style={{opacity:i<=cl.loy%d.cfg.loyTh||cl.loy%d.cfg.loyTh===0&&cl.loy>=d.cfg.loyTh?1:.2}}>{i<=cl.loy%d.cfg.loyTh||cl.loy%d.cfg.loyTh===0&&cl.loy>=d.cfg.loyTh?"🌺":"🌸"}</span>)}</div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <button className="btn btn-w sm" onClick={()=>wa(MSG.retwist(cl.n.split(" ")[0],cl.rf,fmtSlots(d.apts,d.slots)),cl.ph)}>Retwist</button>
          <button className="btn btn-s sm" onClick={()=>wa(MSG.j1(cl.n.split(" ")[0],"[heure]"),cl.ph)}>J-1</button>
          <button className="btn btn-s sm" onClick={()=>wa(MSG.j3(cl.n.split(" ")[0]),cl.ph)}>J+3</button>
          <button className="btn btn-s sm" onClick={()=>wa(MSG.avis(cl.n.split(" ")[0]),cl.ph)}>Avis</button>
          <button className="btn btn-s sm" onClick={()=>setEd(!ed)}>Modifier</button>
          <button className="btn btn-d sm" onClick={()=>{upd(x=>{x.clients=x.clients.filter(c=>c.id!==cl.id);x.apts=x.apts.filter(a=>a.cid!==cl.id)});setSel(null)}}>Suppr</button>
        </div>
        {ed&&<div className="card" style={{margin:"12px 0 0"}}>
          <div className="fr"><div className="fg"><span className="fl">Nom</span><input className="fi" value={en} onChange={e=>setEn(e.target.value)}/></div><div className="fg"><span className="fl">Tel</span><input className="fi" value={ep} onChange={e=>setEp(e.target.value)}/></div></div>
          <div className="fg"><span className="fl">Anniversaire (MM-JJ)</span><input className="fi" value={eb} onChange={e=>setEb(e.target.value)} placeholder="03-15"/></div>
          <button className="btn btn-p sm" onClick={()=>{upd(x=>{const c=x.clients.find(c2=>c2.id===cl.id);if(c){c.n=en;c.ph=ep;c.bday=eb}});setEd(false);setToast("Sauvegarde !")}}>Sauver</button>
        </div>}</>}

        {ct==="rout"&&<div className="card" style={{margin:0}}><b style={{color:"#5A2070"}}>{rt.l}</b>{rt.s.map((s,i)=><div key={i} style={{fontSize:12,padding:"4px 0",borderBottom:"1px solid #EDE8F4"}}>{i+1}. {s}</div>)}{rp.length>0&&<div style={{marginTop:8}}>{rp.map(p=><div key={p.id} style={{fontSize:11}}>- {p.n} ({p.b})</div>)}</div>}<button className="btn btn-w full" style={{marginTop:10}} onClick={()=>wa(MSG.routine(cl.n.split(" ")[0],rt,rp,cl.rf),cl.ph)}>Envoyer</button></div>}

        {ct==="hist"&&<div className="card" style={{margin:0}}><b>Historique RDV</b>{d.apts.filter(a=>a.cid===cl.id).sort((a,b)=>b.date.localeCompare(a.date)).map(a=><div key={a.id} style={{padding:"8px 0",borderBottom:"1px solid #EDE8F4",fontSize:12,display:"flex",justifyContent:"space-between"}}><div><b>{a.date}</b> - {a.svc}</div><div>{a.pr}EUR <span className="badge-s">{a.pd?"Paye":"En cours"}</span></div></div>)}{d.apts.filter(a=>a.cid===cl.id).length===0&&<p style={{color:"#A09080",fontSize:12}}>Aucun RDV</p>}</div>}

        {ct==="avis"&&<div className="card" style={{margin:0}}>{cl.rev.map((r,i)=><div key={i} style={{padding:10,background:"#F8F4FC",borderRadius:14,marginBottom:8}}><div style={{color:"#B89030"}}>{[1,2,3,4,5].map(s=><span key={s} style={{opacity:s<=r.st?1:.2}}>*</span>)}</div><div style={{fontSize:12,marginTop:4}}>{r.tx}</div></div>)}<button className="btn btn-s full" onClick={()=>wa(MSG.avis(cl.n.split(" ")[0]),cl.ph)}>Demander avis</button></div>}
      </div>
    </div>);
  };

  /* ═══ SIMPLE PAGES ═══ */
  const AgendaP=({d,upd,go,setFlow})=>{
    const [sel,setSel]=useState(()=>new Date());
    const [nd,setNd]=useState(6);const [ns,setNs]=useState("09:00");const [ne,setNe]=useState("11:30");
    const MONTHS=["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"];
    const WD=["Lu","Ma","Me","Je","Ve","Sa","Di"];
    const pad=n=>String(n).padStart(2,"0");
    const toISO=dt=>dt.getFullYear()+"-"+pad(dt.getMonth()+1)+"-"+pad(dt.getDate());
    const addD=(dt,n)=>{const x=new Date(dt);x.setDate(x.getDate()+n);return x;};
    const weekStart=addD(sel,-((sel.getDay()+6)%7));
    const week=[0,1,2,3,4,5,6].map(i=>addD(weekStart,i));
    const selISO=toISO(sel), todayISO=toISO(new Date());
    const dayApts=d.apts.filter(a=>a.date===selISO).sort((a,b)=>a.time.localeCompare(b.time));
    const isBooked=h=>d.apts.find(a=>a.date===selISO&&parseInt(a.time,10)===h);
    const book=(iso,time)=>{setFlow({...DEF.flow,date:iso,time});go("flow");};
    const matin=[9,10,11], aprem=[12,13,14,15,16,17,18,19];
    const slotEl=h=>{
      const ap=isBooked(h);const c=ap?d.clients.find(x=>x.id===ap.cid):null;const label=pad(h)+":00";
      if(ap)return(<div key={h} style={{padding:"9px 4px",borderRadius:12,textAlign:"center",background:"linear-gradient(135deg,#5A2070,#9B60C0)",color:"#fff",fontSize:12,fontWeight:600}}>{label}<div style={{fontSize:9,opacity:.85,fontWeight:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c?c.n.split(" ")[0]:"Pris"}</div></div>);
      return(<div key={h} onClick={()=>book(selISO,label)} style={{padding:"9px 4px",borderRadius:12,textAlign:"center",background:"#fff",border:"1px solid #EDE8F4",color:"#2A1A3A",fontSize:12,cursor:"pointer"}}>{label}</div>);
    };

    return(<div className="pg fade">
      <div className="hdr">
        <h1>Agenda</h1>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,margin:"10px 0 12px"}}>
          <span onClick={()=>setSel(addD(sel,-7))} style={{cursor:"pointer",fontSize:20,opacity:.85,padding:"0 8px"}}>&lsaquo;</span>
          <span style={{fontFamily:"'Fraunces',serif",fontWeight:700,fontSize:16}}>{MONTHS[sel.getMonth()]} {sel.getFullYear()}</span>
          <span onClick={()=>setSel(addD(sel,7))} style={{cursor:"pointer",fontSize:20,opacity:.85,padding:"0 8px"}}>&rsaquo;</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {week.map((dt,i)=>{const iso=toISO(dt);const on=iso===selISO;const today=iso===todayISO;
            return(<div key={i} onClick={()=>setSel(new Date(dt))} style={{textAlign:"center",cursor:"pointer",padding:"2px 0"}}>
              <div style={{fontSize:10,opacity:.7,marginBottom:4}}>{WD[i]}</div>
              <div style={{width:30,height:30,lineHeight:"30px",borderRadius:"50%",margin:"0 auto",fontSize:13,fontWeight:on?700:400,background:on?"#fff":"transparent",color:on?"#5A2070":"#fff",border:today&&!on?"1px solid rgba(255,255,255,.55)":"1px solid transparent"}}>{dt.getDate()}</div>
            </div>);})}
        </div>
      </div>

      <div style={{padding:20}}>
        <div style={{fontWeight:700,fontSize:13,color:"#5A2070",marginBottom:8}}>Matin</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>{matin.map(slotEl)}</div>
        <div style={{fontWeight:700,fontSize:13,color:"#5A2070",marginBottom:8}}>Apres-midi</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>{aprem.map(slotEl)}</div>

        <button className="btn btn-p full" style={{marginBottom:16}} onClick={()=>book(selISO,"09:00")}>Nouveau RDV</button>

        <div className="card" style={{margin:0}}><b>RDV du {sel.getDate()} {MONTHS[sel.getMonth()].toLowerCase()}</b>
          {dayApts.length===0&&<p style={{color:"#A09080",fontSize:12,marginTop:8}}>Aucun RDV ce jour</p>}
          {dayApts.map(a=>{const c=d.clients.find(x=>x.id===a.cid);return(
            <div key={a.id} style={{padding:"10px 0",borderBottom:"1px solid #EDE8F4",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:600,fontSize:13}}>{a.time} - {c?.n||"?"}</div><div style={{fontSize:11,color:"#A09080"}}>{a.svc}</div></div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontWeight:700,color:"#5A2070"}}>{a.pr}EUR</span><button className="btn btn-d sm" style={{padding:"4px 8px",fontSize:9}} onClick={()=>upd(x=>{x.apts=x.apts.filter(x2=>x2.id!==a.id)})}>X</button></div>
            </div>);})}
        </div>

        <div className="card" style={{margin:"12px 0 0"}}><b>Creneaux types</b>
          <p style={{fontSize:11,color:"#A09080",margin:"4px 0 8px"}}>Tes disponibilites recurrentes</p>
          {d.slots.map((s,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid #EDE8F4",display:"flex",justifyContent:"space-between",alignItems:"center"}}><b style={{color:"#5A2070",fontSize:13}}>{DAYNAMES[s.day]}</b><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{s.ts.map((t,j)=><span key={j} className="badge-s" style={{background:"#F0E4FA",color:"#5A2070"}}>{t} <span style={{cursor:"pointer"}} onClick={()=>upd(x=>{x.slots[i].ts.splice(j,1);if(x.slots[i].ts.length===0)x.slots.splice(i,1)})}>x</span></span>)}</div></div>)}
          <div className="fr" style={{marginTop:10}}><select className="fi" value={nd} onChange={e=>setNd(+e.target.value)}>{DAYNAMES.map((d2,i)=><option key={i} value={i}>{d2}</option>)}</select><div style={{display:"flex",gap:4}}><input className="fi" type="time" value={ns} onChange={e=>setNs(e.target.value)}/><input className="fi" type="time" value={ne} onChange={e=>setNe(e.target.value)}/></div></div>
          <button className="btn btn-p sm" style={{marginTop:8}} onClick={()=>upd(x=>{const lb=ns.replace(":","h")+"-"+ne.replace(":","h");const ex=x.slots.find(s=>s.day===nd);if(ex)ex.ts.push(lb);else x.slots.push({day:nd,lb:DAYNAMES[nd],ts:[lb]})})}>+ Ajouter</button>
        </div>
      </div>
    </div>);
  }

  const MsgP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{const[mt,setMt]=useState("photo");
    const tpls={photo:{l:"Photo",m:()=>MSG.photo("")},confirm:{l:"Confirm",m:()=>MSG.confirm("","[date]","[heure]",80,40,"Retwist")},j1:{l:"J-1",m:()=>MSG.j1("","[heure]")},retwist:{l:"Retwist",m:()=>MSG.retwist("",4,fmtSlots(d.apts,d.slots))},j3:{l:"J+3",m:()=>MSG.j3("")},avis:{l:"Avis",m:()=>MSG.avis("")},anniv:{l:"Anniv",m:()=>MSG.birthday("")},nego:{l:"Anti-nego",m:()=>MSG.nego}};
    const cur=tpls[mt];
    return(<div className="pg fade"><div className="hdr hdr-sm"><h1>Messages</h1></div>
      <div style={{display:"flex",gap:4,padding:"12px 20px",overflowX:"auto",flexWrap:"nowrap"}}>{Object.entries(tpls).map(([k,t])=><button key={k} className={`btn sm ${mt===k?"btn-p":"btn-s"}`} onClick={()=>setMt(k)} style={{whiteSpace:"nowrap",flexShrink:0}}>{t.l}</button>)}</div>
      <div style={{padding:"0 20px"}}><div className="wa-box"><div className="wa-msg">{typeof cur.m==="function"?cur.m():cur.m}</div></div>
        <div style={{display:"flex",gap:8,marginTop:12}}><button className="btn btn-w" style={{flex:1}} onClick={()=>wa(typeof cur.m==="function"?cur.m():cur.m)}>WhatsApp</button><button className="btn btn-s" style={{flex:1}} onClick={()=>cp(typeof cur.m==="function"?cur.m():cur.m)}>Copier</button></div>
        <div className="sec" style={{padding:"16px 0 8px"}}>Envoyer a</div>
        {d.clients.map(c=><div key={c.id} className="rdv-c" style={{margin:"0 0 6px"}} onClick={()=>{const m=typeof cur.m==="function"?cur.m()?.replace(/Bonjour !/g,"Coucou "+c.n.split(" ")[0]+" !"):cur.m;wa(m,c.ph)}}>
          <div className="av" style={{width:30,height:30,fontSize:11}}>{c.n.charAt(0)}</div><div style={{fontSize:12}}>{c.n}</div>
        </div>)}
      </div>
    </div>);
  };

  const QuoteP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{const[len,setLen]=useState("med");const[sty,setSty]=useState(false);const[rep,setRep]=useState(0);const[nm,setNm]=useState("");const[cid,setCid2]=useState("");
    const ec=cid?d.clients.find(c=>c.id===cid):null;const loyE=ec&&ec.loy>=d.cfg.loyTh&&ec.loy%d.cfg.loyTh===0;const loyD=loyE?d.cfg.loyDis:0;
    const pr=d.cfg;const base=len==="short"?pr.short:len==="lng"?pr.lng:pr.med;const styP=sty?pr.sty:0;const repP=rep>20?pr.rpc:rep>10?10*pr.rpl+(rep-10)*pr.rpd:rep*pr.rpl;const tot=base+styP+repP-loyD;const dep=ec?.tr?0:Math.round(tot*pr.depPct/100);const ll=len==="short"?"courts":len==="lng"?"longs":"moyens";
    const msg=MSG.devis(nm,base,ll,sty,styP,rep,repP,tot,dep,loyD);
    return(<div className="pg fade"><div className="hdr hdr-sm"><h1>Devis</h1></div>
      <div style={{padding:20}}>
        <div className="card" style={{margin:"0 0 12px"}}>
          <div className="fg"><span className="fl">Client</span><select className="fi" value={cid} onChange={e=>{setCid2(e.target.value);const c=d.clients.find(x=>x.id===e.target.value);if(c)setNm(c.n.split(" ")[0])}}><option value="">Nouveau</option>{d.clients.map(c=><option key={c.id} value={c.id}>{c.n}</option>)}</select></div>
          <div className="fr"><div className="fg"><span className="fl">Longueur</span><select className="fi" value={len} onChange={e=>setLen(e.target.value)}><option value="short">Courts {pr.short}EUR</option><option value="med">Moyens {pr.med}EUR</option><option value="lng">Longs {pr.lng}EUR</option></select></div>
            <div className="fg"><span className="fl">Coiffure</span><div style={{display:"flex",gap:4}}><button className={`btn sm ${!sty?"btn-p":"btn-s"}`} onClick={()=>setSty(false)}>Non</button><button className={`btn sm ${sty?"btn-p":"btn-s"}`} onClick={()=>setSty(true)}>+{pr.sty}EUR</button></div></div></div>
          <div className="fg"><span className="fl">Reparations</span><input className="fi" type="number" min="0" value={rep} onChange={e=>setRep(e.target.value===""?"":parseInt(e.target.value)||0)}/></div>
          <div style={{background:"linear-gradient(135deg,#5A2070,#9B60C0)",borderRadius:18,padding:18,color:"#fff",textAlign:"center"}}><div style={{fontSize:10,opacity:.7}}>Total</div><div style={{fontFamily:"'Fraunces',serif",fontSize:36,fontWeight:700}}>{tot}EUR</div>{dep>0&&<div style={{fontSize:11,opacity:.8}}>Acompte {dep}EUR</div>}</div>
        </div>
        <div className="wa-box" style={{margin:"0"}}><div className="wa-msg">{msg}</div></div>
        <div style={{display:"flex",gap:8,marginTop:12}}><button className="btn btn-w" style={{flex:1}} onClick={()=>wa(msg,ec?.ph)}>WhatsApp</button><button className="btn btn-s" style={{flex:1}} onClick={()=>cp(msg)}>Copier</button></div>
      </div>
    </div>);
  };

  const DiagP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{const[probs,setProbs]=useState([]);const rt=RT[probs[0]]||RT.base;const rp=P.filter(p=>probs.some(pr=>p.t.includes(pr)));
    return(<div className="pg fade"><div className="hdr hdr-sm"><h1>Diagnostic</h1></div>
      <div style={{padding:20}}>
        <div className="card" style={{margin:"0 0 12px"}}><b>Problemes</b><div style={{marginTop:8}}>{PROBS.map(p=><div key={p.id} className={`diag-btn ${probs.includes(p.id)?"sel":""}`} onClick={()=>setProbs(pr=>pr.includes(p.id)?pr.filter(x=>x!==p.id):[...pr,p.id])}><span style={{flex:1}}>{p.l}</span>{probs.includes(p.id)&&<b style={{color:"#5A2070"}}>X</b>}</div>)}</div></div>
        {probs.length>0&&<div className="card" style={{margin:0}}><b style={{color:"#5A2070"}}>{rt.l}</b>{rt.s.map((s,i)=><div key={i} style={{fontSize:12,padding:"4px 0",borderBottom:"1px solid #EDE8F4"}}>{i+1}. {s}</div>)}{rp.length>0&&<div style={{marginTop:8}}>{rp.map(p=><div key={p.id} style={{fontSize:11}}>- {p.n} ({p.b})</div>)}</div>}</div>}
      </div>
    </div>);
  };

  const PayP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>(<div className="pg fade"><div className="hdr hdr-sm"><h1>Paiements</h1></div>
    <div style={{padding:20}}>
      <div className="stats" style={{padding:0,marginBottom:14}}><div className="stat"><b>{d.apts.filter(a=>a.pd).reduce((s,a)=>s+a.pr,0)}EUR</b><span>Encaisse</span></div><div className="stat"><b>{d.apts.filter(a=>!a.pd).reduce((s,a)=>s+a.pr,0)}EUR</b><span>A venir</span></div></div>
      <div className="card" style={{margin:0}}>{d.apts.sort((a,b)=>b.date.localeCompare(a.date)).map(a=>{const c=d.clients.find(x=>x.id===a.cid);return(<div key={a.id} style={{padding:"8px 0",borderBottom:"1px solid #EDE8F4",display:"flex",justifyContent:"space-between",fontSize:12}}><div><b>{a.date}</b> {c?.n}</div><div><b>{a.pr}EUR</b> <span className="badge-s">{a.pd?"Paye":"En cours"}</span></div></div>)})}</div>
    </div>
  </div>);

  const LoyP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>(<div className="pg fade"><div className="hdr hdr-sm"><h1>Fidelite</h1></div>
    <div style={{padding:20}}>{d.clients.map(c=><div key={c.id} className="card" style={{margin:"0 0 10px",display:"flex",alignItems:"center",gap:12}}>
      <div className="av">{c.n.charAt(0)}</div><div style={{flex:1}}><div style={{fontWeight:600}}>{c.n}</div><div className="loy-flowers" style={{justifyContent:"flex-start",padding:"4px 0",gap:6}}>{[1,2,3,4,5].map(i=><span key={i} style={{fontSize:16,opacity:i<=c.loy%d.cfg.loyTh?1:.2}}>{i<=c.loy%d.cfg.loyTh?"🌺":"🌸"}</span>)}</div></div>
      {c.loy>=d.cfg.loyTh&&c.loy%d.cfg.loyTh===0&&<span className="badge-s" style={{background:"#F0E4FA",color:"#5A2070"}}>Reduction !</span>}
    </div>)}</div>
  </div>);

  const RevP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>(<div className="pg fade"><div className="hdr hdr-sm"><h1>Avis</h1></div>
    <div style={{padding:20}}>{d.clients.flatMap(c=>c.rev.map(r=>({...r,cn:c.n}))).map((r,i)=><div key={i} className="card" style={{margin:"0 0 10px"}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><b>{r.cn}</b><div style={{color:"#B89030"}}>{[1,2,3,4,5].map(s=><span key={s} style={{opacity:s<=r.st?1:.2}}>*</span>)}</div></div>
      <div style={{fontSize:12,marginTop:4,color:"#504030"}}>{r.tx}</div>
      <button className="btn btn-s sm" style={{marginTop:8}} onClick={()=>cp('"'+r.tx+'" -- '+r.cn)}>Copier</button>
    </div>)}</div>
  </div>);

  const StatsP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{const ca=d.apts.filter(a=>a.pd).reduce((s,a)=>s+a.pr,0);const n=d.apts.filter(a=>a.pd).length;
    return(<div className="pg fade"><div className="hdr hdr-sm"><h1>Statistiques</h1></div>
      <div className="stats" style={{padding:"16px 20px"}}><div className="stat"><b>{ca}EUR</b><span>CA total</span></div><div className="stat"><b>{n?Math.round(ca/n):0}EUR</b><span>Moy/RDV</span></div><div className="stat"><b>{n}</b><span>Prestations</span></div></div>
      <div className="stats" style={{padding:"0 20px"}}><div className="stat"><b>{d.clients.length}</b><span>Clientes</span></div><div className="stat"><b>{d.clients.filter(c=>c.vis>1).length}</b><span>Fideles</span></div><div className="stat"><b>{d.clients.flatMap(c=>c.rev).length}</b><span>Avis</span></div></div>
    </div>);
  };

  const StoryP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{const sl=getSlots(d.apts,d.slots);const slots=sl.length>0?sl:[{label:"Sam 12 Avr",times:["9h-11h30"]}];
    return(<div className="pg fade"><div className="hdr hdr-sm"><h1>Story</h1></div>
      <div style={{padding:20}}>
        <div style={{width:240,margin:"0 auto",background:"linear-gradient(160deg,#FBF7F2,#F0E8F8)",borderRadius:20,padding:24,textAlign:"center",boxShadow:"0 8px 30px rgba(90,32,112,.1)"}}>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:700,color:"#5A2070"}}>Fresitalocks</div>
          <div style={{fontSize:7,letterSpacing:3,textTransform:"uppercase",color:"#7B3FA0",marginBottom:14}}>Disponibilites</div>
          {slots.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",marginBottom:3,background:"#fff",borderRadius:8,fontSize:9}}><b style={{color:"#5A2070"}}>{s.label}</b><span style={{color:"#A09080"}}>{s.times.join(" ou ")}</span></div>)}
          <div style={{marginTop:12,fontSize:8,color:"#7B3FA0"}}>DM ou WhatsApp</div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:16}}><button className="btn btn-w" style={{flex:1}} onClick={()=>wa(slots.map(s=>s.label+" : "+s.times.join(" ou ")).join("\n")+"\n\nLes Abymes\n"+LOC.map+"\n\n-- Fresita")}>WhatsApp</button><button className="btn btn-s" style={{flex:1}} onClick={()=>cp(slots.map(s=>s.label+" : "+s.times.join(" ou ")).join("\n"))}>Copier</button></div>
      </div>
    </div>);
  };

  const FaqP=({d,setD,pg,setPg,sel,setSel,ct,setCt,more,setMore,toast,setToast,go,wa,cp,upd,setFlow,f,rtAlerts,bdAlerts,exportData})=>{const[o,setO]=useState(null);const[sq,setSq]=useState("");
    const flt=FAQ.filter(f2=>f2.q.toLowerCase().includes(sq.toLowerCase())||f2.a.toLowerCase().includes(sq.toLowerCase()));
    return(<div className="pg fade"><div className="hdr hdr-sm"><h1>FAQ</h1></div>
      <div className="search"><input placeholder="Rechercher..." value={sq} onChange={e=>setSq(e.target.value)} style={{width:"100%"}}/></div>
      <div style={{padding:"0 20px"}}>{flt.map((f2,i)=><div key={i} className="faq-i" onClick={()=>setO(o===i?null:i)}><div className="faq-q">{f2.q}<span style={{opacity:.3}}>{o===i?"-":"+"}</span></div>
        {o===i&&<><div className="faq-a">{f2.a}</div><div style={{display:"flex",gap:6,marginTop:8}}><button className="btn btn-w sm" onClick={e=>{e.stopPropagation();wa(f2.a)}}>WhatsApp</button><button className="btn btn-s sm" onClick={e=>{e.stopPropagation();cp(f2.a)}}>Copier</button></div></>}
      </div>)}
      <div className="card" style={{margin:"14px 0"}}><b>Anti-nego</b><div className="wa-box"><div className="wa-msg">{MSG.nego}</div></div><div style={{display:"flex",gap:6,marginTop:8}}><button className="btn btn-w sm" onClick={()=>wa(MSG.nego)}>WhatsApp</button><button className="btn btn-s sm" onClick={()=>cp(MSG.nego)}>Copier</button></div></div>
      </div>
    </div>);
  };

  const SetP=({d,setD,upd,setToast,exportData})=>{
    const pr=d.cfg.pricing;
    const [simN,setSimN]=useState(30);
    const [simZ,setSimZ]=useState(pr.zones[0]?.id||"");
    const [simG,setSimG]=useState(pr.grosseurs[0]?.id||"");
    const simPrix=calcPrix(pr,parseInt(simN)||0,simZ,simG);
    return(<div className="pg fade"><div className="hdr hdr-sm"><h1>Reglages</h1></div>
    <div style={{padding:20}}>

      {/* ── Simulateur de prix ── */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Simulateur de prix</b>
        <p style={{fontSize:11,color:"#A09080",margin:"4px 0 8px"}}>Reprise de racines</p>
        <div className="fr"><div className="fg"><span className="fl">Nb de locks</span><input className="fi" type="number" min="1" value={simN} onChange={e=>setSimN(e.target.value===""?"":parseInt(e.target.value)||0)}/></div>
          <div className="fg"><span className="fl">Longueur</span><select className="fi" value={simZ} onChange={e=>setSimZ(e.target.value)}>{pr.zones.map(z=><option key={z.id} value={z.id}>{z.label} ({z.cm}cm)</option>)}</select></div></div>
        <div className="fg"><span className="fl">Grosseur</span><select className="fi" value={simG} onChange={e=>setSimG(e.target.value)}>{pr.grosseurs.map(g=><option key={g.id} value={g.id}>{g.label} ({g.mm}mm)</option>)}</select></div>
        <div style={{background:"linear-gradient(135deg,#5A2070,#9B60C0)",borderRadius:18,padding:18,color:"#fff",textAlign:"center",marginTop:12}}><div style={{fontSize:10,opacity:.7,letterSpacing:1,textTransform:"uppercase"}}>Prix reprise</div><div style={{fontFamily:"'Fraunces',serif",fontSize:36,fontWeight:700}}>{simPrix}EUR</div></div>
      </div>

      {/* ── Prix de base par tranche de locks ── */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Prix de base (nb de locks)</b>
        <p style={{fontSize:11,color:"#A09080",margin:"4px 0 8px"}}>Jusqu'a X locks = Y euros</p>
        {pr.tranches.map((t,i)=>
          <div key={i} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:11,color:"#7A6488",width:38}}>&le; locks</span>
            <input className="fi" style={{flex:1}} type="number" defaultValue={t.max} onBlur={e=>upd(x=>{x.cfg.pricing.tranches[i].max=parseInt(e.target.value)||0})}/>
            <input className="fi" style={{flex:1}} type="number" defaultValue={t.prix} onBlur={e=>upd(x=>{x.cfg.pricing.tranches[i].prix=parseInt(e.target.value)||0})}/>
            <span style={{fontSize:11,color:"#7A6488"}}>EUR</span>
            <button className="btn btn-d sm" style={{padding:"4px 7px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.pricing.tranches.splice(i,1)})}>X</button>
          </div>)}
        <button className="btn btn-s sm" style={{marginTop:4}} onClick={()=>upd(x=>{const t=x.cfg.pricing.tranches;const l=t[t.length-1];t.push({max:(l?.max||0)+10,prix:(l?.prix||0)+10})})}>+ Ajouter une tranche</button>
      </div>

      {/* ── Longueur (zones) ── */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Longueur (zones)</b>
        <p style={{fontSize:11,color:"#A09080",margin:"4px 0 8px"}}>cm indicatif + effet prix (%)</p>
        {pr.zones.map((z,i)=>
          <div key={z.id} style={{display:"flex",gap:5,alignItems:"center",marginBottom:6}}>
            <input className="fi" style={{flex:"1.4 1 0",minWidth:0}} defaultValue={z.label} onBlur={e=>upd(x=>{x.cfg.pricing.zones[i].label=e.target.value})}/>
            <input className="fi" style={{width:48,padding:"8px 6px"}} type="number" defaultValue={z.cm} onBlur={e=>upd(x=>{x.cfg.pricing.zones[i].cm=parseInt(e.target.value)||0})}/><span style={{fontSize:10,color:"#7A6488"}}>cm</span>
            <input className="fi" style={{width:48,padding:"8px 6px"}} type="number" defaultValue={z.pct} onBlur={e=>upd(x=>{x.cfg.pricing.zones[i].pct=parseInt(e.target.value)||0})}/><span style={{fontSize:10,color:"#7A6488"}}>%</span>
            <button className="btn btn-d sm" style={{padding:"4px 6px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.pricing.zones.splice(i,1)})}>X</button>
          </div>)}
        <button className="btn btn-s sm" style={{marginTop:4}} onClick={()=>upd(x=>{x.cfg.pricing.zones.push({id:"z"+Date.now(),label:"Nouvelle zone",cm:50,pct:0})})}>+ Ajouter une zone</button>
      </div>

      {/* ── Grosseur (diametre) ── */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Grosseur (diametre)</b>
        <p style={{fontSize:11,color:"#A09080",margin:"4px 0 8px"}}>mm indicatif + effet prix (%)</p>
        {pr.grosseurs.map((g,i)=>
          <div key={g.id} style={{display:"flex",gap:5,alignItems:"center",marginBottom:6}}>
            <input className="fi" style={{flex:"1.4 1 0",minWidth:0}} defaultValue={g.label} onBlur={e=>upd(x=>{x.cfg.pricing.grosseurs[i].label=e.target.value})}/>
            <input className="fi" style={{width:48,padding:"8px 6px"}} type="number" defaultValue={g.mm} onBlur={e=>upd(x=>{x.cfg.pricing.grosseurs[i].mm=parseInt(e.target.value)||0})}/><span style={{fontSize:10,color:"#7A6488"}}>mm</span>
            <input className="fi" style={{width:48,padding:"8px 6px"}} type="number" defaultValue={g.pct} onBlur={e=>upd(x=>{x.cfg.pricing.grosseurs[i].pct=parseInt(e.target.value)||0})}/><span style={{fontSize:10,color:"#7A6488"}}>%</span>
            <button className="btn btn-d sm" style={{padding:"4px 6px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.pricing.grosseurs.splice(i,1)})}>X</button>
          </div>)}
        <button className="btn btn-s sm" style={{marginTop:4}} onClick={()=>upd(x=>{x.cfg.pricing.grosseurs.push({id:"g"+Date.now(),label:"Nouvelle",mm:10,pct:0})})}>+ Ajouter</button>
      </div>

      {/* ── Formules (blocs tarifaires par longueur) ── */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Formules (tarifs par longueur)</b>
        <p style={{fontSize:11,color:"#A09080",margin:"4px 0 8px"}}>RETWIST SEUL, FORMULE SIMPLE... prix par longueur</p>
        {d.cfg.formules.map((fo,i)=>
          <div key={fo.id} style={{background:"#F8F4FC",borderRadius:14,padding:"10px 12px",marginBottom:10}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <input className="fi" style={{width:42,padding:"8px 6px",textAlign:"center"}} defaultValue={fo.num} onBlur={e=>upd(x=>{x.cfg.formules[i].num=e.target.value})}/>
              <input className="fi" style={{flex:1,minWidth:0}} defaultValue={fo.title} placeholder="Titre" onBlur={e=>upd(x=>{x.cfg.formules[i].title=e.target.value})}/>
              <button className="btn btn-d sm" style={{padding:"4px 7px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.formules.splice(i,1)})}>X</button>
            </div>
            <input className="fi" style={{marginBottom:8,fontSize:12}} defaultValue={fo.subtitle} placeholder="Sous-titre (ex: Shampoing + Retwist)" onBlur={e=>upd(x=>{x.cfg.formules[i].subtitle=e.target.value})}/>
            {fo.lengths.map((ln,j)=>
              <div key={j} style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
                <input className="fi" style={{flex:1,minWidth:0,padding:"7px 8px"}} defaultValue={ln.label} placeholder="Longueur" onBlur={e=>upd(x=>{x.cfg.formules[i].lengths[j].label=e.target.value})}/>
                <input className="fi" style={{width:64,padding:"7px 6px"}} type="number" defaultValue={ln.prix} onBlur={e=>upd(x=>{x.cfg.formules[i].lengths[j].prix=e.target.value===""?0:parseInt(e.target.value)||0})}/>
                <span style={{fontSize:10,color:"#7A6488"}}>EUR</span>
                <button className="btn btn-d sm" style={{padding:"3px 6px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.formules[i].lengths.splice(j,1)})}>x</button>
              </div>)}
            <button className="btn btn-s sm" style={{fontSize:10,marginBottom:8}} onClick={()=>upd(x=>{x.cfg.formules[i].lengths.push({label:"Nouvelle longueur",prix:0})})}>+ Longueur</button>
            <textarea className="fi" style={{width:"100%",minHeight:40,resize:"vertical",fontSize:12}} defaultValue={fo.note} placeholder="Note (ex: Coiffure incluse)" onBlur={e=>upd(x=>{x.cfg.formules[i].note=e.target.value})}/>
          </div>)}
        <button className="btn btn-s sm" onClick={()=>upd(x=>{const n=String(x.cfg.formules.length+1).padStart(2,"0");x.cfg.formules.push({id:"fo"+Date.now(),num:n,title:"NOUVELLE FORMULE",subtitle:"",note:"",lengths:[{label:"Locks courtes",prix:0},{label:"Locks mi-longues",prix:0},{label:"Locks longues",prix:0},{label:"Locks tres longues",prix:0}]})})}>+ Ajouter une formule</button>
      </div>

      {/* ── Prestations (catalogue de services) ── */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Prestations</b>
        <p style={{fontSize:11,color:"#A09080",margin:"4px 0 8px"}}>Services en plus (shampoing, soin, coiffure...)</p>
        {d.cfg.prestations.map((pst,i)=>
          <div key={pst.id} style={{background:"#F8F4FC",borderRadius:14,padding:"10px 12px",marginBottom:8}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <input className="fi" style={{flex:1,minWidth:0}} defaultValue={pst.nom} placeholder="Nom" onBlur={e=>upd(x=>{x.cfg.prestations[i].nom=e.target.value})}/>
              <input className="fi" style={{width:64,padding:"8px 6px"}} type="number" defaultValue={pst.prix} onBlur={e=>upd(x=>{x.cfg.prestations[i].prix=e.target.value===""?0:parseInt(e.target.value)||0})}/>
              <span style={{fontSize:11,color:"#7A6488"}}>EUR</span>
              <button className="btn btn-d sm" style={{padding:"4px 7px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.prestations.splice(i,1)})}>X</button>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
              <input className="fi" style={{width:52,padding:"8px 6px"}} type="number" defaultValue={pst.duree} onBlur={e=>upd(x=>{x.cfg.prestations[i].duree=e.target.value===""?0:parseInt(e.target.value)||0})}/><span style={{fontSize:11,color:"#7A6488"}}>min</span>
              <input className="fi" style={{flex:1,minWidth:0}} defaultValue={pst.cat} placeholder="Categorie" onBlur={e=>upd(x=>{x.cfg.prestations[i].cat=e.target.value})}/>
            </div>
            <input className="fi" style={{width:"100%"}} defaultValue={pst.desc} placeholder="Description" onBlur={e=>upd(x=>{x.cfg.prestations[i].desc=e.target.value})}/>
          </div>)}
        <button className="btn btn-s sm" style={{marginTop:2}} onClick={()=>upd(x=>{x.cfg.prestations.push({id:"p"+Date.now(),nom:"Nouvelle prestation",prix:0,duree:30,desc:"",cat:""})})}>+ Ajouter une prestation</button>
      </div>
      <div className="card" style={{margin:"0 0 12px"}}><b>Localisation</b><p style={{fontSize:12,color:"#504030",marginTop:4}}>Les Abymes, Guadeloupe</p></div>
      <div className="card" style={{margin:"0 0 12px"}}><b>Donnees</b>
        <button className="btn btn-p full" style={{marginTop:8}} onClick={exportData}>Exporter mes donnees</button>
      </div>
      <button className="btn btn-d full" onClick={()=>{if(window.confirm("Reinitialiser TOUTES les donnees ? Action irreversible.")){localStorage.removeItem(SK);setD(DEF);setToast("Reset !")}}}>Reinitialiser</button>
    </div>
  </div>);
  }

export default App;
