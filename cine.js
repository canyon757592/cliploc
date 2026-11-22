/* Cliploc : caméra en relief.
   Chaque photo reçoit un relief approximatif, déduit de ses lignes de fuite et de son ciel :
   le sol et les murs proches, le fond de la pièce plus loin, le ciel très loin.
   Une caméra virtuelle se déplace dans ce décor (avancée, travelling, survol) et le rendu se fait
   en WebGL, avec flou de mouvement. Aucun modèle d'IA : quelques millisecondes de calcul par photo,
   tout reste sur l'appareil du client. */

export const GW = 160;        // largeur de la grille d'analyse
export const FOCAL = 0.9;     // focale des photos d'annonce (grand-angle), en hauteur d'image
const KMAX = 8;               // échantillons de flou de mouvement par image, au plus
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- Analyse d'une photo ---------- */

function blur(src, w, h, r) {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const o = y * w;
    for (let x = 0; x < w; x++) {
      let s = 0, n = 0;
      for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < w) { s += src[o + xx]; n++ } }
      tmp[o + x] = s / n;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let s = 0, n = 0;
      for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; n++ } }
      out[y * w + x] = s / n;
    }
  }
  return out;
}

function quantile(arr, q) {
  if (!arr.length) return 0;
  const a = Array.from(arr).sort((x, y) => x - y);
  return a[clamp(Math.floor(q * (a.length - 1)), 0, a.length - 1)];
}

/* Analyse sur des pixels RGBA déjà réduits (largeur GW). Renvoie le type de scène, le point de fuite,
   l'horizon et la grille de « proximité » (1 = tout près, petit = loin). */
