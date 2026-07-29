import React, {useState, useRef} from 'react';
import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';

/* ── Palette flyer ── */
const CREAM="#F3EBDD", INK="#171717", RUST="#B25B24", BROWN="#7C4A21", DARK="#2A2A2A", MUT="#9A8A78";

/* ── petites icones ── */
const Leaf=({style})=>(<svg viewBox="0 0 40 80" style={style}><path d="M20 78 C20 50 8 40 8 20 C8 8 20 2 20 2 C20 2 32 8 32 20 C32 40 20 50 20 78Z" fill="none" stroke={RUST} strokeWidth="1.4" opacity=".5"/><path d="M20 70 L20 10 M20 30 L10 22 M20 30 L30 22 M20 45 L9 38 M20 45 L31 38" stroke={RUST} strokeWidth="1" opacity=".45"/></svg>);
const Cal=({c})=>(<svg viewBox="0 0 24 24" width="12" height="12" style={{flex:"0 0 auto"}}><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke={c||BROWN} strokeWidth="1.6"/><path d="M3 9h18M8 3v4M16 3v4" stroke={c||BROWN} strokeWidth="1.6"/></svg>);
const Pin=({c})=>(<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill={c||BROWN}/><circle cx="12" cy="9" r="2.6" fill={CREAM}/></svg>);
const Wa=({c})=>(<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2z" fill={c||"#fff"}/><path d="M8.3 7.3c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.2.2 2 3.2 5 4.4 2.4 1 2.9.8 3.5.8.6-.1 1.8-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2z" fill={RUST}/></svg>);

/* ── Le flyer rendu (largeur de base 350px, capture x3 a l'export) ── */
const FlyerCanvas=React.forwardRef(({fl,onSlot},ref)=>{
  const Tag=({children,style})=>(<span style={{background:INK,color:"#fff",fontFamily:"'Anton',sans-serif",letterSpacing:.5,padding:"3px 9px",borderRadius:4,fontSize:11,display:"inline-block",...style}}>{children}</span>);
  const Circle=({on,onClick})=>(<div onClick={onClick} style={{width:20,height:20,borderRadius:"50%",margin:"0 auto",border:on?"none":`1.6px solid ${MUT}`,background:on?BROWN:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:onClick?"pointer":"default"}}>{on&&<svg viewBox="0 0 24 24" width="12" height="12"><path d="M5 13l4 4L19 7" fill="none" stroke="#fff" strokeWidth="3"/></svg>}</div>);
  const cols=`92px repeat(${fl.slots.length},1fr)`;
  if(fl.template==="pricelist"){
    const TH=fl.plTheme||"#5A2070"; const st=(fl.plStyle||"bars"); const mini=st==="minimal", aurea=st==="aurea", bsp=st==="beautyspot", princess=st==="princess", two=aurea||bsp||princess;
    return(<div ref={ref} style={{width:350,background:princess?"#FBEEF0":bsp?"#FBF6EE":aurea?"#F3EBE0":mini?"#F5F5F5":"#FBF7F2",color:"#2A2A2A",fontFamily:"'Outfit',sans-serif",padding:"18px 16px",boxSizing:"border-box",position:"relative"}}>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontFamily:two?"'Fraunces',serif":"'Anton',sans-serif",fontSize:two?30:34,letterSpacing:1,color:bsp?TH:"#171717",lineHeight:1,fontStyle:aurea?"italic":"normal",...(bsp||princess?{color:TH}:{})}}>{fl.plTitle}</div>
        <div style={{fontFamily:"'Dancing Script',cursive",fontSize:23,color:mini?"#171717":TH,fontWeight:700,marginTop:-2}}>{fl.plSubtitle}</div>
        <div style={{height:mini?1:2,width:mini?"100%":90,background:mini?"#1A1A1A":TH,margin:"6px auto 0",borderRadius:2}}/>
      </div>
      {two?(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{fl.plCategories.map((cat)=> aurea?(
        <div key={cat.id} style={{background:"#EADFCF",borderRadius:14,padding:"9px 9px 7px"}}>
          <div style={{border:`1px solid ${TH}`,background:"#fff",borderRadius:16,padding:"4px 6px",textAlign:"center",fontSize:9.5,letterSpacing:.3,color:TH,fontWeight:700,marginBottom:6}}>{cat.name}</div>
          {cat.items.map((it,ii)=>(<div key={ii} style={{display:"flex",alignItems:"baseline",gap:3,padding:"2px 0",borderBottom:ii<cat.items.length-1?"1px dotted #D3C3B0":"none"}}><span style={{color:TH,fontSize:8}}>{"\u2726"}</span><span style={{fontSize:9.5,color:"#4A3A32",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.label}</span><span style={{fontSize:10.5,fontWeight:700,color:TH}}>{it.prix}&#8364;</span></div>))}
        </div>):bsp?(
        <div key={cat.id} style={{background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #E8D9B8"}}>
          <div style={{background:`linear-gradient(90deg, ${TH}, #C9A24B)`,color:"#fff",fontFamily:"'Anton',sans-serif",fontSize:11,letterSpacing:.5,padding:"6px 10px",marginBottom:5}}>{cat.name}</div>
          <div style={{padding:"0 10px 4px"}}>{cat.items.map((it,ii)=>(<div key={ii} style={{display:"flex",alignItems:"baseline",gap:3,padding:"2px 0"}}><span style={{fontSize:9.5,color:"#5A4A3A",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.label}</span><span style={{fontSize:11,fontWeight:700,color:TH}}>{it.prix}&#8364;</span></div>))}</div>
        </div>):(
        <div key={cat.id} style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>{cat.photo&&<img src={cat.photo} style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",flex:"0 0 auto"}}/>}<div style={{background:"#F3D9DE",borderRadius:"12px 12px 12px 3px",padding:"2px 10px"}}><span style={{fontFamily:"'Dancing Script',cursive",fontSize:15,fontWeight:700,color:TH}}>{cat.name}</span></div></div>
          {cat.items.map((it,ii)=>(<div key={ii} style={{display:"flex",alignItems:"baseline",gap:3,padding:"1px 0"}}><span style={{fontSize:9.5,color:"#5A4A4A",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.label}</span><span style={{fontSize:10.5,fontWeight:700,color:TH}}>{it.prix}&#8364;</span></div>))}
        </div>))}</div>):fl.plCategories.map((cat)=> mini
        ?(<div key={cat.id} style={{display:"flex",gap:12,marginBottom:14,alignItems:"flex-start"}}>
            {cat.photo&&<img src={cat.photo} style={{width:54,height:54,borderRadius:"50%",objectFit:"cover",flex:"0 0 auto",marginTop:2}}/>}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Anton',sans-serif",fontSize:15,letterSpacing:.5,color:"#1A1A1A",borderBottom:"1.5px solid #1A1A1A",paddingBottom:3,marginBottom:5}}>{cat.name}</div>
              {cat.items.map((it,ii)=>(
                <div key={ii} style={{display:"flex",alignItems:"baseline",gap:4,padding:"2px 0"}}>
                  <span style={{fontSize:11.5,color:"#4A4A4A"}}>{it.label}</span>
                  <span style={{flex:1,borderBottom:"1px dotted #BBB",margin:"0 3px",position:"relative",top:-3}}/>
                  <span style={{fontSize:12.5,fontWeight:700,color:TH}}>{it.prix} EUR</span>
                </div>))}
            </div>
          </div>)
        :(<div key={cat.id} style={{marginBottom:13}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              {cat.photo&&<img src={cat.photo} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",flex:"0 0 auto"}}/>}
              <div style={{flex:1,background:TH,color:"#fff",fontFamily:"'Anton',sans-serif",fontSize:13,letterSpacing:.5,padding:"6px 12px",borderRadius:20}}>{cat.name}</div>
            </div>
            {cat.items.map((it,ii)=>(
              <div key={ii} style={{display:"flex",alignItems:"baseline",gap:4,padding:"2px 4px"}}>
                <span style={{fontSize:12,color:"#2A2A2A"}}>{it.label}</span>
                <span style={{flex:1,borderBottom:"1px dotted #C9BCA8",margin:"0 2px",position:"relative",top:-3}}/>
                <span style={{fontSize:13,fontWeight:700,color:TH}}>{it.prix} EUR</span>
              </div>))}
          </div>)
      )}
      <div style={{textAlign:"center",marginTop:8,paddingTop:10,borderTop:"1px solid #E4D9C8"}}>
        <div style={{fontSize:12,color:mini?"#1A1A1A":TH,fontWeight:700}}>{fl.plContact}</div>
        <div style={{fontSize:10,color:"#9A8A78",marginTop:2}}>{fl.plFooter}</div>
      </div>
    </div>);
  }
  if(fl.template==="liste"){
    const PU="#5A2070", LI="#EFE4FA";
    const cal=(c)=>(<svg viewBox="0 0 24 24" width="14" height="14" style={{flex:"0 0 auto"}}><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke={c} strokeWidth="1.8"/><path d="M3 9h18M8 3v4M16 3v4" stroke={c} strokeWidth="1.8"/></svg>);
    return(<div ref={ref} style={{width:350,background:"#FBF9FF",color:"#2A1A3A",fontFamily:"'Outfit',sans-serif",padding:"16px 14px",boxSizing:"border-box",position:"relative",overflow:"hidden"}}>
      <Leaf style={{position:"absolute",top:56,left:-6,width:24,height:48}}/>
      <Leaf style={{position:"absolute",top:56,right:-6,width:24,height:48,transform:"scaleX(-1)"}}/>
      <div style={{textAlign:"center",marginBottom:4}}>{fl.logoB?<img src={fl.logoB} style={{maxHeight:40,maxWidth:160,objectFit:"contain"}}/>:<span style={{fontFamily:"'Dancing Script',cursive",fontSize:26,color:PU,fontWeight:700}}>Fresita Locks</span>}</div>
      <div style={{textAlign:"center",fontSize:11,letterSpacing:4,color:PU,fontWeight:600}}>DISPONIBILITES</div>
      <div style={{textAlign:"center",fontFamily:"'Fraunces',serif",fontSize:33,fontWeight:700,color:PU,fontStyle:"italic",lineHeight:1,margin:"1px 0 8px"}}>{fl.period}</div>
      <div style={{background:LI,borderRadius:12,padding:"8px 10px",display:"flex",gap:8,alignItems:"flex-start",marginBottom:10}}>
        <div style={{width:26,height:26,borderRadius:8,background:PU,display:"flex",alignItems:"center",justifyContent:"center",flex:"0 0 auto"}}>{cal("#fff")}</div>
        <div style={{fontSize:10,lineHeight:1.35}}><b style={{color:PU}}>ATTENTION :</b> {fl.attn}</div>
      </div>
      {fl.days.map((day,i)=>(
        <div key={i} style={{background:"#fff",borderRadius:12,padding:"7px 10px",marginBottom:6,borderLeft:`3px solid ${PU}`,display:"flex",alignItems:"center",gap:6}}>
          {cal(PU)}
          <span style={{fontSize:10,fontWeight:700,flex:"0 0 auto",minWidth:92}}>{day.label}</span>
          <span style={{flex:1,borderBottom:"1px dotted #D8C8EC",position:"relative",top:-3}}/>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
            {fl.slots.map((s,j)=>day.avail[j]
              ?<span key={j} onClick={onSlot?()=>onSlot(i,j):undefined} style={{fontSize:11,fontWeight:700,color:PU,cursor:onSlot?"pointer":"default"}}>{s.toLowerCase()}</span>
              :<span key={j} style={{fontSize:11,color:"#C9A0A0",textDecoration:"line-through"}}>{s.toLowerCase()}</span>)}
          </div>
        </div>))}
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"10px 0 4px"}}>
        <div style={{width:54,height:54,borderRadius:"50%",background:PU,color:"#fff",fontSize:7,fontWeight:700,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",padding:6,flex:"0 0 auto",lineHeight:1.2}}>{fl.listBadge}</div>
        <div style={{flex:1,textAlign:"center",fontStyle:"italic",fontSize:11,color:PU}}>{fl.listFooter}</div>
      </div>
      <div style={{textAlign:"center",fontFamily:"'Dancing Script',cursive",fontSize:17,color:PU,marginTop:2}}>{fl.cta}</div>
    </div>);
  }
  if(fl.template==="promo"){
    const BG=fl.promoTheme||"#1A1A1A", AC="#F4B8C4";
    const dot=(g)=>(<span style={{width:20,height:20,borderRadius:"50%",background:AC,color:BG,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flex:"0 0 auto"}}>{g}</span>);
    return(<div ref={ref} style={{width:350,background:BG,color:"#fff",fontFamily:"'Outfit',sans-serif",boxSizing:"border-box",position:"relative",overflow:"hidden"}}>
      {fl.promoPhoto&&<img src={fl.promoPhoto} style={{width:"100%",height:160,objectFit:"cover",display:"block"}}/>}
      <div style={{padding:"16px 18px 20px"}}>
        <div style={{fontFamily:"'Dancing Script',cursive",fontSize:24,color:AC,lineHeight:1}}>{fl.promoName}</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:27,fontWeight:700,lineHeight:1.05,marginTop:2}}>{fl.promoTagline}</div>
        <div style={{background:AC,color:BG,fontFamily:"'Anton',sans-serif",fontSize:13,letterSpacing:1,padding:"5px 14px",borderRadius:20,display:"inline-block",margin:"14px 0 10px"}}>NOS SERVICES :</div>
        {fl.promoServices.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>{dot("\u2713")}<span style={{fontSize:14,fontWeight:600}}>{s}</span></div>)}
        <div style={{background:AC,color:BG,fontFamily:"'Anton',sans-serif",fontSize:13,letterSpacing:1,padding:"5px 14px",borderRadius:20,display:"inline-block",margin:"14px 0 10px"}}>{fl.promoCTA}</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {fl.promoFB&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>{dot("f")}{fl.promoFB}</div>}
          {fl.promoPhone&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>{dot("\u260E")}{fl.promoPhone}</div>}
          {fl.promoIG&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>{dot("\u25C9")}{fl.promoIG}</div>}
          {fl.promoAddress&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>{dot("\u25CF")}{fl.promoAddress}</div>}
        </div>
      </div>
    </div>);
  }
  return(
  <div ref={ref} style={{width:350,background:CREAM,color:DARK,fontFamily:"'Outfit',sans-serif",padding:"14px 14px 10px",position:"relative",overflow:"hidden",boxSizing:"border-box"}}>
    <Leaf style={{position:"absolute",top:70,left:-6,width:26,height:52}}/>
    <Leaf style={{position:"absolute",bottom:20,right:-6,width:26,height:52,transform:"scaleX(-1)"}}/>

    {/* 1. Titre */}
    <div style={{background:INK,borderRadius:5,padding:"9px 8px",textAlign:"center"}}><span style={{fontFamily:"'Fraunces',serif",color:"#fff",fontSize:19,fontWeight:600,fontStyle:"italic"}}>{fl.title}</span></div>

    {/* 2-3. Collab + logos + tagline */}
    <div style={{display:"flex",gap:8,marginTop:10,alignItems:"stretch"}}>
      <div style={{flex:1}}>
        {fl.collab&&<div style={{textAlign:"center",fontSize:8,letterSpacing:2,color:DARK,fontWeight:600,marginBottom:4}}>{fl.exclusiveLabel}</div>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {fl.collab&&(fl.logoA?<img src={fl.logoA} style={{maxHeight:34,maxWidth:74,objectFit:"contain"}}/>:<span style={{fontFamily:"'Anton',sans-serif",fontSize:15}}>10<span style={{color:RUST}}>@</span>1<sub style={{fontSize:8}}>locks</sub></span>)}
          {fl.collab&&<span style={{color:DARK,fontSize:13}}>&times;</span>}
          {fl.logoB?<img src={fl.logoB} style={{maxHeight:36,maxWidth:96,objectFit:"contain"}}/>:<span style={{fontFamily:"'Dancing Script',cursive",fontSize:20,color:RUST,fontWeight:700}}>Fresita Locks</span>}
        </div>
      </div>
      <div style={{background:INK,borderRadius:4,padding:"6px 7px",width:70,color:"#fff"}}><div style={{fontSize:8.5,lineHeight:1.35}}><b style={{color:"#fff"}}>UNE SEMAINE</b> <span style={{color:RUST}}>{fl.tagline.replace(/^UNE SEMAINE\s*/i,"")}</span></div></div>
    </div>

    {/* 4. Grand titre */}
    <div style={{marginTop:8}}>
      <div style={{fontFamily:"'Anton',sans-serif",fontSize:38,lineHeight:.92,letterSpacing:-.5,color:INK}}>{fl.bigTitle}</div>
      <div style={{fontFamily:"'Dancing Script',cursive",fontSize:30,color:RUST,fontWeight:700,marginTop:-2}}>{fl.period}</div>
      <div style={{height:2,width:120,background:RUST,marginTop:2,borderRadius:2}}/>
    </div>

    {/* 5. Lieu + CTA */}
    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
      <Pin/>
      <div><Tag style={{fontSize:12,padding:"4px 10px"}}>{fl.locName}</Tag><div style={{fontSize:8,letterSpacing:1.5,color:DARK,marginTop:2,fontWeight:600}}>{fl.locCity}</div></div>
      <div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontSize:9,letterSpacing:1,color:DARK,fontWeight:600}}>PRENDS TON</div><div style={{fontFamily:"'Dancing Script',cursive",fontSize:18,color:RUST,fontWeight:700,lineHeight:1}}>rendez-vous !</div></div>
    </div>

    {/* 6. Grille dispos */}
    <div style={{marginTop:10}}>
      <div style={{display:"grid",gridTemplateColumns:cols,gap:4,alignItems:"center",marginBottom:5}}>
        <Tag style={{fontSize:9,textAlign:"center"}}>DATE</Tag>
        {fl.slots.map((s,i)=><Tag key={i} style={{fontSize:9,textAlign:"center"}}>{s}</Tag>)}
      </div>
      {fl.days.map((d,i)=>(
        <div key={i} style={{display:"grid",gridTemplateColumns:cols,gap:4,alignItems:"center",padding:"3px 0",borderTop:i?`1px solid #E4D9C8`:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}><Cal/><span style={{fontSize:8.5,fontWeight:700,color:DARK,lineHeight:1.1}}>{d.label}</span></div>
          {fl.slots.map((s,j)=><Circle key={j} on={!!d.avail[j]} onClick={onSlot&&d.avail[j]?()=>onSlot(i,j):undefined}/>)}
        </div>
      ))}
    </div>

    {/* 7. Prestations + acompte */}
    <div style={{display:"flex",gap:8,marginTop:12}}>
      <div style={{flex:1,border:`1px solid #E0D4C2`,borderRadius:10,padding:"8px 10px"}}>
        <div style={{fontFamily:"'Anton',sans-serif",fontSize:12,letterSpacing:1,marginBottom:5}}>PRESTATIONS</div>
        {fl.prestations.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,padding:"2px 0",borderTop:i?"1px solid #EFE6D6":"none"}}><span style={{width:14,height:14,borderRadius:"50%",border:`1.4px solid ${RUST}`,flex:"0 0 auto"}}/><span style={{fontSize:9,letterSpacing:.5,color:DARK}}>{p}</span></div>)}
      </div>
      <div style={{width:118,border:`1px solid ${RUST}`,borderRadius:10,padding:"8px",textAlign:"center"}}>
        <div style={{fontSize:8.5,fontWeight:700,color:DARK,letterSpacing:.5}}>{fl.acompteTitle}</div>
        <div style={{fontSize:7.5,color:MUT,margin:"2px 0"}}>{fl.acompteText}</div>
        <div style={{fontFamily:"'Anton',sans-serif",fontSize:13,color:RUST}}>ACOMPTE DE {fl.acomptePct} %</div>
        <div style={{fontSize:6.5,color:MUT,marginTop:3,lineHeight:1.3}}>{fl.acompteNote}</div>
      </div>
    </div>

    {/* 8. Contact */}
    <div style={{background:INK,borderRadius:10,padding:"9px 12px",marginTop:8,display:"flex",alignItems:"center",gap:8}}>
      <Wa/><div style={{fontSize:10.5,color:"#fff",fontWeight:600,letterSpacing:.3}}>{fl.contactText.split(/(INSTAGRAM|WHATSAPP)/i).map((t,i)=>/instagram|whatsapp/i.test(t)?<span key={i} style={{color:RUST}}>{t}</span>:t)}</div>
    </div>

    {/* 9. Footer */}
    <div style={{display:"flex",justifyContent:"space-between",marginTop:9,paddingTop:7,borderTop:"1px solid #E4D9C8"}}>
      {fl.footer.map((f,i)=><div key={i} style={{fontSize:6.5,letterSpacing:.5,color:DARK,fontWeight:600,textAlign:"center",flex:1,lineHeight:1.3}}>{f}</div>)}
    </div>
  </div>);
});

/* ── Editeur + preview + export ── */
export default function FlyerP({d,upd,go}){
  const flyers=d.cfg.flyers;
  const [si,setSi]=useState(0);
  const idx=Math.min(si,flyers.length-1);
  const fl=flyers[idx];
  const ref=useRef(null);
  const [busy,setBusy]=useState("");
  const [resv,setResv]=useState(null);
  const [rf,setRf]=useState({nom:"",prenom:"",tel:"",email:"",prest:"",note:"",link:""});
  const rfOk=rf.nom.trim()&&rf.prenom.trim()&&rf.tel.trim()&&rf.email.trim();
  const openResv=(di,sj)=>{setRf({nom:"",prenom:"",tel:"",email:"",prest:(d.cfg.prestations[0]&&d.cfg.prestations[0].nom)||"",note:"",link:""});setResv({di,sj});};
  const submitResv=()=>{ if(!rfOk)return; const di=resv.di,sj=resv.sj;
    upd(x=>{ const f=x.cfg.flyers[idx]; const day=f.days[di]; const slot=f.slots[sj]; const cid="c"+Date.now();
      x.clients.push({id:cid,n:rf.prenom+" "+rf.nom,ph:rf.tel,em:rf.email,cr:new Date().toISOString().slice(0,10),bday:"",vis:1,vip:false,tr:false,rf:0,ref:null,photos:[],diag:[],loy:1,rev:[]});
      const pst=x.cfg.prestations.find(p=>p.nom===rf.prest); const pr=pst?pst.prix:0; const time=String(parseInt(slot,10)||0).padStart(2,"0")+":00";
      x.apts.push({id:"a"+Date.now(),cid,date:day.date,time,svc:rf.prest||"Reservation",pr,dep:0,dpd:false,dm:"",pd:false});
      x.reservations.push({id:"r"+Date.now(),date:day.date,dayLabel:day.label,slot,nom:rf.nom,prenom:rf.prenom,tel:rf.tel,email:rf.email,prestation:rf.prest,note:rf.note,depositLink:rf.link,cid,status:"attente",createdAt:new Date().toISOString()});
      f.days[di].avail[sj]=false;
    }); setResv(null);
  };

  const set=(k,v)=>upd(x=>{x.cfg.flyers[idx][k]=v;});
  const onLogo=(key,file)=>{if(!file)return;const r=new FileReader();r.onload=()=>upd(x=>{x.cfg.flyers[idx][key]=r.result;});r.readAsDataURL(file);};

  const capture=async()=>{await (document.fonts?document.fonts.ready:Promise.resolve());return html2canvas(ref.current,{scale:3,backgroundColor:CREAM,useCORS:true,logging:false});};
  const exportPNG=async()=>{try{setBusy("png");const c=await capture();const a=document.createElement("a");a.href=c.toDataURL("image/png");a.download=(fl.name||"flyer")+".png";a.click();}catch(e){alert("Export image impossible : "+e.message);}setBusy("");};
  const exportPDF=async()=>{try{setBusy("pdf");const c=await capture();const pdf=new jsPDF({orientation:"portrait",unit:"px",format:[c.width,c.height]});pdf.addImage(c.toDataURL("image/png"),"PNG",0,0,c.width,c.height);pdf.save((fl.name||"flyer")+".pdf");}catch(e){alert("Export PDF impossible : "+e.message);}setBusy("");};

  const fillFromAgenda=()=>upd(x=>{const f=x.cfg.flyers[idx];f.days.forEach(day=>{f.slots.forEach((s,j)=>{const h=parseInt(s,10);const taken=x.apts.some(a=>a.date===day.date&&parseInt(a.time,10)===h);day.avail[j]=!taken;});});});

  const Field=({lbl,k,area})=>area
    ?<div className="fg" style={{marginBottom:8}}><span className="fl">{lbl}</span><textarea className="fi" style={{minHeight:52,resize:"vertical"}} value={fl[k]} onChange={e=>set(k,e.target.value)}/></div>
    :<div className="fg" style={{marginBottom:8}}><span className="fl">{lbl}</span><input className="fi" value={fl[k]} onChange={e=>set(k,e.target.value)}/></div>;

  return(<div className="pg fade">
    <div className="hdr hdr-sm" style={{display:"flex",alignItems:"center",gap:10}}>
      <span onClick={()=>go("home")} style={{cursor:"pointer",fontSize:22,opacity:.85}}>&lsaquo;</span><h1 style={{margin:0}}>Flyer</h1>
      <select value={fl.template} onChange={e=>set("template",e.target.value)} style={{marginLeft:"auto",background:"rgba(255,255,255,.18)",color:"#fff",border:"1px solid rgba(255,255,255,.4)",borderRadius:10,padding:"6px 10px",fontSize:12}}>
        <option value="grille" style={{color:"#000"}}>Grille dispos</option>
        <option value="liste" style={{color:"#000"}}>Liste dispos</option>
        <option value="pricelist" style={{color:"#000"}}>Price list</option>
        <option value="promo" style={{color:"#000"}}>Promo vitrine</option>
      </select>
    </div>
    <div style={{padding:16}}>

      {/* PREVIEW EN DIRECT */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
        <div style={{boxShadow:"0 10px 30px rgba(0,0,0,.18)",borderRadius:8,overflow:"hidden"}}><FlyerCanvas ref={ref} fl={fl} onSlot={openResv}/></div>
      </div>

      {/* Export */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <button className="btn btn-p" style={{flex:1}} disabled={busy} onClick={exportPNG}>{busy==="png"?"...":"Exporter PNG"}</button>
        <button className="btn btn-p" style={{flex:1}} disabled={busy} onClick={exportPDF}>{busy==="pdf"?"...":"Exporter PDF"}</button>
      </div>

      <div className="card" style={{margin:"0 0 12px"}}><b>Modele du flyer</b>
        <p style={{fontSize:11,color:"#A09080",margin:"2px 0 6px"}}>Glisse pour choisir &rarr;</p>
        <div style={{display:"flex",gap:10,marginTop:2,overflowX:"auto",paddingBottom:8,scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch"}}>
          {[["grille","Grille dispos"],["liste","Liste dispos"],["pricelist","Price list"],["promo","Promo vitrine"]].map(([v,l])=>
            <button key={v} onClick={()=>set("template",v)} style={{scrollSnapAlign:"start",flex:"0 0 auto",minWidth:120,padding:"14px 16px",borderRadius:14,border:fl.template===v?"none":"1px solid #E4D4F0",background:fl.template===v?"linear-gradient(135deg,#5A2070,#9B60C0)":"#fff",color:fl.template===v?"#fff":"#5A2070",fontWeight:700,fontSize:13,cursor:"pointer"}}>{l}</button>)}
        </div>
      </div>
      {/* Selecteur de flyer */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Mes flyers</b>
        <div className="fr" style={{marginTop:8}}>
          <select className="fi" value={idx} onChange={e=>setSi(+e.target.value)}>{flyers.map((f,i)=><option key={f.id} value={i}>{f.name||"Sans nom"}</option>)}</select>
          <div style={{display:"flex",gap:6}}>
            <button className="btn btn-s sm" onClick={()=>{upd(x=>{const c=JSON.parse(JSON.stringify(x.cfg.flyers[idx]));c.id="f"+Date.now();c.name=(c.name||"Flyer")+" (copie)";x.cfg.flyers.push(c);});setSi(flyers.length)}}>+ Nouveau</button>
            <button className="btn btn-d sm" disabled={flyers.length<=1} onClick={()=>{upd(x=>{x.cfg.flyers.splice(idx,1);});setSi(Math.max(0,idx-1))}}>Suppr</button>
          </div>
        </div>
        <div style={{marginTop:8}}><input className="fi" value={fl.name} onChange={e=>set("name",e.target.value)} placeholder="Nom du flyer"/></div>
      </div>

      {fl.template==="grille"&&(<>
      {/* Collab + logos */}
      <div className="card" style={{margin:"0 0 12px"}}><b>En-tete</b>
        <label style={{display:"flex",alignItems:"center",gap:8,margin:"8px 0",fontSize:13}}><input type="checkbox" checked={fl.collab} onChange={e=>set("collab",e.target.checked)}/> Collaboration (2 logos)</label>
        <div style={{display:"flex",gap:10,marginBottom:8}}>
          <div style={{flex:1}}><span className="fl">Logo Fresita</span>{fl.logoB&&<img src={fl.logoB} style={{maxHeight:34,display:"block",margin:"4px 0"}}/>}<input type="file" accept="image/*" style={{fontSize:11}} onChange={e=>onLogo("logoB",e.target.files[0])}/>{fl.logoB&&<button className="btn btn-d sm" style={{marginTop:4,fontSize:9}} onClick={()=>set("logoB","")}>Retirer</button>}</div>
          {fl.collab&&<div style={{flex:1}}><span className="fl">Logo partenaire</span>{fl.logoA&&<img src={fl.logoA} style={{maxHeight:34,display:"block",margin:"4px 0"}}/>}<input type="file" accept="image/*" style={{fontSize:11}} onChange={e=>onLogo("logoA",e.target.files[0])}/>{fl.logoA&&<button className="btn btn-d sm" style={{marginTop:4,fontSize:9}} onClick={()=>set("logoA","")}>Retirer</button>}</div>}
        </div>
        <Field lbl="Titre (bandeau)" k="title"/>
        {fl.collab&&<Field lbl="Label collab" k="exclusiveLabel"/>}
        <Field lbl="Accroche (boite noire)" k="tagline" area/>
        <Field lbl="Grand titre" k="bigTitle"/>
        <Field lbl="Periode" k="period"/>
      </div>

      {/* Lieu */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Lieu</b>
        <div style={{marginTop:8}}><Field lbl="Nom du lieu" k="locName"/><Field lbl="Ville" k="locCity"/><Field lbl="Accroche RDV" k="cta"/></div>
      </div>

      {/* Creneaux */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Creneaux horaires</b>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
          {fl.slots.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:2}}><input className="fi" style={{width:56,padding:"6px"}} value={s} onChange={e=>upd(x=>{x.cfg.flyers[idx].slots[i]=e.target.value;})}/><button className="btn btn-d sm" style={{padding:"4px 6px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.flyers[idx].slots.splice(i,1);x.cfg.flyers[idx].days.forEach(dd=>dd.avail.splice(i,1));})}>x</button></div>)}
        </div>
        <button className="btn btn-s sm" style={{marginTop:8}} onClick={()=>upd(x=>{x.cfg.flyers[idx].slots.push("00H");x.cfg.flyers[idx].days.forEach(dd=>dd.avail.push(false));})}>+ Creneau</button>
      </div>

      {/* Jours + dispo */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Jours & disponibilites</b>
        <button className="btn btn-p sm" style={{margin:"8px 0"}} onClick={fillFromAgenda}>Remplir depuis mon agenda</button>
        {fl.days.map((day,i)=>(
          <div key={i} style={{background:"#F8F4FC",borderRadius:12,padding:"8px 10px",marginBottom:8}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <input className="fi" type="date" style={{width:130,padding:"6px"}} value={day.date} onChange={e=>upd(x=>{x.cfg.flyers[idx].days[i].date=e.target.value;})}/>
              <button className="btn btn-d sm" style={{marginLeft:"auto",padding:"4px 7px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.flyers[idx].days.splice(i,1);})}>x</button>
            </div>
            <input className="fi" style={{marginBottom:6}} value={day.label} onChange={e=>upd(x=>{x.cfg.flyers[idx].days[i].label=e.target.value;})} placeholder="LUNDI 03 AOUT"/>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {fl.slots.map((s,j)=><label key={j} style={{display:"flex",alignItems:"center",gap:3,fontSize:11}}><input type="checkbox" checked={!!day.avail[j]} onChange={e=>upd(x=>{x.cfg.flyers[idx].days[i].avail[j]=e.target.checked;})}/>{s}</label>)}
            </div>
          </div>))}
        <button className="btn btn-s sm" onClick={()=>upd(x=>{const f=x.cfg.flyers[idx];f.days.push({date:"",label:"NOUVEAU JOUR",avail:f.slots.map(()=>false)});})}>+ Ajouter un jour</button>
      </div>

      {/* Prestations */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Prestations affichees</b>
        <button className="btn btn-s sm" style={{margin:"8px 0"}} onClick={()=>upd(x=>{x.cfg.flyers[idx].prestations=x.cfg.prestations.map(p=>p.nom.toUpperCase());})}>Reprendre mon catalogue</button>
        {fl.prestations.map((p,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6}}><input className="fi" style={{flex:1}} value={p} onChange={e=>upd(x=>{x.cfg.flyers[idx].prestations[i]=e.target.value;})}/><button className="btn btn-d sm" style={{padding:"4px 7px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.flyers[idx].prestations.splice(i,1);})}>x</button></div>)}
        <button className="btn btn-s sm" onClick={()=>upd(x=>{x.cfg.flyers[idx].prestations.push("NOUVELLE PRESTATION");})}>+ Ajouter</button>
      </div>

      {/* Acompte */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Acompte / reservation</b>
        <div style={{marginTop:8}}>
          <Field lbl="Titre" k="acompteTitle"/>
          <Field lbl="Texte" k="acompteText"/>
          <div className="fg" style={{marginBottom:8}}><span className="fl">Acompte %</span><input className="fi" type="number" value={fl.acomptePct} onChange={e=>set("acomptePct",e.target.value===""?"":parseInt(e.target.value)||0)}/></div>
          <Field lbl="Note bas" k="acompteNote" area/>
        </div>
      </div>

      {/* Contact + footer */}
      <div className="card" style={{margin:"0 0 12px"}}><b>Contact & bas de page</b>
        <div style={{marginTop:8}}><Field lbl="Ligne contact" k="contactText" area/></div>
        {fl.footer.map((f,i)=><div key={i} style={{marginBottom:6}}><input className="fi" value={f} onChange={e=>upd(x=>{x.cfg.flyers[idx].footer[i]=e.target.value;})}/></div>)}
      </div>

      <p style={{fontSize:11,color:"#A09080",textAlign:"center"}}>Les logos sont stockes dans le telephone. Garde-les legers.</p>
      </>)}

      {fl.template==="pricelist"&&(<>
      <div className="card" style={{margin:"0 0 12px"}}><b>Price list — en-tete</b>
        <div style={{marginTop:8}}>
          <div style={{marginBottom:10}}><span className="fl">Style</span><div style={{display:"flex",gap:8,marginTop:4}}>{[["bars","Barres couleur"],["minimal","Minimal (photos)"],["aurea","Aurea 2 col"],["beautyspot","Beauty Spot"],["princess","Nails Princess"]].map(([v,l])=><button key={v} onClick={()=>set("plStyle",v)} className="btn sm" style={{background:(fl.plStyle||"bars")===v?"linear-gradient(135deg,#5A2070,#9B60C0)":"#F0E4FA",color:(fl.plStyle||"bars")===v?"#fff":"#5A2070",padding:"6px 12px"}}>{l}</button>)}</div></div>
          <div className="fg" style={{marginBottom:8}}><span className="fl">Titre</span><input className="fi" value={fl.plTitle} onChange={e=>set("plTitle",e.target.value)}/></div>
          <div className="fg" style={{marginBottom:8}}><span className="fl">Sous-titre</span><input className="fi" value={fl.plSubtitle} onChange={e=>set("plSubtitle",e.target.value)}/></div>
          <div className="fg"><span className="fl">Couleur (theme)</span><input className="fi" type="color" style={{height:40,padding:3}} value={fl.plTheme} onChange={e=>set("plTheme",e.target.value)}/></div>
        </div>
      </div>
      <div className="card" style={{margin:"0 0 12px"}}><b>Categories & prix</b>
        <button className="btn btn-p sm" style={{margin:"8px 0"}} onClick={()=>upd(x=>{x.cfg.flyers[idx].plCategories=x.cfg.formules.map((f2,k)=>({id:"pc"+Date.now()+k,name:f2.title,photo:"",items:f2.lengths.map(l=>({label:l.label,prix:l.prix}))}));})}>Reprendre mes formules</button>
        {fl.plCategories.map((cat,ci)=>
          <div key={cat.id} style={{background:"#F8F4FC",borderRadius:14,padding:"10px 12px",marginBottom:10}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
              <input className="fi" style={{flex:1,minWidth:0}} value={cat.name} onChange={e=>upd(x=>{x.cfg.flyers[idx].plCategories[ci].name=e.target.value;})} placeholder="Categorie"/>
              <button className="btn btn-d sm" style={{padding:"4px 7px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.flyers[idx].plCategories.splice(ci,1);})}>X</button>
            </div>
            <div style={{marginBottom:8}}><span className="fl">Photo (option)</span>{cat.photo&&<img src={cat.photo} style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",display:"block",margin:"4px 0"}}/>}<input type="file" accept="image/*" style={{fontSize:11}} onChange={e=>{const fi=e.target.files[0];if(fi){const r=new FileReader();r.onload=()=>upd(x=>{x.cfg.flyers[idx].plCategories[ci].photo=r.result;});r.readAsDataURL(fi);}}}/>{cat.photo&&<button className="btn btn-d sm" style={{marginLeft:6,fontSize:9}} onClick={()=>upd(x=>{x.cfg.flyers[idx].plCategories[ci].photo="";})}>Retirer</button>}</div>
            {cat.items.map((it,ii)=>
              <div key={ii} style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
                <input className="fi" style={{flex:1,minWidth:0,padding:"7px 8px"}} value={it.label} onChange={e=>upd(x=>{x.cfg.flyers[idx].plCategories[ci].items[ii].label=e.target.value;})} placeholder="Prestation"/>
                <input className="fi" style={{width:60,padding:"7px 6px"}} type="number" value={it.prix} onChange={e=>upd(x=>{x.cfg.flyers[idx].plCategories[ci].items[ii].prix=e.target.value===""?"":parseInt(e.target.value)||0;})}/>
                <button className="btn btn-d sm" style={{padding:"3px 6px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.flyers[idx].plCategories[ci].items.splice(ii,1);})}>x</button>
              </div>)}
            <button className="btn btn-s sm" style={{fontSize:10}} onClick={()=>upd(x=>{x.cfg.flyers[idx].plCategories[ci].items.push({label:"Nouvelle ligne",prix:0});})}>+ Ligne</button>
          </div>)}
        <button className="btn btn-s sm" onClick={()=>upd(x=>{x.cfg.flyers[idx].plCategories.push({id:"pc"+Date.now(),name:"NOUVELLE CATEGORIE",photo:"",items:[{label:"Prestation",prix:0}]});})}>+ Ajouter une categorie</button>
      </div>
      <div className="card" style={{margin:"0 0 12px"}}><b>Bas de page</b>
        <div style={{marginTop:8}}>
          <div className="fg" style={{marginBottom:8}}><span className="fl">Contact (@)</span><input className="fi" value={fl.plContact} onChange={e=>set("plContact",e.target.value)}/></div>
          <div className="fg"><span className="fl">Note</span><input className="fi" value={fl.plFooter} onChange={e=>set("plFooter",e.target.value)}/></div>
        </div>
      </div>
      </>)}

      {fl.template==="liste"&&(<>
      <div className="card" style={{margin:"0 0 12px"}}><b>Liste dispos — textes</b>
        <div style={{margin:"8px 0"}}><span className="fl">Logo Fresita</span>{fl.logoB&&<img src={fl.logoB} style={{maxHeight:34,display:"block",margin:"4px 0"}}/>}<input type="file" accept="image/*" style={{fontSize:11}} onChange={e=>onLogo("logoB",e.target.files[0])}/>{fl.logoB&&<button className="btn btn-d sm" style={{marginTop:4,fontSize:9}} onClick={()=>set("logoB","")}>Retirer</button>}</div>
        <Field lbl="Periode" k="period"/>
        <Field lbl="Message ATTENTION" k="attn" area/>
        <Field lbl="Badge rond" k="listBadge"/>
        <Field lbl="Phrase du bas" k="listFooter" area/>
        <Field lbl="Accroche finale" k="cta"/>
      </div>
      <div className="card" style={{margin:"0 0 12px"}}><b>Creneaux horaires</b>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
          {fl.slots.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:2}}><input className="fi" style={{width:56,padding:"6px"}} value={s} onChange={e=>upd(x=>{x.cfg.flyers[idx].slots[i]=e.target.value;})}/><button className="btn btn-d sm" style={{padding:"4px 6px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.flyers[idx].slots.splice(i,1);x.cfg.flyers[idx].days.forEach(dd=>dd.avail.splice(i,1));})}>x</button></div>)}
        </div>
        <button className="btn btn-s sm" style={{marginTop:8}} onClick={()=>upd(x=>{x.cfg.flyers[idx].slots.push("00H");x.cfg.flyers[idx].days.forEach(dd=>dd.avail.push(false));})}>+ Creneau</button>
      </div>
      <div className="card" style={{margin:"0 0 12px"}}><b>Jours & disponibilites</b>
        <button className="btn btn-p sm" style={{margin:"8px 0"}} onClick={fillFromAgenda}>Remplir depuis mon agenda</button>
        {fl.days.map((day,i)=>(
          <div key={i} style={{background:"#F8F4FC",borderRadius:12,padding:"8px 10px",marginBottom:8}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <input className="fi" type="date" style={{width:130,padding:"6px"}} value={day.date} onChange={e=>upd(x=>{x.cfg.flyers[idx].days[i].date=e.target.value;})}/>
              <button className="btn btn-d sm" style={{marginLeft:"auto",padding:"4px 7px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.flyers[idx].days.splice(i,1);})}>x</button>
            </div>
            <input className="fi" style={{marginBottom:6}} value={day.label} onChange={e=>upd(x=>{x.cfg.flyers[idx].days[i].label=e.target.value;})} placeholder="LUNDI 03 AOUT"/>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {fl.slots.map((s,j)=><label key={j} style={{display:"flex",alignItems:"center",gap:3,fontSize:11}}><input type="checkbox" checked={!!day.avail[j]} onChange={e=>upd(x=>{x.cfg.flyers[idx].days[i].avail[j]=e.target.checked;})}/>{s}</label>)}
            </div>
          </div>))}
        <button className="btn btn-s sm" onClick={()=>upd(x=>{const ff=x.cfg.flyers[idx];ff.days.push({date:"",label:"NOUVEAU JOUR",avail:ff.slots.map(()=>false)});})}>+ Ajouter un jour</button>
      </div>
      </>)}

      {fl.template==="promo"&&(<>
      <div className="card" style={{margin:"0 0 12px"}}><b>Promo — visuel & textes</b>
        <div style={{margin:"8px 0"}}><span className="fl">Photo principale</span>{fl.promoPhoto&&<img src={fl.promoPhoto} style={{width:"100%",maxHeight:120,objectFit:"cover",borderRadius:8,display:"block",margin:"4px 0"}}/>}<input type="file" accept="image/*" style={{fontSize:11}} onChange={e=>{const fi=e.target.files[0];if(fi){const r=new FileReader();r.onload=()=>upd(x=>{x.cfg.flyers[idx].promoPhoto=r.result;});r.readAsDataURL(fi);}}}/>{fl.promoPhoto&&<button className="btn btn-d sm" style={{marginLeft:6,fontSize:9}} onClick={()=>set("promoPhoto","")}>Retirer</button>}</div>
        <div className="fg" style={{marginBottom:8}}><span className="fl">Couleur de fond</span><input className="fi" type="color" style={{height:40,padding:3}} value={fl.promoTheme} onChange={e=>set("promoTheme",e.target.value)}/></div>
        <Field lbl="Nom (script)" k="promoName"/>
        <Field lbl="Sous-titre" k="promoTagline"/>
        <Field lbl="Bouton (call to action)" k="promoCTA"/>
      </div>
      <div className="card" style={{margin:"0 0 12px"}}><b>Services</b>
        {fl.promoServices.map((s,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6}}><input className="fi" style={{flex:1}} value={s} onChange={e=>upd(x=>{x.cfg.flyers[idx].promoServices[i]=e.target.value;})}/><button className="btn btn-d sm" style={{padding:"4px 7px",fontSize:9}} onClick={()=>upd(x=>{x.cfg.flyers[idx].promoServices.splice(i,1);})}>x</button></div>)}
        <button className="btn btn-s sm" onClick={()=>upd(x=>{x.cfg.flyers[idx].promoServices.push("Nouveau service");})}>+ Ajouter</button>
      </div>
      <div className="card" style={{margin:"0 0 12px"}}><b>Contact</b>
        <div style={{marginTop:8}}>
          <Field lbl="Facebook" k="promoFB"/>
          <Field lbl="Telephone" k="promoPhone"/>
          <Field lbl="Instagram" k="promoIG"/>
          <Field lbl="Adresse" k="promoAddress"/>
        </div>
      </div>
      </>)}

      {resv&&(()=>{const day=fl.days[resv.di];const slot=fl.slots[resv.sj];return(
        <div className="more-overlay" onClick={()=>setResv(null)}><div className="more-sheet" onClick={e=>e.stopPropagation()}>
          <div style={{width:40,height:4,background:"#D4B8E8",borderRadius:2,margin:"0 auto 14px"}}/>
          <b style={{fontFamily:"'Fraunces',serif",fontSize:18}}>Reservation</b>
          <p style={{fontSize:12,color:"#7A6488",margin:"2px 0 12px"}}>{day.label} &middot; {slot}</p>
          <div className="fg" style={{marginBottom:8}}><span className="fl">Prenom *</span><input className="fi" value={rf.prenom} onChange={e=>setRf({...rf,prenom:e.target.value})}/></div>
          <div className="fg" style={{marginBottom:8}}><span className="fl">Nom *</span><input className="fi" value={rf.nom} onChange={e=>setRf({...rf,nom:e.target.value})}/></div>
          <div className="fg" style={{marginBottom:8}}><span className="fl">Numero *</span><input className="fi" type="tel" value={rf.tel} onChange={e=>setRf({...rf,tel:e.target.value})}/></div>
          <div className="fg" style={{marginBottom:8}}><span className="fl">Email *</span><input className="fi" type="email" value={rf.email} onChange={e=>setRf({...rf,email:e.target.value})}/></div>
          <div className="fg" style={{marginBottom:8}}><span className="fl">Prestation</span><select className="fi" value={rf.prest} onChange={e=>setRf({...rf,prest:e.target.value})}>{d.cfg.prestations.map(p=><option key={p.id} value={p.nom}>{p.nom} ({p.prix}EUR)</option>)}</select></div>
          <div className="fg" style={{marginBottom:8}}><span className="fl">Note</span><textarea className="fi" style={{minHeight:44,resize:"vertical"}} value={rf.note} onChange={e=>setRf({...rf,note:e.target.value})}/></div>
          <div className="fg" style={{marginBottom:12}}><span className="fl">Lien d'acompte (a coller)</span><input className="fi" value={rf.link} onChange={e=>setRf({...rf,link:e.target.value})} placeholder="https://..."/></div>
          {!rfOk&&<p style={{fontSize:11,color:"#C0392B",marginBottom:8}}>Prenom, nom, numero et email obligatoires.</p>}
          <button className="btn btn-p full" disabled={!rfOk} onClick={submitResv}>Valider la reservation</button>
        </div></div>);})()}
    </div>
  </div>);
}
