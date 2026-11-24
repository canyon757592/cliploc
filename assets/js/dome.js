/* Dôme céleste : le ciel entier au-dessus d'un lieu, nord en haut, est à gauche (comme quand on lève la tête). */
import { starsENU, bodies, domeXY, starRadius } from "./sky.js";

export const THEMES = {
  encre: { nom: "Encre", papier: "#10234a", disque: "#0a1834", trait: "rgba(200,164,93,.55)", libelle: "#c8a45d", texte: "#f4efe2", texte2: "#a9b5cc", anneau: "#c8a45d", etoileCouleur: true },
  givre: { nom: "Givre", papier: "#e9eef4", disque: "#10234a", trait: "rgba(200,164,93,.6)", libelle: "#c8a45d", texte: "#10234a", texte2: "#4a5a78", anneau: "#10234a", etoileCouleur: true },
  aurore: { nom: "Aurore", papier: "#1b1440", disque: "#120c33", trait: "rgba(157,132,255,.62)", libelle: "#c9b8ff", texte: "#f4efe2", texte2: "#b8abe0", anneau: "#9d84ff", etoileCouleur: true },
  laiton: { nom: "Laiton", papier: "#0a1834", disque: "#0a1834", trait: "rgba(200,164,93,.7)", libelle: "#d8b876", texte: "#d8b876", texte2: "#b49a66", anneau: "#c8a45d", etoileCouleur: false },
};

const CARD = [["N", 0], ["E", 90], ["S", 180], ["O", 270]];

export function drawDome(ctx, sky, hm, o) {
  const { cx, cy, R } = o;
  const th = o.theme || THEMES.encre;
  const k = R / 300; // échelle de référence : rayon 300 px
  const maxMag = o.maxMag ?? 5.2;
  const reveal = o.reveal ?? 1;
  const enu = o.enu || starsENU(sky, hm.m);

  // disque du ciel
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = th.disque; ctx.fill();
  ctx.clip();

  // tracés des constellations
  if (o.lignes !== false) {
    ctx.strokeStyle = th.trait; ctx.lineWidth = Math.max(0.6, 0.9 * k); ctx.lineCap = "round";
    ctx.globalAlpha = Math.min(1, reveal * 1.4);
    ctx.beginPath();
    for (const c of sky.cons) for (const seg of c.lines) {
      let prev = null;
      for (const v of seg) {
        const p = domeXY(enuOf(hm, v), R, cx, cy);
        if (p && prev) { ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); }
        prev = p;
      }
    }
    ctx.stroke(); ctx.globalAlpha = 1;
  }

  // étoiles (les plus brillantes apparaissent d'abord pendant l'ouverture)
  // étoiles peintes par familles de couleur : un remplissage par famille au lieu d'un par étoile
  const lim = Math.min(maxMag, -1.6 + reveal * 7.2);
  const lots = new Map(), halos = new Map(), sc = k * (o.starScale || 1);
  const lot = (m, key) => { let p = m.get(key); if (!p) { p = new Path2D(); m.set(key, p); } return p; };
  for (let i = 0; i < sky.n; i++) {
    const m = sky.mag[i]; if (m > lim) break; // triées par magnitude
    const u = enu[i * 3 + 2]; if (u < -0.02) continue;
    const f = R / (1 + u), x = cx - f * enu[i * 3], y = cy - f * enu[i * 3 + 1];
    const r = starRadius(m, sc), key = th.etoileCouleur ? sky.cb[i] : -1;
    const p = lot(lots, key); p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2);
    if (m < 1.5 && o.halo !== false) { const h = lot(halos, key); h.moveTo(x + r * 2.6, y); h.arc(x, y, r * 2.6, 0, Math.PI * 2); }
  }
  const teinte = key => (key < 0 ? th.texte : sky.bcol[key]);
  ctx.globalAlpha = 0.18; for (const [key, p] of halos) { ctx.fillStyle = teinte(key); ctx.fill(p); }
  ctx.globalAlpha = 1; for (const [key, p] of lots) { ctx.fillStyle = teinte(key); ctx.fill(p); }

  // noms des constellations (les plus connues)
  if (o.nomsConst !== false && reveal > 0.6) {
    ctx.fillStyle = th.libelle; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `italic 400 ${Math.round(12.5 * k * (o.labelScale || 1))}px "Bodoni Moda", Georgia, serif`;
    for (const c of sky.cons) {
      if (c.rank > (o.rangMax || 1)) continue;
      const p = domeXY(enuOf(hm, c.label), R * 0.97, cx, cy);
      if (p) ctx.fillText(c.fr, p[0], p[1]);
    }
  }

  // planètes et Lune
  if (o.planetes !== false && reveal > 0.8) {
    for (const b of (o.corps || bodies(hm))) {
      if (b.id === "Sun") continue;
      const p = domeXY(b.enu, R, cx, cy);
      if (!p || b.mag > 6.5) continue;
      const r = b.id === "Moon" ? 7.5 * k : Math.max(2.2, (3 - b.mag) * 0.9) * k;
      ctx.fillStyle = b.col; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill();
      ctx.font = `400 ${Math.round(12 * k * (o.labelScale || 1))}px "Atkinson Hyperlegible", system-ui, sans-serif`;
      ctx.fillStyle = th.texte; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(b.fr, p[0] + r + 5 * k, p[1]);
    }
  }
  ctx.restore();

  // anneau d'horizon gravé : graduations tous les 5°, points cardinaux
  if (o.anneau !== false) {
    ctx.save();
    ctx.strokeStyle = th.anneau; ctx.lineWidth = Math.max(1, 1.2 * k);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.55; ctx.lineWidth = Math.max(0.6, 0.7 * k);
    ctx.beginPath(); ctx.arc(cx, cy, R + 14 * k, 0, Math.PI * 2); ctx.stroke();
    for (let a = 0; a < 360; a += 5) {
      const t = a * Math.PI / 180, l = a % 30 === 0 ? 14 : a % 10 === 0 ? 9 : 5;
      const x1 = cx - Math.sin(t) * R, y1 = cy - Math.cos(t) * R;
      const x2 = cx - Math.sin(t) * (R + l * k), y2 = cy - Math.cos(t) * (R + l * k);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (o.cardinaux !== false) {
      ctx.fillStyle = th.texte; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `500 ${Math.round(15 * k)}px "Bodoni Moda", Georgia, serif`;
      for (const [l, a] of CARD) {
        const t = a * Math.PI / 180, d = R + 30 * k;
        ctx.fillText(l, cx - Math.sin(t) * d, cy - Math.cos(t) * d);
      }
    }
    ctx.restore();
  }
  return enu;
}

/* cache léger des vecteurs horizon des tracés (recalculés si la matrice change) */
function enuOf(hm, v) {
  const m = hm.m;
  const x = v[0], y = v[1], z = v[2];
  return [-(m[0][1] * x + m[1][1] * y + m[2][1] * z), m[0][0] * x + m[1][0] * y + m[2][0] * z, m[0][2] * x + m[1][2] * y + m[2][2] * z];
}

/* Canvas net sur écran haute densité */
export function fitCanvas(cv, w, h) {
  const d = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.width = Math.round(w * d); cv.height = Math.round(h * d);
  const ctx = cv.getContext("2d"); ctx.setTransform(d, 0, 0, d, 0, 0);
  return ctx;
}