export function analyzePixels(px, w, h) {
  const N = w * h;
  const L = new Float32Array(N), S = new Float32Array(N), R = new Float32Array(N), G = new Float32Array(N), B = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = px[4 * i], g = px[4 * i + 1], b = px[4 * i + 2];
    R[i] = r; G[i] = g; B[i] = b; L[i] = .299 * r + .587 * g + .114 * b;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b); S[i] = mx > 0 ? (mx - mn) / mx : 0;
  }
  const Lb = blur(L, w, h, 1);
  const gx = new Float32Array(N), gy = new Float32Array(N), mag = new Float32Array(N);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const a = Lb[i - w - 1], b = Lb[i - w], c = Lb[i - w + 1], d = Lb[i - 1], f = Lb[i + 1], g = Lb[i + w - 1], hh = Lb[i + w], k = Lb[i + w + 1];
    gx[i] = (c + 2 * f + k) - (a + 2 * d + g); gy[i] = (g + 2 * hh + k) - (a + 2 * b + c);
    mag[i] = Math.hypot(gx[i], gy[i]);
  }
  const tex = blur(mag, w, h, 2);

  /* Ciel : zone lisse, couleur de ciel (bleu saturé, ou nuit sombre et froide), reliée au bord du haut. */
  const cand = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const blue = B[i] > R[i] + 6 && B[i] >= G[i] - 8 && S[i] > .12;
    const night = L[i] < 70 && B[i] >= R[i] - 4;
    cand[i] = tex[i] < 26 && (blue || night) ? 1 : 0;
  }
  const sky = new Uint8Array(N), stack = [];
  for (let x = 0; x < w; x++) if (cand[x]) { sky[x] = 1; stack.push(x) }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i / w) | 0;
    const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
    for (const j of nb) if (j >= 0 && !sky[j] && cand[j]) { sky[j] = 1; stack.push(j) }
  }
  for (let i = 0; i < N; i++) if (sky[i]) stack.push(i);
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i / w) | 0;
    const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y < h - 1 ? i + w : -1];
    for (const j of nb) if (j >= 0 && !sky[j] && tex[j] < 16 && Math.abs(R[j] - R[i]) + Math.abs(G[j] - G[i]) + Math.abs(B[j] - B[i]) < 14 && L[j] > 40) { sky[j] = 1; stack.push(j) }
  }
  let skyN = 0; for (let i = 0; i < N; i++) skyN += sky[i];
  let skyFrac = skyN / N, horizon = -1;
  if (skyFrac >= .03) {
    const lows = [];
    for (let x = 0; x < w; x++) { let lo = -1; for (let y = 0; y < h; y++) if (sky[y * w + x]) lo = y; if (lo >= 0) lows.push((lo + 1) / h) }
    if (lows.length > w * .2) horizon = quantile(lows, .6);
  }
  if (horizon < .12 || horizon > .78) { horizon = -1; skyFrac = 0; sky.fill(0) }

  /* Point de fuite : vote des contours obliques (les lignes horizontales et verticales ne convergent pas vers le fond). */
  const thr = Math.max(40, quantile(mag.filter((_, i) => !sky[i]), .82));
  const ex = [], ey = [], edx = [], edy = [], em = [];
  for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
    const i = y * w + x, m = mag[i];
    if (m < thr || sky[i]) continue;
    const dx = -gy[i] / m, dy = gx[i] / m;                 // direction de la ligne
    if (Math.abs(dy) < .17 || Math.abs(dx) < .17) continue;
    ex.push(x); ey.push(y); edx.push(dx); edy.push(dy); em.push(m);
  }
  const step = Math.max(1, Math.ceil(ex.length / 1800));
  let tot = 0; for (let k = 0; k < ex.length; k += step) tot += em[k];
  const score = (cx, cy) => {
    let s = 0;
    for (let k = 0; k < ex.length; k += step) {
      const vx = cx - ex[k], vy = cy - ey[k], d = Math.hypot(vx, vy);
      if (d < 4) continue;
      const a = Math.abs(edx[k] * vx + edy[k] * vy) / d;
      s += em[k] * Math.exp((a - 1) * 400);
    }
    return s;
  };
  let best = -1, bx = .5, by = .5;
  for (let j = 0; j <= 40; j++) for (let i = 0; i <= 40; i++) {
    const u = -.3 + 1.6 * i / 40, v = -.3 + 1.6 * j / 40, s = score(u * w, v * h);
    if (s > best) { best = s; bx = u; by = v }
  }
  for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) {
    const u = bx + i * .01, v = by + j * .01, s = score(u * w, v * h);
    if (s > best) { best = s; bx = u; by = v }
  }
  const conf = tot > 0 ? best / tot : 0;

  /* Type de scène et paramètres du relief */
  let kind, vx, vy, back;
  if (horizon > 0 && skyFrac > .05) {
    kind = "ext"; vy = horizon; vx = conf >= .10 && Math.abs(by - horizon) < .2 && bx > .1 && bx < .9 ? bx : .5; back = .09;
  } else if (conf >= .12 && bx > .15 && bx < .85 && by > .15 && by < .85) {
    kind = "int"; vx = bx; vy = by; back = .33;
  } else {
    // pas de lignes de fuite nettes : relief de pièce générique (le centre plus loin que les bords et le sol)
    kind = "flat"; back = .5;
    const central = bx > .3 && bx < .7 && by > .35 && by < .65 && conf >= .08;
    vx = central ? bx : .5; vy = central ? by : .48;
  }
  // colonnes avec du ciel : ce qui est sous le ciel et au-dessus de l'horizon est lointain (ville, collines) ;
  // ce qui est au-dessus du ciel (avancée de toit, plafond) reste proche
  const topSky = new Int32Array(w).fill(-1), botSky = new Int32Array(w).fill(-1);
  if (kind === "ext") for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (sky[y * w + x]) { if (topSky[x] < 0) topSky[x] = y; botSky[x] = y }
  const hRow = horizon * h;
  const near = new Float32Array(N);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = (x + .5) / w, v = (y + .5) / h, i = y * w + x;
    const dh = u >= vx ? (u - vx) / Math.max(.05, 1 - vx) : (vx - u) / Math.max(.05, vx);
    const dv = v >= vy ? (v - vy) / Math.max(.05, 1 - vy) : (vy - v) / Math.max(.05, vy);
    const d = .72 * Math.max(dh, dv) + .28 * Math.hypot(dh, dv) / Math.SQRT2;
    let q = clamp(Math.max(d, back), back, 1);
    if (kind === "ext" && !sky[i] && y < hRow && topSky[x] >= 0 && y > topSky[x]) q = back;
    if (sky[i]) q = .05;
    near[i] = q;
  }
  const sm = blur(blur(near, w, h, 3), w, h, 3);
  const disp = new Uint8Array(N);
  for (let i = 0; i < N; i++) disp[i] = Math.round(clamp(sm[i], .04, 1) * 255);
  const fi = clamp(Math.round(vy * h), 0, h - 1) * w + clamp(Math.round(vx * w), 0, w - 1);
  return { kind, vp: [vx, vy], horizon, conf, skyFrac, gw: w, gh: h, disp, focusNear: Math.max(.04, sm[fi]) };
}

