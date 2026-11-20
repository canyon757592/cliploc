(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- suivi d'entonnoir (à brancher plus tard sur la base) ---------- */
const EV=[];window.__events=EV;
/* Mesure d'audience anonyme : seule l'étape atteinte est envoyée, avec un identifiant aléatoire propre à la visite.
   Rien n'est envoyé en local, ni si le navigateur demande « Ne pas suivre ». */
const SB_URL="https://jfvzharrtvltotolfruz.supabase.co",SB_KEY="sb_publishable_q23wdg3QdKuxTfJX7y-CAQ_2vpP5K-U";
const FUNNEL={view_lp:"landing",link_pasted:"link_pasted",analysis_done:"analysis",cfg_done:"config",montage_done:"montage",gate_view:"gate",signup:"signup",pay_view:"pay_view",pay_success:"paid",render_done:"render",download:"download"};
const SENT=new Set();
const SID=(()=>{let s=null;try{s=sessionStorage.getItem("vt_sid")}catch(e){}if(!s||!/^[a-z0-9]{12,32}$/.test(s)){const a=new Uint8Array(16);crypto.getRandomValues(a);s=Array.from(a,x=>(x%36).toString(36)).join("");try{sessionStorage.setItem("vt_sid",s)}catch(e){}}return s})();
const noTrack=()=>/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)||navigator.doNotTrack==="1"||window.doNotTrack==="1"||navigator.globalPrivacyControl===true;
function sendStep(step){if(!step||SENT.has(step)||noTrack())return;SENT.add(step);try{fetch(SB_URL+"/rest/v1/rpc/log_funnel_event",{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY},body:JSON.stringify({p_session:SID,p_step:step}),keepalive:true}).catch(()=>{})}catch(e){}}
function track(n,p){EV.push({n:n,p:p||{},t:Date.now()});sendStep(FUNNEL[n]);try{console.debug("[track]",n,p||"")}catch(e){}}

/* ---------- prix ---------- */
const END=new Date("2026-11-30T23:59:59+01:00").getTime(),BFR=.4;
const bfOn=()=>Date.now()<END;
const DUR=[{s:15,p:6,d:"Un teaser percutant pour les réseaux."},{s:30,p:12,d:"Le format idéal pour une annonce.",tg:"POPULAIRE"},{s:45,p:18,d:"Plus de pièces, plus de détails."},{s:60,p:24,d:"La visite complète du logement."}];
const QUA=[{k:"hd",l:"HD",r:"720p",x:0,d:"Léger, parfait pour les stories."},{k:"fhd",l:"Full HD",r:"1080p",x:6,d:"Le standard Instagram et TikTok.",tg:"CONSEILLÉ"},{k:"4k",l:"4K",r:"2160p",x:18,d:"Netteté maximale, grands écrans."}];
const r2=n=>Math.round(n*100)/100;
const eur=n=>r2(n).toFixed(2).replace(".",",").replace(",00","")+" €";
const sale=b=>bfOn()?r2(b*(1-BFR)):b;
const pHTML=b=>bfOn()?"<s>"+eur(b)+"</s><b>"+eur(sale(b))+"</b>":"<b>"+eur(b)+"</b>";
const PLANS=[
 {k:"unit",r:0,n:"Une vidéo",d:"Tu paies seulement la vidéo que tu crées.",p:null,f:["Rendu : montage diaporama de tes photos","Durée de 15 à 60 s","HD et Full HD (pas de 4K)","Styles Dynamique et Visite","3 couleurs : Naturel, Chaleureux, Frais","Sans filigrane, sans bordure","-Formation Airbnb non incluse"]},
 {k:"essentiel",r:1,n:"Essentiel",d:"12 crédits chaque mois, arrêt à tout moment.",reg:69,lp:39.99,u:"/ mois",c:12,m:true,f:["12 crédits chaque mois, non utilisés = conservés","Rendu : montage diaporama de tes photos","Les 4 styles : Drone et Cinéma inclus","Les 6 couleurs","HD et Full HD (pas de 4K)","-Formation Airbnb non incluse","Tu arrêtes quand tu veux"]},
 {k:"pro",r:2,n:"Pro",d:"40 crédits chaque mois + la formation offerte.",reg:179,lp:99.99,u:"/ mois",c:40,m:true,ebook:true,f:["40 crédits chaque mois, non utilisés = conservés","Montage diaporama + Animation IA en option","Les 4 styles et les 6 couleurs","4K débloquée","Formation Airbnb offerte (PDF de 44 pages)","Tu arrêtes quand tu veux"],hot:true,bd:"LE PLUS CHOISI"},
 {k:"agence",r:3,n:"Agence",d:"120 crédits chaque mois, arrêt à tout moment.",reg:299,lp:179.99,u:"/ mois",c:120,m:true,ebook:true,f:["120 crédits chaque mois, non utilisés = conservés","Montage diaporama + Animation IA en option","Tout est débloqué : styles, couleurs, 4K","Formation Airbnb offerte","Historique de tous tes projets","Tu arrêtes quand tu veux"],bd:"MEILLEUR PRIX"}
];

PLANS.forEach(p=>{if(p.reg){Object.defineProperty(p,"p",{get(){return bfOn()?p.lp:p.reg},enumerable:true});Object.defineProperty(p,"per",{get(){return p.p/p.c},enumerable:true})}});
/* ---------- décors (illustrations) ---------- */
const SC=[
 {bg:"linear-gradient(180deg,#EFE6D8,#D8C9B4)",s:`<defs><linearGradient id="w@@" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0E7DA"/><stop offset="1" stop-color="#D8C9B4"/></linearGradient><linearGradient id="f@@" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#AB835B"/><stop offset="1" stop-color="#76573A"/></linearGradient><linearGradient id="s@@" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A9893"/><stop offset="1" stop-color="#4F6D68"/></linearGradient><filter id="b@@"><feGaussianBlur stdDeviation="1.5"/></filter></defs><rect width="100" height="160" fill="url(#w@@)"/><rect y="108" width="100" height="52" fill="url(#f@@)"/><path d="M0 120H100M0 134H100M0 150H100M30 108L10 160M60 108L56 160M90 108L104 160" stroke="#5E4429" stroke-opacity=".3" stroke-width=".4"/><rect x="14" y="30" width="22" height="30" fill="#FBF8F1"/><rect x="16" y="32" width="18" height="26" fill="#D3A27F"/><circle cx="25" cy="42" r="5" fill="#EBD0A5"/><rect x="56" y="20" width="34" height="58" fill="#FBF6EA"/><rect x="58.5" y="22.5" width="29" height="53" fill="#BBD9EA"/><rect x="58.5" y="50" width="29" height="25.500" fill="#7FA77A" filter="url(#b@@)"/><path d="M73 22V76M58 48H88" stroke="#FBF6EA" stroke-width="1.6"/><polygon points="56,78 90,78 100,132 36,132" fill="#FFF3D0" opacity=".26" filter="url(#b@@)"/><ellipse cx="38" cy="134" rx="36" ry="8" fill="#D8C5A6"/><ellipse cx="34" cy="106" rx="31" ry="3" fill="#000" opacity=".28" filter="url(#b@@)"/><rect x="8" y="74" width="52" height="20" rx="7" fill="url(#s@@)"/><rect x="4" y="88" width="60" height="18" rx="6" fill="#5C7C76"/><rect x="2" y="82" width="9" height="24" rx="4" fill="#52726C"/><rect x="57" y="82" width="9" height="24" rx="4" fill="#52726C"/><rect x="13" y="78" width="14" height="12" rx="4" fill="#E2B35E"/><rect x="40" y="79" width="14" height="11" rx="4" fill="#F1EBDF"/><rect x="24" y="120" width="32" height="3" rx="1" fill="#3F2D1F"/><rect x="26" y="123" width="2" height="7" fill="#3F2D1F"/><rect x="52" y="123" width="2" height="7" fill="#3F2D1F"/><rect x="36" y="113" width="6" height="7" rx="2" fill="#F2EBDD"/><rect x="88" y="94" width="9" height="14" rx="2" fill="#CDBBA2"/><g filter="url(#b@@)" opacity=".95"><ellipse cx="92" cy="84" rx="7" ry="11" fill="#4B7752"/><ellipse cx="86" cy="88" rx="5" ry="8" fill="#5C8A62"/></g>`},
 {bg:"linear-gradient(180deg,#9CC4DB,#F6E4C8)",s:`<defs><linearGradient id="a@@" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DC3DA"/><stop offset="1" stop-color="#F7E6CB"/></linearGradient><linearGradient id="p@@" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86D8DC"/><stop offset="1" stop-color="#1F8DA6"/></linearGradient><filter id="b@@"><feGaussianBlur stdDeviation="1.4"/></filter></defs><rect width="100" height="160" fill="url(#a@@)"/><g filter="url(#b@@)"><ellipse cx="6" cy="44" rx="12" ry="18" fill="#3C6642"/><rect x="92" y="28" width="2.4" height="50" fill="#5C4630"/><ellipse cx="93" cy="28" rx="13" ry="7" fill="#436F49"/></g><rect y="40" width="100" height="38" fill="#F2EBDD"/><rect y="36" width="100" height="5" fill="#C9B79C"/><rect x="8" y="50" width="22" height="26" fill="#F5D890"/><rect x="38" y="50" width="22" height="26" fill="#F0CB7C"/><rect x="68" y="50" width="24" height="26" fill="#EBC273"/><path d="M19 50V76M49 50V76M80 50V76" stroke="#F2EBDD" stroke-width="1.2"/><rect y="76" width="100" height="15" fill="#C9A77D"/><path d="M0 83H100" stroke="#A98A62" stroke-opacity=".5" stroke-width=".4"/><polygon points="10,91 90,91 100,160 0,160" fill="url(#p@@)"/><rect x="20" y="96" width="60" height="24" fill="#F5D890" opacity=".28" filter="url(#b@@)"/><path d="M16 104q8-3 16 0t16 0 16 0 16 0M10 120q10-3 20 0t20 0 20 0 20 0M4 140q12-3 24 0t24 0 24 0 24 0" stroke="#fff" stroke-opacity=".42" fill="none" stroke-width=".8"/><polygon points="9,91 91,91 92,94 8,94" fill="#EFE7D8"/><rect x="2" y="82" width="22" height="5" rx="2" fill="#fff"/><rect x="2" y="78" width="9" height="5" rx="2" fill="#fff"/><rect x="76" y="82" width="22" height="5" rx="2" fill="#fff"/>`},
 {bg:"linear-gradient(180deg,#EADFCF,#D9CAB5)",s:`<defs><linearGradient id="w@@" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBE0D0"/><stop offset="1" stop-color="#D9CAB5"/></linearGradient><radialGradient id="l@@"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".85"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></radialGradient><filter id="b@@"><feGaussianBlur stdDeviation="1.4"/></filter></defs><rect width="100" height="160" fill="url(#w@@)"/><rect y="124" width="100" height="36" fill="#A67C52"/><rect x="34" y="12" width="32" height="24" fill="#FBF8F1"/><rect x="36" y="14" width="28" height="20" fill="#CE946F"/><circle cx="50" cy="25" r="6" fill="#EBD0A5"/><rect x="14" y="44" width="72" height="34" rx="5" fill="#8B6A4F"/><ellipse cx="50" cy="127" rx="44" ry="4" fill="#000" opacity=".28" filter="url(#b@@)"/><ellipse cx="50" cy="140" rx="46" ry="9" fill="#CCB89B"/><rect x="10" y="72" width="80" height="53" rx="6" fill="#F8F4EB"/><rect x="10" y="94" width="80" height="14" fill="#E8E1D2"/><rect x="10" y="107" width="80" height="9" fill="#C9805F"/><rect x="16" y="66" width="30" height="15" rx="6" fill="#fff"/><rect x="54" y="66" width="30" height="15" rx="6" fill="#fff"/><rect x="40" y="73" width="20" height="11" rx="5" fill="#9DB6A8"/><rect x="0" y="84" width="9" height="24" fill="#7A5B3C"/><rect x="91" y="84" width="9" height="24" fill="#7A5B3C"/><circle cx="5" cy="74" r="16" fill="url(#l@@)"/><circle cx="95" cy="74" r="16" fill="url(#l@@)"/><rect x="2.500" y="74" width="5" height="9" fill="#F7E4B5"/><rect x="92.500" y="74" width="5" height="9" fill="#F7E4B5"/><rect x="0" y="0" width="12" height="100" fill="#D8C8AE" opacity=".9"/><path d="M4 0V100M8 0V100" stroke="#BFAE92" stroke-width=".6"/>`},
 {bg:"linear-gradient(180deg,#EDE8DE,#CFC6B4)",s:`<defs><linearGradient id="c@@" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F5853"/><stop offset="1" stop-color="#244541"/></linearGradient><radialGradient id="l@@"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".8"/><stop offset="1" stop-color="#FFE3A0" stop-opacity="0"/></radialGradient><filter id="b@@"><feGaussianBlur stdDeviation="1.4"/></filter></defs><rect width="100" height="160" fill="#EDE8DE"/><path d="M0 44H100M0 54H100M0 64H100M0 74H100M10 40V80M30 40V80M50 40V80M70 40V80M90 40V80" stroke="#D3CBBB" stroke-width=".4"/><rect y="10" width="100" height="28" fill="#F7F4EC"/><path d="M25 10V38M50 10V38M75 10V38" stroke="#DDD7C8" stroke-width=".6"/><rect x="22" y="30" width="2" height="5" fill="#B8A27A"/><rect x="47" y="30" width="2" height="5" fill="#B8A27A"/><rect x="72" y="30" width="2" height="5" fill="#B8A27A"/><rect y="82" width="100" height="40" fill="url(#c@@)"/><path d="M33 82V122M66 82V122" stroke="#1B3532" stroke-width=".6"/><rect y="78" width="100" height="5" fill="#E4DFD3"/><rect x="14" y="62" width="6" height="16" rx="2" fill="#B8A27A"/><rect x="72" y="66" width="12" height="12" rx="2" fill="#E9E3D3"/><rect y="122" width="100" height="38" fill="#B8946A"/><path d="M30 0V20M50 0V24M70 0V20" stroke="#4B3A2A" stroke-width=".6"/><path d="M24 20h12l3 7H21zM44 24h12l3 7H41zM64 20h12l3 7H61z" fill="#E7B04C"/><circle cx="30" cy="30" r="12" fill="url(#l@@)"/><circle cx="50" cy="34" r="12" fill="url(#l@@)"/><circle cx="70" cy="30" r="12" fill="url(#l@@)"/><ellipse cx="50" cy="142" rx="42" ry="3" fill="#000" opacity=".3" filter="url(#b@@)"/><rect x="10" y="108" width="80" height="34" fill="#F3EFE6"/><rect x="6" y="103" width="88" height="6" fill="#D5CDBB"/><ellipse cx="30" cy="102" rx="8" ry="2.500" fill="#fff"/><circle cx="28" cy="99" r="2.800" fill="#D9573F"/><circle cx="33" cy="99.500" r="2.600" fill="#E9B44C"/><g fill="#6A4C33"><rect x="18" y="146" width="12" height="3" rx="1.500"/><rect x="44" y="146" width="12" height="3" rx="1.500"/><rect x="70" y="146" width="12" height="3" rx="1.500"/></g>`},
 {bg:"linear-gradient(180deg,#F6C9A0,#BFD9E8)",s:`<defs><linearGradient id="a@@" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4C69E"/><stop offset="1" stop-color="#BFD9E8"/></linearGradient><linearGradient id="m@@" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B9DB5"/><stop offset="1" stop-color="#2F7691"/></linearGradient><filter id="b@@"><feGaussianBlur stdDeviation="1.5"/></filter></defs><rect width="100" height="160" fill="url(#a@@)"/><circle cx="68" cy="52" r="11" fill="#FFF0CC" filter="url(#b@@)"/><circle cx="68" cy="52" r="6" fill="#FFF8E2"/><path d="M0 66q20-12 40-4t60-8V70H0z" fill="#86A1A6" opacity=".9"/><rect y="66" width="100" height="26" fill="url(#m@@)"/><rect x="62" y="66" width="14" height="26" fill="#FFE9B8" opacity=".4" filter="url(#b@@)"/><path d="M0 74h100M0 82h100" stroke="#fff" stroke-opacity=".25" stroke-width=".5"/><rect y="92" width="100" height="68" fill="#BE9C75"/><path d="M0 106H100M0 122H100M0 142H100" stroke="#8C6C48" stroke-opacity=".35" stroke-width=".5"/><rect y="86" width="100" height="4" fill="#8C6A48"/><path d="M8 86V104M30 86V104M52 86V104M74 86V104M94 86V104" stroke="#8C6A48" stroke-width="2"/><ellipse cx="50" cy="146" rx="22" ry="3" fill="#000" opacity=".28" filter="url(#b@@)"/><ellipse cx="50" cy="130" rx="19" ry="5.500" fill="#F7F3EA"/><rect x="49" y="131" width="2" height="14" fill="#8C6A48"/><rect x="38" y="126" width="5" height="4" rx="1" fill="#C98258"/><rect x="56" y="126" width="5" height="4" rx="1" fill="#F2EBDD"/><rect x="14" y="124" width="14" height="4" rx="2" fill="#6E5236"/><rect x="14" y="108" width="3" height="20" fill="#6E5236"/><rect x="72" y="124" width="14" height="4" rx="2" fill="#6E5236"/><rect x="83" y="108" width="3" height="20" fill="#6E5236"/><rect x="88" y="136" width="9" height="12" rx="2" fill="#C8B49A"/><g filter="url(#b@@)"><ellipse cx="92" cy="128" rx="6" ry="9" fill="#5A8B5E"/></g>`},
 {bg:"linear-gradient(180deg,#E3E7E4,#C8CFCB)",s:`<defs><radialGradient id="l@@"><stop offset="0" stop-color="#FFE7B0" stop-opacity=".8"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient><linearGradient id="t@@" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8E8E3"/></linearGradient><filter id="b@@"><feGaussianBlur stdDeviation="1.4"/></filter></defs><rect width="100" height="160" fill="#E4E8E5"/><path d="M0 20H100M0 40H100M0 60H100M0 80H100M0 100H100M20 0V116M40 0V116M60 0V116M80 0V116" stroke="#CBD2CE" stroke-width=".4"/><rect y="116" width="100" height="44" fill="#B9B1A1"/><path d="M0 130H100M0 146H100M25 116L12 160M50 116V160M75 116L88 160" stroke="#9C9484" stroke-opacity=".5" stroke-width=".4"/><circle cx="50" cy="40" r="21" fill="#B8A27A"/><circle cx="50" cy="40" r="19" fill="#D6E3E9"/><path d="M38 28q8-6 20-2" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"/><circle cx="50" cy="40" r="30" fill="url(#l@@)" opacity=".5"/><rect x="2" y="64" width="24" height="3" fill="#8C6A48"/><rect x="5" y="52" width="8" height="12" fill="#F4F1EA"/><rect x="15" y="54" width="8" height="10" fill="#E3B796"/><ellipse cx="50" cy="138" rx="42" ry="4" fill="#000" opacity=".28" filter="url(#b@@)"/><path d="M10 106h80q0 22-40 22t-40-22z" fill="url(#t@@)"/><ellipse cx="50" cy="106" rx="40" ry="6" fill="#F1F1EC"/><ellipse cx="50" cy="107" rx="35" ry="4.500" fill="#BFE0E6"/><path d="M84 74v28q0 5-5 5h-6" stroke="#B8A27A" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="88" y="104" width="7" height="14" rx="2" fill="#C8B49A"/><g filter="url(#b@@)"><ellipse cx="91" cy="98" rx="6" ry="9" fill="#5A8B5E"/></g><rect x="6" y="122" width="10" height="6" rx="2" fill="#F8D9A0"/><circle cx="11" cy="119" r="7" fill="url(#l@@)"/>`}
];
let _u=0;
const scn=i=>{const s=SC[i%SC.length],k="g"+(++_u);return '<div class="b" style="background:'+s.bg+'"><svg viewBox="0 0 100 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+s.s.replace(/@@/g,k)+'</svg></div>'};
/* ---------- styles de montage ---------- */
const MOT=[["dynamic","Dynamique","Rythmé, comme un reel : plans courts et transitions vives."],["drone","Drone","Montées, reculs qui révèlent la pièce et survols inclinés."],["cinema","Cinéma","Lent et élégant, fondus enchaînés et bords assombris."],["tour","Visite","Calme et fluide, pour bien montrer chaque pièce."]];
const COL=[["natural","Naturel","contrast(1.03) saturate(1.05)"],["warm","Chaleureux","sepia(.2) saturate(1.2) hue-rotate(-6deg)"],["fresh","Frais","hue-rotate(8deg) saturate(1.05) brightness(1.04)"],["cinema","Cinéma","contrast(1.16) saturate(.95)"],["vivid","Vif","saturate(1.45) contrast(1.08)"],["mono","Noir et blanc","grayscale(1) contrast(1.12)"]];
function thumbHtml(f){const st=f?' style="filter:'+f+'"':"";
  if(S.files.length){if(!S.thumb||S.thumbN!==S.files[0]){if(S.thumb)URL.revokeObjectURL(S.thumb);S.thumb=URL.createObjectURL(S.files[0]);S.thumbN=S.files[0]}return '<i class="th"'+(f?' style="filter:'+f+';':' style="')+'background-image:url('+S.thumb+')"></i>'}
  return '<i class="th"'+st+'>'+scn(1)+'</i>'}
const aiAvail=()=>!!(S.flags&&S.flags.ai===true);
function aiBox(){
  const c=S.dur/15*AIC,okp=S.files.length>=2,on=aiAvail()&&okp;
  if(S.ai&&!on)S.ai=false;
  return '<label style="margin-top:18px">Animation IA</label><button type="button" class="aib'+(S.ai?" on":"")+'" id="stAI"'+(on?'':' disabled')+'><b>Photos animées par IA</b>'+(!aiAvail()?'<em class="lkb">Bientôt</em>':(!okp?'<em class="lkb">Ajoute tes photos</em>':lkb(MINAI)))+'<span>Chaque photo devient un plan animé de 5 s. L\'IA ne fait que bouger la caméra. Tu valides les plans avant le montage final, et un plan raté est remboursé. +'+c+' crédits pour '+S.dur+' s.</span></button><p class="lknote" style="margin-top:8px">'+(S.ai?'Rendu choisi : <b>Animation IA</b>. Ce sont des plans générés par IA à partir de tes photos, que tu valides un par un avant le montage final.':'Rendu choisi : <b>montage diaporama</b>. Tes photos sont mises en mouvement (zoom, panoramiques, transitions), sans rien générer : c\'est exactement le logement.')+'</p>';
}
function styleBox(){
  return '<div class="sty"><label>Mouvement de caméra</label><div class="stg m" id="stM">'+MOT.map(m=>'<button type="button" data-m="'+m[0]+'" class="'+(S.motion===m[0]?"on":"")+'"><b>'+m[1]+'</b>'+lkb(MINM[m[0]])+'<span>'+m[2]+'</span></button>').join("")+'</div>'+
  '<label style="margin-top:18px">Couleurs</label><div class="stg c" id="stC">'+COL.map(c=>'<button type="button" data-c="'+c[0]+'" class="'+(S.grade===c[0]?"on":"")+'">'+thumbHtml(c[2])+'<b>'+c[1]+'</b>'+lkb(MINC[c[0]])+'</button>').join("")+'</div>'+aiBox()+(need()>rank()?'<p class="lknote">🔒 Ce choix demande le '+TMIN[need()]+' ou mieux. Tu le verras à l\'étape paiement, ou change ce choix pour rester sur une formule moins chère.</p>':'')+'</div>'}
/* ---------- montage réel (navigateur) ---------- */
let _rm=null;const rmod=()=>_rm||(_rm=import("./render.js"));
function sceneBlob(i){return new Promise((ok,ko)=>{const sc=SC[i%SC.length];
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1600" viewBox="0 0 100 160" preserveAspectRatio="xMidYMid slice">'+sc.s.replace(/@@/g,"r"+i)+'</svg>';
  const im=new Image();im.onload=()=>{const c=document.createElement("canvas");c.width=1000;c.height=1600;c.getContext("2d").drawImage(im,0,0,1000,1600);c.toBlob(b=>b?ok(b):ko(new Error("img")),"image/png")};im.onerror=()=>ko(new Error("img"));
  im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)})}
