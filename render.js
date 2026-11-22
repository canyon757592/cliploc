/* Cliploc : montage vidéo dans le navigateur du client (WebCodecs + MP4).
   Aucun serveur de montage : le calcul se fait sur l'appareil, donc 0 € de coût par vidéo.
   Usage : const blob = await renderVideo({ photos:[Blob|File|string], captions:[], seconds:30, quality:"fhd", fmt:"v", onProgress }); */
import { Muxer, ArrayBufferTarget } from "./vendor/mp4-muxer.mjs";
import { analyze, createGL, planCine, frameCams } from "./cine.js";

const FPS = 30;
const QUALITIES = {
  hd:  { short: 720,  bitrate: 4e6 },
  fhd: { short: 1080, bitrate: 8e6 },
  "4k":{ short: 2160, bitrate: 28e6 }
};
const ratio = { v: [9, 16], s: [1, 1], h: [16, 9] };

export function dims(quality, fmt) {
  const q = QUALITIES[quality] || QUALITIES.fhd, [a, b] = ratio[fmt] || ratio.v;
  const k = q.short / Math.min(a, b);
  const even = n => Math.round(n / 2) * 2;
  return { w: even(a * k), h: even(b * k), bitrate: q.bitrate };
}

/* Vérifie que l'appareil sait encoder en H.264 à cette taille. Renvoie { ok, codec, reason } */
export async function canRender(quality = "fhd", fmt = "v") {
  if (typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined") {
    return { ok: false, reason: "Ce navigateur ne peut pas créer de vidéo. Utilise Chrome, Edge ou Safari à jour." };
  }
  const { w, h, bitrate } = dims(quality, fmt);
  const codecs = w * h > 2.1e6 ? ["avc1.640033", "avc1.640034"] : ["avc1.640028", "avc1.4d0028", "avc1.42001f"];
  for (const codec of codecs) {
    try {
      const s = await VideoEncoder.isConfigSupported({ codec, width: w, height: h, bitrate, framerate: FPS });
      if (s.supported) return { ok: true, codec, w, h, bitrate };
    } catch (_) { /* on essaie le suivant */ }
  }
  return { ok: false, reason: quality === "4k" ? "Ton appareil ne gère pas la 4K. Choisis Full HD." : "Ton appareil ne sait pas créer de MP4." };
}

