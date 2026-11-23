/* Voûte : moteur du ciel commun (accueil, viseur, poster).
   Positions réelles : catalogue d'étoiles J2000 (d3-celestial, BSD-3) + Astronomy Engine (MIT)
   pour la rotation vers l'horizon local (précession, nutation) et les planètes. */
const A = () => window.Astronomy;
const RAD = Math.PI / 180;

export const PLANETS = [
  { id: "Sun", fr: "Soleil", col: "#ffd27a" },
  { id: "Moon", fr: "Lune", col: "#f2eee0" },
  { id: "Mercury", fr: "Mercure", col: "#d9c8b0" },
  { id: "Venus", fr: "Vénus", col: "#fff4d6" },
  { id: "Mars", fr: "Mars", col: "#ff9a6b" },
  { id: "Jupiter", fr: "Jupiter", col: "#f4dfb8" },
  { id: "Saturn", fr: "Saturne", col: "#f0d8a0" },
  { id: "Uranus", fr: "Uranus", col: "#bfe8f0" },
  { id: "Neptune", fr: "Neptune", col: "#9fb8ff" },
];

let cache = null;
export async function loadSky(base = "/assets/data/sky.json") {
  if (cache) return cache;
  const r = await fetch(base);
  const d = await r.json();
  const n = d.stars.length / 4;
  const vec = new Float32Array(n * 3), mag = new Float32Array(n), col = new Array(n);
  for (let i = 0; i < n; i++) {
    const ra = d.stars[i * 4] / 100 * RAD, de = d.stars[i * 4 + 1] / 100 * RAD;
    const c = Math.cos(de);
    vec[i * 3] = c * Math.cos(ra); vec[i * 3 + 1] = c * Math.sin(ra); vec[i * 3 + 2] = Math.sin(de);
    mag[i] = d.stars[i * 4 + 2] / 100;
    col[i] = bvColor(d.stars[i * 4 + 3] / 100);
  }
  const names = new Map();
  for (const [k, v] of Object.entries(d.names)) names.set(+k, { name: v[0], con: v[1] });
  const cons = d.cons.map(c => ({
    id: c.id, fr: c.fr, la: c.la, gen: c.gen, rank: c.rk,
    label: radec(c.ra / 100, c.dec / 100),
    lines: c.l.map(seg => { const out = []; for (let i = 0; i < seg.length; i += 2) out.push(radec(seg[i] / 100, seg[i + 1] / 100)); return out; }),
  }));
  const byId = new Map(cons.map(c => [c.id, c]));
  cache = { n, vec, mag, col, names, cons, byId };
  return cache;
}

function radec(raDeg, decDeg) {
  const ra = raDeg * RAD, de = decDeg * RAD, c = Math.cos(de);
  return [c * Math.cos(ra), c * Math.sin(ra), Math.sin(de)];
}

/* Couleur approximative d'une étoile selon son indice B-V */
export function bvColor(bv) {
  const t = Math.max(-0.4, Math.min(2, bv));
  let r, g, b;
  if (t < 0) { r = 0.70 + 0.3 * (t + 0.4) / 0.4; g = 0.80 + 0.2 * (t + 0.4) / 0.4; b = 1; }
  else if (t < 0.6) { r = 1; g = 1 - 0.08 * t / 0.6; b = 1 - 0.25 * t / 0.6; }
  else { r = 1; g = 0.92 - 0.3 * (t - 0.6) / 1.4; b = 0.75 - 0.45 * (t - 0.6) / 1.4; }
  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
}

/* Matrice J2000 -> horizon local. Repère horizon d'Astronomy Engine : x nord, y ouest, z zénith. */
export function horMatrix(date, lat, lon) {
  const t = A().MakeTime(date), obs = new (A().Observer)(lat, lon, 0);
  return { m: A().Rotation_EQJ_HOR(t, obs).rot, t, obs };
}

/* Vecteur J2000 -> [est, nord, haut] */
export function toENU(m, x, y, z) {
  const n = m[0][0] * x + m[1][0] * y + m[2][0] * z;
  const w = m[0][1] * x + m[1][1] * y + m[2][1] * z;
  const u = m[0][2] * x + m[1][2] * y + m[2][2] * z;
  return [-w, n, u];
}

/* Toutes les étoiles dans le repère horizon (Float32Array est,nord,haut) */
export function starsENU(sky, m, out) {
  const v = sky.vec, o = out || new Float32Array(sky.n * 3);
  for (let i = 0; i < sky.n; i++) {
    const x = v[i * 3], y = v[i * 3 + 1], z = v[i * 3 + 2];
    o[i * 3] = -(m[0][1] * x + m[1][1] * y + m[2][1] * z);
    o[i * 3 + 1] = m[0][0] * x + m[1][0] * y + m[2][0] * z;
    o[i * 3 + 2] = m[0][2] * x + m[1][2] * y + m[2][2] * z;
  }
  return o;
}

/* Planètes, Lune, Soleil : direction horizon + magnitude + infos */
export function bodies(hm) {
  const X = A();
  return PLANETS.map(p => {
    const eq = X.Equator(p.id, hm.t, hm.obs, false, true);
    const ra = eq.ra * 15 * RAD, de = eq.dec * RAD, c = Math.cos(de);
    const enu = toENU(hm.m, c * Math.cos(ra), c * Math.sin(ra), Math.sin(de));
    let mag = -26.7, phase = null;
    try { const il = X.Illumination(p.id, hm.t); mag = il.mag; phase = il.phase_fraction; } catch (e) {}
    return { ...p, enu, mag, phase, dist: eq.dist };
  });
}

export function altAz(enu) {
  const [e, n, u] = enu;
  const alt = Math.asin(Math.max(-1, Math.min(1, u))) / RAD;
  let az = Math.atan2(e, n) / RAD; if (az < 0) az += 360;
  return { alt, az };
}

export function azName(az) {
  return ["nord", "nord-est", "est", "sud-est", "sud", "sud-ouest", "ouest", "nord-ouest"][Math.round(az / 45) % 8];
}

/* Lever / coucher d'un astre dans les prochaines 24 h */
export function riseSet(id, hm) {
  const X = A();
  const f = d => { try { const r = X.SearchRiseSet(id, hm.obs, d, hm.t, 1); return r ? r.date : null; } catch (e) { return null; } };
  return { rise: f(+1), set: f(-1) };
}

/* Projection « dôme » : ciel entier vu en levant la tête (nord en haut, est à gauche). */
export function domeXY(enu, R, cx, cy) {
  const [e, n, u] = enu;
  if (u < -0.02) return null;
  const alt = Math.asin(Math.min(1, u)), az = Math.atan2(e, n);
  const r = R * Math.tan((Math.PI / 2 - alt) / 2);
  return [cx - r * Math.sin(az), cy - r * Math.cos(az)];
}

export function starRadius(mag, k = 1) {
  return Math.max(0.35, (4.9 - mag) * 0.55) * k;
}

export function fmtTime(d) {
  return d ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—";
}