async function realPhotos(){if(S.files.length>=2)return{list:S.files,caps:S.files.map((_,i)=>CAPS[(i+1)%CAPS.length]),demo:false};
  const q=[1,0,2,3,4,5],l=[];for(const k of q)l.push(await sceneBlob(k));return{list:l,caps:q.map(k=>SCAP[k]),demo:true}}
function photoBox(){const n=S.files.length;
  return '<div class="phb"><b>Tes photos</b><small class="mut">Ajoute les photos du logement (2 minimum, 30 maximum). Pour '+S.dur+' s, vise '+Math.ceil(S.dur/2.5)+' photos ou plus : plus il y en a, plus la vidéo est rythmée. Sans photos, on te montre une vidéo d\'exemple.</small>'+
  '<label class="btn gh" style="height:48px;margin-top:10px;cursor:pointer;display:flex;align-items:center;justify-content:center">'+(n?n+' photo'+(n>1?'s':'')+' ajoutée'+(n>1?'s':'')+' · modifier':'Ajouter mes photos')+'<input type="file" id="phIn" accept="image/*" multiple hidden></label>'+
  (n?'<div class="phs">'+S.files.slice(0,12).map((f,i)=>'<i data-i="'+i+'" style="background-image:url('+URL.createObjectURL(f)+')"></i>').join("")+(n>12?'<em>+'+(n-12)+'</em>':'')+'</div>':'')+
  '<label class="tog" style="padding:12px 0 0;gap:10px;justify-content:flex-start;align-items:flex-start"><input type="checkbox" id="phRt" '+(S.rights?"checked":"")+' style="margin-top:3px"><span style="font-size:.82rem;line-height:1.45" class="mut">Je confirme avoir le droit d\'utiliser ces photos (je suis le propriétaire, le gestionnaire du logement ou j\'ai son accord).</span></label></div>'}
const CAPS=["Bienvenue","Le séjour","Piscine privée","La cuisine","La chambre","Vue dégagée","La terrasse","La salle de bain","Le coin repas","Réservez vos dates"];

/* ---------- lecteur de vidéo (maquette) ---------- */
function Player(root,photos,dur,opt){
  let t=null,i=0,sl=[],bar,cap,self={},show_cap=false;
  function build(){root.innerHTML="";sl=photos.map(p=>{const d=document.createElement("div");d.className="sl";if(p.u){const b=document.createElement("div");b.className="b";b.style.backgroundImage='url("'+p.u+'")';b.style.backgroundSize="cover";b.style.backgroundPosition="center";d.appendChild(b)}else d.innerHTML=scn(p.s);root.appendChild(d);return d});
    const sh=document.createElement("div");sh.className="vsh";root.appendChild(sh);
    bar=document.createElement("div");bar.className="sts";photos.forEach(()=>{bar.appendChild(document.createElement("span")).appendChild(document.createElement("i"))});root.appendChild(bar);
    cap=document.createElement("div");cap.className="cp";root.appendChild(cap);
    if(opt&&opt.ui){const u=document.createElement("div");u.className="vu";u.innerHTML='<div class="vt">0:'+String(S.dur).padStart(2,"0")+'</div><div class="vr"><span>♥</span><span>💬</span><span>➤</span></div><div class="vb"><i></i><b>@ton_logement</b></div>';root.appendChild(u)}else{const m=document.createElement("div");m.className="vm";m.innerHTML="<i></i><span>Visite en vidéo</span>";root.appendChild(m)}}
  function show(k){i=k%photos.length;sl.forEach((s,j)=>s.classList.toggle("on",j===i));
    $$("span",bar).forEach((sp,j)=>{sp.className=j<i?"d":"";sp.style.setProperty("--du",dur+"s")});
    const c=$$("span",bar)[i];c.classList.remove("r");void c.offsetWidth;c.classList.add("r");
    const b=sl[i].querySelector(".b");b.style.animation="none";void b.offsetWidth;b.style.animation="";
    cap.classList.add("sw");setTimeout(()=>{cap.textContent=show_cap?photos[i].c:"";cap.classList.remove("sw")},180)}
  self.start=function(){build();show(0);clearInterval(t);t=setInterval(()=>show(i+1),dur*1000);return self};
  self.stop=()=>clearInterval(t);
  return self;
}
const SCAP=["Le séjour","Piscine privée","La chambre","La cuisine","Vue dégagée","La salle de bain"];
const mkPhotos=n=>Array.from({length:n},(_,k)=>{const q=[1,0,2,3,4,5][k%6];return{s:q,c:SCAP[q]}});

/* ---------- état ---------- */
const S={motion:"dynamic",grade:"natural",thumb:"",files:[],rights:false,blobUrl:"",url:"",id:"",n:12,dur:30,q:"fhd",fmt:"v",music:"Chill estival",lang:"Français",caps:true,plan:"unit",cs:0,
  user:null,videos:LS.get("vt_videos",[]),credits:0,sub:false,flags:{ai:false},pf:{},avUrl:"",dtab:"ov"};
function cleanState(){
  const num=(v,d)=>Number.isFinite(+v)?Math.max(0,Math.min(1e6,Math.trunc(+v))):d;
  if(S.user&&!(typeof S.user.email==="string"&&/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(S.user.email)&&S.user.email.length<255))S.user=null;
  S.credits=num(S.credits,0);S.sub=S.sub===true;
  S.videos=(Array.isArray(S.videos)?S.videos:[]).slice(0,200).filter(v=>v&&typeof v==="object").map(v=>({id:num(v.id,0),listing:String(v.listing||"").replace(/[^A-Za-z0-9_-]/g,"").slice(0,40),dur:[15,30,45,60].includes(+v.dur)?+v.dur:30,q:["hd","fhd","4k"].includes(v.q)?v.q:"hd",fmt:["v","s","h"].includes(v.fmt)?v.fmt:"v",n:num(v.n,10),date:String(v.date||"").slice(0,20),caps:false}));
}
const save=()=>{LS.set("vt_videos",S.videos);try{hdr()}catch(e){}};
const base=()=>DUR.find(d=>d.s===S.dur).p+QUA.find(q=>q.k===S.q).x;
const UNITP=6,AIC=3,MINAI=2,cr=()=>base()/UNITP+(S.ai?S.dur/15*AIC:0);
const MINM={dynamic:0,tour:0,drone:1,cinema:1},MINC={natural:0,warm:0,fresh:0,cinema:1,vivid:1,mono:1},MINQ={hd:0,fhd:0,"4k":2};
const TNAME=["Aucune formule","Essentiel","Pro","Agence"],TMIN=["","la formule Essentiel","la formule Pro","la formule Agence"],TSHORT=["","Essentiel","Pro","Agence"];
const need=()=>Math.max(MINM[S.motion]||0,MINC[S.grade]||0,MINQ[S.q]||0,S.ai?MINAI:0);
const rank=()=>S.sub?3:(S.tiers&&S.tiers.pro)?2:(S.tiers&&S.tiers.essentiel)?1:0;
const lkb=n=>n>rank()?'<em class="lkb">🔒 '+TSHORT[n]+'</em>':'';
function lacks(r){const o=[];if((MINM[S.motion]||0)>r)o.push("le style "+MOT.find(m=>m[0]===S.motion)[1]);if((MINC[S.grade]||0)>r)o.push("la couleur "+COL.find(c=>c[0]===S.grade)[1]);if((MINQ[S.q]||0)>r)o.push("la qualité "+QUA.find(q=>q.k===S.q).l);if(S.ai&&MINAI>r)o.push("l'Animation IA");return o}
const crl=n=>n+" crédit"+(n>1?"s":"");
const hashOf=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h};
let heroPhotos=null,timers=[],heroP=null,gbP=null,doneP=null,gpP=null;
const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);return t};
const clearAll=()=>{timers.forEach(clearTimeout);timers=[]};

/* ---------- navigation ---------- */
const SCR=["lp","ex","eb","fq","an","cfg","mk","gate","pay","rd2","done","dash","pr","auth","pg"];
const NEED={an:"url",cfg:"url",mk:"url",gate:"url",pay:"url",rd2:"url",done:"cur"};
function go(id,opt){
  opt=opt||{};
  if(NEED[id]==="url"&&!S.url){id="lp"}
  if(id==="done"&&!S.cur){id="lp"}
  clearAll();[gbP,gpP,doneP].forEach(x=>x&&x.stop());
  SCR.forEach(s=>{$("#"+s).hidden=(s!==id)});
  document.body.dataset.s=id;
  exP.forEach(x=>x.stop());exP=[];nav();
  window.scrollTo({top:0,behavior:"auto"});
  if(!opt.nopush){try{history.pushState({s:id},"","#"+id)}catch(e){}}
  hdr();
  const f={an:runAn,cfg:()=>renderCfg(),mk:runMk,gate:renderGate,pay:renderPay,rd2:runRd,done:renderDone,dash:()=>{S.dtab="ov";renderDash()},pr:renderPr,ex:gallery,eb:renderEb,auth:()=>renderAuth("signup")}[id];
  if(f)f();
  if(id==="lp"){if(heroP)heroP.stop();heroP=Player($("#heroPh"),heroPhotos||mkPhotos(6),2.4).start()}
  if(id!=="lp"&&heroP){heroP.stop()}
}
window.addEventListener("popstate",e=>{const id=(location.hash||"#lp").slice(1);go(SCR.indexOf(id)>=0?id:"lp",{nopush:true})});
function jump(id){if(document.body.dataset.s!=="lp"){go("lp");setTimeout(()=>{const e=document.getElementById(id);if(e)e.scrollIntoView({behavior:"smooth"})},60)}else{const e=document.getElementById(id);if(e)e.scrollIntoView({behavior:"smooth"})}}
function focusBar(){if(document.body.dataset.s!=="lp")go("lp");setTimeout(()=>{window.scrollTo({top:0,behavior:"smooth"});const i=$("#url");if(i)i.focus({preventScroll:true})},80)}
function hdr(){
  const h=$("#hr");
  if(S.user){h.innerHTML='<button class="hdac" data-v="go" data-a="dash" title="Mon compte">'+avHtml(34)+'<span class="vh">Mon compte : </span><span class="hdn">'+esc(dispName()||"Mon compte")+'</span>'+(S.credits>0?'<span class="cb">'+S.credits+'</span>':'')+'</button>'}
  else{h.innerHTML='<button class="btn gh s" data-v="go" data-a="auth">Se connecter</button>'}
}
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{t.hidden=true},2600)}