/* Analyse d'une image (ImageBitmap ou canvas) : réduction à GW pixels de large puis analyse. */
export function analyze(img) {
  const w = GW, h = Math.max(24, Math.round(GW * img.height / img.width));
  const c = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(w, h) : Object.assign(document.createElement("canvas"), { width: w, height: h });
  const x = c.getContext("2d", { willReadFrequently: true });
  x.imageSmoothingQuality = "high";
  x.drawImage(img, 0, 0, w, h);
  return analyzePixels(x.getImageData(0, 0, w, h).data, w, h);
}

/* ---------- Géométrie de la caméra (identique côté processeur et côté carte graphique) ---------- */

function rotM(yaw, pitch, roll) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
  const Ry = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const Rx = [1, 0, 0, 0, cp, -sp, 0, sp, cp];
  const Rz = [cr, -sr, 0, sr, cr, 0, 0, 0, 1];
  const mul = (A, B) => { const o = new Array(9); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c]; return o };
  return mul(Rz, mul(Rx, Ry));
}

function nearAt(info, u, v) {
  const { gw, gh, disp } = info;
  const x = clamp(u * gw - .5, 0, gw - 1), y = clamp(v * gh - .5, 0, gh - 1);
  const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(gw - 1, x0 + 1), y1 = Math.min(gh - 1, y0 + 1), fx = x - x0, fy = y - y0;
  const a = disp[y0 * gw + x0], b = disp[y0 * gw + x1], c = disp[y1 * gw + x0], d = disp[y1 * gw + x1];
  return Math.max(.03, lerp(lerp(a, b, fx), lerp(c, d, fx), fy) / 255);
}

/* Pour un point de l'écran (coordonnées du plan caméra), retrouve le point de la photo qui s'y projette. */
function sourceOf(xt, yt, cam, info, asp, M) {
  let X = xt, Y = yt;
  for (let it = 0; it < 5; it++) {
    const Z = 1 / nearAt(info, X / asp + .5, Y + .5);
    const Px = X * Z / FOCAL - cam.tx, Py = Y * Z / FOCAL - cam.ty, Pz = Z - cam.tz;
    const cx = M[0] * Px + M[1] * Py + M[2] * Pz, cy = M[3] * Px + M[4] * Py + M[5] * Pz, cz = Math.max(.05, M[6] * Px + M[7] * Py + M[8] * Pz);
    const k = cz / Z;
    X += (xt - FOCAL * cx / cz) * k; Y += (yt - FOCAL * cy / cz) * k;
  }
  return [X / asp + .5, Y + .5];
}

/* ---------- Grammaire de caméra ---------- */

/* Mouvements (unités : la distance des murs les plus proches vaut 1).
   fwd : avancée vers le fond ; side : travelling latéral ; up : montée (négatif = la caméra monte) ;
   orbit : la caméra tourne pour garder le fond cadré ; roll : inclinaison (virage de drone). */
