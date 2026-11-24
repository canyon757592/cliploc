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

/* Ciel étoilé en fond de page : deux calques dessinés UNE fois, le scintillement et les étoiles filantes
   sont des animations CSS gérées par la carte graphique (aucun calcul image par image). */
function cielDeFond() {
  const c1 = document.getElementById("fond"), c2 = document.getElementById("fond2"); if (!c1) return;
  function peins() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5), W = innerWidth, H = innerHeight;
    let g = 7; const rnd = () => ((g = (g * 16807) % 2147483647) / 2147483647);
    const n = Math.round(Math.min(220, W * H / 7000));
    [c1, c2].forEach((cv, couche) => {
      if (!cv) return;
      cv.width = W * dpr; cv.height = H * dpr;
      const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < n; i++) {
        const x = rnd() * W, y = rnd() * H, r = 0.35 + rnd() * rnd() * 1.4, t = rnd(), a = 0.5 + rnd() * 0.45;
        if ((i % 2) !== couche) continue;
        ctx.fillStyle = `rgba(${t < 0.12 ? "182,160,255" : t < 0.2 ? "255,226,180" : "244,239,226"},${a.toFixed(2)})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill();
      }
    });
  }
  function filante() {
    if (calme || document.hidden) return;
    const f = document.createElement("i"); f.className = "filante"; f.setAttribute("aria-hidden", "true");
    f.style.left = (15 + Math.random() * 70) + "vw"; f.style.top = (Math.random() * 30) + "vh";
    f.style.setProperty("--sens", Math.random() < 0.5 ? "-1" : "1");
    f.addEventListener("animationend", () => f.remove());
    document.body.append(f);
  }
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(peins, 200); });
  const go = () => { peins(); if (!calme) { const suite = () => setTimeout(() => { filante(); suite(); }, 9000 + Math.random() * 9000); setTimeout(filante, 4000); suite(); } };
  if (document.readyState === "complete") setTimeout(go, 200); else addEventListener("load", () => setTimeout(go, 200), { once: true });
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