/* ---------- bandeau Black Friday ---------- */
function tick(){const bf=$("#bf");if(!bfOn()){bf.hidden=true;return}bf.hidden=false;let ms=END-Date.now();const d=Math.floor(ms/864e5);ms-=d*864e5;const h=Math.floor(ms/36e5);ms-=h*36e5;const m=Math.floor(ms/6e4);ms-=m*6e4;const s=Math.floor(ms/1e3);const p=n=>String(n).padStart(2,"0");$("#cdn").textContent="J-"+d+" "+p(h)+":"+p(m)+":"+p(s)}
tick();setInterval(tick,1000);

/* ---------- collage du lien ---------- */
/* Accepte : lien complet, lien sans https, lien court abnb.me, lien /l/, ou texte de partage contenant un lien */
function parseAirbnb(raw){
  const found=String(raw).match(/(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/ig)||[];
  for(const c of found){
    let u=c.replace(/[),.;!?»]+$/,"");
    if(!/^https?:\/\//i.test(u))u="https://"+u;
    let x;try{x=new URL(u)}catch(e){continue}
    const host=x.hostname.toLowerCase().replace(/^www\./,""),p=x.pathname;
    if(host==="abnb.me"&&/^\/[A-Za-z0-9]+/.test(p))return{url:"https://abnb.me"+p.replace(/\/+$/,""),kind:"short"};
    if(/^([a-z0-9-]+\.)*airbnb\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2,3})$/.test(host)){
      const m=p.match(/^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?(rooms|h|luxury\/listing)\/(plus\/)?([^\/?#]+)/i);
      if(m&&/^[A-Za-z0-9_-]{1,40}$/.test(m[3]))return{url:"https://"+host+"/"+m[1]+"/"+(m[2]||"")+m[3],id:m[3],kind:"listing"};
      const l=p.match(/^\/l\/([A-Za-z0-9]+)/);
      if(l)return{url:"https://"+host+"/l/"+l[1],kind:"short"};
    }
  }
  return null;
}
function start(e,form){
  if(e&&e.preventDefault)e.preventDefault();
  const bar=form?$(".bar",form.parentNode)||form:$("#bar"),f=form||$("#bar");
  const inp=$("input",f),msg=$(".emsg",f.parentNode),v=inp.value.trim();
  const fail=t=>{msg.textContent=t;f.classList.remove("err");void f.offsetWidth;f.classList.add("err");try{f.scrollIntoView({block:"center",behavior:"smooth"})}catch(_){}track("link_invalid",{v:v.slice(0,40)})};
  if(!v){fail("Colle d'abord le lien de l'annonce Airbnb.");return false}
  const R=parseAirbnb(v);if(!R){fail("Lien non reconnu. Dans l'appli Airbnb : Partager, puis Copier le lien. Exemple : airbnb.fr/rooms/123456.");return false}
  msg.textContent="";f.classList.remove("err");
  S.url=R.url;S.cs=0;S.plan=S.want||"unit";S.want=null;S.bump=false;S.planSet=false;S.id=R.id||("lien-"+R.url.split("/").pop());S.n=10+hashOf(S.id)%9;
  track("link_pasted",{id:S.id,n:S.n});const bt=$(".btn",f);if(bt){bt.disabled=true;bt.innerHTML='<span class="spn"></span>Lecture de l\'annonce…'}setTimeout(()=>{if(bt){bt.disabled=false;bt.innerHTML="Créer ma vidéo"}go("an")},450);return false;
}
$$(".bar input").forEach(i=>i.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();start(e,i.closest(".bar"))}}));
$$(".bar input").forEach(i=>i.addEventListener("input",()=>{const f=i.closest(".bar");f.classList.remove("err");const m=$(".emsg",f.parentNode);if(m)m.textContent=""}));
$$(".bar input").forEach(i=>i.addEventListener("paste",()=>setTimeout(()=>{const r=parseAirbnb(i.value);if(r&&i.value!==r.url)i.value=r.url},0)));
function demo(){const i=$("#url");i.value="https://www.airbnb.fr/rooms/123456789";i.focus()}

/* ---------- 1. animation d'analyse ---------- */
function runAn(){
  track("analysis_start");
  const rd=$("#rd");rd.innerHTML="";const rg=$("#rg"),cons=$("#cons");cons.innerHTML="";
  const lines=[["ouverture de l'annonce "+S.id,"ok"],["annonce reconnue","ok"],["préparation du montage","ok"],["réglage du rythme","cur"]];
  const stages=["Lecture de l'annonce","Annonce reconnue","Préparation du montage","Réglage du rythme"];
  const pos=[[8,38],[70,14],[78,60],[44,78],[14,70],[56,40],[30,12]];
  stages.forEach((s,k)=>{later(()=>{rg.textContent=s;const d=document.createElement("div");d.className=lines[k][1]==="cur"?"":"ok";d.textContent=lines[k][0]+(k<3?" ✓":"");cons.appendChild(d);cons.scrollTop=1e4;
    if(k>=1)pos.slice((k-1)*2,(k-1)*2+3).forEach((p,j)=>later(()=>{const el=document.createElement("div");el.className="pt";el.style.cssText="left:"+p[0]+"%;top:"+p[1]+"%;background:"+SC[(k+j)%6].bg;rd.appendChild(el)},j*140))},k*1150)});
  later(()=>{track("analysis_done");go("cfg")},4900);
}

function foundHtml(){return '<div class="found"><p><b>✓ Annonce reconnue</b><br><span class="mut">À l\'étape suivante, tu ajoutes les photos du logement.</span></p></div>'}
function gateBullets(){return '<ul class="gl"><li>Sans filigrane, prête à publier</li><li>Tu ne paies qu\'après avoir vérifié ton récapitulatif</li><li>Remboursé automatiquement si le montage échoue</li></ul>'}
function payExtras(opts){
  const sel=opts.find(o=>o.k===S.plan);let h="";
    if(!S.ebook&&!(sel&&sel.pack&&sel.pack.ebook))h+='<label class="bump"><input type="checkbox" id="pBump"'+(S.bump?" checked":"")+'><span><b>Ajoute la Formation Airbnb</b> pour <b>'+eur(BUMP_PRICE)+'</b> <s>'+eur(EB_PRICE)+'</s><small>Guide PDF de 44 pages : trouver des clients, écrire les messages, fixer ton prix.</small></span></label>';
  return h;
}
const bumpOn=o=>S.bump&&!S.ebook&&!(o.pack&&o.pack.ebook);
const BUMP_PRICE=14;
const ptotal=o=>(o.free?0:o.p)+(bumpOn(o)?BUMP_PRICE:0);
const MSG="Bonjour [Prénom],\n\nJ'ai vu votre annonce « [Nom du logement] ». Je réalise des vidéos verticales à partir des photos d'une annonce, pour vos réseaux et vos annonces.\n\nJe peux vous préparer la vôtre pour [prix] €. Je vous envoie un exemple ?";
function msgText(){
  const n=S.name||"[Ton prénom]";
  return "Bonjour [Prénom du propriétaire],\n\nJ'ai vu votre annonce « [nom du logement] » et j'ai préparé une courte vidéo verticale à partir de vos photos, pour vos réseaux et vos annonces : [lien de la vidéo]\n\nSi elle vous plaît, je vous la livre en haute qualité, sans filigrane, pour "+S.price+" €.\n\nBelle journée,\n"+n;
}
function msgBuilder(el){
  el.innerHTML='<div class="row3"><div><label for="mbN">Ton prénom</label><input class="inp" id="mbN" placeholder="Ex : Léa" maxlength="30" value="'+esc(S.name)+'"></div><div><label for="mbP">Ton prix (€)</label><input class="inp" id="mbP" inputmode="numeric" maxlength="4" value="'+esc(S.price)+'"></div></div><textarea class="inp" id="mbT" aria-label="Message à envoyer" style="min-height:210px;margin-top:10px"></textarea><button class="btn big" id="mbC" type="button" style="height:50px;margin-top:10px">Copier le message</button><p class="note">Tu peux modifier le texte : il est copié tel quel. Ton prénom et ton prix sont gardés pour la prochaine fois.</p>';
  const t=$("#mbT"),n=$("#mbN"),pr=$("#mbP");let edited=false;
  const fill=()=>{if(!edited)t.value=msgText()};
  n.oninput=()=>{S.name=n.value.trim().slice(0,30);LS.set("vt_name",S.name);fill()};
  pr.oninput=()=>{const x=parseInt(pr.value,10);S.price=x>0&&x<1000?x:60;LS.set("vt_price",S.price);fill()};
  t.oninput=()=>{edited=true};
  $("#mbC").onclick=()=>{(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(()=>toast("Message copié."),()=>{t.select();toast("Sélectionne le texte pour le copier.")});track("msg_copy")};
  fill();
}
function balLine(){return S.credits>0?'<div class="bal"><span>🎟 Il te reste <b>'+crl(S.credits)+'</b>'+(S.sub?" ce mois-ci":"")+'</span><button class="lk" id="balGo">Voir mon compte</button></div>':''}
function nextSteps(){
  let h='<div class="nx"><p class="kk">ET MAINTENANT ?</p><h3>Passe à l\'action</h3>'+
   balLine()+'<div class="nxc"><b>1 · Envoie-la à ton prospect</b><span>Ton message est prêt : ajoute ton prénom et ton prix, puis copie.</span><div id="mbBox"></div></div>';
  if(rank()===0)h+='<div class="nxc"><b>2 · Prépare les suivantes</b><span>Un abonnement te donne des crédits chaque mois : '+eur(PLANS[1].per)+' le crédit avec Essentiel, '+eur(PLANS[2].per)+' avec Pro (formation offerte), '+eur(PLANS[3].per)+' avec Agence. Tu arrêtes quand tu veux.</span><div class="nxb"><button class="btn s" id="nxPk">Voir les formules</button></div></div>';
  if(!S.ebook)h+='<div class="nxc"><b>3 · Apprends à vendre</b><span>La formation Airbnb : trouver des hôtes, fixer ton prix.</span><button class="btn gh s" id="nxEb">Voir la formation</button></div>';
  return h+'</div>';
}

/* ---------- 2. configuration (durée, qualité, style) ---------- */
function renderCfg(){
  const step=S.cs,total=3;
  const dots=Array.from({length:total},(_,i)=>'<i class="'+(i<=step?"on":"")+'"></i>').join("");
  let h='<div class="dt">'+dots+'<span>ÉTAPE '+(step+1)+'/'+total+'</span></div><div class="pb"><i style="width:'+((step+1)/total*100)+'%"></i></div>';
  if(step===0){
    h+='<p class="kk">DURÉE</p><h2>Quelle durée pour ta vidéo ?</h2>'+foundHtml()+'<p class="sub">Plus la vidéo est longue, plus chaque pièce est détaillée.</p><div class="gd" id="gd">'+
    DUR.map(d=>'<button class="tile'+(d.s===S.dur?" on":"")+'" data-d="'+d.s+'"><u>✓</u><span class="big">'+d.s+'<small>S</small></span><span class="ds">'+d.d+'</span>'+(d.tg?'<span class="tg">'+d.tg+'</span>':'')+'</button>').join("")+'</div>'+photoBox();
  }else if(step===1){
    h+='<p class="kk">QUALITÉ</p><h2>Quelle qualité d\'image ?</h2><p class="sub">Tu pourras télécharger la vidéo en MP4.</p><div class="gd c3" id="gd">'+
    QUA.map(q=>'<button class="tile'+(q.k===S.q?" on":"")+'" data-q="'+q.k+'" style="min-height:104px"><u>✓</u><span class="big" style="font-size:1.8rem">'+q.l+'<small>'+q.r+'</small></span><span class="ds">'+q.d+'</span>'+lkb(MINQ[q.k])+(q.tg?'<span class="tg">'+q.tg+'</span>':'')+'</button>').join("")+'</div>';
  }else{
    h+='<p class="kk">STYLE</p><h2>Style de ta vidéo</h2><p class="sub">Choisis le mouvement et les couleurs. Tu verras le résultat dans ta vidéo finale.</p>'+
    styleBox()+'<div style="margin-top:18px"><label>Format</label><div class="seg" id="sgF"><button data-f="v" class="'+(S.fmt==="v"?"on":"")+'">Vertical · Reels, TikTok</button><button data-f="s" class="'+(S.fmt==="s"?"on":"")+'">Carré · Instagram</button><button data-f="h" class="'+(S.fmt==="h"?"on":"")+'">Large · YouTube</button></div></div><p class="mut" style="font-size:.86rem;margin-top:12px">La vidéo remplit tout l\'écran dans le format choisi, sans bande noire. Les photos sont recadrées au centre.</p>';
  }
  if(step>0)h+='<p style="margin-top:12px"><button class="lk mut" id="cfgBack">← Retour</button></p>';
  $("#cfgCard").innerHTML=h;
  $("#cfgPz").innerHTML='<b style="font-size:1.25rem">'+S.dur+' s · '+QUA.find(x=>x.k===S.q).l+'</b>';
  $("#cfgNext").textContent=step<total-1?"Continuer":"Lancer le montage";
  $$("#gd .tile").forEach(t=>t.onclick=()=>{if(t.dataset.d){S.dur=+t.dataset.d;track("cfg_duration",{s:S.dur})}else{S.q=t.dataset.q;track("cfg_quality",{q:S.q})}renderCfg()});
  $$("#sgF button").forEach(b=>b.onclick=()=>{S.fmt=b.dataset.f;renderCfg()});
  $$("#stM button").forEach(b=>b.onclick=()=>{S.motion=b.dataset.m;track("cfg_motion",{m:S.motion});renderCfg()});
  $$("#stC button").forEach(b=>b.onclick=()=>{S.grade=b.dataset.c;track("cfg_grade",{c:S.grade});renderCfg()});
  const ai=$("#stAI");if(ai&&!ai.disabled)ai.onclick=()=>{S.ai=!S.ai;track("cfg_ai",{on:S.ai});renderCfg()};
  const pi=$("#phIn");if(pi)pi.onchange=()=>{const all=[...pi.files],a=all.filter(f=>/^image\/(jpeg|png|webp|heic|heif|avif)$/i.test(f.type)&&f.size>0&&f.size<=25*1024*1024).slice(0,30);if(a.length<all.length)toast("Certains fichiers ont été ignorés : photos JPEG, PNG, WebP ou HEIC de 25 Mo maximum.");S.files=a;track("photos_added",{n:a.length});renderCfg()};
  const pr=$("#phRt");if(pr)pr.onchange=()=>{S.rights=pr.checked};
  const bk=$("#cfgBack");if(bk)bk.onclick=()=>{S.cs--;renderCfg();window.scrollTo(0,0)};
  $("#cfgNext").onclick=()=>{if(S.cs===0&&S.files.length===1){toast("Ajoute au moins 2 photos (ou retire-la).");return}if(S.cs===0&&S.files.length>=2&&!S.rights){toast("Coche la case pour confirmer tes droits sur les photos.");return}if(S.cs<total-1){S.cs++;renderCfg();window.scrollTo(0,0)}else{track("cfg_done",{dur:S.dur,q:S.q,fmt:S.fmt});S.cs=0;go("mk")}};
}

/* ---------- 3. animation de montage ---------- */
function runMk(){
  track("montage_start");
  const L=["Tri des photos","Rythme et transitions","Cadrage plein écran","Export "+QUA.find(q=>q.k===S.q).l];
  const fs=$("#fs");fs.innerHTML="";const nF=7;for(let i=0;i<nF;i++){const d=document.createElement("div");d.style.background=SC[i%6].bg;fs.appendChild(d)}
  $("#mkL").innerHTML=L.map(x=>'<li><span class="ic"></span>'+x+'</li>').join("");
  const li=$$("#mkL li"),C=364.4,TOT=6400;let st=Date.now();
  function f(){const p=Math.min(1,(Date.now()-st)/TOT);$("#mkC").style.strokeDashoffset=C*(1-p);$("#mkP").textContent=Math.round(p*100)+"%";
    $$("#fs div").forEach((d,i)=>d.classList.toggle("on",p>i/nF));
    const k=Math.min(L.length-1,Math.floor(p*L.length));li.forEach((e,j)=>{e.className=j<k?"d":(j===k?"a":"")});$("#mkT").textContent=L[k];
    if(p<1)later(f,60);else{li.forEach(e=>e.className="d");track("montage_done");later(()=>go("gate"),450)}}
  f();
}

/* ---------- 4. projet prêt (fond flouté) + compte ---------- */
function recap(){const q=QUA.find(x=>x.k===S.q);return '<div class="rec"><span class="chip">'+(S.files.length?S.files.length+' photos':'Vidéo d\'exemple')+'</span><span class="chip">'+S.dur+' s</span><span class="chip">'+q.l+' '+q.r+'</span><span class="chip">'+({v:"Vertical",s:"Carré",h:"Large"}[S.fmt])+'</span><span class="chip y">Sans filigrane</span></div>'}
function renderGate(){
  track("gate_view",{logged:!!S.user});
  if(gbP)gbP.stop();gbP=Player($("#gbPh"),mkPhotos(S.n>6?6:S.n),2,{ui:true}).start();
  let h='<div class="gprev"><div class="ph"><div id="gpPh" style="position:absolute;inset:0"></div><div class="lockb">🔒</div></div><div><p class="kk">MONTAGE TERMINÉ</p><h2>Ta vidéo est prête</h2></div></div><p class="mut">Voici l\'aperçu, flouté. Crée ton compte pour débloquer le fichier final, sans filigrane.</p>'+recap()+gateBullets();
  if(S.user){
    h+='<p class="mut sm">Connecté en tant que <b style="color:var(--ink)">'+S.user.email+'</b></p><button class="btn big" id="gGo">Débloquer ma vidéo</button>';
  }else{
    h+='<p class="mut" style="margin-bottom:6px"><b style="color:var(--ink)">Crée ton compte</b> pour retrouver ta vidéo et la télécharger.</p>'+
    '<div class="fld"><input class="inp" id="gE" type="email" inputmode="email" autocomplete="email" placeholder="Ton email"></div><div class="fld"><input class="inp" id="gP" type="password" autocomplete="new-password" placeholder="Mot de passe (8 caractères minimum)"></div>'+
    '<label class="ck"><input type="checkbox" id="gC"><span>J\'accepte les conditions d\'utilisation et la politique de confidentialité.</span></label><div class="errm" id="gErr"></div>'+
    '<button class="btn big" id="gGo" style="margin-top:6px">Créer mon compte et débloquer ma vidéo</button><p class="lg">Déjà un compte ? <button class="lk" id="gLog">Se connecter</button></p>';
  }
  $("#gateCard").innerHTML=h;
  gpP=Player($("#gpPh"),mkPhotos(S.n>6?6:S.n),2).start();
  $("#gGo").onclick=async()=>{
    if(!S.user){const e=$("#gE").value.trim(),p=$("#gP").value,er=$("#gErr");
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)){er.textContent="Entre une adresse email valide.";return}
      if(p.length<8){er.textContent="Le mot de passe doit faire 8 caractères minimum.";return}
      if(!$("#gC").checked){er.textContent="Accepte les conditions pour continuer.";return}
      if(!(await doAuth(true,e,p,er,$("#gGo"))))return}
    go("pay")};
  const lg=$("#gLog");if(lg)lg.onclick=()=>{S.back="gate";go("auth")};
}