const MOVES = {
  push:    { fwd: [0, .36], up: [0, -.015] },
  walkL:   { fwd: [0, .32], side: [.05, -.04], orbit: .5 },
  walkR:   { fwd: [0, .32], side: [-.05, .04], orbit: .5 },
  reveal:  { fwd: [.30, .02], up: [-.02, 0] },
  slideR:  { side: [-.11, .11], fwd: [.04, .09], orbit: .6 },
  slideL:  { side: [.11, -.11], fwd: [.04, .09], orbit: .6 },
  orbitR:  { side: [-.15, .15], fwd: [.05, .14], orbit: 1, roll: [.022, -.022] },
  orbitL:  { side: [.15, -.15], fwd: [.05, .14], orbit: 1, roll: [-.022, .022] },
  rise:    { up: [.05, -.08], fwd: [0, .12], orbitV: 1 },
  fly:     { fwd: [0, .55], up: [0, -.05], orbitV: .6 },
  drift:   { side: [-.045, .045], fwd: [0, .07], orbit: .4 }
};
const REPERTOIRE = {
  drone:   { ext: ["fly", "orbitR", "rise", "orbitL", "reveal"], int: ["push", "orbitR", "reveal", "orbitL"], flat: ["push", "orbitL", "slideR"] },
  cinema:  { ext: ["fly", "slideR", "reveal", "slideL"], int: ["push", "slideL", "reveal", "slideR"], flat: ["push", "slideL", "slideR"] },
  tour:    { ext: ["fly", "walkL", "push", "walkR"], int: ["push", "walkL", "push", "walkR"], flat: ["walkR", "push", "walkL"] },
  dynamic: { ext: ["fly", "orbitR", "push", "orbitL", "rise"], int: ["push", "slideR", "reveal", "orbitL", "walkR"], flat: ["walkL", "slideR", "push", "slideL"] }
};
export const STYLES = {
  drone:   { k: .55, amp: 1.0,  trans: ["push", "dissolve"],          dur: { push: .62, dissolve: .9 },   vig: .22, grain: .035, kBase: 3, hand: .0012, bob: 0, flash: .34 },
  cinema:  { k: .8,  amp: .72,  trans: ["dissolve", "dissolve", "cut"], dur: { dissolve: 1.1, cut: 0 },   vig: .34, grain: .05,  kBase: 3, hand: .0007, bob: 0 },
  tour:    { k: .25, amp: .9,   trans: ["push", "cut", "push"],         dur: { push: .5, cut: 0 },        vig: .12, grain: .028, kBase: 3, hand: .0025, bob: .0035, flash: .1 },
  dynamic: { k: -1,  amp: 1.08, trans: ["whip", "flash", "whip", "cut"], dur: { whip: .34, flash: 0, cut: 0 }, vig: .12, grain: .03, kBase: 4, hand: .0016, bob: 0 }
};

const smoother = t => t * t * t * (t * (6 * t - 15) + 10);
function ease(st, t) {
  if (st.k < 0) {                                       // rampe de vitesse : rapide, lent au milieu, rapide
    const u = 2 * t - 1, a = 1.7, r = .5 + .5 * Math.sign(u) * Math.pow(Math.abs(u), a);
    if (t < 0) return t * 1.35; if (t > 1) return 1 + (t - 1) * 1.35;
    return .5 * t + .5 * r;
  }
  const k = st.k, s = 1 - k;
  if (t < 0) return t * s; if (t > 1) return 1 + (t - 1) * s;
  return s * t + k * smoother(t);
}

function seeded(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }

/* Position de la caméra sur un plan, au temps normalisé t (0 = début du plan, 1 = fin ; hors de [0,1] la caméra continue sur sa lancée). */
function baseCam(sh, t, gt, st) {
  const e = ease(st, t), m = sh.mv, a = sh.amp;
  const g = k => m[k] ? lerp(m[k][0], m[k][1], e) * a : 0;
  const fwd = g("fwd"), side = g("side"), up = g("up"), roll = g("roll");
  const zf = 1 / sh.info.focusNear;
  let yaw = (m.orbit || 0) * side / zf, pitch = -(m.orbitV || 0) * up / zf;
  const n = sh.noise;
  yaw += st.hand * (Math.sin(gt * 1.9 + n[0]) * .6 + Math.sin(gt * 4.3 + n[1]) * .4);
  pitch += st.hand * (Math.sin(gt * 2.3 + n[2]) * .6 + Math.sin(gt * 5.1 + n[3]) * .4);
  const rollN = roll + st.hand * .8 * Math.sin(gt * 1.3 + n[4]);
  const bob = st.bob ? st.bob * Math.sin(gt * Math.PI * 2 * 1.8 + n[5]) : 0;
  const d = sh.dir;
  return { tx: fwd * d[0] + side, ty: fwd * d[1] + up + bob, tz: fwd * d[2], yaw, pitch, roll: rollN, cx: sh.view.cx, cy: sh.view.cy, hh: sh.view.hh };
}

