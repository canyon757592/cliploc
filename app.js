(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- suivi d'entonnoir (à brancher plus tard sur la base) ---------- */
const EV=[];window.__events=EV;
function track(n,p){EV.push({n:n,p:p||{},t:Date.now()});try{console.debug("[track]",n,p||"")}catch(e){}}

/* ---------- prix ---------- */
const END=new Date("2026-11-30T23:59:59+01:00").getTime(),BFR=.4;
const bfOn=()=>Date.now()<END;
const DUR=[{s:15,p:4,d:"Un teaser percutant pour les réseaux."},{s:30,p:8,d:"Le format idéal pour une annonce.",tg:"POPULAIRE"},{s:45,p:12,d:"Plus de pièces, plus de détails."},{s:60,p:16,d:"La visite complète du logement."}];
const QUA=[{k:"hd",l:"HD",r:"720p",x:0,d:"Léger, parfait pour les stories."},{k:"fhd",l:"Full HD",r:"1080p",x:4,d:"Le standard Instagram et TikTok.",tg:"CONSEILLÉ"},{k:"4k",l:"4K",r:"2160p",x:12,d:"Netteté maximale, grands écrans."}];
const r2=n=>Math.round(n*100)/100;
const eur=n=>r2(n).toFixed(2).replace(".",",").replace(",00","")+" €";
const sale=b=>bfOn()?r2(b*(1-BFR)):b;
const pHTML=b=>bfOn()?"<s>"+eur(b)+"</s><b>"+eur(sale(b))+"</b>":"<b>"+eur(b)+"</b>";
const PLANS=[
 {k:"unit",r:0,n:"Une vidéo",d:"Tu paies seulement la vidéo que tu crées.",p:null,f:["Durée de 15 à 60 s","HD et Full HD (pas de 4K)","Styles Dynamique et Visite","3 couleurs : Naturel, Chaleureux, Frais","Sans filigrane, sans bordure","-Formation Airbnb non incluse"]},
 {k:"essentiel",r:1,n:"Pack Essentiel",d:"12 crédits, sans abonnement.",p:39,u:"une fois",c:12,per:3.25,f:["12 crédits qui n'expirent pas","Les 4 styles : Drone et Cinéma inclus","Les 6 couleurs","HD et Full HD (pas de 4K)","-Formation Airbnb non incluse"]},
 {k:"pro",r:2,n:"Pack Pro",d:"40 crédits + la formation offerte.",p:99,u:"une fois",c:40,per:2.48,ebook:true,f:["40 crédits qui n'expirent pas","Les 4 styles et les 6 couleurs","4K débloquée","Formation Airbnb offerte (PDF de 44 pages)"],hot:true,bd:"LE PLUS CHOISI"},
 {k:"agence",r:3,n:"Abonnement Agence",d:"120 crédits chaque mois, arrêt à tout moment.",p:149,u:"/ mois",c:120,per:1.24,m:true,ebook:true,f:["120 crédits chaque mois","Tout est débloqué : styles, couleurs, 4K","Formation Airbnb offerte","Historique de tous tes projets","Tu arrêtes quand tu veux"],bd:"MEILLEUR PRIX"}
];

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
function styleBox(){
  return '<div class="sty"><label>Mouvement de caméra</label><div class="stg m" id="stM">'+MOT.map(m=>'<button type="button" data-m="'+m[0]+'" class="'+(S.motion===m[0]?"on":"")+'"><b>'+m[1]+'</b>'+lkb(MINM[m[0]])+'<span>'+m[2]+'</span></button>').join("")+'</div>'+
  '<label style="margin-top:18px">Couleurs</label><div class="stg c" id="stC">'+COL.map(c=>'<button type="button" data-c="'+c[0]+'" class="'+(S.grade===c[0]?"on":"")+'">'+thumbHtml(c[2])+'<b>'+c[1]+'</b>'+lkb(MINC[c[0]])+'</button>').join("")+'</div>'+(need()>rank()?'<p class="lknote">🔒 Ce choix demande le '+TMIN[need()]+' ou mieux. Tu le verras à l\'étape paiement, ou change de style pour rester sur une vidéo à l\'unité.</p>':'')+'</div>'}
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
  function build(){root.innerHTML="";sl=photos.map(p=>{const d=document.createElement("div");d.className="sl";d.innerHTML=scn(p.s);root.appendChild(d);return d});
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
  user:LS.get("vt_user",null),videos:LS.get("vt_videos",[]),credits:LS.get("vt_credits",0),sub:LS.get("vt_sub",false)};
function cleanState(){
  const num=(v,d)=>Number.isFinite(+v)?Math.max(0,Math.min(1e6,Math.trunc(+v))):d;
  if(S.user&&!(typeof S.user.email==="string"&&/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(S.user.email)&&S.user.email.length<255))S.user=null;
  S.credits=num(S.credits,0);S.sub=S.sub===true;
  S.videos=(Array.isArray(S.videos)?S.videos:[]).slice(0,200).filter(v=>v&&typeof v==="object").map(v=>({id:num(v.id,0),listing:String(v.listing||"").replace(/[^A-Za-z0-9_-]/g,"").slice(0,40),dur:[15,30,45,60].includes(+v.dur)?+v.dur:30,q:["hd","fhd","4k"].includes(v.q)?v.q:"hd",fmt:["v","s","h"].includes(v.fmt)?v.fmt:"v",n:num(v.n,10),date:String(v.date||"").slice(0,20),caps:false}));
}
const save=()=>{LS.set("vt_tiers",S.tiers);LS.set("vt_user",S.user);LS.set("vt_videos",S.videos);LS.set("vt_credits",S.credits);LS.set("vt_sub",S.sub);LS.set("vt_ledger",S.ledger.slice(-60));LS.set("vt_ctot",S.credTotal);LS.set("vt_renew",S.renew);try{hdr()}catch(e){}};
const base=()=>DUR.find(d=>d.s===S.dur).p+QUA.find(q=>q.k===S.q).x;
const UNITP=4,cr=()=>base()/UNITP;
const MINM={dynamic:0,tour:0,drone:1,cinema:1},MINC={natural:0,warm:0,fresh:0,cinema:1,vivid:1,mono:1},MINQ={hd:0,fhd:0,"4k":2};
const TNAME=["Une vidéo","Pack Essentiel","Pack Pro","Abonnement Agence"],TMIN=["","Pack Essentiel","Pack Pro","Abonnement Agence"],TSHORT=["","Essentiel","Pro","Agence"];
const need=()=>Math.max(MINM[S.motion]||0,MINC[S.grade]||0,MINQ[S.q]||0);
const rank=()=>S.sub?3:(S.tiers&&S.tiers.pro)?2:(S.tiers&&S.tiers.essentiel)?1:0;
const lkb=n=>n>rank()?'<em class="lkb">🔒 '+TSHORT[n]+'</em>':'';
function lacks(r){const o=[];if((MINM[S.motion]||0)>r)o.push("le style "+MOT.find(m=>m[0]===S.motion)[1]);if((MINC[S.grade]||0)>r)o.push("la couleur "+COL.find(c=>c[0]===S.grade)[1]);if((MINQ[S.q]||0)>r)o.push("la qualité "+QUA.find(q=>q.k===S.q).l);return o}
const crl=n=>n+" crédit"+(n>1?"s":"");
const hashOf=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h};
let timers=[],heroP=null,gbP=null,doneP=null,gpP=null;
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
  const f={an:runAn,cfg:()=>renderCfg(),mk:runMk,gate:renderGate,pay:renderPay,rd2:runRd,done:renderDone,dash:renderDash,pr:renderPr,ex:gallery,eb:renderEb,auth:()=>renderAuth("signup")}[id];
  if(f)f();
  if(id==="lp"){if(heroP)heroP.stop();heroP=Player($("#heroPh"),mkPhotos(6),2.4).start()}
  if(id!=="lp"&&heroP){heroP.stop()}
}
window.addEventListener("popstate",e=>{const id=(location.hash||"#lp").slice(1);go(SCR.indexOf(id)>=0?id:"lp",{nopush:true})});
function jump(id){if(document.body.dataset.s!=="lp"){go("lp");setTimeout(()=>{const e=document.getElementById(id);if(e)e.scrollIntoView({behavior:"smooth"})},60)}else{const e=document.getElementById(id);if(e)e.scrollIntoView({behavior:"smooth"})}}
function focusBar(){if(document.body.dataset.s!=="lp")go("lp");setTimeout(()=>{window.scrollTo({top:0,behavior:"smooth"});const i=$("#url");if(i)i.focus({preventScroll:true})},80)}
function hdr(){
  const h=$("#hr");
  if(S.user){h.innerHTML='<button class="btn gh s" data-v="go" data-a="dash">Mes vidéos'+(S.credits>0?'<span class="cb">'+S.credits+'</span>':'')+'</button><button class="btn s" data-v="logout" title="Se déconnecter">'+esc(S.user.email.charAt(0).toUpperCase())+'</button>'}
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
    if(!S.ebook&&!(sel&&sel.pack&&sel.pack.ebook))h+='<label class="bump"><input type="checkbox" id="pBump"'+(S.bump?" checked":"")+'><span><b>Ajoute la Formation Airbnb</b> pour <b>9 €</b> <s>'+eur(EB_PRICE)+'</s><small>Guide PDF de 44 pages : trouver des clients, écrire les messages, fixer ton prix.</small></span></label>';
  return h;
}
const bumpOn=o=>S.bump&&!S.ebook&&!(o.pack&&o.pack.ebook);
const ptotal=o=>(o.free?0:sale(o.p))+(bumpOn(o)?9:0);
const MSG="Bonjour [Prénom],\n\nJ'ai vu votre annonce « [Nom du logement] ». Je réalise des vidéos verticales à partir des photos d'une annonce, pour Instagram et TikTok.\n\nJe peux vous préparer la vôtre pour [prix] €. Je vous envoie un exemple ?";
function msgText(){
  const n=S.name||"[Ton prénom]";
  return "Bonjour [Prénom du propriétaire],\n\nJ'ai vu votre annonce « [nom du logement] » et j'ai préparé une courte vidéo verticale à partir de vos photos, pour Instagram et TikTok : [lien de la vidéo]\n\nSi elle vous plaît, je vous la livre en haute qualité, sans filigrane, pour "+S.price+" €.\n\nBelle journée,\n"+n;
}
function msgBuilder(el){
  el.innerHTML='<div class="row3"><div><label>Ton prénom</label><input class="inp" id="mbN" placeholder="Ex : Léa" maxlength="30" value="'+esc(S.name)+'"></div><div><label>Ton prix (€)</label><input class="inp" id="mbP" inputmode="numeric" maxlength="4" value="'+esc(S.price)+'"></div></div><textarea class="inp" id="mbT" style="min-height:210px;margin-top:10px"></textarea><button class="btn big" id="mbC" type="button" style="height:50px;margin-top:10px">Copier le message</button><p class="note">Tu peux modifier le texte : il est copié tel quel. Ton prénom et ton prix sont gardés pour la prochaine fois.</p>';
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
  if(!S.sub)h+='<div class="nxc"><b>2 · Prépare les suivantes</b><span>1 crédit : '+eur(sale(UNITP))+' à l\'unité, '+eur(sale(PLANS[2].per))+' avec le Pack Pro (formation offerte), '+eur(sale(PLANS[3].per))+' avec l\'abonnement Agence.</span><div class="nxb"><button class="btn s" id="nxPk">Voir les packs</button><button class="btn gh s" id="nxAg">M\'abonner</button></div></div>';
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
  $("#gGo").onclick=()=>{
    if(!S.user){const e=$("#gE").value.trim(),p=$("#gP").value,er=$("#gErr");
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)){er.textContent="Entre une adresse email valide.";return}
      if(p.length<8){er.textContent="Le mot de passe doit faire 8 caractères minimum.";return}
      if(!$("#gC").checked){er.textContent="Accepte les conditions pour continuer.";return}
      S.user={email:e};save();hdr();track("signup")}
    go("pay")};
  const lg=$("#gLog");if(lg)lg.onclick=()=>{S.back="gate";go("auth")};
}