/* ---------- 5. paiement (simulé) ---------- */
function payCfg(){
  const c=cr(),nd=need(),opts=[],rk=rank();
  if(S.credits>=c)opts.push(rk>=nd?{k:"credit",n:"Utiliser mes crédits",s:crl(c)+" pour cette vidéo. Il t'en restera "+(S.credits-c)+".",p:0,free:true}:{k:"credit",n:"Utiliser mes crédits",s:crl(c)+" pour cette vidéo.",p:0,free:true,off:true,why:"Ta formule ne permet pas "+lacks(rk).join(", ")+"."});
  const subd=rk>0;
  PLANS.slice(1).forEach(pl=>{
    const off=subd||pl.r<nd,after=pl.c-c;
    opts.push({k:pl.k,n:pl.n,s:"Cette vidéo ("+crl(c)+") + "+after+" crédit"+(after>1?"s":"")+" à utiliser"+" ce mois-ci. Abonnement mensuel renouvelé chaque mois, tu arrêtes quand tu veux.",p:pl.p,pack:pl,per:pl.p/pl.c*c,old:bfOn()?pl.reg:0,after:after,tag:pl.bd,mo:pl.m,off:off,why:subd?"Tu as déjà un abonnement actif. Pour en changer, résilie-le depuis Mon compte.":off?"Ne permet pas "+lacks(pl.r).join(", ")+".":"",gift:pl.ebook&&!S.ebook});
  });
  return opts;
}
function paySel(){
  const qx=QUA.find(x=>x.k===S.q).x,dp=DUR.find(x=>x.s===S.dur).p;
  return (bfOn()?'<p class="gbf">🔥 Offre de lancement appliquée, jusqu\'au 30 novembre</p>':'')+
  '<div class="pcfg"><label class="kk" style="display:block;margin-bottom:6px">DURÉE</label><div class="seg" id="pD">'+DUR.map(d=>'<button data-d="'+d.s+'" class="'+(d.s===S.dur?"on":"")+'">'+d.s+' s<small>'+crl((d.p+qx)/UNITP)+'</small></button>').join("")+'</div>'+
  '<label class="kk" style="display:block;margin:12px 0 6px">QUALITÉ</label><div class="seg" id="pQ">'+QUA.map(q=>'<button data-q="'+q.k+'" class="'+(q.k===S.q?"on":"")+'">'+q.l+'<small>'+(q.x?"+"+crl(q.x/UNITP):"inclus")+'</small></button>').join("")+'</div>'+
  '<p class="mut sm" style="margin-top:8px"><b>Rendu :</b> '+(S.ai?'Animation IA (plans générés par IA, validés par toi)':'montage diaporama de tes photos')+'</p><p class="mut sm" style="margin-top:4px">'+S.n+' photos · format '+({v:"vertical",s:"carré",h:"large"}[S.fmt])+'</p></div>';
}
function optHtml(o){
  const save=0;
  return '<button class="opt'+(o.k===S.plan?" on":"")+(o.off?" off":"")+'" data-k="'+o.k+'"'+(o.off?' disabled aria-disabled="true"':'')+'><span><b>'+o.n+'</b>'+(o.tag?'<em class="otg">'+o.tag+'</em>':'')+'<small>'+o.s+'</small>'+(o.per&&!o.off?'<small class="per">cette vidéo te revient à '+eur(o.per)+(save>0?' (−'+save+' %)':'')+'</small>':'')+(o.gift&&!o.off?'<small class="gift">🎁 Formation Airbnb offerte (valeur '+eur(EB_PRICE)+')</small>':'')+(o.off&&o.why?'<small class="why">🔒 '+o.why+'</small>':'')+'</span><span class="pp">'+(o.free?"0 €":(o.old?"<s>"+eur(o.old)+"</s>":"")+"<b>"+eur(o.p)+"</b>")+(o.mo?'<i>par mois</i>':'')+'</span></button>';
}
function renderPay(){
  track("pay_view");
  const opts=payCfg(),ok=opts.filter(o=>!o.off);if(!S.planSet&&ok[0]&&ok[0].k==="credit")S.plan="credit";if(!ok.length){$("#payCard").innerHTML='<p class="kk">DERNIÈRE ÉTAPE</p><h2>Plus assez de crédits</h2><p class="sub">Cette vidéo coûte '+crl(cr())+' et il t\'en reste '+S.credits+'. Ton abonnement t\'en ajoute à chaque renouvellement. '+(S.credits>0?'Tu peux aussi choisir une vidéo plus courte ou en qualité HD.':'')+'</p><div class="nxb" style="margin-top:14px"><button class="btn" id="pCfg">Changer ma vidéo</button><button class="btn gh" id="pPortal">Gérer mon abonnement</button></div><div class="errm" id="pErr"></div>';const pc=$("#pCfg");if(pc)pc.onclick=()=>{S.cs=2;go("cfg")};const pp=$("#pPortal");if(pp)pp.onclick=openPortal;return}
  if(!ok.some(o=>o.k===S.plan))S.plan=(ok.find(o=>o.k==="pro")||ok[0]).k;
  let h='<div class="dt"><i class="on"></i><i class="on"></i><i class="on"></i><span>PAIEMENT</span></div><div class="pb"><i style="width:100%"></i></div><p class="kk">DERNIÈRE ÉTAPE</p><h2>Choisis ta formule</h2><p class="sub">Ta vidéo coûte '+crl(cr())+' (1 crédit = 15 s en HD). Choisis ton abonnement : tu reçois tes crédits chaque mois et tu arrêtes quand tu veux. La vidéo est livrée sans filigrane.</p>'+paySel()+(need()>0?'<p class="lknote" style="margin-top:12px">🔒 Tu as choisi '+lacks(0).join(", ")+' : il faut un abonnement Essentiel ou mieux. <button class="lk" id="pEdit">Changer mon style</button></p>':'')+
  opts.map(optHtml).join("")+
  payExtras(opts)+'<label class="ck"><input type="checkbox" id="pOk"><span>Je confirme avoir l\'accord du propriétaire pour utiliser les photos de cette annonce, et je m\'engage à ne pas présenter le logement autrement qu\'il est.</span></label><div class="errm" id="pErr"></div><div class="sec2">🔒 Paiement sécurisé par Stripe · Facture envoyée par email</div>';
  $("#payCard").innerHTML=h;
  syncPay(opts);
  $$("#pD button").forEach(b=>b.onclick=()=>{S.dur=+b.dataset.d;track("pay_dur",{s:S.dur});renderPay()});
  $$("#pQ button").forEach(b=>b.onclick=()=>{S.q=b.dataset.q;track("pay_q",{q:S.q});renderPay()});
  const pe=$("#pEdit");if(pe)pe.onclick=()=>{S.cs=2;go("cfg")};
  const pb=$("#pBump");if(pb)pb.onchange=()=>{S.bump=pb.checked;track("bump",{on:S.bump});syncPay(opts)};
  $$("#payCard .opt:not(.off)").forEach(b=>b.onclick=()=>{S.planSet=true;S.plan=b.dataset.k;track("pay_plan",{k:S.plan});renderPay()});
  $("#payBtn").onclick=async()=>{
    if(!$("#pOk").checked){$("#pErr").textContent="Confirme l'accord du propriétaire pour continuer.";return}
    const o=opts.find(x=>x.k===S.plan);track("pay_click",{plan:o.k});
    if(o.k==="credit"&&!bumpOn(o)){
      const b=$("#payBtn");b.disabled=true;$("#pErr").textContent="";S.cur=newCur();
      try{await ensureJob()}catch(e){S.cur=null;$("#pErr").textContent=e.message;b.disabled=false;return}
      finish(o);return}
    if(!aiAvailPay()){payLater();return}
    const b=$("#payBtn");b.disabled=true;$("#pErr").textContent="";
    const need=cr(),bump=bumpOn(o);
    let spec,grant=0;
    if(o.k==="credit"){spec={kind:"ebook",bump:true}}
    else if(o.k==="agence"){spec={kind:"agence"};grant=o.pack.c}
    else{spec={kind:"pack",plan:o.k,bump:bump};grant=o.pack.c}
    startCheckout(spec,{video:true,before:S.credits,grant:grant,ebook:o.k==="credit"||bump});
  };
}
/* Paiement Stripe : le serveur calcule le prix et crée la session, on part sur la page de paiement Stripe, puis on revient ici.
   Pendant ce temps le projet (photos comprises) est gardé sur l'appareil, dans le navigateur (IndexedDB). */
