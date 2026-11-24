/* Lunétoiles : le viseur. Pointe le téléphone vers le ciel, les noms s'affichent.
   Rien n'est envoyé : position, orientation et caméra restent dans le téléphone. */
import { loadSky, horMatrix, starsENU, bodies, altAz, azName, riseSet, fmtTime, toENU } from "./sky.js";
import { aPass, offrePass } from "./achats.js";
import { son } from "./ambiance.js";

const $ = s => document.querySelector(s);
const RAD = Math.PI / 180;
const cv = $("#ciel"), ctx = cv.getContext("2d"), video = $("#cam");
const LS = { get: (k, d) => { try { const v = localStorage.getItem("lunetoiles." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem("lunetoiles." + k, JSON.stringify(v)); } catch (e) {} } };

const st = {
  mode: "glisser", lat: 48.8566, lon: 2.3522, lieuMoi: false,
  temps: null, yaw: 180, pitch: 28, vfov: 70, vfovCapteurs: LS.get("vfov", 62),
  offset: LS.get("offset", 0), lignes: LS.get("lignes", true), noms: LS.get("noms", true),
  faibles: LS.get("faibles", false), camera: false, cible: null, calage: false,
  W: 0, H: 0, dpr: 1, fiches: 0, debut: Date.now(),
};
let sky, enu = null, bod = [], cons = [], hm = null, dernierCalcul = 0;
let ori = null, absolu = false, base = null;

/* ---------- calcul du ciel ---------- */
function recalcul() {
  const d = st.temps || new Date();
  hm = horMatrix(d, st.lat, st.lon);
  enu = starsENU(sky, hm.m, enu);
  bod = bodies(hm);
  cons = sky.cons.map(c => ({ c, label: toENU(hm.m, ...c.label), lines: c.lines.map(seg => seg.map(v => toENU(hm.m, ...v))) }));
  dernierCalcul = performance.now();
  majBandeau();
}

/* ---------- orientation de la caméra ---------- */
const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function baseCapteurs() {
  if (!ori) return null;
  const a = ori.a * RAD, b = ori.b * RAD, g = ori.g * RAD;
  const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cg = Math.cos(g), sg = Math.sin(g);
  // R = Rz(alpha) · Rx(beta) · Ry(gamma) : repère du téléphone -> repère terrestre (est, nord, haut)
  const R = [
    [ca * cg - sa * sb * sg, -sa * cb, ca * sg + sa * sb * cg],
    [sa * cg + ca * sb * sg, ca * cb, sa * sg - ca * sb * cg],
    [-cb * sg, sb, cb * cg],
  ];
  const mul = v => [R[0][0] * v[0] + R[0][1] * v[1] + R[0][2] * v[2], R[1][0] * v[0] + R[1][1] * v[1] + R[1][2] * v[2], R[2][0] * v[0] + R[2][1] * v[1] + R[2][2] * v[2]];
  const ang = ((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0) * RAD;
  const F = mul([0, 0, -1]); // la caméra arrière regarde derrière l'écran
  const U = mul([Math.sin(ang), Math.cos(ang), 0]);
  return { F, U };
}
function baseGlisser() {
  const y = st.yaw * RAD, p = st.pitch * RAD;
  return { F: [Math.cos(p) * Math.sin(y), Math.cos(p) * Math.cos(y), Math.sin(p)], U: [-Math.sin(p) * Math.sin(y), -Math.sin(p) * Math.cos(y), Math.cos(p)] };
}
function tourne(v, d) { const c = Math.cos(d * RAD), s = Math.sin(d * RAD); return [v[0] * c + v[1] * s, v[1] * c - v[0] * s, v[2]]; }

function camera() {
  let b = st.mode === "capteurs" ? baseCapteurs() : baseGlisser();
  if (!b) b = baseGlisser();
  if (st.mode === "capteurs") {
    b = { F: tourne(b.F, st.offset), U: tourne(b.U, st.offset) };
    if (base) { const k = 0.22; b = { F: norm(base.F.map((x, i) => x + (b.F[i] - x) * k)), U: norm(base.U.map((x, i) => x + (b.U[i] - x) * k)) }; }
  }
  base = b;
  const R = norm(cross(b.F, b.U)), U = cross(R, b.F);
  const vfov = st.mode === "capteurs" ? st.vfovCapteurs : st.vfov;
  return { F: b.F, R, U, f: (st.H / 2) / Math.tan(vfov / 2 * RAD), vfov };
}

/* ---------- dessin ---------- */
function taille() {
  st.dpr = Math.min(devicePixelRatio || 1, 2);
  st.W = innerWidth; st.H = innerHeight;
  cv.width = Math.round(st.W * st.dpr); cv.height = Math.round(st.H * st.dpr);
}

let cam, visee = null, dernierVise = 0;
function proj(v) {
  const z = dot(v, cam.F); if (z < 0.08) return null;
  return [st.W / 2 + cam.f * dot(v, cam.R) / z, st.H / 2 - cam.f * dot(v, cam.U) / z];
}
const dedans = p => p && p[0] > -40 && p[0] < st.W + 40 && p[1] > -40 && p[1] < st.H + 40;

function dessine() {
  if (!sky) return;
  if (!$("#depart").hidden) { setTimeout(() => requestAnimationFrame(dessine), 300); return; } // écran de démarrage opaque : inutile de dessiner
  if (!st.temps && performance.now() - dernierCalcul > 2000) recalcul();
  cam = camera();
  ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
  ctx.clearRect(0, 0, st.W, st.H);
  if (!st.camera) { ctx.fillStyle = "#050d1f"; ctx.fillRect(0, 0, st.W, st.H); }
  else { ctx.fillStyle = "rgba(3,8,22,.28)"; ctx.fillRect(0, 0, st.W, st.H); }
  const zoom = Math.sqrt(62 / cam.vfov);
  const plus = aPass();
  const cibles = [];

  // horizon et points cardinaux
  ctx.strokeStyle = "rgba(200,164,93,.75)"; ctx.lineWidth = 1.5; ctx.beginPath();
  let prev = null;
  for (let a = 0; a <= 360; a += 3) {
    const p = proj([Math.sin(a * RAD), Math.cos(a * RAD), 0]);
    if (p && prev) { ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); }
    prev = p;
  }
  ctx.stroke();
  ctx.font = '500 18px "Bodoni Moda", Georgia, serif'; ctx.textAlign = "center"; ctx.textBaseline = "top";
  [["N", 0], ["NE", 45], ["E", 90], ["SE", 135], ["S", 180], ["SO", 225], ["O", 270], ["NO", 315]].forEach(([l, a]) => {
    const p = proj([Math.sin(a * RAD), Math.cos(a * RAD), 0]);
    if (dedans(p)) { ctx.fillStyle = l.length === 1 ? "#c8a45d" : "rgba(200,164,93,.7)"; ctx.fillText(l, p[0], p[1] + 6); }
  });

  // tracés des constellations
  if (st.lignes) {
    ctx.lineWidth = 1.2; ctx.lineCap = "round";
    for (const k of cons) {
      ctx.strokeStyle = k.label[2] > 0 ? "rgba(200,164,93,.5)" : "rgba(200,164,93,.2)";
      ctx.beginPath();
      for (const seg of k.lines) { let q = null; for (const v of seg) { const p = proj(v); if (p && q) { ctx.moveTo(q[0], q[1]); ctx.lineTo(p[0], p[1]); } q = p; } }
      ctx.stroke();
    }
  }

  // étoiles
  const lim = plus && st.faibles ? 6.2 : 4.6;
  for (let i = 0; i < sky.n; i++) {
    const m = sky.mag[i]; if (m > lim) break;
    const v = [enu[i * 3], enu[i * 3 + 1], enu[i * 3 + 2]];
    const p = proj(v); if (!dedans(p)) continue;
    const r = Math.max(0.7, (5.3 - m) * 0.95) * zoom;
    ctx.globalAlpha = v[2] < 0 ? 0.3 : 1;
    ctx.fillStyle = sky.col[i];
    if (m < 1.6) { ctx.globalAlpha *= 0.22; ctx.beginPath(); ctx.arc(p[0], p[1], r * 2.8, 0, 7); ctx.fill(); ctx.globalAlpha = v[2] < 0 ? 0.3 : 1; }
    ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill();
    const nm = sky.names.get(i);
    cibles.push({ t: "etoile", i, p, v, m, nom: nm && nm.name, con: nm && nm.con });
    if (st.noms && nm && m < (cam.vfov < 40 ? 3.4 : 2.1)) {
      ctx.font = 'italic 400 15px "Bodoni Moda", Georgia, serif'; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(244,239,226,.92)"; ctx.fillText(nm.name, p[0] + r + 6, p[1]);
    }
  }
  ctx.globalAlpha = 1;

  // noms des constellations
  if (st.noms) {
    ctx.font = 'italic 400 17px "Bodoni Moda", Georgia, serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const k of cons) {
      if (cam.vfov > 80 && k.c.rank > 1) continue;
      const p = proj(k.label); if (!dedans(p)) continue;
      ctx.fillStyle = k.label[2] > 0 ? "rgba(216,184,118,.95)" : "rgba(216,184,118,.35)";
      ctx.fillText(k.c.fr, p[0], p[1]);
      cibles.push({ t: "const", k, p, v: k.label });
    }
  }

  // planètes, Lune, Soleil
  for (const b of bod) {
    const p = proj(b.enu); if (!dedans(p)) continue;
    const r = (b.id === "Moon" || b.id === "Sun" ? 13 : Math.max(3.5, (3 - b.mag) * 1.3)) * zoom;
    ctx.globalAlpha = b.enu[2] < 0 ? 0.35 : 1;
    ctx.fillStyle = b.col; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill();
    if (b.id === "Sun") { ctx.strokeStyle = "#ffd27a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p[0], p[1], r + 7, 0, 7); ctx.stroke(); }
    else { ctx.strokeStyle = "rgba(244,239,226,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p[0], p[1], r + 5, 0, 7); ctx.stroke(); }
    ctx.font = '700 15px "Atkinson Hyperlegible", system-ui, sans-serif'; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#f4efe2"; ctx.fillText(b.fr, p[0] + r + 9, p[1]);
    ctx.globalAlpha = 1;
    cibles.push({ t: "astre", b, p, v: b.enu });
  }

  guidage();
  vise(cibles);
  requestAnimationFrame(dessine);
}
let derniersCibles = [];

/* ce qu'on vise au centre de l'écran */
function vise(cibles) {
  derniersCibles = cibles;
  if (performance.now() - dernierVise < 250) return;
  dernierVise = performance.now();
  const cx = st.W / 2, cy = st.H / 2;
  const d = c => Math.hypot(c.p[0] - cx, c.p[1] - cy);
  const sun = cibles.find(c => c.t === "astre" && c.b.id === "Sun" && c.v[2] > 0 && d(c) < st.H * 0.35);
  let best = null, bd = 1e9;
  for (const c of cibles) {
    if (c.t === "etoile" && !c.nom) continue;
    const lim = c.t === "astre" ? 90 : c.t === "etoile" ? 60 : 120;
    const dd = d(c) * (c.t === "const" ? 1.6 : 1);
    if (dd < lim && dd < bd) { bd = dd; best = c; }
  }
  const el = $("#vise");
  if (st.calage) { el.innerHTML = ""; return; }
  if (sun) { el.innerHTML = `<div class="n">Attention au Soleil</div><div class="d">Ne le regarde jamais directement, ni avec des jumelles.</div>`; return; }
  if (!best) { el.innerHTML = `<div class="q">Vise une étoile brillante ou touche-la</div>`; visee = null; return; }
  if (visee === best.nom + best.t + (best.k && best.k.c.id) + (best.b && best.b.id)) return;
  visee = best.nom + best.t + (best.k && best.k.c.id) + (best.b && best.b.id);
  const { alt, az } = altAz(best.v);
  const nom = best.t === "astre" ? best.b.fr : best.t === "const" ? best.k.c.fr : best.nom;
  const sous = best.t === "astre" ? (best.b.id === "Moon" ? "la Lune" : "une planète") : best.t === "const" ? "une constellation" : (sky.byId.get(best.con)?.fr ? "dans " + article(sky.byId.get(best.con).fr) : "une étoile");
  el.innerHTML = `<div class="q">Tu regardes</div><div class="n">${nom}</div><div class="d">${sous}${alt < 0 ? " (sous l'horizon)" : ""}</div>`;
}

function article(c) {
  const f = c.toLowerCase();
  if (/^[aeiouyéèêâîôûh]/i.test(f)) return "l'" + c;
  const fem = ["Andromède", "Baleine", "Boussole", "Carène", "Cassiopée", "Chevelure de Bérénice", "Colombe", "Couronne australe", "Couronne boréale", "Croix du Sud", "Dorade", "Flèche", "Girafe", "Grande Ourse", "Grue", "Hydre", "Hydre mâle", "Licorne", "Lyre", "Machine pneumatique", "Mouche", "Petite Ourse", "Poupe", "Règle", "Table", "Vierge", "Voile", "Balance", "Lynx"].includes(c);
  if (/^(Gémeaux|Poissons)$/.test(c)) return "les " + c;
  return (fem ? "la " : "le ") + c;
}

/* flèche vers l'astre recherché (Pass des étoiles) */
function guidage() {
  const fl = $("#fleche");
  if (!st.cible || !aPass()) { fl.hidden = true; return; }
  const v = cibleVecteur(st.cible); if (!v) { fl.hidden = true; return; }
  const p = proj(v);
  if (p && p[0] > 30 && p[0] < st.W - 30 && p[1] > 80 && p[1] < st.H - 90) {
    fl.hidden = true;
    ctx.strokeStyle = "#ee5a43"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p[0], p[1], 30, 0, 7); ctx.stroke();
    return;
  }
  const x = dot(v, cam.R), y = dot(v, cam.U), z = dot(v, cam.F);
  let ang = Math.atan2(-y, x); if (z < 0 && Math.abs(x) < 0.05 && Math.abs(y) < 0.05) ang = -Math.PI / 2;
  const rx = st.W / 2 - 50, ry = st.H / 2 - 110;
  fl.style.left = (st.W / 2 + Math.cos(ang) * rx) + "px"; fl.style.top = (st.H / 2 + Math.sin(ang) * ry) + "px";
  fl.querySelector("svg").style.transform = `rotate(${ang}rad)`;
  fl.querySelector("span").textContent = st.cible.nom;
  fl.hidden = false;
}
function cibleVecteur(c) {
  if (c.t === "astre") return bod.find(b => b.id === c.id)?.enu;
  if (c.t === "etoile") return [enu[c.i * 3], enu[c.i * 3 + 1], enu[c.i * 3 + 2]];
  if (c.t === "const") return cons.find(k => k.c.id === c.id)?.label;
}

/* ---------- fiches ---------- */
function eclat(m) {
  if (m < 0) return "parmi les astres les plus brillants du ciel";
  if (m < 1.5) return "très brillante, facile à voir même en ville";
  if (m < 3) return "bien visible à l'œil nu";
  if (m < 4.6) return "visible loin des lumières de la ville";
  return "très faible, il faut un ciel bien noir";
}
const dirTxt = v => { const { alt, az } = altAz(v); return alt < 0 ? `sous l'horizon, côté ${azName(az)}` : `vers le ${azName(az)}, à ${Math.round(alt)}° au-dessus de l'horizon`; };

function fiche(c) {
  const f = $("#fiche"), plus = aPass();
  let h = "";
  if (c.t === "astre") {
    const b = c.b;
    const type = b.id === "Moon" ? "Le satellite de la Terre" : b.id === "Sun" ? "Notre étoile" : "Planète du système solaire";
    const km = Math.round(b.dist * 149597870.7);
    h = `<h2>${b.fr}</h2><div class="type">${type}</div><dl>
      <dt>Où</dt><dd>${dirTxt(b.enu)}</dd>
      ${b.id === "Moon" ? `<dt>Phase</dt><dd>éclairée à ${Math.round((b.phase ?? 0) * 100)} %</dd>` : ""}
      ${b.id !== "Sun" ? `<dt>Éclat</dt><dd>${eclat(b.mag)}</dd>` : ""}
      <dt>Distance</dt><dd>${b.id === "Moon" ? km.toLocaleString("fr-FR") + " km" : (km / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " millions de km"}</dd>`;
    if (plus) { const rs = riseSet(b.id, hm); h += `<dt>Lever</dt><dd>${fmtTime(rs.rise)}</dd><dt>Coucher</dt><dd>${fmtTime(rs.set)}</dd>`; }
    h += `</dl>`;
    if (b.id === "Sun") h += `<p class="plus-teaser">Ne regarde jamais le Soleil directement, ni avec des jumelles ou un appareil photo.</p>`;
    else if (!plus) h += `<p class="plus-teaser">Heures de lever et de coucher : <button type="button" data-plus>avec le Pass des étoiles, 0,99 €</button></p>`;
  } else if (c.t === "const") {
    const k = c.k.c;
    h = `<h2>${k.fr}</h2><div class="type">Constellation (nom latin : ${k.la})</div><dl><dt>Où</dt><dd>${dirTxt(c.v)}</dd></dl>`;
  } else {
    const con = c.con && sky.byId.get(c.con);
    h = `<h2>${c.nom || "Étoile"}</h2><div class="type">${c.nom ? "Étoile" : "Étoile sans nom courant"}${con ? " de la constellation " + article(con.fr).replace(/^l'/, "d'").replace(/^la /, "de la ").replace(/^le /, "du ").replace(/^les /, "des ") : ""}</div><dl>
      <dt>Où</dt><dd>${dirTxt(c.v)}</dd><dt>Éclat</dt><dd>${eclat(c.m)} (magnitude ${c.m.toLocaleString("fr-FR")})</dd></dl>`;
  }
  f.innerHTML = `<button class="ferme" type="button" aria-label="Fermer la fiche">×</button>` + h;
  f.hidden = false;
  f.querySelector(".ferme").onclick = () => { f.hidden = true; };
  f.querySelector("[data-plus]")?.addEventListener("click", offrePass);
  st.fiches++; offrePoster(); son("petit");
}

/* ---------- interactions : glisser, pincer, toucher ---------- */
const pts = new Map(); let pinch = null, bouge = 0, depart = null;
cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); bouge = 0; depart = [e.clientX, e.clientY]; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), v: st.mode === "capteurs" ? st.vfovCapteurs : st.vfov }; } });
cv.addEventListener("pointermove", e => {
  if (!pts.has(e.pointerId)) return;
  const old = pts.get(e.pointerId), dx = e.clientX - old[0], dy = e.clientY - old[1];
  pts.set(e.pointerId, [e.clientX, e.clientY]);
  bouge += Math.abs(dx) + Math.abs(dy);
  if (pts.size === 2 && pinch) {
    const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    zoomer(pinch.v * pinch.d / d);
    return;
  }
  const deg = (st.mode === "capteurs" ? st.vfovCapteurs : st.vfov) / st.H;
  if (st.mode === "glisser") { st.yaw = (st.yaw - dx * deg + 360) % 360; st.pitch = Math.max(-15, Math.min(89.5, st.pitch + dy * deg)); }
  else if (st.calage) { st.offset = ((st.offset - dx * deg) + 540) % 360 - 180; }
});
const fin = e => {
  if (!pts.has(e.pointerId)) return;
  pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
  if (bouge < 8 && depart) toucher(depart[0], depart[1]);
};
cv.addEventListener("pointerup", fin); cv.addEventListener("pointercancel", e => { pts.delete(e.pointerId); pinch = null; });
cv.addEventListener("wheel", e => { e.preventDefault(); zoomer((st.mode === "capteurs" ? st.vfovCapteurs : st.vfov) * Math.exp(e.deltaY * 0.0012)); }, { passive: false });
function zoomer(v) { v = Math.max(18, Math.min(110, v)); if (st.mode === "capteurs") { st.vfovCapteurs = v; LS.set("vfov", v); } else st.vfov = v; }