/* ---------- 5. paiement (simulé) ---------- */
function payCfg(){
  const c=cr(),nd=need(),opts=[],rk=rank();
  if(S.credits>=c)opts.push(rk>=nd?{k:"credit",n:"Utiliser mes crédits",s:crl(c)+" pour cette vidéo. Il t'en restera "+(S.credits-c)+".",p:0,free:true}:{k:"credit",n:"Utiliser mes crédits",s:crl(c)+" pour cette vidéo.",p:0,free:true,off:true,why:"Ta formule ne permet pas "+lacks(rk).join(", ")+"."});
  opts.push({k:"unit",n:"Cette vidéo seulement",s:S.dur+" s · "+QUA.find(x=>x.k===S.q).l+" · "+crl(c)+" · paiement unique",p:base(),off:nd>0,why:nd>0?"Pas inclus à l'unité : "+lacks(0).join(", ")+".":""});
  PLANS.slice(1).forEach(pl=>{
    const off=pl.r<nd,after=pl.c-c;
    opts.push({k:pl.k,n:pl.n,s:"Cette vidéo ("+crl(c)+") + "+after+" crédit"+(after>1?"s":"")+" à utiliser"+(pl.m?" ce mois-ci. Renouvelé chaque mois, tu arrêtes quand tu veux.":" quand tu veux, sans abonnement."),p:pl.p,pack:pl,per:sale(pl.p)/pl.c*c,after:after,tag:pl.bd,mo:pl.m,off:off,why:off?"Ne permet pas "+lacks(pl.r).join(", ")+".":"",gift:pl.ebook&&!S.ebook});
  });
  return opts;
}
function paySel(){
  const qx=QUA.find(x=>x.k===S.q).x,dp=DUR.find(x=>x.s===S.dur).p;
  return (bfOn()?'<p class="gbf">🔥 Black Friday −40 % appliqué, jusqu\'au 30 novembre</p>':'')+
  '<div class="pcfg"><label class="kk" style="display:block;margin-bottom:6px">DURÉE</label><div class="seg" id="pD">'+DUR.map(d=>'<button data-d="'+d.s+'" class="'+(d.s===S.dur?"on":"")+'">'+d.s+' s<small>'+eur(sale(d.p+qx))+'</small></button>').join("")+'</div>'+
  '<label class="kk" style="display:block;margin:12px 0 6px">QUALITÉ</label><div class="seg" id="pQ">'+QUA.map(q=>'<button data-q="'+q.k+'" class="'+(q.k===S.q?"on":"")+'">'+q.l+'<small>'+(q.x?"+"+eur(sale(q.x)):"inclus")+'</small></button>').join("")+'</div>'+
  '<p class="mut sm" style="margin-top:8px">'+S.n+' photos · format '+({v:"vertical",s:"carré",h:"large"}[S.fmt])+'</p></div>';
}
function optHtml(o){
  const u=sale(base()),save=o.per?Math.round((1-o.per/u)*100):0;
  return '<button class="opt'+(o.k===S.plan?" on":"")+(o.off?" off":"")+'" data-k="'+o.k+'"'+(o.off?' disabled aria-disabled="true"':'')+'><span><b>'+o.n+'</b>'+(o.tag?'<em class="otg">'+o.tag+'</em>':'')+'<small>'+o.s+'</small>'+(o.per&&!o.off?'<small class="per">cette vidéo te revient à '+eur(o.per)+(save>0?' (−'+save+' %)':'')+'</small>':'')+(o.gift&&!o.off?'<small class="gift">🎁 Formation Airbnb offerte (valeur '+eur(EB_PRICE)+')</small>':'')+(o.off&&o.why?'<small class="why">🔒 '+o.why+'</small>':'')+'</span><span class="pp">'+(o.free?"0 €":pHTML(o.p))+(o.mo?'<i>par mois</i>':'')+'</span></button>';
}
function renderPay(){
  track("pay_view");
  const opts=payCfg(),ok=opts.filter(o=>!o.off);if(!S.planSet&&ok[0]&&ok[0].k==="credit")S.plan="credit";if(!ok.some(o=>o.k===S.plan))S.plan=(ok.find(o=>o.k==="unit")||ok.find(o=>o.k==="pro")||ok[0]).k;
  let h='<div class="dt"><i class="on"></i><i class="on"></i><i class="on"></i><span>PAIEMENT</span></div><div class="pb"><i style="width:100%"></i></div><p class="kk">DERNIÈRE ÉTAPE</p><h2>Choisis ta formule</h2><p class="sub">Ta vidéo coûte '+crl(cr())+' (1 crédit = 15 s en HD). Paie à l\'unité, prends un pack ou un abonnement. Dans tous les cas, elle est livrée sans filigrane.</p>'+paySel()+(need()>0?'<p class="lknote" style="margin-top:12px">🔒 Tu as choisi '+lacks(0).join(", ")+' : il faut un pack. <button class="lk" id="pEdit">Changer mon style</button></p>':'')+
  opts.map(optHtml).join("")+
  payExtras(opts)+'<label class="ck"><input type="checkbox" id="pOk"><span>Je confirme avoir l\'accord du propriétaire pour utiliser les photos de cette annonce dans une vidéo.</span></label><div class="errm" id="pErr"></div><div class="sec2">🔒 Paiement sécurisé par Stripe · Facture envoyée par email</div>';
  $("#payCard").innerHTML=h;
  syncPay(opts);
  $$("#pD button").forEach(b=>b.onclick=()=>{S.dur=+b.dataset.d;track("pay_dur",{s:S.dur});renderPay()});
  $$("#pQ button").forEach(b=>b.onclick=()=>{S.q=b.dataset.q;track("pay_q",{q:S.q});renderPay()});
  const pe=$("#pEdit");if(pe)pe.onclick=()=>{S.cs=2;go("cfg")};
  const pb=$("#pBump");if(pb)pb.onchange=()=>{S.bump=pb.checked;track("bump",{on:S.bump});syncPay(opts)};
  $$("#payCard .opt:not(.off)").forEach(b=>b.onclick=()=>{S.planSet=true;S.plan=b.dataset.k;track("pay_plan",{k:S.plan});renderPay()});
  $("#payBtn").onclick=()=>{
    if(!$("#pOk").checked){$("#pErr").textContent="Confirme l'accord du propriétaire pour continuer.";return}
    const o=opts.find(x=>x.k===S.plan);track("pay_click",{plan:o.k});
    if(o.k==="credit"&&!bumpOn(o)){settle(o);finish(o);return}
    openMd('<p class="kk">PAIEMENT SIMULÉ</p><h2 style="margin-bottom:10px">Stripe s\'ouvre ici</h2><p class="mut">Dans la vraie version, tu es redirigé vers la page de paiement sécurisée de Stripe. Ici, la maquette simule un paiement réussi.</p><div class="rec" style="margin-top:14px"><span class="chip y">'+o.n.toUpperCase()+'</span><span class="chip">'+eur(ptotal(o))+'</span></div><button class="btn big" id="mdOk">Simuler un paiement réussi</button><p class="lg"><button class="lk" data-v="closeMd">Annuler</button></p>');
    $("#mdOk").onclick=()=>{closeMd();settle(o);finish(o)};
  };
}
function syncPay(opts){const o=opts.find(x=>x.k===S.plan),t=ptotal(o);$("#payPz").innerHTML=(o.free&&!bumpOn(o))?"<b>0 €</b>":(bumpOn(o)?"<b>"+eur(t)+"</b>":pHTML(o.p));$("#payBtn").textContent=t===0?"Débloquer ma vidéo":"Payer "+eur(t)}
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const RENEW=30*864e5;
function addCredits(n,label){const before=S.credits;S.credits+=n;S.credTotal=before<=0?n:S.credTotal+n;S.ledger.push({l:label,d:n,at:Date.now()})}
function useCredits(n,label){S.credits-=n;S.ledger.push({l:label,d:-n,at:Date.now()})}
function grant(pl){addCredits(pl.c,pl.n);if(pl.m){S.sub=true;S.renew=Date.now()+RENEW}else S.tiers[pl.k]=true;if(pl.ebook&&!S.ebook){S.ebook=true;LS.set("vt_ebook",true);S.ledger.push({l:"Formation Airbnb offerte (PDF)",d:0,at:Date.now()})}}
function settle(o){
  const q=cr(),lab="Vidéo · annonce "+S.id;
  if(o.pack){grant(o.pack);useCredits(q,lab)}
  else if(o.k==="credit")useCredits(q,lab);
  else S.ledger.push({l:lab+" (payée à l'unité)",d:0,at:Date.now()});
  if(bumpOn(o)){S.ebook=true;LS.set("vt_ebook",true);S.ledger.push({l:"Formation Airbnb (PDF)",d:0,at:Date.now()})}
  save();
}
/* achat direct d'un pack / abonnement, sans vidéo en cours */
function buy(k){
  const pl=PLANS.find(x=>x.k===k);if(!pl||!pl.p)return;if(pl.m&&S.sub){toast("Tu as déjà cet abonnement.");return}
  if(!S.user){S.back=document.body.dataset.s;S.buyK=k;track("buy_login",{k:k});go("auth");return}
  track("buy_open",{k:k});
  openMd('<p class="kk">PAIEMENT SIMULÉ</p><h2 style="margin-bottom:10px">'+pl.n+'</h2><p class="mut">'+(pl.m?pl.c+" crédits par mois, renouvelés chaque mois. Tu peux arrêter quand tu veux.":pl.c+" crédits à utiliser quand tu veux, sans abonnement.")+(pl.ebook&&!S.ebook?" La formation Airbnb est offerte.":"")+'</p><div class="rec" style="margin-top:14px"><span class="chip y">'+eur(sale(pl.p))+(pl.m?" par mois":"")+'</span><span class="chip">'+pl.c+' crédits</span></div><button class="btn big" id="mdOk">Simuler un paiement réussi</button><p class="lg"><button class="lk" data-v="closeMd">Annuler</button></p>');
  $("#mdOk").onclick=()=>{closeMd();grant(pl);save();track("buy_success",{k:k});toast(pl.c+" crédits ajoutés à ton compte.");go("dash")};
}
function finish(o){track("pay_success",{plan:o.k});S.cur={id:Date.now(),listing:S.id,dur:S.dur,q:S.q,fmt:S.fmt,n:S.n,date:new Date().toLocaleDateString("fr-FR"),caps:S.caps};go("rd2")}