/* ---------- Styles de mouvement et de couleur ---------- */
export const MOTIONS = {
  dynamic: { label: "Dynamique", shot: [1.6, 3.0], ease: 1, trans: ["fade", "slideH", "zoom", "slideV"], vig: 0,
    moves: [
      { z0: 1.00, z1: 1.16, x0: -.3, x1: .3, y0: 0, y1: 0 }, { z0: 1.16, z1: 1.00, x0: .3, x1: -.2, y0: -.4, y1: .2 },
      { z0: 1.10, z1: 1.10, x0: -1, x1: 1, y0: 0, y1: 0 }, { z0: 1.12, z1: 1.12, x0: 1, x1: -1, y0: .2, y1: -.2 },
      { z0: 1.00, z1: 1.20, x0: 0, x1: 0, y0: .8, y1: -.4 }, { z0: 1.18, z1: 1.02, x0: -.5, x1: .5, y0: -.8, y1: .6 }] },
  drone: { label: "Drone", shot: [2.6, 5.0], ease: .35, trans: ["through", "fade", "through", "zoom"], vig: .18,
    moves: [
      { z0: 1.00, z1: 1.30, x0: 0, x1: 0, y0: .9, y1: -.5, r0: 0, r1: 0 },            // avancée avec montée
      { z0: 1.32, z1: 1.00, x0: 0, x1: 0, y0: -.7, y1: .6, r0: 0, r1: 0 },            // recul qui révèle la scène
      { z0: 1.16, z1: 1.16, x0: -1, x1: 1, y0: .15, y1: -.15, r0: -1.2, r1: 1.2 },    // survol latéral incliné
      { z0: 1.10, z1: 1.26, x0: .8, x1: -.8, y0: .3, y1: -.3, r0: 1.4, r1: -1.4 },    // orbite lente
      { z0: 1.00, z1: 1.24, x0: -.3, x1: .3, y0: 1, y1: -.8, r0: 0, r1: .6 }] },
  cinema: { label: "Cinéma", shot: [3.2, 5.2], ease: 1, trans: ["fade"], vig: .34,
    moves: [
      { z0: 1.00, z1: 1.08, x0: -.2, x1: .2, y0: 0, y1: 0 }, { z0: 1.09, z1: 1.00, x0: .2, x1: -.2, y0: .1, y1: -.1 },
      { z0: 1.04, z1: 1.04, x0: -.6, x1: .6, y0: 0, y1: 0 }] },
  tour: { label: "Visite", shot: [2.6, 4.0], ease: .7, trans: ["fade", "slideH"], vig: 0,
    moves: [
      { z0: 1.08, z1: 1.08, x0: -1, x1: 1, y0: 0, y1: 0 }, { z0: 1.08, z1: 1.08, x0: 1, x1: -1, y0: 0, y1: 0 },
      { z0: 1.00, z1: 1.10, x0: 0, x1: 0, y0: .4, y1: -.4 }] }
};
export const GRADES = {
  natural: { label: "Naturel", con: 1.03, sat: 1.05, br: 0, r: 0, g: 0, b: 0 },
  warm:    { label: "Chaleureux", con: 1.05, sat: 1.12, br: .01, r: .035, g: .008, b: -.05 },
  fresh:   { label: "Frais", con: 1.04, sat: 1.08, br: .02, r: -.03, g: .008, b: .04 },
  cinema:  { label: "Cinéma", con: 1.16, sat: .95, br: -.01, r: .03, g: -.005, b: -.03, teal: true },
  vivid:   { label: "Vif", con: 1.10, sat: 1.38, br: .01, r: .008, g: 0, b: 0 },
  mono:    { label: "Noir et blanc", con: 1.12, sat: 0, br: 0, r: 0, g: 0, b: 0 }
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Étalonnage appliqué UNE fois par photo (fonctionne sur tous les navigateurs, y compris Safari). */
function gradeCanvas(src, W, H, g, sharpen = 0) {
  const c = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(W, H) : Object.assign(document.createElement("canvas"), { width: W, height: H });
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(src, 0, 0, W, H);
  const id = x.getImageData(0, 0, W, H), d = id.data;
  const lut = ch => { const o = new Uint8ClampedArray(256), off = (ch === 0 ? g.r : ch === 1 ? g.g : g.b) + g.br;
    for (let i = 0; i < 256; i++) { let v = i / 255; v = (v - .5) * g.con + .5 + off; o[i] = clamp(v, 0, 1) * 255 } return o };
  const LR = lut(0), LG = lut(1), LB = lut(2), sat = g.sat;
  for (let i = 0; i < d.length; i += 4) {
    let r = LR[d[i]], gg = LG[d[i + 1]], b = LB[d[i + 2]];
    const l = .299 * r + .587 * gg + .114 * b;
    if (g.teal) { const sh = 1 - l / 255; b += sh * 14; r -= sh * 6 }          // ombres un peu bleutées
    r = l + (r - l) * sat; gg = l + (gg - l) * sat; b = l + (b - l) * sat;
    d[i] = r; d[i + 1] = gg; d[i + 2] = b;
  }
  if (sharpen > 0) {
    const N = W * H, Y = new Float32Array(N), T = new Float32Array(N);
    for (let i = 0; i < N; i++) Y[i] = .299 * d[4 * i] + .587 * d[4 * i + 1] + .114 * d[4 * i + 2];
    const pass = (a, o, horiz) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x;
      o[i] = horiz ? (a[x > 0 ? i - 1 : i] + a[i] + a[x < W - 1 ? i + 1 : i]) / 3 : (a[y > 0 ? i - W : i] + a[i] + a[y < H - 1 ? i + W : i]) / 3 } };
    pass(Y, T, true); const U = new Float32Array(N); pass(T, U, false);
    for (let i = 0; i < N; i++) { const k = sharpen * (Y[i] - U[i]); d[4 * i] += k; d[4 * i + 1] += k; d[4 * i + 2] += k }
  }
  x.putImageData(id, 0, 0);
  return c;
}