function toucher(x, y) {
  let best = null, bd = 36;
  for (const c of derniersCibles) {
    const d = Math.hypot(c.p[0] - x, c.p[1] - y) * (c.t === "const" ? 1.3 : 1);
    if (d < bd) { bd = d; best = c; }
  }
  if (best) fiche(best); else $("#fiche").hidden = true;
}

/* ---------- capteurs, position, caméra ---------- */
function surOrientation(e) {
  if (e.alpha == null || e.beta == null) return;
  let a = e.alpha;
  if (typeof e.webkitCompassHeading === "number" && !isNaN(e.webkitCompassHeading)) { a = 360 - e.webkitCompassHeading; absolu = true; }
  else if (e.type === "deviceorientationabsolute" || e.absolute) absolu = true;
  else if (absolu) return; // on préfère les mesures liées au nord
  ori = { a, b: e.beta, g: e.gamma || 0 };
}

async function commencer(forcerGlisser) {
  $("#depMsg").textContent = "";
  if (!forcerGlisser) {
    try { if (typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission) { const r = await DeviceOrientationEvent.requestPermission(); if (r !== "granted") throw new Error("refus"); } } catch (e) { }
    addEventListener("deviceorientationabsolute", surOrientation);
    addEventListener("deviceorientation", surOrientation);
    await new Promise(r => setTimeout(r, 900));
  }
  st.mode = !forcerGlisser && ori ? "capteurs" : "glisser";
  $("#depart").hidden = true; son("ouvre");
  document.body.classList.toggle("mode-capteurs", st.mode === "capteurs");
  $("#btnCalage").hidden = st.mode !== "capteurs";
  position();
  if (st.mode === "capteurs") {
    activerCamera(true);
    if (!absolu) aide("Ta boussole n'est pas disponible : touche « Recaler » et fais glisser pour aligner le ciel.");
  } else aide("Fais glisser pour explorer le ciel, pince ou utilise la molette pour zoomer.");
  setTimeout(offrePoster, 75000);
  const cb = new URLSearchParams(location.search).get("cible");
  const b = cb && bod.find(x => x.id === cb);
  if (b) setTimeout(() => {
    if (aPass()) { st.cible = { t: "astre", id: b.id, nom: b.fr }; aide(`Suis la flèche jusqu'à ${b.fr}.`); }
    else { if (st.mode === "glisser") { const { alt, az } = altAz(b.enu); st.yaw = az; st.pitch = Math.max(5, alt); } fiche({ t: "astre", b, v: b.enu }); }
  }, 600);
}
function position() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(p => { st.lat = p.coords.latitude; st.lon = p.coords.longitude; st.lieuMoi = true; recalcul(); majReglages(); },
    () => aide("Sans ta position, Lunétoiles montre le ciel de Paris."), { timeout: 12000, maximumAge: 900000, enableHighAccuracy: false });
}
async function activerCamera(on) {
  if (!on) { video.srcObject?.getTracks().forEach(t => t.stop()); video.srcObject = null; st.camera = false; video.classList.remove("on"); majReglages(); return; }
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    video.srcObject = s; await video.play().catch(() => {}); st.camera = true; video.classList.add("on");
  } catch (e) { st.camera = false; }
  majReglages();
}
let aideT; function aide(t) { const el = $("#vise"); el.innerHTML = `<div class="d">${t}</div>`; dernierVise = performance.now() + 4000; clearTimeout(aideT); aideT = setTimeout(() => { visee = null; }, 4200); }