/* ---------- 6. montage en cours ---------- */
function runRd(){
  const L=["Préparation des photos","Montage des plans","Mouvements et transitions","Export "+QUA.find(q=>q.k===S.q).l+" "+S.dur+" s"];
  $("#rL").innerHTML=L.map(x=>'<li><span class="ic"></span>'+x+'</li>').join("");
  const li=$$("#rL li"),C=364.4;let cancelled=false;
  const set=p=>{$("#rC").style.strokeDashoffset=C*(1-p);$("#rP").textContent=Math.round(p*100)+"%";const k=Math.min(L.length-1,Math.floor(p*L.length));li.forEach((e,j)=>{e.className=j<k?"d":(j===k?"a":"")});$("#rT").textContent=L[k]};
  set(0);const keep=()=>{if(document.body.dataset.s!=="rd2")cancelled=true};
  (async()=>{
    try{
      const M=await rmod(),cap=await M.canRender(S.q,S.fmt);
      if(!cap.ok)throw new Error(cap.reason);
      const ph=await realPhotos();
      const blob=await M.renderVideo({photos:ph.list,seconds:S.dur,quality:S.q,fmt:S.fmt,motion:S.motion,grade:S.grade,onProgress:p=>{keep();set(p)}});
      if(cancelled)return;
      if(S.blobUrl)URL.revokeObjectURL(S.blobUrl);S.blobUrl=URL.createObjectURL(blob);S.blobSize=blob.size;S.cur.demo=ph.demo;
      li.forEach(e=>e.className="d");set(1);S.videos.unshift(S.cur);save();track("render_done",{demo:ph.demo,mb:Math.round(blob.size/1e5)/10});later(()=>go("done"),400)
    }catch(e){
      track("render_error",{m:String(e&&e.message||e).slice(0,80)});
      $("#rT").textContent="Le montage a échoué";
      $("#rL").innerHTML='<li style="list-style:none;color:var(--mut);line-height:1.5">'+String(e&&e.message||"Erreur inconnue").replace(/</g,"&lt;")+'<br><br><button class="btn" id="rRetry">Réessayer</button> <button class="btn gh" id="rQ">Choisir une qualité plus basse</button></li>';
      const r=$("#rRetry");if(r)r.onclick=()=>go("rd2");const q=$("#rQ");if(q)q.onclick=()=>{if(S.q==="4k")S.q="fhd";else S.q="hd";go("rd2")}
    }
  })();
}