const IDB={
  open(){return new Promise((ok,ko)=>{try{const r=indexedDB.open("cliploc",1);r.onupgradeneeded=()=>r.result.createObjectStore("d");r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)}catch(e){ko(e)}})},
  async run(mode,fn){const db=await this.open();return new Promise((ok,ko)=>{const t=db.transaction("d",mode),o=fn(t.objectStore("d"));t.oncomplete=()=>{db.close();ok(o&&o.result)};t.onerror=()=>{db.close();ko(t.error)}})},
  put(v){return this.run("readwrite",st=>st.put(v,"draft"))},get(){return this.run("readonly",st=>st.get("draft"))},del(){return this.run("readwrite",st=>st.delete("draft"))}
};
async function saveDraft(flow){
  const d={at:Date.now(),flow:flow||null,files:S.files.slice(0,30)};
  ["url","id","n","dur","q","fmt","motion","grade","ai","bump","caps"].forEach(k=>{d[k]=S[k]});
  await IDB.put(d);
}
async function restoreDraft(){
  let d=null;try{d=await IDB.get()}catch(e){}
  if(!d||typeof d!=="object"||!(Date.now()-d.at<2*864e5))return null;
  const R=parseAirbnb(String(d.url||""));if(!R)return null;
  const files=(Array.isArray(d.files)?d.files:[]).filter(f=>f instanceof Blob&&/^image\//.test(f.type)&&f.size>0&&f.size<=25*1024*1024).slice(0,30);
  S.url=R.url;S.id=R.id||("lien-"+R.url.split("/").pop());S.files=files;S.rights=true;
  S.dur=[15,30,45,60].includes(d.dur)?d.dur:30;S.q=["hd","fhd","4k"].includes(d.q)?d.q:"fhd";S.fmt=["v","s","h"].includes(d.fmt)?d.fmt:"v";
  S.motion=["dynamic","drone","cinema","tour"].includes(d.motion)?d.motion:"dynamic";S.grade=["natural","warm","fresh","cinema","vivid","mono"].includes(d.grade)?d.grade:"natural";
  S.ai=d.ai===true&&files.length>=2&&aiAvail();S.n=Math.max(2,Math.min(40,Math.trunc(+d.n)||12));S.bump=false;S.planSet=false;S.caps=d.caps!==false;
  const f=d.flow&&typeof d.flow==="object"?d.flow:null;
  return{flow:f?{video:f.video===true,before:Math.max(0,Math.min(1e6,Math.trunc(+f.before)||0)),grant:Math.max(0,Math.min(200,Math.trunc(+f.grant)||0)),ebook:f.ebook===true}:null};
}
const aiAvailPay=()=>!!(S.flags&&S.flags.pay===true);
function payLater(){track("pay_blocked");openMd('<p class="kk">BIENTÔT</p><h2 style="margin-bottom:10px">Le paiement en ligne ouvre très bientôt</h2><p class="mut">Cliploc est en phase de lancement et le paiement par carte est en cours d\'activation. Ton compte est créé : dès que c\'est ouvert, tu retrouves ici ton projet et tes choix.</p><button class="btn big" data-v="closeMd">Compris</button>')}
let _co=false;window.addEventListener("pageshow",()=>{_co=false});
async function startCheckout(spec,flow){
  if(_co)return;_co=true;
  try{
    try{await saveDraft(flow)}catch(e){}
    const r=await CL.checkout(spec);
    if(!r||typeof r.url!=="string"||!/^https:\/\/checkout\.stripe\.com\//.test(r.url))throw new Error("Le paiement n'a pas pu démarrer. Réessaie dans un instant.");
    track("checkout_open",{k:spec.kind});
    location.assign(r.url);
  }catch(e){_co=false;const b=$("#payBtn");if(b)b.disabled=false;const er=$("#pErr");if(er&&document.body.dataset.s==="pay")er.textContent=e.message;else toast(e.message);}
}
/* Retour de Stripe : on attend que le webhook ait crédité le compte, puis on reprend là où on s'était arrêté. */
async function afterPay(paid){
  const rs=await restoreDraft();
  if(!paid){if(rs){go("pay");toast("Paiement annulé : ton projet est conservé.")}return}
  if(!CL.session()){S.back=rs?"pay":null;go("auth");toast("Reconnecte-toi pour retrouver ton achat.");return}
  const fl=rs&&rs.flow,ok=p=>p&&(!fl||(p.credits>=fl.before+fl.grant&&(!fl.ebook||p.ebook===true)));
  openMd('<p class="kk">PAIEMENT REÇU</p><h2 style="margin-bottom:10px">On active ton achat…</h2><p class="mut">Ça prend quelques secondes. Ne ferme pas cette page.</p>');
  let done=false;
  for(let i=0;i<30&&!done;i++){let p=null;try{p=await CL.profile()}catch(e){}if(ok(p)||(!fl&&p)){done=true;break}await new Promise(r=>setTimeout(r,2000))}
  if(!done){openMd('<p class="kk">PAIEMENT REÇU</p><h2 style="margin-bottom:10px">Validation en cours</h2><p class="mut">Ton paiement est bien parti, mais la validation prend plus de temps que d\'habitude. Recharge cette page dans une minute : ton projet est conservé et tes crédits arriveront.</p><button class="btn big" data-v="closeMd">OK</button>');return}
  await syncProfile();closeMd();track("paid_return");
  if(rs&&fl&&fl.video){
    S.cur=newCur();
    try{await ensureJob();try{await IDB.del()}catch(e){}finish({k:"credit"})}
    catch(e){S.cur=null;go("pay");const er=$("#pErr");if(er)er.textContent=e.message}
    return}
  try{await IDB.del()}catch(e){}
  toast("Merci ! Ton achat est activé.");go("dash");
}
function syncPay(opts){const o=opts.find(x=>x.k===S.plan),t=ptotal(o);$("#payPz").innerHTML=(o.free&&!bumpOn(o))?"<b>0 €</b>":(bumpOn(o)?"<b>"+eur(t)+"</b>":(o.old?"<s>"+eur(o.old)+"</s>":"")+"<b>"+eur(o.p)+"</b>");$("#payBtn").textContent=t===0?"Débloquer ma vidéo":"Payer "+eur(t)}
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const RENEW=30*864e5;
/* achat direct d'un pack / abonnement, sans vidéo en cours */
function buy(k){
  const pl=PLANS.find(x=>x.k===k);if(!pl||!pl.p)return;if(rank()>0&&S.user){toast("Tu as déjà un abonnement actif. Gère-le depuis Mon compte.");return}
  if(!S.user){S.back=document.body.dataset.s;S.buyK=k;track("buy_login",{k:k});go("auth");return}
  track("buy_open",{k:k});
  if(!aiAvailPay()){payLater();return}
  startCheckout(k==="agence"?{kind:"agence"}:{kind:"pack",plan:k},{video:false,before:S.credits,grant:pl.c,ebook:false});
}
async function openPortal(action){
  try{const u=await CL.portal(action==='cancel'?'cancel':'');location.assign(u)}
  catch(e){const er=$("#pErr");if(er&&document.body.dataset.s==="pay")er.textContent=e.message;else toast(e.message)}
}
function newCur(){return{id:Date.now(),listing:S.id,dur:S.dur,q:S.q,fmt:S.fmt,n:S.n,date:new Date().toLocaleDateString("fr-FR"),caps:S.caps,ai:!!S.ai,motion:S.motion,grade:S.grade,job:null}}
function finish(o){track("pay_success",{plan:o.k});go("rd2")}
/* Débit des crédits côté serveur : une seule fois par vidéo, remboursé si le montage échoue. */
async function ensureJob(){
  const c=S.cur;if(c.job)return c.job;
  const id=await CL.startJob({url:"https://www.airbnb.com/rooms/"+c.listing,duration:c.dur,quality:c.q,fmt:c.fmt,motion:c.motion,grade:c.grade,ai:c.ai});
  c.job=id;await syncProfile();return id;
}

/* ---------- 6. montage en cours ---------- */
/* Plans IA : on montre les clips, le client décoche ceux qui ne ressemblent pas à son logement. */
function previewClips(clips){return new Promise(res=>{
  const urls=clips.map(b=>b?URL.createObjectURL(b):null);
  $("#rT").textContent="Vérifie les plans";$("#rL").style.maxWidth="none";
  $("#rL").innerHTML='<li class="cpw" style="list-style:none"><p class="mut sm" style="margin-bottom:10px">L\'IA a seulement bougé la caméra. Vérifie que chaque plan reste fidèle à ton logement : décoche ceux qui ne te conviennent pas, ils seront remplacés par la photo.</p><div class="cpg">'+clips.map((b,i)=>b?'<label class="cpi"><video src="'+urls[i]+'" muted loop autoplay playsinline></video><span><input type="checkbox" data-i="'+i+'" checked> Plan '+(i+1)+'</span></label>':'<div class="cpi off"><span>Plan '+(i+1)+' : photo seule (remboursé)</span></div>').join("")+'</div><button class="btn big" id="cpOk" style="margin-top:14px">Valider et créer ma vidéo</button><button class="btn gh" id="cpNo" style="margin-top:8px;width:100%">Ça ne ressemble pas à mon logement : me rembourser</button></li>';
  const done=r=>{urls.forEach(u=>u&&URL.revokeObjectURL(u));res(r)};
  $("#cpOk").onclick=()=>{const on=new Set($$("#rL input[data-i]").filter(x=>x.checked).map(x=>+x.dataset.i));done({keep:clips.map((b,i)=>!!b&&on.has(i))})};
  $("#cpNo").onclick=()=>done({refund:true});
})}
async function aiStage(M,ph,job,set,alive){
  const plan=M.aiPlan(ph.list.length,S.cur.dur),images=plan.map(i=>ph.list[i]);
  const r=await CL.aiClips({job,images,onProgress:(d,n)=>{alive();set(0.4*d/n);$("#rT").textContent="Animation IA : "+d+" / "+n+" plans"}});
  alive();
  if(r.refunded>0){await syncProfile();toast(crl(r.refunded)+" remboursé"+(r.refunded>1?"s":"")+" pour "+(r.refunded>1?"les plans":"le plan")+" que l'IA n'a pas pu faire.")}
  if(!r.clips.some(Boolean))return{clips:null};
  set(0.4);
  const d=await previewClips(r.clips);
  if(d.refund)return{refund:true};
  alive();
  return{clips:r.clips.map((b,i)=>d.keep[i]?b:null)};
}
function runRd(){
  const c0=S.cur,ai=!!(c0&&c0.ai);
  const L=ai?["Préparation des photos","Animation IA des plans","Aperçu à valider","Montage des plans","Export "+QUA.find(q=>q.k===c0.q).l+" "+c0.dur+" s"]:["Préparation des photos","Montage des plans","Mouvements et transitions","Export "+QUA.find(q=>q.k===S.q).l+" "+S.dur+" s"];
  $("#rL").style.maxWidth="";$("#rL").innerHTML=L.map(x=>'<li><span class="ic"></span>'+x+'</li>').join("");
  const li=$$("#rL li"),C=364.4;let cancelled=false;
  const set=p=>{$("#rC").style.strokeDashoffset=C*(1-p);$("#rP").textContent=Math.round(p*100)+"%";const k=Math.min(L.length-1,Math.floor(p*L.length));li.forEach((e,j)=>{e.className=j<k?"d":(j===k?"a":"")});$("#rT").textContent=L[k]};
  set(0);const keep=()=>{if(document.body.dataset.s!=="rd2")cancelled=true};
  (async()=>{
    let job=null;
    const bail=()=>{if(job&&!ai&&c0.job){const j=job;c0.job=null;CL.finishJob(j,false,"cancelled").then(()=>syncProfile()).catch(()=>{})}};
    try{
      const M=await rmod(),cap=await M.canRender(c0.q,c0.fmt);
      if(!cap.ok)throw new Error(cap.reason);
      const ph=await realPhotos();
      if(ai&&ph.demo)throw new Error("L'animation IA demande tes propres photos.");
      job=await ensureJob();
      let clips=null;
      if(ai){
        const r=await aiStage(M,ph,job,set,keep);
        if(cancelled){bail();return}
        if(r.refund){
          const f=await CL.finishJob(job,false,"ai_rejected");c0.job=null;await syncProfile();track("ai_refund",{r:f});
          toast(f==="refunded"?"C'est remboursé : tes crédits sont rendus.":"Remboursement impossible pour le moment (trop de demandes aujourd'hui).");
          S.cs=2;go("cfg");return}
        clips=r.clips;
      }
      const blob=await M.renderVideo({photos:ph.list,seconds:c0.dur,quality:c0.q,fmt:c0.fmt,motion:c0.motion,grade:c0.grade,clips,onProgress:p=>{keep();set(ai?0.6+0.4*p:p)}});
      if(cancelled){bail();return}
      try{await CL.finishJob(job,true)}catch(e){}
      if(S.blobUrl)URL.revokeObjectURL(S.blobUrl);S.blobUrl=URL.createObjectURL(blob);S.blob=blob;S.blobSize=blob.size;c0.demo=ph.demo;c0.ai=!!(clips&&clips.some(Boolean));
      li.forEach(e=>e.className="d");set(1);S.videos.unshift(c0);save();track("render_done",{demo:ph.demo,mb:Math.round(blob.size/1e5)/10});later(()=>go("done"),400)
    }catch(e){
      const msg=String(e&&e.message||e);
      track("render_error",{m:msg.slice(0,80)});
      if(job&&!c0.noRefund){try{await CL.finishJob(job,false,msg)}catch(_){}c0.job=null;try{await syncProfile()}catch(_){}}
      if(cancelled)return;
      $("#rT").textContent="Le montage a échoué";
      $("#rL").innerHTML='<li class="cpw" style="list-style:none;color:var(--mut);line-height:1.5">'+esc(msg||"Erreur inconnue")+(job?'<br><br>Tes crédits ont été rendus.':'')+'<br><br><button class="btn" id="rRetry">Réessayer</button> <button class="btn gh" id="rQ">Choisir une qualité plus basse</button></li>';
      const r=$("#rRetry");if(r)r.onclick=()=>go("rd2");const q=$("#rQ");if(q)q.onclick=()=>{c0.q=c0.q==="4k"?"fhd":"hd";S.q=c0.q;go("rd2")}
    }
  })();
}

/* ---------- 7. terminé ---------- */
let stars=0;
function renderDone(){
  const c=S.cur;stars=0;
  $("#doneCard").innerHTML='<p class="kk">C\'EST FAIT</p><h2>Ta vidéo est prête</h2><p class="mut">'+c.dur+' s · '+QUA.find(q=>q.k===c.q).l+(c.ai?' · Animation IA':' · montage diaporama')+' · sans filigrane'+(c.demo?' · vidéo d\'exemple':'')+'</p><div class="phw" style="margin:18px 0"><div class="ph"><div id="dnPh" style="position:absolute;inset:0"></div><div class="nt"></div></div></div>'+
  '<button class="btn big" id="dl" style="margin-top:0">Télécharger la vidéo (MP4)</button><button class="btn gh big" id="shr" style="margin-top:10px;height:52px">Envoyer la vidéo (WhatsApp, SMS…)</button>'+
  nextSteps()+'<div class="rvw" style="margin-top:26px;border-top:1px solid var(--ln);padding-top:20px">'+rvHtml()+'</div>'+
  '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap"><button class="btn" id="nv">Créer une autre vidéo</button><button class="btn gh" id="mv">Mes vidéos</button></div>';
  if(doneP)doneP.stop();
  if(S.blobUrl&&c.fmt!=="v"){const w=$("#dnPh").closest(".phw");if(w)w.innerHTML='<video src="'+S.blobUrl+'" controls playsinline loop muted autoplay style="width:100%;aspect-ratio:'+(c.fmt==="s"?"1/1":"16/9")+';border-radius:14px;background:#000;object-fit:cover"></video>'}
  else if(S.blobUrl){$("#dnPh").innerHTML='<video src="'+S.blobUrl+'" controls playsinline loop muted autoplay style="width:100%;height:100%;object-fit:cover;background:#000"></video>'}else doneP=Player($("#dnPh"),mkPhotos(c.n>8?8:c.n),2.4).start();
  $("#dl").onclick=()=>{if(!S.blobUrl){toast("Ta vidéo n'est plus en mémoire : relance le montage depuis Mes vidéos.");return}track("download");const a=document.createElement("a");a.href=S.blobUrl;a.download="cliploc-"+c.listing+"-"+c.dur+"s.mp4";document.body.appendChild(a);a.click();a.remove()};
  $("#shr").onclick=async()=>{if(!S.blob){toast("Ta vidéo n'est plus en mémoire : relance le montage depuis Mes vidéos.");return}
    try{const f=new File([S.blob],"video-cliploc.mp4",{type:"video/mp4"});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:"Ma vidéo Cliploc"});track("share");return}}catch(e){if(e&&e.name==="AbortError")return}
    toast("L'envoi direct n'est pas disponible ici : télécharge la vidéo, puis envoie-la par WhatsApp, SMS ou email.")};
  rvBind($("#doneCard .rvw"));
  msgBuilder($("#mbBox"));
  const bg=$("#balGo");if(bg)bg.onclick=()=>go("dash");
  const np=$("#nxPk");if(np)np.onclick=()=>{track("next_pack");prGo("packs")};
  const na=$("#nxAg");if(na)na.onclick=()=>{track("next_agence");buy("agence")};
  const ne=$("#nxEb");if(ne)ne.onclick=()=>{track("next_ebook");go("eb")};
  $("#nv").onclick=()=>{S.url="";S.cur=null;focusBar()};$("#mv").onclick=()=>go("dash");
}


/* ---------- onglets ---------- */
const NAVS=[["lp","Accueil"],["p","Formules"],["ex","Exemples"],["eb","Formation Airbnb","NOUVEAU"],["fq","Contact"]];
S.tiers={};S.prMode="unit";S.ledger=[];S.credTotal=0;S.name=LS.get("vt_name","");S.price=LS.get("vt_price",60);S.renew=0;
S.tiers={essentiel:S.tiers&&S.tiers.essentiel===true,pro:S.tiers&&S.tiers.pro===true};try{cleanState()}catch(e){}
let exP=[];
function nav(){
  const cur=document.body.dataset.s;
  const act=k=>k===cur||(cur==="pr"&&k==="p");
  const h=NAVS.map(n=>'<button class="tb'+(act(n[0])?" on":"")+'" data-v="nav" data-a="'+n[0]+'">'+n[1]+(n[2]?'<em>'+n[2]+'</em>':'')+'</button>').join("");
  $("#nvD").innerHTML=h;const t=$("#tabs");t.innerHTML=h;const on=$(".on",t);if(on)t.scrollLeft=Math.max(0,on.offsetLeft-24);
}

function navGo(k){if(k==="p"||k==="u"){go("pr")}else go(k)}
function prGo(m){S.prMode=m;go("pr")}
function pick(k){S.want=k;toast("Colle ton lien : tu paieras ce plan à la dernière étape.");focusBar()}

/* ---------- exemples ---------- */
const GAL=[["Villa avec piscine","30 S · FULL HD",[1,4,0,2]],["Appartement en ville","15 S · HD",[0,3,5,2]],["Maison de vacances","45 S · FULL HD",[4,1,2,3]],["Studio cosy","15 S · HD",[2,5,0]],["Gîte avec terrasse","30 S · FULL HD",[4,3,1,5]],["Loft design","60 S · 4K",[3,0,5,2,4]]];
let REAL={hero:[],videos:[]};
function loadReal(){return fetch("examples/manifest.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(m=>{
  if(!m)return;
  const ok=u=>typeof u==="string"&&/^examples\/[A-Za-z0-9_.-]+$/.test(u);
  REAL.hero=(Array.isArray(m.hero)?m.hero:[]).filter(ok);
  REAL.videos=(Array.isArray(m.videos)?m.videos:[]).filter(v=>v&&ok(v.src)&&ok(v.poster)).slice(0,12);
  if(REAL.hero.length>=3){heroPhotos=REAL.hero.map(u=>({u:u,c:""}));if(heroP){heroP.stop();heroP=Player($("#heroPh"),heroPhotos,2.4).start()}}
  if(!$("#ex").hidden)gallery();
}).catch(()=>{})}
function gallery(){
  if(REAL.videos.length){
    $("#galBox").innerHTML=REAL.videos.map(v=>'<div class="gc"><div class="ph"><video src="'+v.src+'" poster="'+v.poster+'" muted loop playsinline preload="none" controls style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000"></video></div><b>'+esc(v.title||"")+'</b><small>'+esc(v.meta||"")+'</small><button class="btn gh s" data-v="focus">Faire la mienne</button></div>').join("");
    return;
  }
  $("#galBox").innerHTML=GAL.map((g,i)=>'<div class="gc"><div class="ph"><div id="gx'+i+'" style="position:absolute;inset:0"></div></div><b>'+g[0]+'</b><small>'+g[1]+'</small><button class="btn gh s" data-v="focus">Faire la mienne</button></div>').join("");
  GAL.forEach((g,i)=>{exP.push(Player($("#gx"+i),g[2].map(q=>({s:q,c:SCAP[q]})),2+((i%3)*.3)).start())});
}