/* ---------- panneaux ---------- */
function ouvre(id) { ["#recherche", "#temps", "#reglages"].forEach(p => { $(p).hidden = p !== id; }); $("#fiche").hidden = true; }
function ferme() { ["#recherche", "#temps", "#reglages"].forEach(p => { $(p).hidden = true; }); }
document.querySelectorAll(".panneau .ferme").forEach(b => b.onclick = ferme);

function listeRecherche() {
  const q = ($("#filtre").value || "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const items = [];
  bod.forEach(b => items.push({ t: "astre", id: b.id, nom: b.fr, v: b.enu, sous: b.id === "Moon" ? "La Lune" : b.id === "Sun" ? "Le Soleil" : "Planète" }));
  sky.names.forEach((n, i) => { if (sky.mag[i] < 2.6) items.push({ t: "etoile", i, nom: n.name, v: [enu[i * 3], enu[i * 3 + 1], enu[i * 3 + 2]], sous: "Étoile" }); });
  cons.forEach(k => items.push({ t: "const", id: k.c.id, nom: k.c.fr, v: k.label, sous: "Constellation" }));
  const f = items.filter(x => !q || x.nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q))
    .sort((a, b) => (b.v[2] > 0) - (a.v[2] > 0) || (a.t === "astre" ? -1 : 0) - (b.t === "astre" ? -1 : 0) || a.nom.localeCompare(b.nom, "fr"))
    .slice(0, 60);
  $("#liste").innerHTML = f.map((x, n) => `<li><button type="button" data-n="${n}"><span class="t">${x.nom}</span><span class="o">${x.sous}, ${dirTxt(x.v)}</span><span class="h">${x.v[2] > 0 ? "visible" : ""}</span></button></li>`).join("") || `<li class="discret">Aucun résultat.</li>`;
  $("#liste").querySelectorAll("button").forEach(b => b.onclick = () => {
    const x = f[+b.dataset.n]; ferme();
    if (aPass()) { st.cible = { t: x.t, id: x.id, i: x.i, nom: x.nom }; aide(`Suis la flèche jusqu'à ${x.nom}.`); }
    else { fiche(x.t === "astre" ? { t: "astre", b: bod.find(b => b.id === x.id), v: x.v } : x.t === "const" ? { t: "const", k: cons.find(k => k.c.id === x.id), v: x.v } : { t: "etoile", i: x.i, v: x.v, m: sky.mag[x.i], nom: x.nom, con: sky.names.get(x.i)?.con });
      $("#fiche").insertAdjacentHTML("beforeend", `<p class="plus-teaser">Une flèche pour te guider jusqu'à ${x.nom} ? <button type="button" class="lien-btn" id="plusGuide">C'est avec le Pass des étoiles</button></p>`);
      $("#plusGuide").onclick = offrePass; }
  });
}