/* ---------- 7. terminé ---------- */
let stars=0;
function renderDone(){
  const c=S.cur;stars=0;
  $("#doneCard").innerHTML='<p class="kk">C\'EST FAIT</p><h2>Ta vidéo est prête</h2><p class="mut">'+c.dur+' s · '+QUA.find(q=>q.k===c.q).l+' · sans filigrane'+(c.demo?' · vidéo d\'exemple':'')+'</p><div class="phw" style="margin:18px 0"><div class="ph"><div id="dnPh" style="position:absolute;inset:0"></div><div class="nt"></div></div></div>'+
  '<button class="btn big" id="dl" style="margin-top:0">Télécharger la vidéo (MP4)</button><button class="btn gh big" id="shr" style="margin-top:10px;height:52px">Copier le lien de partage</button>'+
  nextSteps()+'<div style="margin-top:26px;border-top:1px solid var(--ln);padding-top:20px"><p class="kk">TON AVIS</p><b>Tu es satisfait du résultat ?</b><div class="stars" id="st">'+[1,2,3,4,5].map(n=>'<button data-n="'+n+'" aria-label="'+n+' étoiles">★</button>').join("")+'</div><textarea class="inp" id="rvT" placeholder="Dis-nous ce que tu en penses (facultatif)"></textarea><button class="btn gh big" id="rvB" style="height:50px">Envoyer mon avis</button></div>'+
  '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap"><button class="btn" id="nv">Créer une autre vidéo</button><button class="btn gh" id="mv">Mes vidéos</button></div>';
  if(doneP)doneP.stop();
  if(S.blobUrl&&c.fmt!=="v"){const w=$("#dnPh").closest(".phw");if(w)w.innerHTML='<video src="'+S.blobUrl+'" controls playsinline loop muted autoplay style="width:100%;aspect-ratio:'+(c.fmt==="s"?"1/1":"16/9")+';border-radius:14px;background:#000;object-fit:cover"></video>'}
  else if(S.blobUrl){$("#dnPh").innerHTML='<video src="'+S.blobUrl+'" controls playsinline loop muted autoplay style="width:100%;height:100%;object-fit:cover;background:#000"></video>'}else doneP=Player($("#dnPh"),mkPhotos(c.n>8?8:c.n),2.4).start();
  $("#dl").onclick=()=>{if(!S.blobUrl){toast("Ta vidéo n'est plus en mémoire : relance le montage depuis Mes vidéos.");return}track("download");const a=document.createElement("a");a.href=S.blobUrl;a.download="cliploc-"+c.listing+"-"+c.dur+"s.mp4";document.body.appendChild(a);a.click();a.remove()};
  $("#shr").onclick=()=>toast("Maquette : lien de partage à venir.");
  $$("#st button").forEach(b=>b.onclick=()=>{stars=+b.dataset.n;$$("#st button").forEach((x,i)=>x.classList.toggle("on",i<stars))});
  $("#rvB").onclick=()=>{if(!stars){toast("Choisis une note.");return}const l=LS.get("vt_reviews_pending",[]);l.push({stars:stars,text:$("#rvT").value.slice(0,500),at:Date.now()});LS.set("vt_reviews_pending",l);track("review",{stars:stars});toast("Merci ! Ton avis sera publié après vérification.")};
  msgBuilder($("#mbBox"));
  const bg=$("#balGo");if(bg)bg.onclick=()=>go("dash");
  const np=$("#nxPk");if(np)np.onclick=()=>{track("next_pack");prGo("packs")};
  const na=$("#nxAg");if(na)na.onclick=()=>{track("next_agence");buy("agence")};
  const ne=$("#nxEb");if(ne)ne.onclick=()=>{track("next_ebook");go("eb")};
  $("#nv").onclick=()=>{S.url="";S.cur=null;focusBar()};$("#mv").onclick=()=>go("dash");
}