/* ---------- formation (ebook) ---------- */
const CHAP=[["Le business en dix minutes","Ce que tu vends, à qui, et combien il te reste à la fin."],["Tes clients","Six profils, ce qu'ils veulent, et par qui commencer."],["Se mettre en règle","Micro-entreprise, factures, droit sur les photos, prospection autorisée."],["Ton offre et tes prix","Trois offres, calcul de marge avec les vrais tarifs."],["Ta vitrine","Trois vidéos d'exemple, profil Instagram, WhatsApp Business."],["Dix méthodes pour trouver des clients","Entourage, Facebook, Instagram, LinkedIn, partenaires, terrain…"],["Quatorze messages à copier","Premier contact, relances, devis, livraison, avis."],["Le déroulé d'une vente","Sept étapes, de la démo au paiement et à la recommandation."],["Répondre aux objections","Dix objections courantes et comment y répondre."],["Faire grandir ton activité","Packs, abonnements, objectifs mensuels."],["T'organiser et suivre tes chiffres","Semaine type, feuille de suivi, entonnoir."],["Livrer comme un pro","Checklist, formats, conseils de publication."],["Les erreurs à éviter","Douze erreurs et quoi faire à la place."],["Plan d'action sur 30 jours","Un calendrier jour par jour."]];
async function dlEb(){track("ebook_download");toast("Préparation du PDF…");const r=await CL.ebook();if(!r.ok){toast(r.error);return}const u=URL.createObjectURL(r.blob),a=document.createElement("a");a.href=u;a.download="Cliploc-La-formation.pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000)}
const EB_PRICE=39;
S.ebook=false;
function renderEb(){
  $("#chBox").innerHTML=CHAP.map((c,i)=>'<div class="ch"><b class="n">'+String(i+1).padStart(2,"0")+'</b><div><b>'+c[0]+'</b><span>'+c[1]+'</span></div></div>').join("");
  $("#ebBuy").innerHTML='<div class="pz">'+(bfOn()?'<s>'+eur(EB_PRICE)+'</s>':'')+'<b>'+eur(sale(EB_PRICE))+'</b><span class="mut sm">TTC · paiement unique</span></div>'+
   '<ul><li>Guide PDF de 44 pages, 14 chapitres, 12 schémas</li><li>14 messages à copier et calculs de marge</li><li>Plan d\'action sur 30 jours et modèles (devis, autorisation photo)</li></ul>'+
   (S.ebook?'<button class="btn big" id="ebDl">Télécharger le PDF</button>':'<button class="btn big" id="ebGo">Obtenir la formation</button>');
  const g=$("#ebGo");if(g)g.onclick=buyEbook;
  const d=$("#ebDl");if(d)d.onclick=dlEb;
  track("view_ebook");
}
function buyEbook(){
  if(!S.user){S.back="eb";track("ebook_login");go("auth");return}
  track("ebook_checkout");
  if(!aiAvailPay()){payLater();return}
  startCheckout({kind:"ebook"},{video:false,before:S.credits,grant:0,ebook:true});
}

/* ---------- 8. mes vidéos ---------- */
function rvHtml(){return '<p class="kk">TON AVIS</p><b>Tu es satisfait du résultat ?</b><div class="stars rvs">'+[1,2,3,4,5].map(n=>'<button type="button" data-n="'+n+'" aria-label="'+n+' étoiles">★</button>').join("")+'</div><input class="inp rvn" maxlength="40" autocomplete="given-name" placeholder="Ton prénom et l\'initiale de ton nom (ex. Julie M.)"><textarea class="inp rvt" maxlength="500" placeholder="Ton avis, en quelques phrases (20 caractères minimum)"></textarea><p class="mut sm" style="margin:2px 0 10px">Ton avis est affiché avec ce nom après vérification. Seuls les clients qui ont terminé une vidéo peuvent en laisser un.</p><button type="button" class="btn gh big rvb" style="height:50px">Envoyer mon avis</button>'}
function rvBind(root){if(!root)return;let stars=0;const q=s=>root.querySelector(s);
  {const n0=q(".rvn"),p=S.pf||{};if(n0&&!n0.value&&p.first_name)n0.value=(p.first_name+(p.last_name?" "+p.last_name.charAt(0).toUpperCase()+".":"")).slice(0,40)}
  $$(".rvs button",root).forEach(b=>b.onclick=()=>{stars=+b.dataset.n;$$(".rvs button",root).forEach((x,i)=>x.classList.toggle("on",i<stars))});
  q(".rvb").onclick=async()=>{const b=q(".rvb"),n=q(".rvn").value.trim(),t=q(".rvt").value.trim();
    if(!stars){toast("Choisis une note.");return}if(n.length<2){toast("Indique ton prénom.");return}if(t.length<20){toast("Ton avis doit faire au moins 20 caractères.");return}
    b.disabled=true;const r=await CL.submitReview(stars,t,n);b.disabled=false;if(!r.ok){toast(r.error);return}
    track("review",{stars:stars});root.innerHTML='<p class="kk">TON AVIS</p><b>Merci !</b><p class="mut sm" style="margin-top:6px">Ton avis sera publié après vérification.</p>'}}
/* ---------- Mon compte : profil, photo, crédits, vidéos ---------- */
const AC_TABS=[["ov","Vue d'ensemble"],["pf","Mes infos"],["vd","Mes vidéos"],["eb","Formation"],["mb","Mon message"]];
const PFK=["first_name","last_name","username","phone","company","addr1","zip","city","country"];
const PFL={first_name:"Prénom",last_name:"Nom",username:"Nom d'utilisateur",phone:"Téléphone",company:"Société ou conciergerie",addr1:"Adresse",zip:"Code postal",city:"Ville",country:"Pays"};
const PFM={first_name:60,last_name:60,username:30,phone:20,company:80,addr1:120,zip:12,city:60,country:60};
function dispName(){const p=S.pf||{};return String(p.first_name||p.username||(S.user&&S.user.email?S.user.email.split("@")[0]:"")||"").slice(0,40)}
function fullName(){const p=S.pf||{};return String([p.first_name,p.last_name].filter(Boolean).join(" ")||p.username||(S.user&&S.user.email?S.user.email.split("@")[0]:"")||"")}
function avHtml(px){const f=Math.round(px*.42),ini=esc((dispName()||"?").charAt(0).toUpperCase());
  return S.avUrl?'<img class="avi" src="'+S.avUrl+'" alt="" width="'+px+'" height="'+px+'">':'<span class="avi" style="width:'+px+'px;height:'+px+'px;font-size:'+f+'px" aria-hidden="true">'+ini+'</span>'}
function pfPct(){const p=S.pf||{};return Math.round([p.avatar_path,p.first_name,p.last_name,p.username,p.phone,p.city].filter(Boolean).length/6*100)}
function pfCheck(d){
  if(d.username&&!/^[a-z0-9_.-]{3,30}$/.test(d.username))return "Nom d'utilisateur : 3 à 30 caractères, lettres minuscules, chiffres, point, tiret ou tiret bas.";
  if(d.phone&&!/^\+?[0-9 .()-]{6,20}$/.test(d.phone))return "Numéro de téléphone invalide (chiffres, espaces, + et tirets).";
  for(const k of PFK){if(d[k].length>PFM[k])return PFL[k]+" : "+PFM[k]+" caractères au maximum.";if(/[<>\u0000-\u001f]/.test(d[k]))return PFL[k]+" : les caractères < et > ne sont pas acceptés."}
  return ""}
async function avBlob(file){
  if(!/^image\//i.test(file.type||"")&&!/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name||""))throw new Error("type");
  if(file.size>12e6)throw new Error("big");
  let bmp;try{bmp=await createImageBitmap(file,{imageOrientation:"from-image"})}catch(e){bmp=await createImageBitmap(file)}
  const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,256,256);
  const m=Math.min(bmp.width,bmp.height);x.drawImage(bmp,(bmp.width-m)/2,(bmp.height-m)/2,m,m,0,0,256,256);if(bmp.close)bmp.close();
  const b=await new Promise(r=>c.toBlob(r,"image/jpeg",.86));if(!b)throw new Error("enc");return b}
async function loadDetails(){
  let d=null;try{d=await CL.details()}catch(e){}
  if(!d)return;
  S.pf=d;
  if(d.avatar_path&&!S.avUrl){let b=null;try{b=await CL.avatarGet()}catch(e){}if(b)S.avUrl=URL.createObjectURL(b)}
  if(!d.avatar_path&&S.avUrl){try{URL.revokeObjectURL(S.avUrl)}catch(e){}S.avUrl=""}
  hdr();if(document.body.dataset.s==="dash")renderDash();
}
function setTab(k){if(!AC_TABS.some(t=>t[0]===k))k="ov";S.dtab=k;
  $$(".acb").forEach(b=>{const on=b.dataset.t===k;b.classList.toggle("on",on);b.setAttribute("aria-current",on?"page":"false")});
  $$(".acpn").forEach(x=>{x.hidden=x.id!=="ac_"+k});
  const h=$("#acH");if(h)h.textContent="Mon compte : "+AC_TABS.find(t=>t[0]===k)[1]}
function renderDash(){
  if(!S.user){go("auth");return}
  const p=S.pf||{},v=S.videos,c=S.credits,tot=Math.max(S.credTotal,c),pct=tot?Math.round(c/tot*100):0;
  const dt=t=>new Date(t).toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
  const led=S.ledger.slice().reverse(),pp=pfPct(),hasAv=!!(S.avUrl||p.avatar_path);
  const side='<aside class="acs"><div class="crd acp">'+avHtml(88)+'<b class="acnm">'+esc(fullName())+'</b>'+(p.username?'<span class="acun">@'+esc(p.username)+'</span>':'')+'<span class="acem">'+esc(S.user.email)+'</span><div class="acbd"><span class="pill">'+TNAME[rank()]+'</span><span class="pill">'+c+' crédit'+(c>1?"s":"")+'</span></div></div>'+
    '<nav class="acn" aria-label="Mon compte">'+AC_TABS.map(t=>'<button type="button" class="acb" data-t="'+t[0]+'">'+t[1]+'</button>').join("")+'</nav><button type="button" class="lk acout" data-v="logout">Se déconnecter</button></aside>';
  const ov='<div class="crd"><p class="kk">'+(dispName()?'Bonjour '+esc(dispName()):'Mon compte')+'</p><h2>Mes crédits</h2><div class="bal2"><b>'+c+'</b><span>crédit'+(c>1?"s":"")+' restant'+(c>1?"s":"")+(rank()>0?" ce mois-ci":"")+'</span></div><p class="mut sm" style="margin-top:6px">Ta formule : <b>'+TNAME[rank()]+'</b>'+(rank()<3?' · 4K '+(rank()>=2?'débloquée':'verrouillée')+' · '+(rank()>=1?'tous les styles':'styles Dynamique et Visite'):' · tout est débloqué')+'</p>'+
   (S.credTotal>0?'<div class="pb" style="margin:12px 0 6px"><i style="width:'+pct+'%"></i></div><p class="mut sm">'+(tot-c)+' utilisé'+((tot-c)>1?"s":"")+' sur '+tot+'</p>':'<p class="mut sm" style="margin-top:8px">Tu n\'as pas encore de crédits. Choisis une formule : tu en reçois chaque mois et tu arrêtes quand tu veux.</p>')+
   (rank()>0?'<div class="subc"><b>Abonnement '+TNAME[rank()]+' · actif</b><span>'+PLANS[rank()].c+' crédits par mois, renouvelés chaque mois. Les crédits non utilisés sont conservés.</span><div class="subb"><button class="btn dng" id="subC">Résilier mon abonnement</button><button class="lk" id="subX">Gérer mon abonnement</button></div><small class="mut">Tu gardes ton abonnement et tes crédits jusqu\'à la fin du mois déjà payé. Rien n\'est repris ensuite.</small></div>':'')+
   '<div class="nxb" style="margin-top:14px"><button class="btn" id="dBuyP">Voir les formules</button></div>'+
   '<p class="note">1 crédit = 15 s en HD. Le nombre de crédits d\'une vidéo est affiché avant de payer. Tu reçois un email quand il t\'en reste 2.</p></div>'+
   (pp<100?'<div class="crd acnx"><b>Ton profil est complet à '+pp+' %</b><div class="pb" style="margin:10px 0 8px"><i style="width:'+pp+'%"></i></div><p class="mut sm">Ajoute ta photo et tes coordonnées pour personnaliser ton compte.</p><button type="button" class="btn gh s" id="ovPf" style="margin-top:10px">Compléter mon profil</button></div>':'')+
   (led.length?'<div class="crd"><p class="kk">HISTORIQUE</p>'+led.slice(0,12).map(e=>'<div class="lg2"><span>'+esc(e.l)+'<small>'+dt(e.at)+'</small></span><b class="'+(e.d>0?"pos":e.d<0?"neg":"")+'">'+(e.d>0?"+"+e.d:e.d<0?e.d:"—")+'</b></div>').join("")+'</div>':'');
  const inp=(k,extra)=>'<label'+(extra&&extra.full?' class="full"':'')+'><span>'+PFL[k]+(extra&&extra.opt?' <small>(facultatif)</small>':'')+'</span><input class="inp" id="pf_'+k+'" name="'+k+'" maxlength="'+PFM[k]+'"'+(extra&&extra.attrs?' '+extra.attrs:'')+'></label>';
  const pf='<div class="crd"><p class="kk">MES INFOS</p><h2>Mon profil</h2><div class="pfph"><div id="pfAv">'+avHtml(96)+'</div><div class="pfbt"><div><button type="button" class="btn gh s" id="pfPick">'+(hasAv?'Changer la photo':'Ajouter une photo')+'</button>'+(hasAv?' <button type="button" class="lk" id="pfDel">Retirer</button>':'')+'</div><input type="file" id="pfFile" accept="image/*" hidden><p class="mut sm">Photo recadrée en carré. Elle reste privée : seul ton compte peut la voir.</p></div></div>'+
   '<form id="pfForm" novalidate><div class="pff">'+inp("first_name",{attrs:'autocomplete="given-name"'})+inp("last_name",{attrs:'autocomplete="family-name"'})+inp("username",{attrs:'autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="ex. julie.m"',full:true,opt:true})+
   '<label class="full"><span>Adresse email</span><input class="inp" id="pf_email" type="email" disabled></label>'+
   inp("phone",{attrs:'type="tel" inputmode="tel" autocomplete="tel" placeholder="ex. 06 12 34 56 78"',full:true,opt:true})+inp("company",{attrs:'autocomplete="organization"',full:true,opt:true})+inp("addr1",{attrs:'autocomplete="street-address"',full:true,opt:true})+inp("zip",{attrs:'autocomplete="postal-code" inputmode="text"',opt:true})+inp("city",{attrs:'autocomplete="address-level2"',opt:true})+inp("country",{attrs:'autocomplete="country-name"',full:true,opt:true})+
   '</div><p class="pfe" id="pfErr" role="alert"></p><button type="submit" class="btn" id="pfSave" style="margin-top:6px">Enregistrer</button></form>'+
   '<p class="note" style="margin-top:14px">Tous les champs sont facultatifs. Ces informations servent à personnaliser ton compte : elles restent privées, ne sont jamais affichées publiquement et ne sont pas utilisées pour t\'envoyer de la publicité. Pour changer ton adresse email, écris-nous depuis la page Contact.</p></div>'+
   '<div class="crd"><p class="kk">SÉCURITÉ</p><h2>Mot de passe</h2><form id="pwForm" novalidate><div class="pff"><label><span>Nouveau mot de passe</span><input class="inp" id="pw1" type="password" autocomplete="new-password" placeholder="8 caractères minimum"></label><label><span>Répète-le</span><input class="inp" id="pw2" type="password" autocomplete="new-password"></label></div><p class="pfe" id="pwErr" role="alert"></p><button type="submit" class="btn gh s" id="pwSave">Changer mon mot de passe</button></form></div>'+
   '<div class="crd dgr"><p class="kk">ZONE SENSIBLE</p><h2>Supprimer mon compte</h2><p class="mut sm" style="margin:6px 0 12px">Efface définitivement ton compte : profil, photo, vidéos, historique et crédits restants. Les factures restent conservées chez notre prestataire de paiement, comme la loi l\'impose.</p><button type="button" class="btn dng s" id="delAcc">Supprimer mon compte</button></div>';
  const vd='<div class="crd"><p class="kk">MES VIDÉOS</p>'+
   (v.length?'<div class="vl">'+v.map(x=>'<div class="vi"><div class="th">'+scn(0)+'</div><div style="flex:1"><b>Annonce '+esc(x.listing)+'</b><small>'+(+x.dur||0)+' s · '+esc((QUA.find(q=>q.k===x.q)||QUA[0]).l)+' · '+esc(x.date)+'</small></div></div>').join("")+'</div><p class="note" style="margin-top:12px">Cliploc ne conserve pas tes fichiers vidéo : télécharge ta vidéo à la fin du montage, avant de quitter la page.</p>':'<div class="empty">Aucune vidéo pour l\'instant.<br><br><button class="btn" data-v="focus">Créer ma première vidéo</button></div>')+'</div>'+
   (v.length?'<div class="crd rvw">'+rvHtml()+'</div>':'');
  const eb=S.ebook?'<div class="crd"><p class="kk">MA BIBLIOTHÈQUE</p><b>Formation Airbnb · guide PDF</b><div style="margin-top:10px"><button class="btn gh s" data-v="dl">Télécharger</button></div></div>':'<div class="crd"><p class="kk">FORMATION</p><b>Formation Airbnb · guide PDF</b><p class="mut sm" style="margin-top:6px">Un guide pour proposer ta vidéo à des propriétaires et remplir ton calendrier.</p><div style="margin-top:12px"><button class="btn gh s" data-v="go" data-a="eb">Découvrir la formation</button></div></div>';
  const mb='<div class="crd"><p class="kk">MON MESSAGE POUR LES PROPRIÉTAIRES</p><div id="mbBox"></div></div>';
  $("#dashBox").innerHTML=side+'<div class="acm"><h1 class="vh" id="acH">Mon compte</h1><section class="acpn" id="ac_ov">'+ov+'</section><section class="acpn" id="ac_pf" hidden>'+pf+'</section><section class="acpn" id="ac_vd" hidden>'+vd+'</section><section class="acpn" id="ac_eb" hidden>'+eb+'</section><section class="acpn" id="ac_mb" hidden>'+mb+'</section></div>';
  PFK.forEach(k=>{$("#pf_"+k).value=p[k]||""});$("#pf_email").value=S.user.email;
  msgBuilder($("#mbBox"));
  $$(".acb").forEach(b=>b.onclick=()=>{setTab(b.dataset.t);if(window.matchMedia("(max-width:899px)").matches){const m=$(".acm");if(m)m.scrollIntoView({block:"start",behavior:"smooth"})}});
  const op=$("#ovPf");if(op)op.onclick=()=>setTab("pf");
  $("#dBuyP").onclick=()=>prGo("packs");
  const sx=$("#subX");if(sx)sx.onclick=async()=>{sx.disabled=true;await openPortal();sx.disabled=false};
  const sc=$("#subC");if(sc)sc.onclick=async()=>{sc.disabled=true;sc.textContent="Ouverture…";await openPortal("cancel");sc.disabled=false;sc.textContent="Résilier mon abonnement"};
  if(v.length)rvBind($("#ac_vd .rvw"));
  $("#pfPick").onclick=()=>$("#pfFile").click();
  $("#pfFile").onchange=async e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;
    const pk=$("#pfPick");pk.disabled=true;pk.textContent="Envoi…";
    try{const blob=await avBlob(f);const r=await CL.avatarSet(blob);if(!r.ok){toast(r.error);pk.disabled=false;pk.textContent=hasAv?"Changer la photo":"Ajouter une photo";return}
      if(S.avUrl){try{URL.revokeObjectURL(S.avUrl)}catch(x){}}S.avUrl=URL.createObjectURL(blob);S.pf=Object.assign({},S.pf,{avatar_path:"1"});track("avatar_set");toast("Photo mise à jour.");hdr();renderDash();setTab("pf")}
    catch(err){pk.disabled=false;pk.textContent=hasAv?"Changer la photo":"Ajouter une photo";toast(err&&err.message==="big"?"Cette image est trop lourde (12 Mo maximum).":"Cette image n'a pas pu être lue. Essaie avec un JPEG ou un PNG.")}};
  const pd=$("#pfDel");if(pd)pd.onclick=async()=>{pd.disabled=true;const r=await CL.avatarDel();if(!r.ok){pd.disabled=false;toast(r.error);return}
    if(S.avUrl){try{URL.revokeObjectURL(S.avUrl)}catch(x){}}S.avUrl="";S.pf=Object.assign({},S.pf,{avatar_path:null});toast("Photo retirée.");hdr();renderDash();setTab("pf")};
  $("#pwForm").onsubmit=async e=>{e.preventDefault();const er=$("#pwErr"),a=$("#pw1").value,c=$("#pw2").value;er.textContent="";
    if(a.length<8){er.textContent="Le mot de passe doit faire 8 caractères minimum.";return}
    if(a!==c){er.textContent="Les deux mots de passe ne sont pas identiques.";return}
    const b=$("#pwSave");b.disabled=true;const r=await CL.setPassword(a);b.disabled=false;
    if(!r.ok){er.textContent=r.error;return}
    $("#pw1").value="";$("#pw2").value="";track("password_change");toast("Mot de passe modifié.")};
  $("#delAcc").onclick=()=>{
    openMd('<p class="kk" style="color:#D92D20">SUPPRESSION DÉFINITIVE</p><h2 style="margin-bottom:8px">Supprimer mon compte ?</h2><p class="mut">Tout sera effacé : ton profil, ta photo, tes vidéos, ton historique et tes crédits restants. Cette action ne peut pas être annulée.</p>'+(rank()>0?'<p class="mut" style="margin-top:8px"><b>Ton abonnement sera arrêté tout de suite, sans remboursement du mois en cours.</b></p>':'')+
      '<div class="fld" style="margin-top:14px"><input class="inp" id="dPw" type="password" autocomplete="current-password" placeholder="Ton mot de passe"></div><div class="fld"><input class="inp" id="dCf" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Écris SUPPRIMER pour confirmer"></div><div class="errm" id="dErr"></div><button class="btn dng big" id="dGo">Supprimer définitivement</button><button class="btn gh big" data-v="closeMd" style="margin-top:8px">Annuler</button>');
    $("#dGo").onclick=async()=>{const er=$("#dErr"),b=$("#dGo");er.textContent="";
      if(!$("#dPw").value){er.textContent="Entre ton mot de passe.";return}
      if($("#dCf").value.trim()!=="SUPPRIMER"){er.textContent="Écris le mot SUPPRIMER (en majuscules) pour confirmer.";return}
      b.disabled=true;const t0=b.textContent;b.textContent="Suppression…";
      const r=await CL.deleteAccount($("#dPw").value);b.disabled=false;b.textContent=t0;
      if(!r.ok){er.textContent=r.error;return}
      closeMd();S.videos=[];logout();track("account_deleted");toast("Ton compte et tes données ont été supprimés.")}};
  $("#pfForm").onsubmit=async e=>{e.preventDefault();const er=$("#pfErr"),b=$("#pfSave");er.textContent="";
    const d={};for(const k of PFK){let x=($("#pf_"+k).value||"").trim().replace(/\s+/g," ");if(k==="username")x=x.toLowerCase().replace(/^@/,"");d[k]=x}
    const bad=pfCheck(d);if(bad){er.textContent=bad;return}
    b.disabled=true;const t0=b.textContent;b.textContent="Enregistrement…";
    const r=await CL.saveDetails(d);b.disabled=false;b.textContent=t0;
    if(!r.ok){er.textContent=r.error;return}
    S.pf=Object.assign({},S.pf,Object.fromEntries(PFK.map(k=>[k,d[k]||null])));track("profile_save");toast("Profil enregistré.");hdr();renderDash();setTab("pf")};
  setTab(S.dtab);
}