/* voyage dans le temps (Pass des étoiles) */
function versLocal(d) { const p = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; }
function decale(ms) { st.temps = new Date((st.temps || new Date()).getTime() + ms); $("#quand").value = versLocal(st.temps); recalcul(); }
function majBandeau() {
  const b = $("#bandeauTemps");
  if (!st.temps) { b.hidden = true; return; }
  b.hidden = false;
  b.textContent = `Ciel du ${st.temps.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à ${st.temps.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · revenir à maintenant`;
}

function majReglages() {
  $("#rCam").checked = st.camera; $("#rLignes").checked = st.lignes; $("#rNoms").checked = st.noms; $("#rFaibles").checked = st.faibles && aPass();
  $("#rZoom").value = st.mode === "capteurs" ? st.vfovCapteurs : st.vfov;
  $("#rLieu").textContent = st.lieuMoi ? `ta position (${st.lat.toFixed(2).replace(".", ",")}°, ${st.lon.toFixed(2).replace(".", ",")}°)` : "Paris (position par défaut)";
}

/* proposition poster, une seule fois */
function offrePoster() {
  if (LS.get("offrePosterVue", false)) return;
  if (st.fiches < 3 && Date.now() - st.debut < 70000) return;
  LS.set("offrePosterVue", true);
  const c = $("#offrePoster"); c.hidden = false;
  c.querySelector(".ferme").onclick = () => { c.hidden = true; };
}