async function toBitmap(src, maxSide, grade, sharpen = 0) {
  let blob = src;
  if (typeof src === "string") { const r = await fetch(src, { mode: "cors" }); if (!r.ok) throw new Error("Photo introuvable"); blob = await r.blob() }
  const probe = await createImageBitmap(blob);
  const big = Math.max(probe.width, probe.height);
  let bmp = probe;
  if (big > maxSide) {
    const k = maxSide / big;
    bmp = await createImageBitmap(probe, { resizeWidth: Math.round(probe.width * k), resizeHeight: Math.round(probe.height * k), resizeQuality: "high" });
    probe.close();
  }
  if (grade) {
    const out = gradeCanvas(bmp, bmp.width, bmp.height, grade, sharpen);
    bmp.close();
    return out;
  }
  return bmp;
}

const nextTick = () => new Promise(r => setTimeout(r, 0));
const easeIO = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function drawShot(ctx, img, W, H, p, m, ox = 0, oy = 0, extra = 1) {
  const e0 = clamp(p, 0, 1);
  const e = m.k * easeIO(e0) + (1 - m.k) * e0;
  const mv = m.mv, rot = ((mv.r0 || 0) + ((mv.r1 || 0) - (mv.r0 || 0)) * e) * Math.PI / 180;
  const rotExtra = 1 + Math.abs(rot) * (W / H + H / W) + (rot ? .01 : 0);
  const z = (mv.z0 + (mv.z1 - mv.z0) * e) * extra * rotExtra;
  const s = Math.max(W / img.width, H / img.height) * z;
  const dw = img.width * s, dh = img.height * s;
  const px = mv.x0 + (mv.x1 - mv.x0) * e, py = mv.y0 + (mv.y1 - mv.y0) * e;
  const x = (W - dw) / 2 + px * (dw - W) / 2 * .8 + ox, y = (H - dh) / 2 + py * (dh - H) / 2 * .8 + oy;
  if (rot) { ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(rot); ctx.translate(-W / 2, -H / 2); ctx.drawImage(img, x, y, dw, dh); ctx.restore() }
  else ctx.drawImage(img, x, y, dw, dh);
}

/* Animation IA : un plan de 5 s par tranche de 5 s, chacun tiré d'une photo (réparties sur toute la liste). */
export function aiPlan(photoCount, seconds) {
  const c = Math.ceil(seconds / 5);
  return Array.from({ length: c }, (_, i) => Math.min(photoCount - 1, Math.floor(i * photoCount / c)));
}
function drawVid(ctx, v, W, H, ox = 0, oy = 0, extra = 1) {
  const s = Math.max(W / v.videoWidth, H / v.videoHeight) * extra, dw = v.videoWidth * s, dh = v.videoHeight * s;
  ctx.drawImage(v, (W - dw) / 2 + ox, (H - dh) / 2 + oy, dw, dh);
}
const drawAny = (ctx, sh, W, H, p, ox = 0, oy = 0, extra = 1) => sh.vid ? drawVid(ctx, sh.vid, W, H, ox, oy, extra) : drawShot(ctx, sh.img, W, H, p, sh, ox, oy, extra);
function seekTo(v, t) {
  return new Promise(res => {
    let done = false; const end = () => { if (!done) { done = true; v.removeEventListener("seeked", end); clearTimeout(to); res() } };
    const to = setTimeout(end, 4000); v.addEventListener("seeked", end); v.currentTime = t;
  });
}
const prep = async (sh, p) => { if (sh.vid) { const t = clamp(p, 0, 1) * Math.max(0, (sh.vid.duration || 5) - 0.08); if (Math.abs(sh.vid.currentTime - t) > 1e-3) await seekTo(sh.vid, t) } };
async function loadClip(blob) {
  const v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = URL.createObjectURL(blob);
  await new Promise((res, rej) => { const to = setTimeout(() => rej(new Error("Plan IA illisible")), 10000); v.onloadeddata = () => { clearTimeout(to); res() }; v.onerror = () => { clearTimeout(to); rej(new Error("Plan IA illisible")) } });
  if (!v.videoWidth || !v.videoHeight) throw new Error("Plan IA illisible");
  await seekTo(v, 0);
  return v;
}