/* ---------- tarifs ---------- */
function planCard(p){
  const unit=false;
  const per="soit "+eur(p.per)+" le crédit";
  const ft=p.f.map(x=>x[0]==="-"?'<li class="no">'+x.slice(1)+'</li>':'<li>'+x+'</li>').join("");
  return '<div class="plan'+(p.hot?" hot":"")+'">'+(p.bd?'<span class="bd2">'+p.bd+'</span>':'<span class="bd2" style="visibility:hidden">.</span>')+'<h3 style="margin-top:12px">'+p.n+'</h3><p class="mut sm" style="margin-top:4px">'+p.d+'</p>'+
  '<div class="pr">'+(unit?'<em>dès</em>':'')+(bfOn()?'<s>'+eur(p.reg)+'</s>':'')+eur(p.p)+' <small>'+p.u+'</small></div><p class="pv">'+per+(bfOn()?' · offre de lancement, prix bloqué tant que tu restes abonné':'')+'</p>'+
  '<ul>'+ft+'</ul><button class="btn'+(p.hot?"":" gh")+'" data-v="'+(unit?"focus":"buy")+'" data-a="'+p.k+'">'+"M'abonner"+'</button></div>';
}
function homeAi(){
  const b=$("#aiBand");if(!b)return;
  b.innerHTML='<div class="aiband"><div><b>Montage diaporama</b><p>Tes photos sont mises en mouvement : zoom, panoramiques, transitions. Rien n\'est généré, c\'est exactement le logement. Pour toutes les formules.</p></div><span class="lkb ok">Inclus partout</span></div>'+
  '<div class="aiband"><div><b>Animation IA'+(aiAvail()?'':' (bientôt)')+'</b><p>Chaque photo devient un court plan vidéo où l\'IA ne fait que bouger la caméra. Une IA peut se tromper : tu valides chaque plan avant le montage final, et un plan raté est remboursé.</p></div><span class="lkb">Pack Pro et Agence</span></div>';
}
function homeStyles(){
  const m=$("#hsM");if(!m)return;
  m.innerHTML=MOT.map(x=>'<div class="hsc"><b>'+esc(x[1])+'</b>'+(MINM[x[0]]?'<em class="lkb">Dès la formule '+TSHORT[MINM[x[0]]]+'</em>':'<em class="lkb ok">Inclus partout</em>')+'<p>'+esc(x[2])+'</p></div>').join("");
}
function ebCard(){
  return '<div class="crd ebs"><div><b>Tu veux juste la formation Airbnb ?</b><p class="mut sm">Guide PDF de 44 pages, 14 chapitres : trouver des clients, écrire les messages, fixer ton prix. Sans abonnement, paiement unique.</p></div>'+
    (S.ebook?'<button class="btn gh" data-v="dl">Télécharger le PDF</button>':'<button class="btn" data-v="ebuy">Acheter seule · '+(bfOn()?'<s>'+eur(EB_PRICE)+'</s> ':'')+eur(sale(EB_PRICE))+'</button>')+'</div>';
}
function stkRot(){const e=$("#stkA");if(!e||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches))return;const L=["Tous les réseaux","Instagram","TikTok","WhatsApp","Facebook","YouTube Shorts","Snapchat"];let i=0;setInterval(()=>{if(document.hidden)return;i=(i+1)%L.length;e.classList.add("stkh");setTimeout(()=>{e.textContent=L[i];e.classList.remove("stkh")},180)},2200)}
function renderPlans(el){el.classList.add("p3");el.innerHTML=PLANS.slice(1).map(planCard).join("");const eh=$("#ebHome");if(eh)eh.innerHTML=ebCard()}
function cmpTable(){
  const Y='<span class="yes">✓</span>',N='<span class="nop">–</span>';
  const rows=[["Prix d\'un crédit",PLANS.map(p=>p.reg?eur(p.per):"")],["Crédits chaque mois",["—","12","40","120"]],["Styles Dynamique et Visite",[Y,Y,Y,Y]],["Styles Drone et Cinéma",[N,Y,Y,Y]],["Couleurs",["3","6","6","6"]],["HD et Full HD",[Y,Y,Y,Y]],["4K",[N,N,Y,Y]],["Montage diaporama de tes photos",[Y,Y,Y,Y]],["Animation IA en option"+(aiAvail()?"":" (bientôt)"),[N,N,Y,Y]],["Formation Airbnb",[N,N,"Offerte","Offerte"]],["Historique des projets",[N,N,Y,Y]]];
  return '<div class="crd mx" style="margin-top:18px"><p class="kk" style="padding:10px 10px 0">Comparer les formules</p><div class="scx" tabindex="0" role="region" aria-label="Comparatif des formules"><table class="tbl cmp"><thead><tr><th><span class="vh">Détail</span></th>'+PLANS.slice(1).map(p=>'<th>'+p.n+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr><th>'+r[0]+'</th>'+r[1].slice(1).map(x=>'<td>'+x+'</td>').join("")+'</tr>').join("")+'</tbody></table></div></div>';
}
function credBox(){
  return '<div class="crd" style="margin-top:18px"><p class="kk">Comment marchent les crédits</p><p class="mut sm" style="margin:6px 0 10px">Chaque vidéo coûte un nombre de crédits selon sa durée et sa qualité. Le prix exact est affiché avant de payer.</p><div class="scx" tabindex="0" role="region" aria-label="Crédits selon la durée et la qualité"><table class="tbl cmp"><thead><tr><th><span class="vh">Détail</span></th>'+QUA.map(q=>'<th>'+q.l+'</th>').join("")+'</tr></thead><tbody>'+DUR.map(d=>'<tr><th>'+d.s+' s</th>'+QUA.map(q=>'<td><b>'+((d.p+q.x)/UNITP)+'</b></td>').join("")+'</tr>').join("")+'</tbody></table></div><ul class="gl" style="margin-top:12px"><li>Le solde s\'affiche en haut du site, à côté de « Mes vidéos ».</li><li>L\'option Animation IA (formules Pro et Agence) ajoute '+AIC+' crédits par tranche de 15 s.</li><li>Les crédits non utilisés sont conservés. Chaque mois, ton abonnement t\'en ajoute de nouveaux.</li><li>Tu reçois un email quand il t\'en reste 2.</li></ul></div>';
}
function renderPr(){
  $("#prTg").innerHTML="";
  $("#prBody").innerHTML='<div class="plans p3">'+planCard(PLANS[1])+planCard(PLANS[2])+planCard(PLANS[3])+'</div>'+ebCard()+cmpTable()+credBox()+
    '<p class="note">'+(bfOn()?"Offre de lancement jusqu\'au 30 novembre : le prix barré sera le prix normal ensuite. Si tu t\'abonnes maintenant, ton prix ne change pas tant que tu restes abonné. ":"")+'Prix TTC, abonnement mensuel renouvelé automatiquement. Tu peux arrêter à tout moment depuis Mon compte : l\'abonnement continue jusqu\'à la fin du mois payé.</p>';
}

/* ---------- compte ---------- */
function renderForgot(){
  $("#authCard").innerHTML='<p class="kk">MOT DE PASSE OUBLIÉ</p><h2>On t\'envoie un lien</h2><p class="mut sm" style="margin-top:6px">Entre l\'email de ton compte : tu reçois un lien pour choisir un nouveau mot de passe.</p><div class="fld" style="margin-top:14px"><input class="inp" id="fE" type="email" autocomplete="email" placeholder="Ton email"></div><div class="errm" id="fErr"></div><button class="btn big" id="fGo" style="margin-top:6px">Recevoir le lien</button><p class="lg"><button class="lk" id="fBk" type="button">Retour à la connexion</button></p>';
  $("#fBk").onclick=()=>renderAuth("login");
  $("#fGo").onclick=async()=>{const e=$("#fE").value.trim(),er=$("#fErr"),b=$("#fGo");er.textContent="";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)){er.textContent="Entre une adresse email valide.";return}
    b.disabled=true;const t0=b.textContent;b.textContent="Envoi…";const r=await CL.recover(e);b.disabled=false;b.textContent=t0;
    if(!r.ok){er.textContent=r.error;return}
    track("password_forgot");
    $("#authCard").innerHTML='<p class="kk">EMAIL ENVOYÉ</p><h2>Regarde ta boîte mail</h2><p class="mut" style="margin-top:8px">Si un compte existe avec <b>'+esc(e)+'</b>, un lien vient d\'être envoyé. Il est valable environ une heure. Pense à regarder les courriers indésirables.</p><button class="btn big" id="fOk">Retour à la connexion</button>';
    $("#fOk").onclick=()=>renderAuth("login")};
}
function renderReset(){
  $("#authCard").innerHTML='<p class="kk">NOUVEAU MOT DE PASSE</p><h2>Choisis ton mot de passe</h2><div class="fld" style="margin-top:14px"><input class="inp" id="rP1" type="password" autocomplete="new-password" placeholder="Nouveau mot de passe (8 caractères minimum)"></div><div class="fld"><input class="inp" id="rP2" type="password" autocomplete="new-password" placeholder="Répète-le"></div><div class="errm" id="rErr"></div><button class="btn big" id="rGo" style="margin-top:6px">Enregistrer</button>';
  $("#rGo").onclick=async()=>{const a=$("#rP1").value,c=$("#rP2").value,er=$("#rErr"),b=$("#rGo");er.textContent="";
    if(a.length<8){er.textContent="Le mot de passe doit faire 8 caractères minimum.";return}
    if(a!==c){er.textContent="Les deux mots de passe ne sont pas identiques.";return}
    b.disabled=true;const t0=b.textContent;b.textContent="Un instant…";const r=await CL.setPassword(a);b.disabled=false;b.textContent=t0;
    if(!r.ok){er.textContent=r.error;return}
    track("password_reset");toast("Mot de passe modifié. Tu es connecté.");go("dash")};
}
function renderAuth(mode){
  if(mode==="forgot")return renderForgot();
  if(mode==="reset")return renderReset();
  const su=mode==="signup";
  $("#authCard").innerHTML='<p class="kk">'+(su?"CRÉER UN COMPTE":"CONNEXION")+'</p><h2>'+(su?"Rejoins Cliploc":"Content de te revoir")+'</h2><div class="fld" style="margin-top:14px"><input class="inp" id="aE" type="email" autocomplete="email" placeholder="Ton email"></div><div class="fld"><input class="inp" id="aP" type="password" autocomplete="'+(su?"new-password":"current-password")+'" placeholder="Mot de passe"></div>'+
   (su?'<label class="ck"><input type="checkbox" id="aC"><span>J\'accepte les conditions d\'utilisation et la politique de confidentialité.</span></label>':'')+'<div class="errm" id="aErr"></div><button class="btn big" id="aGo" style="margin-top:6px">'+(su?"Créer mon compte":"Me connecter")+'</button><p class="lg">'+(su?"Déjà un compte ?":"Pas encore de compte ?")+' <button class="lk" id="aSw">'+(su?"Se connecter":"Créer un compte")+'</button></p>';
  $("#aSw").onclick=()=>renderAuth(su?"login":"signup");
  if(!su){$("#aGo").insertAdjacentHTML("afterend",'<p class="lg" style="margin-top:12px"><button class="lk" id="aFg" type="button">Mot de passe oublié ?</button></p>');$("#aFg").onclick=()=>renderAuth("forgot")}
  $("#aGo").onclick=async()=>{const e=$("#aE").value.trim(),p=$("#aP").value,er=$("#aErr");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)){er.textContent="Entre une adresse email valide.";return}
    if(p.length<8){er.textContent="Le mot de passe doit faire 8 caractères minimum.";return}
    if(su&&!$("#aC").checked){er.textContent="Accepte les conditions pour continuer.";return}
    if(!(await doAuth(su,e,p,er,$("#aGo"))))return;
    const b=S.back;S.back=null;go(b||(S.url?"gate":"dash"));if(S.buyK){const k=S.buyK;S.buyK=null;setTimeout(()=>buy(k),250)}};
}
async function doAuth(su,e,p,er,btn){
  er.textContent="";btn.disabled=true;const t0=btn.textContent;btn.textContent="Un instant…";
  try{
    const r=su?await CL.signUp(e,p):await CL.signIn(e,p);
    if(!r.ok){er.textContent=r.error;return false}
    if(r.pending){openMd('<p class="kk">EMAIL ENVOYÉ</p><h2 style="margin-bottom:10px">Confirme ton email</h2><p class="mut">Clique sur le lien reçu à '+esc(e)+' : tu reviens ici, connecté. Pense à regarder les courriers indésirables.</p><button class="btn big" data-v="closeMd">OK</button>');return false}
    S.user={email:r.email};await syncProfile();save();track(su?"signup":"login");return true;
  }finally{btn.disabled=false;btn.textContent=t0}
}
async function syncProfile(){
  let p=null,l=[];try{[p,l]=await Promise.all([CL.profile(),CL.ledger()])}catch(e){}
  if(!p){if(!CL.session()){S.user=null;S.credits=0;S.sub=false;S.tiers={essentiel:false,pro:false};S.ebook=false;hdr()}return}
  S.credits=p.credits|0;S.sub=p.plan==="agence";S.tiers={essentiel:p.plan==="essentiel"||p.plan==="pro",pro:p.plan==="pro"};S.ebook=p.ebook===true;try{const eh=$("#ebHome");if(eh)eh.innerHTML=ebCard()}catch(e){}
  const LB={video_start:"Vidéo",video_refund:"Remboursement",purchase_unit:"Achat",purchase_pack:"Achat d'un pack",subscription:"Abonnement (crédits du mois)",manual:"Crédits offerts"};
  S.ledger=l.slice().reverse().map(e=>({l:LB[e.reason]||"Opération",d:e.delta|0,at:Date.parse(e.created_at)||Date.now()}));
  const used=l.reduce((a,e)=>a+((e.reason==="video_start"||e.reason==="video_refund")?-e.delta:0),0);
  S.credTotal=S.credits+Math.max(0,used);
  hdr();if(document.body.dataset.s==="dash")renderDash();
  loadDetails().catch(()=>{});
}
function logout(){CL.signOut();if(S.avUrl){try{URL.revokeObjectURL(S.avUrl)}catch(e){}}S.pf={};S.avUrl="";S.dtab="ov";S.user=null;S.credits=0;S.sub=false;S.tiers={essentiel:false,pro:false};S.ebook=false;S.ledger=[];S.credTotal=0;S.cur=null;save();hdr();toast("Tu es déconnecté.");go("lp")}