/* ---------- onglets ---------- */
const NAVS=[["lp","Accueil"],["u","Une vidéo"],["p","Packs & abonnement"],["ex","Exemples"],["eb","Formation Airbnb","NOUVEAU"],["fq","Contact"]];
S.tiers=LS.get("vt_tiers",{});S.prMode="unit";S.ledger=LS.get("vt_ledger",[]);S.credTotal=LS.get("vt_ctot",0);S.name=LS.get("vt_name","");S.price=LS.get("vt_price",60);S.renew=LS.get("vt_renew",0);
S.tiers={essentiel:S.tiers&&S.tiers.essentiel===true,pro:S.tiers&&S.tiers.pro===true};try{cleanState()}catch(e){}
let exP=[];
function nav(){
  const cur=document.body.dataset.s;
  const act=k=>k===cur||(cur==="pr"&&((k==="u"&&S.prMode!=="packs")||(k==="p"&&S.prMode==="packs")));
  const h=NAVS.map(n=>'<button class="tb'+(act(n[0])?" on":"")+'" data-v="nav" data-a="'+n[0]+'">'+n[1]+(n[2]?'<em>'+n[2]+'</em>':'')+'</button>').join("");
  $("#nvD").innerHTML=h;const t=$("#tabs");t.innerHTML=h;const on=$(".on",t);if(on)t.scrollLeft=Math.max(0,on.offsetLeft-24);
}

function navGo(k){if(k==="u"){S.prMode="unit";go("pr")}else if(k==="p"){S.prMode="packs";go("pr")}else go(k)}
function prGo(m){S.prMode=m;go("pr")}
function pick(k){S.want=k;toast("Colle ton lien : tu paieras ce plan à la dernière étape.");focusBar()}

/* ---------- exemples ---------- */
const GAL=[["Villa avec piscine","30 S · FULL HD",[1,4,0,2]],["Appartement en ville","15 S · HD",[0,3,5,2]],["Maison de vacances","45 S · FULL HD",[4,1,2,3]],["Studio cosy","15 S · HD",[2,5,0]],["Gîte avec terrasse","30 S · FULL HD",[4,3,1,5]],["Loft design","60 S · 4K",[3,0,5,2,4]]];
function gallery(){
  $("#galBox").innerHTML=GAL.map((g,i)=>'<div class="gc"><div class="ph"><div id="gx'+i+'" style="position:absolute;inset:0"></div></div><b>'+g[0]+'</b><small>'+g[1]+'</small><button class="btn gh s" data-v="focus">Faire la mienne</button></div>').join("");
  GAL.forEach((g,i)=>{exP.push(Player($("#gx"+i),g[2].map(q=>({s:q,c:SCAP[q]})),2+((i%3)*.3)).start())});
}

/* ---------- formation (ebook) ---------- */
const CHAP=[["Le business en dix minutes","Ce que tu vends, à qui, et combien il te reste à la fin."],["Tes clients","Six profils, ce qu'ils veulent, et par qui commencer."],["Se mettre en règle","Micro-entreprise, factures, droit sur les photos, prospection autorisée."],["Ton offre et tes prix","Trois offres, calcul de marge avec les vrais tarifs."],["Ta vitrine","Trois vidéos d'exemple, profil Instagram, WhatsApp Business."],["Dix méthodes pour trouver des clients","Entourage, Facebook, Instagram, LinkedIn, partenaires, terrain…"],["Quatorze messages à copier","Premier contact, relances, devis, livraison, avis."],["Le déroulé d'une vente","Sept étapes, de la démo au paiement et à la recommandation."],["Répondre aux objections","Dix objections courantes et comment y répondre."],["Faire grandir ton activité","Packs, abonnements, objectifs mensuels."],["T'organiser et suivre tes chiffres","Semaine type, feuille de suivi, entonnoir."],["Livrer comme un pro","Checklist, formats, conseils de publication."],["Les erreurs à éviter","Douze erreurs et quoi faire à la place."],["Plan d'action sur 30 jours","Un calendrier jour par jour."]];
function dlEb(){track("ebook_download");const a=document.createElement("a");a.href="formation-cliploc.pdf";a.download="Cliploc-La-formation.pdf";document.body.appendChild(a);a.click();a.remove()}
const EB_PRICE=29;
S.ebook=LS.get("vt_ebook",false);
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
  openMd('<p class="kk">PAIEMENT (SIMULATION)</p><h3 style="margin:4px 0">Formation Airbnb</h3><p class="mut">'+eur(sale(EB_PRICE))+' TTC</p><button class="btn big" id="ebPay" style="margin-top:12px">Simuler un paiement réussi</button><button class="btn gh" style="margin-top:8px;width:100%" data-v="closeMd">Annuler</button>');
  $("#ebPay").onclick=()=>{S.ebook=true;LS.set("vt_ebook",true);closeMd();track("ebook_paid");toast("Paiement validé. Le téléchargement du PDF démarre.");renderEb();dlEb()};
}

