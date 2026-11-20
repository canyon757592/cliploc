/* Cliploc : montage vidéo dans le navigateur du client (WebCodecs + MP4).
   Aucun serveur de montage : le calcul se fait sur l'appareil, donc 0 € de coût par vidéo.
   Usage : const blob = await renderVideo({ photos:[Blob|File|string], captions:[], seconds:30, quality:"fhd", fmt:"v", onProgress }); */
import { Muxer, ArrayBufferTarget } from "./vendor/mp4-muxer.mjs";

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

const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const nextTick = () => new Promise(r => setTimeout(r, 0));

async function toBitmap(src, maxSide) {
  let blob = src;
  if (typeof src === "string") {
    const r = await fetch(src, { mode: "cors" });
    if (!r.ok) throw new Error("Photo introuvable");
    blob = await r.blob();
  }
  const probe = await createImageBitmap(blob);
  const big = Math.max(probe.width, probe.height);
  if (big <= maxSide) return probe;
  const k = maxSide / big;
  const small = await createImageBitmap(probe, { resizeWidth: Math.round(probe.width * k), resizeHeight: Math.round(probe.height * k), resizeQuality: "high" });
  probe.close();
  return small;
}

/* Mouvements de caméra : chaque plan zoome / glisse un peu, toujours en plein cadre (jamais de bordure). */
const MOVES = [
  { z0: 1.00, z1: 1.16, x0: -.3, x1: .3, y0: 0, y1: 0 },
  { z0: 1.16, z1: 1.00, x0: .3, x1: -.2, y0: -.4, y1: .2 },
  { z0: 1.10, z1: 1.10, x0: -1, x1: 1, y0: 0, y1: 0 },
  { z0: 1.12, z1: 1.12, x0: 1, x1: -1, y0: .2, y1: -.2 },
  { z0: 1.00, z1: 1.20, x0: 0, x1: 0, y0: .8, y1: -.4 },
  { z0: 1.18, z1: 1.02, x0: -.5, x1: .5, y0: -.8, y1: .6 }
];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function drawShot(ctx, img, W, H, p, idx, ox = 0, oy = 0, extra = 1) {
  const m = MOVES[idx % MOVES.length], e = ease(clamp(p, 0, 1));
  const z = (m.z0 + (m.z1 - m.z0) * e) * extra;
  const s = Math.max(W / img.width, H / img.height) * z;
  const dw = img.width * s, dh = img.height * s;
  const px = m.x0 + (m.x1 - m.x0) * e, py = m.y0 + (m.y1 - m.y0) * e;
  const x = (W - dw) / 2 + px * (dw - W) / 2 + ox;
  const y = (H - dh) / 2 + py * (dh - H) / 2 + oy;
  ctx.drawImage(img, x, y, dw, dh);
}

/* Combien de plans pour une durée donnée : des plans courts, comme dans un reel. */
export function planShots(photoCount, seconds) {
  const shot = clamp(seconds / photoCount, 1.6, 3.0);
  const count = Math.max(2, Math.round(seconds / shot));
  return { count, per: seconds / count };
}

export async function renderVideo({ photos, seconds = 30, quality = "fhd", fmt = "v", onProgress = () => {}, signal }) {
  if (!photos || photos.length < 2) throw new Error("Il faut au moins 2 photos.");
  const cap = await canRender(quality, fmt);
  if (!cap.ok) throw new Error(cap.reason);
  const { w: W, h: H, bitrate, codec } = cap;

  const { count, per } = planShots(photos.length, seconds);
  const order = Array.from({ length: count }, (_, i) => i % photos.length);   // on enchaîne les photos dans l'ordre, puis on reprend
  const maxSide = Math.max(W, H) * 1.35;
  const cache = new Map();
  for (let i = 0; i < photos.length; i++) {
    if (!order.includes(i)) continue;
    cache.set(i, await toBitmap(photos[i], maxSide));
    onProgress(0.1 * (cache.size) / new Set(order).size, "Préparation des photos");
    if (signal && signal.aborted) throw new Error("Annulé");
  }
  const imgs = order.map(i => cache.get(i));

  const canvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(W, H) : Object.assign(document.createElement("canvas"), { width: W, height: H });
  const ctx = canvas.getContext("2d", { alpha: false });

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: "avc", width: W, height: H }, fastStart: "in-memory" });
  let encError = null;
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: e => { encError = e; } });
  enc.configure({ codec, width: W, height: H, bitrate, framerate: FPS, latencyMode: "quality" });

  const xf = Math.min(0.35, per * 0.25);               // durée des transitions
  const pOf = (k, t) => clamp((t - (k * per - xf)) / (per + xf), 0, 1);   // avancement du mouvement du plan k
  const total = Math.round(seconds * FPS);
  for (let f = 0; f < total; f++) {
    if (signal && signal.aborted) { enc.close(); throw new Error("Annulé"); }
    if (encError) throw encError;
    const t = f / FPS;
    const i = Math.min(count - 1, Math.floor(t / per));
    const local = t - i * per;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    const inT = i < count - 1 && local > per - xf;
    if (!inT) {
      drawShot(ctx, imgs[i], W, H, pOf(i, t), i);
    } else {
      const u = ease((local - (per - xf)) / xf), kind = i % 4;
      if (kind === 0) {                                  // fondu enchaîné
        drawShot(ctx, imgs[i], W, H, pOf(i, t), i);
        ctx.globalAlpha = u; drawShot(ctx, imgs[i + 1], W, H, pOf(i + 1, t), i + 1); ctx.globalAlpha = 1;
      } else if (kind === 1) {                           // glissement horizontal
        drawShot(ctx, imgs[i], W, H, pOf(i, t), i, -u * W, 0);
        drawShot(ctx, imgs[i + 1], W, H, pOf(i + 1, t), i + 1, (1 - u) * W, 0);
      } else if (kind === 2) {                           // zoom : la photo suivante arrive de près
        drawShot(ctx, imgs[i], W, H, pOf(i, t), i);
        ctx.globalAlpha = u; drawShot(ctx, imgs[i + 1], W, H, pOf(i + 1, t), i + 1, 0, 0, 1 + (1 - u) * 0.25); ctx.globalAlpha = 1;
      } else {                                           // glissement vertical
        drawShot(ctx, imgs[i], W, H, pOf(i, t), i, 0, -u * H);
        drawShot(ctx, imgs[i + 1], W, H, pOf(i + 1, t), i + 1, 0, (1 - u) * H);
      }
    }
    // ouverture et fermeture en fondu rapide
    const fade = Math.max(t < 0.25 ? 1 - t / 0.25 : 0, t > seconds - 0.4 ? (t - (seconds - 0.4)) / 0.4 : 0);
    if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, fade)})`; ctx.fillRect(0, 0, W, H); }

    const frame = new VideoFrame(canvas, { timestamp: Math.round(f * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
    enc.encode(frame, { keyFrame: f % (FPS * 2) === 0 });
    frame.close();
    while (enc.encodeQueueSize > 6) await nextTick();
    if (f % 6 === 0) { onProgress(0.1 + 0.88 * f / total, "Montage de la vidéo"); await nextTick(); }
  }
  await enc.flush();
  enc.close();
  if (encError) throw encError;
  muxer.finalize();
  cache.forEach(b => b.close && b.close());
  onProgress(1, "Terminé");
  return new Blob([target.buffer], { type: "video/mp4" });
}