function covered(sh, st, hh, cx, cy, ts, aOut) {
  const pts = [];
  for (let k = 0; k <= 6; k++) { const s = k / 6; pts.push([s, 0], [s, 1], [0, s], [1, s]) }
  const save = sh.view; sh.view = { cx, cy, hh };
  try {
    for (const t of ts) {
      const c = baseCam(sh, t, sh.t0 + t * sh.per, st), M = rotM(c.yaw, c.pitch, c.roll);
      for (const [ox, oy] of pts) {
        const xt = cx + (ox - .5) * 2 * hh * aOut, yt = cy + (oy - .5) * 2 * hh;
        const [u, v] = sourceOf(xt, yt, c, sh.info, sh.asp, M);
        if (u < .002 || u > .998 || v < .002 || v > .998) return false;
      }
    }
    return true;
  } finally { sh.view = save }
}

/* Prépare le film : un mouvement par plan, choisi selon la photo (extérieur, pièce, plan serré),
   puis le cadrage le plus large possible sans jamais sortir de la photo. */
export function planCine({ infos, asps, per, count, seconds, motion, outAsp, outH = 1080 }) {
  const st = STYLES[motion] || STYLES.drone, rep = REPERTOIRE[motion] || REPERTOIRE.drone;
  const rnd = seeded(count * 7919 + Math.round(seconds * 13));
  const trans = Array.from({ length: Math.max(0, count - 1) }, (_, i) => st.trans[i % st.trans.length]);
  const half = tr => tr === "dissolve" || tr === "push" || tr === "whip" ? (st.dur[tr] || .5) / 2 : 1 / 30;
  const used = { ext: 0, int: 0, flat: 0 }, byPhoto = new Map();
  const shots = [];
  let prevMove = "";
  for (let i = 0; i < count; i++) {
    const info = infos[i], asp = asps[i], list = rep[info.kind] || rep.flat, seen = byPhoto.get(info) || [];
    let name = list[used[info.kind]++ % list.length];
    if (i === count - 1 && info.kind !== "flat") name = info.kind === "ext" ? "fly" : "push";   // dernier plan : on avance
    for (let g = 0; g < list.length && (name === prevMove || seen.includes(name)); g++) name = list[used[info.kind]++ % list.length];
    seen.push(name); byPhoto.set(info, seen);
    prevMove = name;
    const vpX = (info.vp[0] - .5) * asp, vpY = info.vp[1] - .5, n = Math.hypot(vpX, vpY, FOCAL);
    const mv = MOVES[name], peak = k => mv[k] ? Math.max(Math.abs(mv[k][0]), Math.abs(mv[k][1])) : 0;
    const sh = {
      p: i, info, asp, per, t0: i * per, mv, name,
      amp: Math.min(st.amp * Math.pow(clamp(per / 3, .55, 1.3), .7), peak("fwd") ? .45 / peak("fwd") : 9, peak("side") ? .18 / peak("side") : 9),
      dir: [vpX / n, vpY / n, FOCAL / n],
      noise: Array.from({ length: 6 }, () => rnd() * 6.283),
      pre: i > 0 ? half(trans[i - 1]) / per : 0, post: i < count - 1 ? half(trans[i]) / per : 0,
      view: null
    };
    // cadrage : centré sur le point de fuite, le plus large possible tant que l'image reste couverte
    const hhMax = Math.min(info.kind === "ext" ? .44 : .5, asp / (2 * outAsp)) * .995;
    const ts = []; for (let k = 0; k <= 10; k++) ts.push(lerp(-sh.pre - .03, 1 + sh.post + .03, k / 10));
    let ok = null;
    for (let tries = 0; tries < 5 && !ok; tries++) {
      const fit = hh => {
        const cxMax = Math.max(0, asp / 2 - hh * outAsp), cyMax = Math.max(0, .5 - hh);
        // extérieur : point de fuite au tiers plutôt qu'au centre (la vue et la piscine restent dans le cadre)
        const cx = clamp(info.kind === "ext" ? vpX * .5 : vpX, -cxMax, cxMax), cy = clamp(info.kind === "ext" ? Math.min(cyMax, vpY + .5 * hh) : vpY * .5, -cyMax, cyMax);
        return covered(sh, st, hh, cx, cy, ts, outAsp) ? { cx, cy, hh } : null;
      };
      if (fit(.22)) {
        let lo = .22, hi = hhMax;
        if (fit(hi)) lo = hi; else for (let k = 0; k < 12; k++) { const m = (lo + hi) / 2; if (fit(m)) lo = m; else hi = m }
        ok = fit(lo);
      } else sh.amp *= .72;                                 // mouvement trop ample pour cette photo : on l'adoucit
    }
    sh.view = ok || { cx: 0, cy: 0, hh: .3 };
    sh.view.hh *= .985;
    shots.push(sh);
  }
  return { shots, trans, st, per, count, seconds, outAsp, outH };
}