/* ---------- 8. mes vidéos ---------- */
function renderDash0(){
  if(!S.user){go("auth");return}
  const v=S.videos,c=S.credits,tot=Math.max(S.credTotal,c),pct=tot?Math.round(c/tot*100):0;
  const renew=S.sub&&S.renew?new Date(S.renew).toLocaleDateString("fr-FR",{day:"numeric",month:"long"}):"";
  const dt=t=>new Date(t).toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
  const led=S.ledger.slice().reverse();
  $("#dashBox").innerHTML=
   '<div class="crd"><p class="kk">MON COMPTE</p><h2>Mes crédits</h2><div class="bal2"><b>'+c+'</b><span>crédit'+(c>1?"s":"")+' restant'+(c>1?"s":"")+(S.sub?" ce mois-ci":"")+'</span></div><p class="mut sm" style="margin-top:6px">Ta formule : <b>'+TNAME[rank()]+'</b>'+(rank()<3?' · 4K '+(rank()>=2?'débloquée':'verrouillée')+' · '+(rank()>=1?'tous les styles':'styles Dynamique et Visite'):' · tout est débloqué')+'</p>'+
   (S.credTotal>0?'<div class="pb" style="margin:12px 0 6px"><i style="width:'+pct+'%"></i></div><p class="mut sm">'+(tot-c)+' utilisé'+((tot-c)>1?"s":"")+' sur '+tot+'</p>':'<p class="mut sm" style="margin-top:8px">Tu n\'as pas encore de crédits. Un pack réduit le prix de chaque vidéo et débloque des options.</p>')+
   (S.sub?'<div class="subc"><b>Abonnement Agence · actif</b><span>120 crédits par mois. Prochain renouvellement le '+renew+'.</span><button class="lk" id="subX">Arrêter l\'abonnement</button></div>':'')+
   '<div class="nxb" style="margin-top:14px"><button class="btn" id="dBuyP">Voir les formules</button>'+(S.sub?'':'<button class="btn gh" id="dBuyA">M\'abonner</button>')+'</div>'+
   '<p class="note">1 crédit = 15 s en HD. Le nombre de crédits d\'une vidéo est affiché avant de payer. Tu reçois un email quand il t\'en reste 2.</p></div>'+
   '<div class="crd" style="margin-top:14px"><p class="kk">MES VIDÉOS</p>'+
   (v.length?'<div class="vl">'+v.map(x=>'<div class="vi"><div class="th">'+scn(0)+'</div><div style="flex:1"><b>Annonce '+esc(x.listing)+'</b><small>'+(+x.dur||0)+' s · '+esc((QUA.find(q=>q.k===x.q)||QUA[0]).l)+' · '+esc(x.date)+'</small></div><button class="btn gh s" data-v="toast" data-a="Maquette : téléchargement à venir.">Télécharger</button></div>').join("")+'</div>':'<div class="empty">Aucune vidéo pour l\'instant.<br><br><button class="btn" data-v="focus">Créer ma première vidéo</button></div>')+'</div>'+
   (led.length?'<div class="crd" style="margin-top:14px"><p class="kk">HISTORIQUE</p>'+led.slice(0,12).map(e=>'<div class="lg2"><span>'+esc(e.l)+'<small>'+dt(e.at)+'</small></span><b class="'+(e.d>0?"pos":e.d<0?"neg":"")+'">'+(e.d>0?"+"+e.d:e.d<0?e.d:"—")+'</b></div>').join("")+'</div>':'')+
   '<div class="crd" style="margin-top:14px"><p class="kk">MON MESSAGE POUR LES PROPRIÉTAIRES</p><div id="mbBox"></div></div>';
  msgBuilder($("#mbBox"));
  $("#dBuyP").onclick=()=>prGo("packs");const da=$("#dBuyA");if(da)da.onclick=()=>buy("agence");
  const sx=$("#subX");if(sx)sx.onclick=()=>{openMd('<p class="kk">ABONNEMENT AGENCE</p><h2 style="margin-bottom:10px">Arrêter l\'abonnement ?</h2><p class="mut">Tes crédits restants restent utilisables jusqu\'au '+renew+'. Ensuite, plus de renouvellement.</p><button class="btn big" id="subOk">Oui, arrêter</button><p class="lg"><button class="lk" data-v="closeMd">Garder mon abonnement</button></p>');$("#subOk").onclick=()=>{S.sub=false;save();closeMd();track("sub_cancel");toast("Abonnement arrêté. Tes crédits restants sont conservés.");renderDash()}};
}

function renderDash(){renderDash0();if(S.user&&S.ebook)$("#dashBox").insertAdjacentHTML("beforeend",'<div class="crd" style="margin-top:14px"><p class="kk">MA BIBLIOTHÈQUE</p><b>Formation Airbnb · guide PDF</b><div style="margin-top:10px"><button class="btn gh s" data-v="dl">Télécharger</button></div></div>')}

