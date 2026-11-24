import { loadSky, horMatrix, starsENU, bodies, altAz, azName } from "./sky.js";
const plusTard = f => (window.requestIdleCallback ? requestIdleCallback(f, { timeout: 1500 }) : setTimeout(f, 200));
import { drawDome, fitCanvas } from "./dome.js";
import { renderPoster } from "./poster-render.js";
import { son } from "./ambiance.js";

const $ = s => document.querySelector(s);
const lieu = { lat: 48.8566, lon: 2.3522, nom: "Paris", moi: false };
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
let sky;

function moment() {
  const now = new Date();
  const hm = horMatrix(now, lieu.lat, lieu.lon);
  const sun = bodies(hm).find(b => b.id === "Sun");
  if (altAz(sun.enu).alt < -10) return { d: now, txt: "maintenant" };
  const soir = new Date(now); soir.setHours(22, 0, 0, 0);
  if (soir < now) soir.setDate(soir.getDate() + 1);
  return { d: soir, txt: "ce soir à 22 h" };
}

function heureFr(d) { return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", " h "); }

/* Le ciel est calculé une fois (puis chaque minute) ; l'animation d'ouverture ne fait que redessiner */
let etat = null;
function prepare() {
  const cv = $("#dome"); if (!cv) return null;
  const s = Math.round(cv.parentElement.getBoundingClientRect().width);
  const ctx = fitCanvas(cv, s, s);
  const hm = horMatrix(new Date(), lieu.lat, lieu.lon);
  etat = { s, ctx, hm, enu: starsENU(sky, hm.m), corps: bodies(hm) };
  $("#domeLieu").textContent = `Le vrai ciel au-dessus ${lieu.moi ? "de toi" : "de " + lieu.nom}, en ce moment (${heureFr(new Date())}).`;
  return etat;
}
function dessine(reveal = 1, recalcule = true) {
  if (recalcule || !etat) prepare();
  if (!etat) return;
  const { s, ctx, hm, enu, corps } = etat;
  ctx.clearRect(0, 0, s, s);
  drawDome(ctx, sky, hm, { cx: s / 2, cy: s / 2, R: s / 2 - 38 * (s / 620), reveal, maxMag: 5.2, rangMax: 1, enu, corps });
}

function ouverture() {
  // le ciel est dessiné UNE fois ; l'apparition (fondu, netteté) est confiée à la carte graphique en CSS
  dessine(1);
  const cv = $("#dome"); if (!cv || calme) return;
  cv.classList.add("avant");
  requestAnimationFrame(() => requestAnimationFrame(() => cv.classList.remove("avant")));
}

function ceSoir() {
  const el = $("#astres"); if (!el) return;
  const m = moment();
  const hm = horMatrix(m.d, lieu.lat, lieu.lon);
  const vis = bodies(hm).filter(b => b.id !== "Sun" && b.mag < 6).map(b => ({ b, a: altAz(b.enu) })).filter(x => x.a.alt > 5).sort((x, y) => x.b.mag - y.b.mag);
  $("#ceSoirQuand").textContent = m.txt === "maintenant" ? "En ce moment" : "Ce soir à 22 h";
  if (!vis.length) { el.innerHTML = `<li><span class="nom">Rien</span><span class="ou">Aucune planète n'est bien placée à cette heure. Les étoiles, elles, sont là : ouvre le ciel.</span></li>`; return; }
  el.innerHTML = vis.map(({ b, a }) => {
    let sous = "";
    if (b.id === "Moon") sous = `Éclairée à ${Math.round((b.phase ?? 0) * 100)} %`;
    else if (b.mag < -1) sous = "Très brillante, impossible à rater";
    else if (b.mag < 1.5) sous = "Bien visible à l'œil nu";
    else if (b.mag < 6) sous = "Visible avec un ciel bien noir";
    return `<li><a href="/ciel/?cible=${b.id}" aria-label="Voir ${b.fr} dans le viseur"><span class="nom">${b.fr}</span><span><span class="ou">vers le ${azName(a.az)}</span><br><span class="sous">${sous}</span></span><span class="haut">${Math.round(a.alt)}° de haut<br><span class="aller">Voir dans le viseur</span></span></a></li>`;
  }).join("");
}

async function exemplePoster() {
  const cv = $("#posterEx"); if (!cv) return;
  await renderPoster(cv, { date: "2026-02-14", heure: "21:30", lat: 48.8566, lon: 2.3522, lieu: "Paris", titre: "La nuit où tout a commencé", sousTitre: "Léa & Sami", theme: "aurore" }, { w: 700, apercu: false });
}

/* Le savais-tu ? */
const FAITS = [
  "La lumière du Soleil met environ 8 minutes et 20 secondes pour arriver jusqu'à toi.",
  "Sirius, l'étoile la plus brillante de la nuit, est à environ 8,6 années-lumière : tu vois une lumière partie il y a plus de huit ans.",
  "La Lune s'éloigne de la Terre d'environ 3,8 centimètres chaque année.",
  "On voit toujours la même face de la Lune : elle tourne sur elle-même aussi vite qu'elle tourne autour de nous.",
  "Une étoile filante est souvent un grain de poussière pas plus gros qu'un grain de sable.",
  "La galaxie d'Andromède se voit à l'œil nu loin des villes. Sa lumière est partie il y a environ 2,5 millions d'années.",
  "Sur Vénus, un jour dure plus longtemps qu'une année : elle tourne très lentement sur elle-même.",
  "Bételgeuse, l'épaule d'Orion, est si grande que placée à la place du Soleil, elle dépasserait l'orbite de Mars.",
  "L'étoile Polaire n'est pas la plus brillante du ciel : des dizaines d'étoiles brillent davantage.",
  "La Station spatiale fait le tour de la Terre en environ une heure et demie. On la voit passer comme un point brillant qui ne clignote pas.",
  "Saturne est si peu dense qu'elle flotterait dans une baignoire assez grande pour la contenir.",
];
function savais() {
  const p = $("#fait"), b = $("#faitSuivant"); if (!p || !b) return;
  let i = Math.floor(Math.random() * FAITS.length);
  const montre = () => { p.textContent = FAITS[i % FAITS.length]; };
  montre();
  b.addEventListener("click", () => { i++; p.animate?.([{ opacity: 0, filter: "blur(4px)" }, { opacity: 1, filter: "blur(0)" }], { duration: 380 }); montre(); });
}

/* Planche d'atlas : une constellation en projection gnomonique, vue de l'intérieur (est à gauche) */
function planche(id = "UMa") {
  const cv = $("#planche"); if (!cv) return;
  const W = cv.width, H = cv.height, ctx = cv.getContext("2d");
  const k = sky.byId.get(id); if (!k) return;
  const c = k.label;
  const nrm = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
  const e = nrm([-c[1], c[0], 0]), n = [c[1] * e[2] - c[2] * e[1], c[2] * e[0] - c[0] * e[2], c[0] * e[1] - c[1] * e[0]];
  const S = W * 1.18, cx = W / 2, cy = (H - 150) / 2 + 30;
  const P = v => { const z = v[0] * c[0] + v[1] * c[1] + v[2] * c[2]; if (z < 0.82) return null; return [cx - (v[0] * e[0] + v[1] * e[1] + v[2] * e[2]) / z * S, cy - (v[0] * n[0] + v[1] * n[1] + v[2] * n[2]) / z * S]; };
  ctx.fillStyle = "#0a1834"; ctx.fillRect(0, 0, W, H);
  // cadre gravé double filet
  ctx.strokeStyle = "#c8a45d"; ctx.lineWidth = 2; ctx.strokeRect(22, 22, W - 44, H - 44);
  ctx.lineWidth = 0.8; ctx.strokeRect(34, 34, W - 68, H - 68);
  for (let x = 34; x <= W - 34; x += 26) { ctx.beginPath(); ctx.moveTo(x, 34); ctx.lineTo(x, x % 130 === 34 % 130 ? 46 : 40); ctx.moveTo(x, H - 34); ctx.lineTo(x, H - 40); ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.rect(36, 36, W - 72, H - 186); ctx.clip();
  // autres constellations, très discrètes
  for (const o of sky.cons) {
    ctx.strokeStyle = o.id === id ? "rgba(200,164,93,.95)" : "rgba(200,164,93,.18)"; ctx.lineWidth = o.id === id ? 2.2 : 1;
    ctx.beginPath();
    for (const seg of o.lines) { let q = null; for (const v of seg) { const p = P(v); if (p && q) { ctx.moveTo(q[0], q[1]); ctx.lineTo(p[0], p[1]); } q = p; } }
    ctx.stroke();
  }
  for (let i = 0; i < sky.n; i++) {
    const m = sky.mag[i]; if (m > 5.6) break;
    const v = [sky.vec[i * 3], sky.vec[i * 3 + 1], sky.vec[i * 3 + 2]], p = P(v); if (!p) continue;
    const r = Math.max(0.9, (5.6 - m) * 2.1);
    ctx.fillStyle = "#f4efe2"; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill();
    const nm = sky.names.get(i);
    if (nm && nm.con === id && m < 3.5) { ctx.fillStyle = "#d8b876"; ctx.font = 'italic 400 26px "Bodoni Moda", Georgia, serif'; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(nm.name, p[0] + r + 10, p[1] + 2); }
  }
  ctx.restore();
  ctx.strokeStyle = "#c8a45d"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(34, H - 150); ctx.lineTo(W - 34, H - 150); ctx.stroke();
  ctx.fillStyle = "#f4efe2"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = '500 44px "Bodoni Moda", Georgia, serif'; ctx.fillText(k.fr, W / 2, H - 92);
  ctx.fillStyle = "#c8a45d"; ctx.font = 'italic 400 26px "Bodoni Moda", Georgia, serif'; ctx.fillText(k.la, W / 2, H - 56);
}

async function init() {
  sky = await loadSky();
  await document.fonts?.ready;
  ouverture(); savais(); ceSoir();
  // la planche d'atlas est plus bas dans la page : dessinée seulement quand on s'en approche
  const pl = $("#planche");
  if (pl && "IntersectionObserver" in window) { const io = new IntersectionObserver(e => { if (e[0].isIntersecting) { io.disconnect(); plusTard(() => planche()); } }, { rootMargin: "500px" }); io.observe(pl); } else plusTard(() => planche());
  setInterval(() => { dessine(1); ceSoir(); }, 60000);
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => dessine(1), 150); });
  $("#maPos")?.addEventListener("click", () => {
    if (!navigator.geolocation) return;
    $("#maPos").textContent = "Localisation…";
    navigator.geolocation.getCurrentPosition(p => {
      lieu.lat = p.coords.latitude; lieu.lon = p.coords.longitude; lieu.moi = true;
      $("#maPos").textContent = "Position utilisée"; dessine(1); ceSoir(); son("magie");
    }, () => { $("#maPos").textContent = "Position refusée, on reste sur Paris"; }, { timeout: 10000, maximumAge: 600000 });
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(e => { if (e[0].isIntersecting) { io.disconnect(); exemplePoster(); } }, { rootMargin: "300px" });
    const t = $("#posterEx"); if (t) io.observe(t);
  } else exemplePoster();
}
init();