/* Les passes à dessiner pour l'instant gt : un ou deux plans, chacun avec ses échantillons de flou de mouvement. */
export function frameCams(plan, gt, fps) {
  const { shots, trans, st, per, count } = plan;
  const i = clamp(Math.floor(gt / per), 0, count - 1);
  const camsFor = (sh, t, K, shutter, extra) => {
    const out = [];
    for (let k = 0; k < K; k++) {
      const dt = K > 1 ? (k / (K - 1) - .5) * shutter : 0;
      const g = t + dt, c = baseCam(sh, (g - sh.t0) / per, g, st);
      if (extra) extra(c, g);
      out.push(c);
    }
    return out;
  };
  const sb = 0.5 / fps;
  // vitesse à l'écran (en pixels) entre le début et la fin de l'obturation : décide du nombre d'échantillons
  const speedPx = (sh, a, b) => {
    const Ma = rotM(a.yaw, a.pitch, a.roll), Mb = rotM(b.yaw, b.pitch, b.roll); let m = 0;
    for (const [ox, oy] of [[.5, .5], [.05, .05], [.95, .05], [.05, .95], [.95, .95]]) {
      const xt = a.cx + (ox - .5) * 2 * a.hh * plan.outAsp, yt = a.cy + (oy - .5) * 2 * a.hh;
      const ua = sourceOf(xt, yt, a, sh.info, sh.asp, Ma), ub = sourceOf(xt, yt, b, sh.info, sh.asp, Mb);
      m = Math.max(m, Math.hypot((ua[0] - ub[0]) * sh.asp, ua[1] - ub[1]) / (2 * a.hh) * plan.outH);
    }
    return m;
  };
  const adapt = (sh, t, shutter, extra, kMax) => {
    const ends = camsFor(sh, t, 2, shutter, extra), px = speedPx(sh, ends[0], ends[1]);
    const K = clamp(Math.ceil(px / 2.5), 1, kMax);
    return K === 1 ? camsFor(sh, t, 1, 0, extra) : K === 2 ? ends : camsFor(sh, t, K, shutter, extra);
  };
  const base = (sh, alpha = 1, expo = 0) => ({ shot: sh, alpha, expo, cams: adapt(sh, gt, sb, null, Math.max(st.kBase, 4)) });
  // transition avec le plan suivant ou le précédent
  const near = [];
  if (i < count - 1) near.push(i); if (i > 0) near.push(i - 1);
  for (const j of near) {
    const tr = trans[j], b = (j + 1) * per, d = st.dur[tr] || 0, A = shots[j], Bs = shots[j + 1];
    if (tr === "dissolve" && Math.abs(gt - b) < d / 2) {
      const u = smoother((gt - (b - d / 2)) / d);
      return [base(A), base(Bs, u)];
    }
    if (tr === "push" && Math.abs(gt - b) < d / 2) {
      const s = (gt - (b - d / 2)) / d, boost = .42, K = KMAX, sh2 = 1 / fps;
      const flash = (st.flash || .3) * Math.exp(-Math.pow((s - .5) / .14, 2));
      const fA = (c, g) => { const q = clamp(((g - (b - d / 2)) / d) / .5, 0, 1.3); c.tz += boost * Math.pow(q, 2.2) * A.dir[2]; c.tx += boost * Math.pow(q, 2.2) * A.dir[0]; c.ty += boost * Math.pow(q, 2.2) * A.dir[1] };
      const fB = (c, g) => { const q = clamp((1 - (g - (b - d / 2)) / d) / .5, 0, 1.3); c.tz += boost * Math.pow(q, 2.2) * Bs.dir[2]; c.tx += boost * Math.pow(q, 2.2) * Bs.dir[0]; c.ty += boost * Math.pow(q, 2.2) * Bs.dir[1] };
      const out = [];
      if (s < .58) out.push({ shot: A, alpha: 1, expo: flash, cams: adapt(A, gt, sh2, fA, K) });
      if (s > .42) out.push({ shot: Bs, alpha: s < .58 ? smoother((s - .42) / .16) : 1, expo: flash, cams: adapt(Bs, gt, sh2, fB, K) });
      return out;
    }
    if (tr === "whip" && Math.abs(gt - b) < d / 2) {
      const s = (gt - (b - d / 2)) / d, W = .26 * (j % 2 ? -1 : 1), K = KMAX, sh2 = 1 / fps;
      if (s < .5) return [{ shot: A, alpha: 1, expo: 0, cams: adapt(A, gt, sh2, (c, g) => { const q = clamp(((g - (b - d / 2)) / d) / .5, 0, 1.4); c.yaw += W * Math.pow(q, 2.5) }, K) }];
      return [{ shot: Bs, alpha: 1, expo: 0, cams: adapt(Bs, gt, sh2, (c, g) => { const q = clamp((1 - (g - (b - d / 2)) / d) / .5, 0, 1.4); c.yaw -= W * Math.pow(q, 2.5) }, K) }];
    }
    if (tr === "flash" && Math.abs(gt - b) < .25) {
      const e = .85 * Math.exp(-Math.abs(gt - b) / .07);
      return [base(gt < b ? A : Bs, 1, e)];
    }
  }
  return [base(shots[i])];
}