/* ---------- tarifs ---------- */
function planCard(p){
  const unit=p.k==="unit";
  const per=unit?"1 crédit = 15 s en HD. Prix selon durée et qualité.":"soit "+eur(sale(p.per))+" le crédit";
  const ft=p.f.map(x=>x[0]==="-"?'<li class="no">'+x.slice(1)+'</li>':'<li>'+x+'</li>').join("");
  return '<div class="plan'+(p.hot?" hot":"")+'">'+(p.bd?'<span class="bd2">'+p.bd+'</span>':'<span class="bd2" style="visibility:hidden">.</span>')+'<h3 style="margin-top:12px">'+p.n+'</h3><p class="mut sm" style="margin-top:4px">'+p.d+'</p>'+
  '<div class="pr">'+(unit?'<em>dès</em>':'')+(bfOn()?'<s>'+eur(unit?UNITP:p.p)+'</s>':'')+eur(sale(unit?UNITP:p.p))+' <small>'+(unit?"/ vidéo":p.u)+'</small></div><p class="pv">'+per+'</p>'+
  '<ul>'+ft+'</ul><button class="btn'+(p.hot?"":" gh")+'" data-v="'+(unit?"focus":"buy")+'" data-a="'+p.k+'">'+(unit?"Créer ma vidéo":(p.m?"M'abonner":"Acheter le pack"))+'</button></div>';
}
function renderPlans(el){el.innerHTML=PLANS.map(planCard).join("")}
function cmpTable(){
  const Y='<span class="yes">✓</span>',N='<span class="nop">–</span>';
  const rows=[["Prix d\'un crédit",PLANS.map(p=>eur(sale(p.k==="unit"?UNITP:p.per)))],["Crédits inclus",["—","12","40","120 / mois"]],["Styles Dynamique et Visite",[Y,Y,Y,Y]],["Styles Drone et Cinéma",[N,Y,Y,Y]],["Couleurs",["3","6","6","6"]],["HD et Full HD",[Y,Y,Y,Y]],["4K",[N,N,Y,Y]],["Formation Airbnb",[N,N,"Offerte","Offerte"]],["Historique des projets",[N,N,Y,Y]]];
  return '<div class="crd mx" style="margin-top:18px"><p class="kk" style="padding:10px 10px 0">Comparer les formules</p><div class="scx"><table class="tbl cmp"><thead><tr><th></th>'+PLANS.map(p=>'<th>'+(p.k==="unit"?"Unité":p.n.replace("Pack ","").replace("Abonnement ",""))+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr><th>'+r[0]+'</th>'+r[1].map(x=>'<td>'+x+'</td>').join("")+'</tr>').join("")+'</tbody></table></div></div>';
}
function credBox(){
  return '<div class="crd" style="margin-top:18px"><p class="kk">Comment marchent les crédits</p><p class="mut sm" style="margin:6px 0 10px">Chaque vidéo coûte un nombre de crédits selon sa durée et sa qualité. Le prix exact est affiché avant de payer.</p><div class="scx"><table class="tbl cmp"><thead><tr><th></th>'+QUA.map(q=>'<th>'+q.l+'</th>').join("")+'</tr></thead><tbody>'+DUR.map(d=>'<tr><th>'+d.s+' s</th>'+QUA.map(q=>'<td><b>'+((d.p+q.x)/UNITP)+'</b></td>').join("")+'</tr>').join("")+'</tbody></table></div><ul class="gl" style="margin-top:12px"><li>Le solde s\'affiche en haut du site, à côté de « Mes vidéos ».</li><li>Les crédits d\'un pack n\'expirent pas. Ceux de l\'abonnement sont renouvelés chaque mois.</li><li>Tu reçois un email quand il t\'en reste 2.</li></ul></div>';
}
function renderPr(){
  const m=S.prMode==="packs"?"packs":"unit";
  $("#prTg").innerHTML='<button data-m="unit" class="'+(m==="unit"?"on":"")+'">Une seule vidéo</button><button data-m="packs" class="'+(m==="packs"?"on":"")+'">Packs &amp; abonnement</button>';
  $$("#prTg button").forEach(b=>b.onclick=()=>{S.prMode=b.dataset.m;renderPr();nav()});
  if(m==="unit"){
    $("#prBody").innerHTML='<div class="crd mx"><table class="tbl"><thead><tr><th></th>'+QUA.map(q=>'<th>'+q.l+'<small>'+q.r+'</small></th>').join("")+'</tr></thead><tbody>'+
      DUR.map(d=>'<tr><th>'+d.s+' s<small>'+d.d+'</small></th>'+QUA.map(q=>{const b=d.p+q.x;if(MINQ[q.k]>0)return '<td class="lkd">🔒<small>Pack Pro</small></td>';return '<td>'+(bfOn()?'<s>'+eur(b)+'</s>':'')+'<b>'+eur(sale(b))+'</b></td>'}).join("")+'</tr>').join("")+'</tbody></table></div>'+
      '<p class="note">'+(bfOn()?"Black Friday −40 % jusqu'au 30 novembre. ":"")+'Prix TTC. À l\'unité : styles Dynamique et Visite, 3 couleurs, pas de 4K. Les packs débloquent le reste.</p>'+
      '<button class="btn big" data-v="focus">Créer ma vidéo</button>'+
      '<p class="mut" style="margin-top:16px;text-align:center">Tu en fais souvent ? <button class="lk" data-v="pr" data-a="packs">Voir les packs</button> : dès '+eur(sale(PLANS[3].per))+' le crédit.</p>';
  }else{
    $("#prBody").innerHTML='<div class="plans p3">'+planCard(PLANS[1])+planCard(PLANS[2])+planCard(PLANS[3])+'</div>'+cmpTable()+credBox()+
      '<p class="mut" style="margin-top:16px;text-align:center">Une seule vidéo à faire ? <button class="lk" data-v="pr" data-a="unit">Voir le prix à l\'unité</button></p>';
  }
}

/* ---------- compte ---------- */
function renderAuth(mode){
  const su=mode==="signup";
  $("#authCard").innerHTML='<p class="kk">'+(su?"CRÉER UN COMPTE":"CONNEXION")+'</p><h2>'+(su?"Rejoins Cliploc":"Content de te revoir")+'</h2><div class="fld" style="margin-top:14px"><input class="inp" id="aE" type="email" autocomplete="email" placeholder="Ton email"></div><div class="fld"><input class="inp" id="aP" type="password" autocomplete="'+(su?"new-password":"current-password")+'" placeholder="Mot de passe"></div>'+
   (su?'<label class="ck"><input type="checkbox" id="aC"><span>J\'accepte les conditions d\'utilisation et la politique de confidentialité.</span></label>':'')+'<div class="errm" id="aErr"></div><button class="btn big" id="aGo" style="margin-top:6px">'+(su?"Créer mon compte":"Me connecter")+'</button><p class="lg">'+(su?"Déjà un compte ?":"Pas encore de compte ?")+' <button class="lk" id="aSw">'+(su?"Se connecter":"Créer un compte")+'</button></p>';
  $("#aSw").onclick=()=>renderAuth(su?"login":"signup");
  $("#aGo").onclick=()=>{const e=$("#aE").value.trim(),p=$("#aP").value,er=$("#aErr");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)){er.textContent="Entre une adresse email valide.";return}
    if(p.length<8){er.textContent="Le mot de passe doit faire 8 caractères minimum.";return}
    if(su&&!$("#aC").checked){er.textContent="Accepte les conditions pour continuer.";return}
    S.user={email:e};save();hdr();track(su?"signup":"login");const b=S.back;S.back=null;go(b||(S.url?"gate":"dash"));if(S.buyK){const k=S.buyK;S.buyK=null;setTimeout(()=>buy(k),250)}};
}
function logout(){S.user=null;save();hdr();toast("Tu es déconnecté.");go("lp")}

