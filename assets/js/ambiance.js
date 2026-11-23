/* Lunétoiles : ambiance commune (ciel animé, sons stellaires, apparitions).
   Les sons sont synthétisés en direct (Web Audio), aucun fichier. Coupables à tout moment. */
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
const LSK = "lunetoiles.son";
let actx = null;
export const sonActif = () => { try { return localStorage.getItem(LSK) !== "0"; } catch (e) { return true; } };

const GAMME = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51]; // pentatonique, sonne « cristal »
function note(f, t0, dur, vol, type = "sine") {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.05);
}
/* son("clic") : scintillement · son("ouvre") : petite montée · son("petit") : un tintement · son("magie") : cascade */
export function son(type = "clic") {
  if (!sonActif() || document.hidden) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    const t = actx.currentTime + 0.005, r = () => GAMME[Math.floor(Math.random() * GAMME.length)];
    if (type === "petit") { note(r() * 2, t, 0.35, 0.035); return; }
    if (type === "ouvre") { [0, 2, 4].forEach((k, i) => note(GAMME[k + 2], t + i * 0.07, 0.6, 0.04)); note(GAMME[7] * 2, t + 0.21, 0.9, 0.02, "triangle"); return; }
    if (type === "magie") { [7, 5, 4, 2, 0].forEach((k, i) => note(GAMME[k] * 2, t + i * 0.06, 0.7, 0.03)); return; }
    const f = r(); note(f, t, 0.5, 0.045); note(f * 1.5, t + 0.04, 0.45, 0.025); note(f * 3, t + 0.02, 0.25, 0.01, "triangle");
  } catch (e) { /* pas de son disponible : on continue sans */ }
}

/* Bouton son dans l'en-tête */
function boutonSon() {
  const b = document.getElementById("btnSon"); if (!b) return;
  const texte = !b.querySelector("svg");
  const maj = () => { const on = sonActif(); b.setAttribute("aria-pressed", String(on)); if (texte) b.textContent = on ? "Couper" : "Activer"; else { b.setAttribute("aria-label", on ? "Couper les sons" : "Activer les sons"); b.title = on ? "Sons activés" : "Sons coupés"; } b.classList.toggle("muet", !on); };
  b.addEventListener("click", () => { try { localStorage.setItem(LSK, sonActif() ? "0" : "1"); } catch (e) {} maj(); son("petit"); });
  maj();
}

/* Sons au clic sur les actions (boutons, onglets, options) */
function sonsAuClic() {
  document.addEventListener("click", e => {
    const el = e.target.closest(".bouton, .outil, .pastille, .puce, summary, .lien-sec, .nav a, [data-son]");
    if (!el || el.id === "btnSon") return;
    son(el.dataset.son || (el.classList.contains("bouton") ? "clic" : "petit"));
  }, { capture: true });
}

/* Ciel étoilé animé en fond de page */
function cielDeFond() {
  const cv = document.getElementById("fond"); if (!cv) return;
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, etoiles = [], filante = null, prochaine = 6000, t0 = performance.now(), dernier = 0;
  let graine = 7; const rnd = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  function taille() {
    dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    graine = 7; const n = Math.round(Math.min(220, W * H / 7000));
    etoiles = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H, r: 0.35 + rnd() * rnd() * 1.4, v: 0.4 + rnd() * 1.6, p: rnd() * 6.3, c: rnd() < 0.12 ? "182,160,255" : rnd() < 0.2 ? "255,226,180" : "244,239,226" }));
    dessine(performance.now());
  }
  function dessine(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of etoiles) {
      const a = calme ? 0.7 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t / 1000 * s.v + s.p));
      ctx.fillStyle = `rgba(${s.c},${(a * 0.85).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.29); ctx.fill();
    }
    if (filante) {
      const k = (t - filante.t) / 900; if (k > 1) filante = null;
      else {
        const x = filante.x + filante.dx * k, y = filante.y + filante.dy * k, g = ctx.createLinearGradient(x, y, x - filante.dx * 0.22, y - filante.dy * 0.22);
        g.addColorStop(0, `rgba(244,239,226,${(1 - k).toFixed(2)})`); g.addColorStop(1, "rgba(182,160,255,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - filante.dx * 0.22, y - filante.dy * 0.22); ctx.stroke();
      }
    }
  }
  function boucle(t) {
    if (!document.hidden && t - dernier > 40) { // ~25 images/s suffisent
      dernier = t;
      if (!filante && t - t0 > prochaine) { t0 = t; prochaine = 9000 + Math.random() * 9000; filante = { t, x: W * (0.2 + Math.random() * 0.6), y: H * Math.random() * 0.3, dx: (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 160), dy: 120 + Math.random() * 80 }; }
      dessine(t);
    }
    requestAnimationFrame(boucle);
  }
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(taille, 150); });
  taille();
  if (!calme) requestAnimationFrame(boucle);
}

/* Apparitions douces au défilement */
function apparitions() {
  const els = document.querySelectorAll("[data-revele]");
  if (!els.length) return;
  if (calme || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("vu")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vu"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  els.forEach(e => io.observe(e));
}

document.documentElement.classList.add("js");
boutonSon(); sonsAuClic(); cielDeFond(); apparitions();