/* ---------- Rendu WebGL ---------- */

const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uImg;uniform sampler2D uDep;
uniform vec2 uRes;uniform float uAsp;uniform float uF;uniform int uK;
uniform vec4 uA[${KMAX}];uniform vec4 uB[${KMAX}];uniform vec4 uC[${KMAX}];
uniform float uAlpha;uniform float uExpo;uniform float uVig;uniform float uGrain;uniform float uFade;uniform float uTime;
vec2 toUV(vec2 X){return vec2(X.x/uAsp+.5,X.y+.5);}
float nearAt(vec2 uv){return max(texture2D(uDep,clamp(uv,0.,1.)).r,.03);}
mat3 rotM(vec3 a){float cy=cos(a.x),sy=sin(a.x),cp=cos(a.y),sp=sin(a.y),cr=cos(a.z),sr=sin(a.z);
mat3 Ry=mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy);mat3 Rx=mat3(1.,0.,0.,0.,cp,sp,0.,-sp,cp);mat3 Rz=mat3(cr,sr,0.,-sr,cr,0.,0.,0.,1.);return Rz*Rx*Ry;}
void main(){
vec2 o=vec2(gl_FragCoord.x/uRes.x,1.-gl_FragCoord.y/uRes.y);float aOut=uRes.x/uRes.y;vec3 acc=vec3(0.);vec2 X=vec2(0.);vec2 Xp=vec2(0.);float n=0.;
for(int k=0;k<${KMAX};k++){if(k>=uK)break;
vec4 A=uA[k];vec4 B=uB[k];vec4 C=uC[k];mat3 R=rotM(A.xyz);
vec2 xt=C.xy+vec2((o.x-.5)*2.*A.w*aOut,(o.y-.5)*2.*A.w);if(k==0)X=xt;
for(int i=0;i<5;i++){if(k>0&&i>=2)break;float Z=1./nearAt(toUV(X));vec3 P=vec3(X*Z/uF,Z)-B.xyz;vec3 Pc=R*P;float cz=max(Pc.z,.05);X+=(xt-uF*Pc.xy/cz)*(cz/Z);}
if(k>0){acc+=texture2D(uImg,clamp(toUV(mix(Xp,X,.25)),0.,1.)).rgb+texture2D(uImg,clamp(toUV(mix(Xp,X,.5)),0.,1.)).rgb+texture2D(uImg,clamp(toUV(mix(Xp,X,.75)),0.,1.)).rgb;n+=3.;}
acc+=texture2D(uImg,clamp(toUV(X),0.,1.)).rgb;n+=1.;Xp=X;}
vec3 c=acc/n;
c+=uExpo*(1.-c)*.8;
vec2 d=(o-.5)*vec2(aOut,1.);c*=1.-uVig*smoothstep(.28,.9,length(d)*1.35);
float gr=fract(sin(dot(gl_FragCoord.xy+vec2(uTime*61.7,uTime*17.3),vec2(12.9898,78.233)))*43758.5453)-.5;
c+=gr*uGrain;c*=1.-uFade;
gl_FragColor=vec4(c,uAlpha);}`;

export function createGL(W, H) {
  const cv = typeof document !== "undefined" ? Object.assign(document.createElement("canvas"), { width: W, height: H }) : new OffscreenCanvas(W, H);
  const opts = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: "high-performance" };
  let gl = cv.getContext("webgl2", opts); const v2 = !!gl;
  if (!gl) gl = cv.getContext("webgl", opts);
  if (!gl) return null;
  if (gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) < 3 * KMAX + 12) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader"); return s };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr) || "programme");
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["uImg", "uDep", "uRes", "uAsp", "uF", "uK", "uA", "uB", "uC", "uAlpha", "uExpo", "uVig", "uGrain", "uFade", "uTime"].forEach(n => U[n] = gl.getUniformLocation(pr, n));
  gl.uniform1i(U.uImg, 0); gl.uniform1i(U.uDep, 1); gl.uniform2f(U.uRes, W, H); gl.uniform1f(U.uF, FOCAL);
  const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const fA = new Float32Array(4 * KMAX), fB = new Float32Array(4 * KMAX), fC = new Float32Array(4 * KMAX);

  function upload(img, info) {
    let src = img;
    if (Math.max(img.width, img.height) > maxTex) {
      const k = maxTex / Math.max(img.width, img.height), c = Object.assign(document.createElement("canvas"), { width: Math.floor(img.width * k), height: Math.floor(img.height * k) });
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); src = c;
    }
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
    if (v2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR) }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const d = gl.createTexture(); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, d);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, info.gw, info.gh, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, info.disp);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return { t, d, asp: img.width / img.height };
  }
  function release(h) { if (h) { gl.deleteTexture(h.t); gl.deleteTexture(h.d) } }
  function draw(passes, post) {
    gl.viewport(0, 0, W, H);
    gl.uniform1f(U.uVig, post.vig || 0); gl.uniform1f(U.uGrain, post.grain || 0); gl.uniform1f(U.uFade, post.fade || 0); gl.uniform1f(U.uTime, post.time || 0);
    passes.forEach((ps, j) => {
      if (j === 0) gl.disable(gl.BLEND); else { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA) }
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, ps.tex.t);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, ps.tex.d);
      const K = Math.min(KMAX, ps.cams.length);
      ps.cams.slice(0, K).forEach((c, k) => {
        fA.set([c.yaw, c.pitch, c.roll, c.hh], 4 * k); fB.set([c.tx, c.ty, c.tz, 0], 4 * k); fC.set([c.cx, c.cy, 0, 0], 4 * k);
      });
      gl.uniform1i(U.uK, K); gl.uniform4fv(U.uA, fA); gl.uniform4fv(U.uB, fB); gl.uniform4fv(U.uC, fC);
      gl.uniform1f(U.uAsp, ps.tex.asp); gl.uniform1f(U.uAlpha, ps.alpha); gl.uniform1f(U.uExpo, ps.expo || 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
    gl.disable(gl.BLEND);
  }
  return { canvas: cv, upload, release, draw, lost: () => gl.isContextLost(), destroy: () => { const e = gl.getExtension("WEBGL_lose_context"); if (e) e.loseContext() } };
}
