/* Rendu du poster « carte du ciel » : aperçu (filigrané) et fichier HD. */
import { loadSky, horMatrix, starsENU } from "./sky.js";
import { drawDome, THEMES } from "./dome.js";

export const HD = { w: 3000, h: 4243 }; // format A (ratio √2) : A3 à ~250 dpi, A4 à ~360 dpi ; sous la limite des iPhone

/* ---------- fuseau horaire du lieu (carte Natural Earth, domaine public) ---------- */
let zones = null;
async function loadZones() {
  if (!zones) zones = await (await fetch("/assets/data/fuseaux.json")).json();
  return zones;
}
function inRing(r, x, y) {
  let ins = false;
  for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
    const xi = r[i], yi = r[i + 1], xj = r[j], yj = r[j + 1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
/* cadre englobant de chaque contour, calculé une fois : on ne teste en détail que les zones qui entourent le point */
let cadres = null;
function prepareCadres(z) {
  cadres = z.f.map(([, , rings]) => rings.map(r => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 0; i < r.length; i += 2) { const x = r[i], y = r[i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, x1, y0, y1]; }));
}
export async function zoneAt(lat, lon) {
  const z = await loadZones(), x = lon * z.u, y = lat * z.u;
  if (!cadres) prepareCadres(z);
  for (let k = 0; k < z.f.length; k++) {
    const [tz, off, rings] = z.f[k];
    let ins = false;
    for (let j = 0; j < rings.length; j++) { const c = cadres[k][j]; if (x < c[0] || x > c[1] || y < c[2] || y > c[3]) continue; if (inRing(rings[j], x, y)) ins = !ins; }
    if (ins) return { tz: tz || null, off: typeof off === "number" ? off : Math.round(lon / 15) };
  }
  return { tz: null, off: Math.round(lon / 15) };
}
function offsetMin(tz, utcMs) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(utcMs)).map(x => [x.type, x.value]));
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return (asUTC - utcMs) / 60000;
}
/* « 2026-02-14 » + « 21:30 » à l'heure locale du lieu -> Date UTC */
export async function localToUTC(dateStr, timeStr, lat, lon) {
  const [y, mo, d] = dateStr.split("-").map(Number), [h, mi] = (timeStr || "22:00").split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const z = await zoneAt(lat, lon);
  if (z.tz) {
    try {
      let g = wall - offsetMin(z.tz, wall) * 60000;
      g = wall - offsetMin(z.tz, g) * 60000;
      return { date: new Date(g), tz: z.tz };
    } catch (e) { /* fuseau inconnu du navigateur : décalage fixe */ }
  }
  return { date: new Date(wall - z.off * 3600000), tz: null };
}

/* ---------- textes ---------- */
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export function dateFr(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, mi] = (timeStr || "22:00").split(":");
  return `${d === 1 ? "1er" : d} ${MOIS[m - 1]} ${y}, ${+h} h ${mi}`;
}
export function coordFr(lat, lon) {
  const f = (v, p, n) => `${Math.abs(v).toFixed(4).replace(".", ",")}° ${v >= 0 ? p : n}`;
  return `${f(lat, "N", "S")}  ${f(lon, "E", "O")}`;
}

/* ---------- rendu ---------- */
export async function renderPoster(cv, p, opt = {}) {
  const sky = await loadSky();
  const W = opt.w || 900, H = Math.round(W * Math.SQRT2);
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const th = THEMES[p.theme] || THEMES.encre;
  const u = W / 1000;
  await document.fonts?.ready;

  ctx.fillStyle = th.papier; ctx.fillRect(0, 0, W, H);
  // filet gravé intérieur
  ctx.strokeStyle = th.anneau; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.4 * u;
  ctx.strokeRect(34 * u, 34 * u, W - 68 * u, H - 68 * u); ctx.globalAlpha = 1;

  const utc = p.utc ? new Date(p.utc) : (await localToUTC(p.date, p.heure, p.lat, p.lon)).date;
  const hm = horMatrix(utc, p.lat, p.lon);
  const R = 360 * u, cx = W / 2, cy = 120 * u + R + 30 * u;
  drawDome(ctx, sky, hm, { cx, cy, R, theme: th, maxMag: 5.6, enu: starsENU(sky, hm.m), rangMax: 2, labelScale: 0.92, starScale: 0.95 });

  // textes
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = th.texte;
  const yT = cy + R + 150 * u;
  ctx.font = `italic 400 ${Math.round(58 * u)}px "Bodoni Moda", Georgia, serif`;
  wrap(ctx, p.titre || "Le ciel de cette nuit-là", cx, yT, W - 180 * u, 66 * u, 2);
  ctx.font = `400 ${Math.round(24 * u)}px "Atkinson Hyperlegible", system-ui, sans-serif`;
  ctx.fillStyle = th.texte2;
  const l2 = [p.sousTitre, dateFr(p.date, p.heure)].filter(Boolean).join("  ·  ");
  ctx.fillText(l2, cx, yT + 150 * u);
  ctx.fillText(`${p.lieu || ""}${p.lieu ? "  ·  " : ""}${coordFr(p.lat, p.lon)}`, cx, yT + 188 * u);

  if (opt.apercu) watermark(ctx, W, H, u, th.texte);
  return cv;
}

function wrap(ctx, text, x, y, maxW, lh, maxLines) {
  const words = String(text).split(/\s+/); let line = "", lines = [];
  for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  lines = lines.slice(0, maxLines);
  const y0 = y - (lines.length - 1) * lh / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, y0 + i * lh));
}

function watermark(ctx, W, H, u, couleur = "#ffffff") {
  ctx.save();
  ctx.globalAlpha = 0.2; ctx.fillStyle = couleur; ctx.strokeStyle = "#000000"; ctx.lineWidth = 1.2 * u;
  ctx.font = `italic 500 ${Math.round(46 * u)}px "Bodoni Moda", Georgia, serif`;
  ctx.textAlign = "center"; ctx.translate(W / 2, H / 2); ctx.rotate(-Math.PI / 7);
  for (let y = -H; y < H; y += 190 * u) for (let x = -W; x < W; x += 420 * u) { ctx.fillText("Aperçu Lunétoiles", x + (y / 190 % 2) * 210 * u, y); }
  ctx.restore();
}
