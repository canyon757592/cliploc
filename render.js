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

/* dessine une photo en « cover » avec un léger zoom/déplacement (effet Ken Burns) */
function drawPhoto(ctx, img, W, H, p, idx) {
  const zoomIn = idx % 2 === 0;
  const z = 1.04 + 0.1 * (zoomIn ? p : 1 - p);
  const s = Math.max(W / img.width, H / img.height) * z;
  const dw = img.width * s, dh = img.height * s;
  const dir = idx % 4 < 2 ? 1 : -1;
  const ox = (W - dw) / 2 + dir * (dw - W) * 0.5 * (p - 0.5) * 0.8;
  const oy = (H - dh) / 2;
  ctx.drawImage(img, ox, oy, dw, dh);
}

function drawCaption(ctx, text, W, H, a, fontFamily) {
  if (!text || a <= 0) return;
  const size = Math.round(Math.min(W, H) * 0.055);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `700 ${size}px ${fontFamily}`;
  const tw = ctx.measureText(text).width, padX = size * 0.9, ph = size * 1.9;
  const bw = Math.min(tw + padX * 2, W * 0.9), x = (W - bw) / 2, y = H * 0.84 - ph / 2 + (1 - a) * size * 0.6;
  ctx.fillStyle = "rgba(10,8,14,.55)";
  const r = ph / 2;
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + bw, y, x + bw, y + ph, r); ctx.arcTo(x + bw, y + ph, x, y + ph, r); ctx.arcTo(x, y + ph, x, y, r); ctx.arcTo(x, y, x + bw, y, r); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, y + ph / 2 + size * 0.04, bw - padX);
  ctx.restore();
}

export async function renderVideo({ photos, captions = [], seconds = 30, quality = "fhd", fmt = "v", onProgress = () => {}, signal }) {
  if (!photos || photos.length < 2) throw new Error("Il faut au moins 2 photos.");
  const cap = await canRender(quality, fmt);
  if (!cap.ok) throw new Error(cap.reason);
  const { w: W, h: H, bitrate, codec } = cap;

  // nombre de photos montrées : environ 2,2 s chacune au minimum
  const count = Math.max(2, Math.min(photos.length, Math.round(seconds / 2.2)));
  const pick = Array.from({ length: count }, (_, i) => Math.round(i * (photos.length - 1) / Math.max(1, count - 1)));
  const maxSide = Math.max(W, H) * 1.25;
  const imgs = [];
  for (let i = 0; i < pick.length; i++) {
    imgs.push(await toBitmap(photos[pick[i]], maxSide));
    onProgress(0.1 * (i + 1) / pick.length, "Préparation des photos");
    if (signal && signal.aborted) throw new Error("Annulé");
  }
  const caps = pick.map(i => captions[i] || "");

  const canvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(W, H) : Object.assign(document.createElement("canvas"), { width: W, height: H });
  const ctx = canvas.getContext("2d", { alpha: false });
  const family = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: "avc", width: W, height: H }, fastStart: "in-memory" });
  let encError = null;
  const enc = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: e => { encError = e; }
  });
  enc.configure({ codec, width: W, height: H, bitrate, framerate: FPS, latencyMode: "quality" });

  const total = Math.round(seconds * FPS), per = seconds / count, xf = Math.min(0.7, per * 0.3);
  for (let f = 0; f < total; f++) {
    if (signal && signal.aborted) { enc.close(); throw new Error("Annulé"); }
    if (encError) throw encError;
    const t = f / FPS;
    const i = Math.min(count - 1, Math.floor(t / per));
    const local = t - i * per;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    drawPhoto(ctx, imgs[i], W, H, ease(Math.min(1, local / per)), i);
    if (i < count - 1 && local > per - xf) {
      ctx.globalAlpha = ease((local - (per - xf)) / xf);
      drawPhoto(ctx, imgs[i + 1], W, H, 0, i + 1);
      ctx.globalAlpha = 1;
    }
    // dégradé bas pour la lisibilité du texte
    const g = ctx.createLinearGradient(0, H * 0.6, 0, H);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.38)");
    ctx.fillStyle = g; ctx.fillRect(0, H * 0.6, W, H * 0.4);
    // texte : apparaît 0,4 s après le début de chaque photo
    const ct = local - 0.4, dur = Math.min(per - 0.9, 2.4);
    const a = ct < 0 ? 0 : ct < 0.3 ? ct / 0.3 : ct > dur - 0.3 ? Math.max(0, (dur - ct) / 0.3) : 1;
    drawCaption(ctx, caps[i], W, H, a, family);
    // fondu d'ouverture et de fermeture
    const fade = Math.max(t < 0.3 ? 1 - t / 0.3 : 0, t > seconds - 0.4 ? (t - (seconds - 0.4)) / 0.4 : 0);
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
  imgs.forEach(b => b.close && b.close());
  onProgress(1, "Terminé");
  return new Blob([target.buffer], { type: "video/mp4" });
}