/* Combien de plans pour une durée donnée. */
export function planShots(photoCount, seconds, motion = "dynamic") {
  const M = MOTIONS[motion] || MOTIONS.dynamic;
  const shot = clamp(seconds / photoCount, M.shot[0], M.shot[1]);
  const count = Math.max(2, Math.round(seconds / shot));
  return { count, per: seconds / count };
}

/* Montage : caméra en relief (WebGL) quand l'appareil le permet, sinon montage classique.
   Si la carte graphique décroche en cours de route, on recommence avec le montage classique. */
export async function renderVideo(opts) {
  try { return await renderCore(opts) }
  catch (e) { if (e && e.cineLost) return await renderCore({ ...opts, engine: "2d" }); throw e }
}

async function renderCore({ photos, seconds = 30, quality = "fhd", fmt = "v", motion = "dynamic", grade = "natural", onProgress = () => {}, signal, clips = null, engine = "auto" }) {
  if (!photos || photos.length < 2) throw new Error("Il faut au moins 2 photos.");
  const cap = await canRender(quality, fmt);
  if (!cap.ok) throw new Error(cap.reason);
  const { w: W, h: H, bitrate, codec } = cap;
  const M = MOTIONS[motion] || MOTIONS.dynamic, G = GRADES[grade] || GRADES.natural;

  const useClips = Array.isArray(clips) && clips.some(c => c);
  let count, per, order;
  if (useClips) { order = aiPlan(photos.length, seconds); count = order.length; per = seconds / count }
  else { ({ count, per } = planShots(photos.length, seconds, motion)); order = Array.from({ length: count }, (_, i) => i % photos.length) }
  const vids = [];
  const cleanVids = () => vids.forEach(v => { try { URL.revokeObjectURL(v.src); v.removeAttribute("src"); v.load() } catch (_) {} });
  const needPhoto = [...new Set(order.filter((_, i) => !(useClips && clips[i])))];
  const maxSide = Math.min(Math.max(W, H) * 1.3, needPhoto.length > 12 ? 2800 : 3400);   // limite la mémoire sur téléphone
  let cine = null;
  if (!useClips && engine !== "2d") { try { cine = createGL(W, H) } catch (_) { cine = null } }
  const cache = new Map();
  for (let i = 0; i < needPhoto.length; i++) {
    cache.set(needPhoto[i], await toBitmap(photos[needPhoto[i]], maxSide, G, cine ? .45 : 0));
    onProgress(0.12 * (i + 1) / Math.max(1, needPhoto.length), "Préparation des photos");
    if (signal && signal.aborted) throw new Error("Annulé");
  }
  const shots = [];
  try {
    for (let i = 0; i < order.length; i++) {
      const base = { mv: M.moves[i % M.moves.length], k: M.ease, tr: useClips ? (M.trans.includes("through") ? "fade" : M.trans[i % M.trans.length]) : M.trans[i % M.trans.length] };
      if (useClips && clips[i]) { const v = await loadClip(clips[i]); vids.push(v); shots.push({ ...base, vid: v, tr: "fade" }) }
      else shots.push({ ...base, img: cache.get(order[i]) });
    }
  } catch (e) { cleanVids(); throw e }

  let plan = null; const infos = new Map(), texOf = new Map(), lastUse = new Map();
  if (cine) {
    try {
      for (const idx of needPhoto) infos.set(idx, analyze(cache.get(idx)));
      plan = planCine({ infos: order.map(p => infos.get(p)), asps: order.map(p => cache.get(p).width / cache.get(p).height), per, count, seconds, motion, outAsp: W / H, outH: H });
      order.forEach((p, k) => lastUse.set(p, k));
    } catch (_) { cine.destroy(); cine = null; plan = null }
  }
  const texture = p => { if (!texOf.has(p)) texOf.set(p, cine.upload(cache.get(p), infos.get(p))); return texOf.get(p) };
  const canvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(W, H) : Object.assign(document.createElement("canvas"), { width: W, height: H });
  const ctx = canvas.getContext("2d", { alpha: false });
  let vig = null;
  if (M.vig) { vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .78); vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, `rgba(0,0,0,${M.vig})`) }

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: "avc", width: W, height: H }, fastStart: "in-memory" });
  let encError = null;
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: e => { encError = e; } });
  enc.configure({ codec, width: W, height: H, bitrate, framerate: FPS, latencyMode: "quality" });

  const xf = Math.min(motion === "dynamic" ? 0.35 : 0.6, per * 0.25);
  const pOf = (k, t) => clamp((t - (k * per - xf)) / (per + xf), 0, 1);
  const total = Math.round(seconds * FPS);
  try {
  for (let f = 0; f < total; f++) {
    if (signal && signal.aborted) { enc.close(); throw new Error("Annulé"); }
    if (encError) throw encError;
    const t = f / FPS, i = Math.min(count - 1, Math.floor(t / per)), local = t - i * per;
    const fadeG = Math.min(1, Math.max(t < 0.35 ? 1 - t / 0.35 : 0, t > seconds - 0.6 ? (t - (seconds - 0.6)) / 0.6 : 0));
    if (cine) {
      const passes = frameCams(plan, t, FPS).map(ps => ({ ...ps, tex: texture(order[ps.shot.p]) }));
      cine.draw(passes, { vig: plan.st.vig, grain: plan.st.grain, fade: fadeG, time: t });
      if (cine.lost()) throw Object.assign(new Error("La carte graphique a été interrompue"), { cineLost: true });
      ctx.drawImage(cine.canvas, 0, 0, W, H);
      for (const [p, h] of texOf) if (lastUse.get(p) < i - 1) { cine.release(h); texOf.delete(p) }
    } else {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    const A = shots[i], inT = i < count - 1 && local > per - xf, pa = pOf(i, t);
    if (!inT) { await prep(A, pa); drawAny(ctx, A, W, H, pa) }
    else {
      const B = shots[i + 1], u = easeIO((local - (per - xf)) / xf), pb = pOf(i + 1, t);
      await prep(A, pa); await prep(B, pb);
      switch (A.tr) {
        case "slideH": drawAny(ctx, A, W, H, pa, -u * W, 0); drawAny(ctx, B, W, H, pb, (1 - u) * W, 0); break;
        case "slideV": drawAny(ctx, A, W, H, pa, 0, -u * H); drawAny(ctx, B, W, H, pb, 0, (1 - u) * H); break;
        case "zoom": drawAny(ctx, A, W, H, pa); ctx.globalAlpha = u; drawAny(ctx, B, W, H, pb, 0, 0, 1 + (1 - u) * .25); ctx.globalAlpha = 1; break;
        case "through": drawAny(ctx, B, W, H, pb, 0, 0, 1.12 - .12 * u); ctx.globalAlpha = 1 - u; drawAny(ctx, A, W, H, pa, 0, 0, 1 + .32 * u); ctx.globalAlpha = 1; break;
        default: drawAny(ctx, A, W, H, pa); ctx.globalAlpha = u; drawAny(ctx, B, W, H, pb); ctx.globalAlpha = 1;
      }
    }
    if (vig) { ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H) }
    const fade = Math.max(t < 0.3 ? 1 - t / 0.3 : 0, t > seconds - 0.5 ? (t - (seconds - 0.5)) / 0.5 : 0);
    if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, fade)})`; ctx.fillRect(0, 0, W, H) }
    }
    const frame = new VideoFrame(canvas, { timestamp: Math.round(f * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
    enc.encode(frame, { keyFrame: f % (FPS * 2) === 0 });
    frame.close();
    while (enc.encodeQueueSize > 6) await nextTick();
    if (f % 6 === 0) { onProgress(0.12 + 0.86 * f / total, "Montage de la vidéo"); await nextTick(); }
  }
  await enc.flush(); enc.close();
  if (encError) throw encError;
  muxer.finalize();
  } finally { cleanVids(); cache.forEach(b => b.close && b.close()); if (cine) { texOf.forEach(h => cine.release(h)); cine.destroy() } }
  onProgress(1, "Terminé");
  return new Blob([target.buffer], { type: "video/mp4" });
}