/* ---------- pages légales ---------- */
const PAGES={
 mentions:["Mentions légales","<p>Éditeur : [nom ou raison sociale] · SIRET : [à compléter] · Adresse : [à compléter] · Contact : [email].</p><p>Hébergeur : [à compléter].</p><p>Cliploc n'est affilié ni à Airbnb, ni aux propriétaires des annonces.</p>"],
 privacy:["Confidentialité","<h3>Données collectées</h3><p>Adresse email, lien d'annonce, choix de vidéo, historique d'achats. Pas de données de santé.</p><h3>Photos</h3><p>Les photos des annonces ne sont utilisées que pour générer ta vidéo, puis supprimées après un délai à définir.</p><h3>Mesure d'audience</h3><p>Nous comptons, de façon anonyme, les étapes que franchissent les visiteurs (par exemple « a vu les tarifs »). Un identifiant aléatoire est gardé le temps de la visite, sans cookie ni lien avec ton email. Rien n'est envoyé si ton navigateur demande « Ne pas suivre ». Notre hébergeur voit ton adresse IP dans ses journaux techniques.</p><h3>Tes droits</h3><p>Accès, rectification, suppression : écris-nous. Page à compléter avant le lancement.</p>"],
 cgv:["Conditions générales de vente","<p>Page à rédiger avant le lancement : prix TTC, livraison numérique, droit de rétractation applicable aux contenus numériques, responsabilité de l'utilisateur sur les droits des photos.</p><h3>Abonnement</h3><p>Les formules Essentiel, Pro et Agence sont des abonnements mensuels, payables par carte et renouvelés automatiquement chaque mois. Chaque renouvellement ajoute au compte le nombre de crédits de la formule. Les crédits non utilisés sont conservés. L\'utilisateur peut résilier à tout moment depuis « Mon compte » : l\'abonnement reste actif jusqu\'à la fin de la période déjà payée, puis ne se renouvelle pas, et les fonctions réservées à la formule se verrouillent. Les crédits restants sont conservés.</p><h3>Droits sur les photos</h3><p>L'utilisateur confirme avoir l'accord du propriétaire des photos avant de lancer le montage.</p><h3>Fidélité de la vidéo</h3><p>La vidéo doit rester fidèle aux photos de l'annonce et au logement réel. L'utilisateur s'engage à ne pas la diffuser d'une manière qui tromperait les voyageurs sur le logement (pièces, équipements, état, surface, environnement).</p><h3>Deux types de rendu</h3><p><b>Montage diaporama</b> (toutes les formules) : les photos de l'utilisateur sont mises en mouvement par zoom, panoramiques et transitions. Aucune image n'est générée ni modifiée.</p><p><b>Animation IA</b> (option des formules Pro et Agence) : chaque photo est transformée en court plan vidéo par une intelligence artificielle, avec pour seule consigne de déplacer la caméra et l'interdiction d'ajouter, retirer ou modifier des éléments. Une IA peut cependant produire des erreurs : l'utilisateur regarde chaque plan avant le montage final, retire ceux qui ne sont pas fidèles au logement (ils sont remplacés par la photo), et ne publie que des images fidèles. Il peut aussi refuser l'ensemble et être remboursé. Un plan que l'IA n'a pas pu produire est remboursé à raison d'un crédit par plan.</p><p><i>Texte provisoire, à faire relire par un juriste avant l'ouverture au public.</i></p>"],
 contact:["Contact","<p>Écris-nous avec le formulaire de la page Contact : on te répond par email.</p>"]
};
function page(k){const p=PAGES[k];$("#pgBox").innerHTML='<p class="kk">Informations</p><h2>'+p[0]+'</h2><div style="margin-top:16px">'+p[1]+'</div>';go("pg")}

/* ---------- divers ---------- */
function openMd(h){$("#mdBox").innerHTML=h;$("#md").hidden=false}
function closeMd(){$("#md").hidden=true}
function copy(){const t=$("#msgTxt").textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast("Message copié."),()=>toast("Sélectionne le texte pour le copier."))}
const FAQ=[["Quelles annonces puis-je utiliser ?","Toute annonce Airbnb publique dont tu as le lien. Avant de lancer le montage, tu confirmes avoir l'accord du propriétaire des photos."],["Combien de temps pour avoir ma vidéo ?","L'analyse prend quelques secondes. Le montage démarre après le paiement et ta vidéo est prête en quelques minutes."],["Quelles durées et quelles qualités ?","De 15 à 60 secondes, en HD, Full HD ou 4K, au format vertical, carré ou large. Le prix dépend de la durée et de la qualité."],["Où puis-je publier ma vidéo ?","Partout où une vidéo est acceptée : Instagram, TikTok, Facebook, YouTube (Shorts), Snapchat, ton site ou ta fiche Google (30 secondes maximum). Tu peux aussi l'envoyer en privé à tes locataires par WhatsApp, SMS ou email. Certains sites d'annonces comme PAP, SeLoger ou leboncoin acceptent aussi la vidéo, selon le type d'annonce et de compte. Chaque plateforme a ses propres règles (durée, format, parfois réservé aux professionnels) et certaines refusent les montages de photos : vérifie-les avant de publier."],["Quelle différence entre le montage diaporama et l'Animation IA ?","Le montage diaporama met tes photos en mouvement (zoom, panoramiques, transitions) : rien n'est généré, c'est exactement le logement. L'Animation IA (formules Pro et Agence, en option) transforme chaque photo en court plan vidéo avec un mouvement de caméra réaliste. Comme une IA peut se tromper, tu valides chaque plan avant le montage final, et un plan raté est remboursé."],["Comment arrêter mon abonnement ?","Depuis Mon compte, bouton « Gérer mon abonnement » : tu résilies en quelques clics. Ton abonnement reste actif jusqu'à la fin du mois déjà payé. Tu gardes tes crédits restants."],["Mes crédits expirent-ils ?","Non. Les crédits non utilisés sont conservés d'un mois à l'autre. Chaque renouvellement t'en ajoute de nouveaux."],["Y a-t-il un filigrane ?","Non. La vidéo est livrée sans filigrane."],["Comment je facture le propriétaire ?","Comme tu veux. Tu fixes ton prix, tu envoies ta facture, tu gardes la différence avec ce que tu paies ici."],["Puis-je modifier la vidéo ?","Tu choisis la durée, la qualité, le format, la musique et la langue des textes avant le montage."]];
function faq(){$$("#fqBox,#fqBox2").forEach(box=>{box.innerHTML=FAQ.map(f=>'<div class="fq"><button aria-expanded="false">'+f[0]+'<i>+</i></button><p>'+f[1]+'</p></div>').join("");
  $$(".fq>button",box).forEach(b=>b.onclick=()=>{const f=b.parentNode;f.classList.toggle("o");b.setAttribute("aria-expanded",f.classList.contains("o"))})})}
/* Avis : n'affiche QUE de vrais avis de clients. Tant que la liste est vide, on montre les engagements. */
const AVIS=[];
function trustBox(){
  if(AVIS.length){$("#trK").textContent="Avis clients";$("#trH").textContent="Ils ont créé leur vidéo";$("#trBox").innerHTML='<div class="avs">'+AVIS.map(a=>'<div class="rv"><b class="s">'+"★".repeat(Math.max(1,Math.min(5,+a.stars||5)))+'</b><p style="margin:8px 0 10px">'+esc(a.text)+'</p><span class="mut sm">'+esc(a.name)+' · client vérifié</span></div>').join("")+'</div>';return}
  $("#trBox").innerHTML='<div class="trg">'+[["🔒","Paiement sécurisé","Réglé via Stripe. Tes données de carte ne passent jamais par nous."],["🎬","Sans filigrane","La vidéo livrée est propre, prête à être publiée."],["💶","Prix affiché = prix payé","Tu vois le prix avant de payer, TTC, sans frais cachés."],["🗑","Tes photos, ton contrôle","Suppression des photos après le montage et sur simple demande."]].map(x=>'<div class="trust"><i>'+x[0]+'</i><div><b>'+x[1]+'</b><span>'+x[2]+'</span></div></div>').join("")+'</div>';
}
if("IntersectionObserver" in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("v");io.unobserve(e.target)}}),{threshold:.1});$$(".vis").forEach(el=>io.observe(el))}else{$$(".vis").forEach(el=>el.classList.add("v"))}

window.V={nav:navGo,pr:prGo,pick:pick,go:go,jump:jump,focus:focusBar,start:start,demo:demo,copy:copy,page:page,logout:logout,closeMd:closeMd,toast:toast,buyEbook:buyEbook,buy:buy,dl:dlEb};
/* Clics : pas de gestionnaire inline (la politique de sécurité les interdit), liste blanche d'actions */
/* Accessibilité : chaque écran visible a un titre de niveau 1 (les titres d'écran sont des h2 mis en forme) */
(()=>{let q=0;const vis=e=>!e.closest("[hidden]");const fix=()=>{q=0;const s=document.querySelector(".scr:not([hidden])");if(!s)return;
  if([...s.querySelectorAll('h1,[role="heading"][aria-level="1"]')].some(vis))return;
  const hs=[...s.querySelectorAll("h2,h3")].filter(vis),f=hs[0];if(!f)return;f.setAttribute("role","heading");f.setAttribute("aria-level","1");
  if(!hs.some(x=>x!==f&&x.tagName==="H2"))hs.forEach(x=>{if(x.tagName==="H3")x.setAttribute("aria-level","2")})};
  const m=document.querySelector("main");if(m)new MutationObserver(()=>{if(!q)q=requestAnimationFrame(fix)}).observe(m,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});fix()})();
const ACTS={skip:()=>{const m=document.querySelector("main");if(m){m.setAttribute("tabindex","-1");m.focus()}},focus:()=>V.focus(),closeMd:()=>V.closeMd(),toast:a=>V.toast(a),pr:a=>V.pr(a==="packs"?"packs":"unit"),page:a=>PAGES[a]&&V.page(a),nav:a=>V.nav(a),logout:()=>V.logout(),go:a=>SCR.includes(a)&&V.go(a),dl:()=>V.dl(),demo:()=>V.demo(),copy:()=>V.copy(),buy:a=>V.buy(a),ebuy:()=>V.buyEbook()};
document.addEventListener("click",e=>{
  const t=e.target.closest&&e.target.closest("[data-v]");if(!t)return;
  const n=t.dataset.v,a=t.dataset.a;
  if(n==="mdbg"){if(e.target===t)closeMd();return}
  if(n==="start"){V.start(e,t.closest(".bar")||document.getElementById("bar"));return}
  if(Object.prototype.hasOwnProperty.call(ACTS,n))ACTS[n](a);
});
$("#ctGo").onclick=async()=>{const e=$("#ctE").value.trim(),m=$("#ctM").value.trim(),er=$("#ctErr"),b=$("#ctGo");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)||e.length>254){er.textContent="Entre une adresse email valide.";return}
  if(m.length<10){er.textContent="Écris un message d'au moins 10 caractères.";return}
  if(m.length>2000){er.textContent="Ton message est trop long (2 000 caractères maximum).";return}
  if(!CL.contact){er.textContent="Ta page n'est pas à jour. Recharge-la (Ctrl+F5) puis réessaie.";return}
  er.textContent="";b.disabled=true;const t0=b.textContent;b.textContent="Envoi…";
  const r=await CL.contact(e,m,($("#ctW")||{}).value||"");b.disabled=false;b.textContent=t0;
  if(!r.ok){er.textContent=r.error;return}
  track("contact_sent");$("#ctM").value="";toast("Message envoyé. On te répond par email.")};
CL.restore().catch(()=>false).then(()=>{const ss=CL.session();if(ss){S.user={email:ss.m};hdr();return CL.sweep().catch(()=>{}).then(()=>syncProfile())}}).catch(()=>{}).then(()=>{
  const q=new URLSearchParams(location.search),pd=q.get("paid")==="1",pc=q.get("pay")==="cancel";
  if(pd||pc){try{history.replaceState(null,"",location.pathname+location.hash)}catch(e){}afterPay(pd)}
  if(CL.linkError()){toast("Ce lien n'est plus valable. Redemande-en un avec « Mot de passe oublié ».");go("auth");renderAuth("forgot")}
  else if(CL.isRecovery()&&S.user){go("auth");renderAuth("reset")}});
CL.flags().then(f=>{S.flags=f;const cs=document.body.dataset.s;renderPlans($("#plHome"));homeAi();if(cs==="cfg")renderCfg();if(cs==="pr")renderPr()}).catch(()=>{});
faq();trustBox();loadReal();renderPlans($("#plHome"));homeStyles();homeAi();hdr();nav();stkRot();CL.reviews().then(l=>{if(l.length){AVIS.length=0;l.forEach(x=>AVIS.push(x));trustBox()}}).catch(()=>{});
const h0=(location.hash||"#lp").slice(1);go(h0==="lp"||SCR.indexOf(h0)<0?"lp":(NEED[h0]?"lp":h0),{nopush:true});
track("view_lp");
})();