/* capture à partager */
async function capture() {
  son("magie");
  const c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height;
  const x = c.getContext("2d");
  if (st.camera && video.videoWidth) {
    const s = Math.max(c.width / video.videoWidth, c.height / video.videoHeight), w = video.videoWidth * s, h = video.videoHeight * s;
    x.drawImage(video, (c.width - w) / 2, (c.height - h) / 2, w, h);
  } else { x.fillStyle = "#050d1f"; x.fillRect(0, 0, c.width, c.height); }
  x.drawImage(cv, 0, 0);
  const u = st.dpr;
  x.fillStyle = "rgba(5,13,31,.75)"; x.fillRect(0, c.height - 64 * u, c.width, 64 * u);
  x.fillStyle = "#f4efe2"; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = `italic 500 ${22 * u}px "Bodoni Moda", Georgia, serif`;
  x.fillText(`Vu avec Lunétoiles · ${location.host}`, c.width / 2, c.height - 32 * u);
  c.toBlob(async b => {
    const file = new File([b], "mon-ciel-lunetoiles.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: "Mon ciel avec Lunétoiles" }); return; } catch (e) { return; } }
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "mon-ciel-lunetoiles.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, "image/png");
}

/* ---------- démarrage ---------- */
async function init() {
  taille(); addEventListener("resize", taille);
  sky = await loadSky(); recalcul();
  const tactile = matchMedia("(pointer: coarse)").matches;
  $("#depTexte").textContent = tactile ? "Pointe ton téléphone vers le ciel : Lunétoiles affiche le nom de ce que tu regardes." : "Sur ordinateur, fais glisser le ciel à la souris. Pour le viseur, ouvre cette page sur ton téléphone.";
  $("#btnGo").onclick = () => commencer(false);
  $("#btnGlisser").onclick = () => commencer(true);
  if (!tactile) { $("#btnGo").textContent = "Explorer le ciel"; $("#btnGo").onclick = () => commencer(true); $("#btnGlisser").hidden = true; }

  $("#btnRecherche").onclick = () => { ouvre("#recherche"); listeRecherche(); setTimeout(() => $("#filtre").focus(), 50); };
  $("#filtre").oninput = listeRecherche;
  $("#btnTemps").onclick = () => { if (!aPass()) return offrePass(); ouvre("#temps"); $("#quand").value = versLocal(st.temps || new Date()); };
  $("#quand").onchange = e => { if (e.target.value) { st.temps = new Date(e.target.value); recalcul(); } };
  document.querySelectorAll("[data-dt]").forEach(b => b.onclick = () => decale(+b.dataset.dt * 3600000));
  $("#maintenant").onclick = () => { st.temps = null; recalcul(); ferme(); };
  $("#bandeauTemps").onclick = () => { st.temps = null; recalcul(); };
  $("#btnReglages").onclick = () => { ouvre("#reglages"); majReglages(); };
  $("#rCam").onchange = e => activerCamera(e.target.checked);
  $("#rLignes").onchange = e => { st.lignes = e.target.checked; LS.set("lignes", st.lignes); };
  $("#rNoms").onchange = e => { st.noms = e.target.checked; LS.set("noms", st.noms); };
  $("#rFaibles").onchange = e => { if (!aPass()) { e.target.checked = false; return offrePass(); } st.faibles = e.target.checked; LS.set("faibles", st.faibles); };
  $("#rZoom").oninput = e => zoomer(+e.target.value);
  $("#rPos").onclick = position;
  $("#btnRouge").onclick = () => { const r = $("#rouge"), on = r.hidden; r.hidden = !on; $("#btnRouge").setAttribute("aria-pressed", String(on)); };
  $("#btnCapture").onclick = capture;
  $("#btnCalage").onclick = () => {
    st.calage = !st.calage; $("#calage").hidden = !st.calage; $("#btnCalage").setAttribute("aria-pressed", String(st.calage));
    if (!st.calage) LS.set("offset", st.offset);
  };
  $("#calageOk").onclick = () => $("#btnCalage").click();
  $("#calageZero").onclick = () => { st.offset = 0; };
  if (aPass()) document.body.classList.add("plus");
  const q = new URLSearchParams(location.search);
  if ((q.get("pass") === "1" || q.get("plus") === "1") && !aPass()) offrePass();
  if (q.get("achat") === "annule") $("#depMsg").textContent = "Paiement annulé : rien n'a été débité.";
  requestAnimationFrame(dessine);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
}
init();