/* ---------- pages légales ---------- */
const PAGES={
 mentions:["Mentions légales","<p>Éditeur : [nom ou raison sociale] · SIRET : [à compléter] · Adresse : [à compléter] · Contact : [email].</p><p>Hébergeur : [à compléter].</p><p>Cliploc n'est affilié ni à Airbnb, ni aux propriétaires des annonces.</p>"],
 privacy:["Confidentialité","<h3>Données collectées</h3><p>Adresse email, lien d'annonce, choix de vidéo, historique d'achats. Pas de données de santé.</p><h3>Photos</h3><p>Les photos des annonces ne sont utilisées que pour générer ta vidéo, puis supprimées après un délai à définir.</p><h3>Tes droits</h3><p>Accès, rectification, suppression : écris-nous. Page à compléter avant le lancement.</p>"],
 cgv:["Conditions générales de vente","<p>Page à rédiger avant le lancement : prix TTC, livraison numérique, droit de rétractation applicable aux contenus numériques, responsabilité de l'utilisateur sur les droits des photos.</p><h3>Droits sur les photos</h3><p>L'utilisateur confirme avoir l'accord du propriétaire des photos avant de lancer le montage.</p>"],
 contact:["Contact","<p>Écris-nous à [adresse email à compléter].</p>"]
};
function page(k){const p=PAGES[k];$("#pgBox").innerHTML='<p class="kk">Informations</p><h2>'+p[0]+'</h2><div style="margin-top:16px">'+p[1]+'</div>';go("pg")}

/* ---------- divers ---------- */
function openMd(h){$("#mdBox").innerHTML=h;$("#md").hidden=false}
function closeMd(){$("#md").hidden=true}
function copy(){const t=$("#msgTxt").textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast("Message copié."),()=>toast("Sélectionne le texte pour le copier."))}
const FAQ=[["Quelles annonces puis-je utiliser ?","Toute annonce Airbnb publique dont tu as le lien. Avant de lancer le montage, tu confirmes avoir l'accord du propriétaire des photos."],["Combien de temps pour avoir ma vidéo ?","L'analyse prend quelques secondes. Le montage démarre après le paiement et ta vidéo est prête en quelques minutes."],["Quelles durées et quelles qualités ?","De 15 à 60 secondes, en HD, Full HD ou 4K, au format vertical, carré ou large. Le prix dépend de la durée et de la qualité."],["Y a-t-il un filigrane ?","Non. La vidéo est livrée sans filigrane."],["Comment je facture le propriétaire ?","Comme tu veux. Tu fixes ton prix, tu envoies ta facture, tu gardes la différence avec ce que tu paies ici."],["Puis-je modifier la vidéo ?","Tu choisis la durée, la qualité, le format, la musique et la langue des textes avant le montage."]];
function faq(){$$("#fqBox,#fqBox2").forEach(box=>{box.innerHTML=FAQ.map(f=>'<div class="fq"><button aria-expanded="false">'+f[0]+'<i>+</i></button><p>'+f[1]+'</p></div>').join("");
  $$(".fq>button",box).forEach(b=>b.onclick=()=>{const f=b.parentNode;f.classList.toggle("o");b.setAttribute("aria-expanded",f.classList.contains("o"))})})}
/* Avis : n'affiche QUE de vrais avis de clients. Tant que la liste est vide, on montre les engagements. */
const AVIS=[];
function trustBox(){
  if(AVIS.length){$("#trK").textContent="Avis clients";$("#trH").textContent="Ils ont créé leur vidéo";$("#trBox").innerHTML='<div class="avs">'+AVIS.map(a=>'<div class="rv"><b class="s">'+"★".repeat(a.stars)+'</b><p style="margin:8px 0 10px">'+a.text+'</p><span class="mut sm">'+a.name+'</span></div>').join("")+'</div>';return}
  $("#trBox").innerHTML='<div class="trg">'+[["🔒","Paiement sécurisé","Réglé via Stripe. Tes données de carte ne passent jamais par nous."],["🎬","Sans filigrane","La vidéo livrée est propre, prête à être publiée."],["💶","Prix affiché = prix payé","Tu vois le prix avant de payer, TTC, sans frais cachés."],["🗑","Tes photos, ton contrôle","Suppression des photos après le montage et sur simple demande."]].map(x=>'<div class="trust"><i>'+x[0]+'</i><div><b>'+x[1]+'</b><span>'+x[2]+'</span></div></div>').join("")+'</div>';
}
if("IntersectionObserver" in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("v");io.unobserve(e.target)}}),{threshold:.1});$$(".vis").forEach(el=>io.observe(el))}else{$$(".vis").forEach(el=>el.classList.add("v"))}

window.V={nav:navGo,pr:prGo,pick:pick,go:go,jump:jump,focus:focusBar,start:start,demo:demo,copy:copy,page:page,logout:logout,closeMd:closeMd,toast:toast,buyEbook:buyEbook,buy:buy,dl:dlEb};
/* Clics : pas de gestionnaire inline (la politique de sécurité les interdit), liste blanche d'actions */
const ACTS={focus:()=>V.focus(),closeMd:()=>V.closeMd(),toast:a=>V.toast(a),pr:a=>V.pr(a==="packs"?"packs":"unit"),page:a=>PAGES[a]&&V.page(a),nav:a=>V.nav(a),logout:()=>V.logout(),go:a=>SCR.includes(a)&&V.go(a),dl:()=>V.dl(),demo:()=>V.demo(),copy:()=>V.copy(),buy:a=>V.buy(a)};
document.addEventListener("click",e=>{
  const t=e.target.closest&&e.target.closest("[data-v]");if(!t)return;
  const n=t.dataset.v,a=t.dataset.a;
  if(n==="mdbg"){if(e.target===t)closeMd();return}
  if(n==="start"){V.start(e,t.closest(".bar")||document.getElementById("bar"));return}
  if(Object.prototype.hasOwnProperty.call(ACTS,n))ACTS[n](a);
});
$("#ctGo").onclick=()=>{const e=$("#ctE").value.trim(),m=$("#ctM").value.trim(),er=$("#ctErr");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)){er.textContent="Entre une adresse email valide.";return}
  if(m.length<10){er.textContent="Écris un message d'au moins 10 caractères.";return}
  er.textContent="";const l=LS.get("vt_contact",[]);l.push({e:e,m:m.slice(0,1000),at:Date.now()});LS.set("vt_contact",l);track("contact_sent");$("#ctM").value="";toast("Message envoyé (maquette). On te répond par email.")};
faq();trustBox();renderPlans($("#plHome"));hdr();nav();
const h0=(location.hash||"#lp").slice(1);go(h0==="lp"||SCR.indexOf(h0)<0?"lp":(NEED[h0]?"lp":h0),{nopush:true});
track("view_lp");
})();
