/* Créateur d'Affiche des étoiles : date, heure, lieu -> le ciel exact de ce moment-là. Aperçu gratuit, HD après paiement. */
import { renderPoster, localToUTC } from "./poster-render.js";
import { fenetrePaiement } from "./achats.js";
import { son } from "./ambiance.js";
import { THEMES } from "./dome.js";

const $ = s => document.querySelector(s);
const p = {
  titre: "La nuit où tout a commencé", sousTitre: "", date: new Date().toISOString().slice(0, 10), heure: "21:30",
  lat: 48.8566, lon: 2.3522, lieu: "Paris, France", theme: "encre", utc: null,
};

function lireForm() {
  p.titre = $("#pTitre").value.trim(); p.sousTitre = $("#pSous").value.trim();
  p.date = $("#pDate").value || p.date; p.heure = $("#pHeure").value || "21:30";
  p.theme = document.querySelector("input[name=theme]:checked")?.value || "encre";
}
let t;
function apercu() { clearTimeout(t); t = setTimeout(async () => {
  lireForm();
  const r = await localToUTC(p.date, p.heure, p.lat, p.lon); p.utc = r.date.toISOString();
  await renderPoster($("#apercu"), p, { w: 900, apercu: true });
  $("#apercuTxt").textContent = `Le ciel du ${new Date(p.date + "T12:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à ${p.heure.replace(":", " h ")}, au-dessus de ${p.lieu}.`;
}, 180); }

/* Recherche de lieu : OpenStreetMap (Nominatim), une requête par recherche, jamais pendant la frappe */
async function chercheLieu(e) {
  e?.preventDefault();
  const q = $("#pLieu").value.trim(); if (q.length < 2) return;
  const box = $("#lieux"); box.innerHTML = `<li class="discret">Recherche…</li>`;
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=fr&q=${encodeURIComponent(q)}`);
    const j = await r.json();
    if (!j.length) { box.innerHTML = `<li class="discret">Aucun lieu trouvé. Essaie avec le nom de la ville.</li>`; return; }
    box.innerHTML = j.map((x, i) => `<li><button type="button" data-i="${i}">${x.display_name}</button></li>`).join("");
    box.querySelectorAll("button").forEach(b => b.onclick = () => { son("petit");
      const x = j[+b.dataset.i];
      p.lat = +x.lat; p.lon = +x.lon;
      const parts = x.display_name.split(",").map(s => s.trim());
      p.lieu = parts.length > 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : x.display_name;
      $("#pLieu").value = p.lieu; box.innerHTML = ""; apercu();
    });
  } catch (err) { box.innerHTML = `<li class="discret">La recherche de lieu ne répond pas. Réessaie dans un instant.</li>`; }
}

function acheter() {
  lireForm();
  fenetrePaiement({
    sku: "affiche", titre: "Ton Affiche des étoiles",
    points: ["Fichier haute définition 3000 × 4243 pixels, sans filigrane", "Prêt à imprimer en A4 ou en A3, ou à encadrer en 30 × 40 cm", "Téléchargeable tout de suite, et à nouveau plus tard avec ton e-mail"],
    note: "L'impression et le cadre ne sont pas fournis : tu imprimes chez toi, chez un imprimeur ou dans une borne photo.",
    extras: ["carnet", "pass"],
    corps: { poster: { ...p } },
  });
}

/* Occasions : un clic pré-remplit le titre et le style */
const OCCASIONS = {
  rencontre: { titre: "La nuit où tout a commencé", sous: "Léa & Sami", theme: "aurore" },
  naissance: { titre: "Bienvenue parmi nous", sous: "Léon, 3,2 kg de bonheur", theme: "givre" },
  mariage: { titre: "Le soir où l'on s'est dit oui", sous: "Inès & Tom", theme: "laiton" },
  anniversaire: { titre: "Le ciel de tes 18 ans", sous: "Joyeux anniversaire Maya", theme: "encre" },
  souvenir: { titre: "Sous le même ciel, pour toujours", sous: "", theme: "encre" },
};
function occasions() {
  document.querySelectorAll(".puce[data-occ]").forEach(b => b.addEventListener("click", () => {
    const o = OCCASIONS[b.dataset.occ]; if (!o) return;
    document.querySelectorAll(".puce[data-occ]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    $("#pTitre").value = o.titre; $("#pSous").value = o.sous;
    const r = document.querySelector(`input[name=theme][value=${o.theme}]`); if (r) r.checked = true;
    $("#pDate").focus(); apercu();
  }));
}

/* Exemples encadrés */
async function galerie() {
  const ex = [
    ["#ex1", { date: "2025-03-08", heure: "04:12", lat: 45.764, lon: 4.8357, lieu: "Lyon, France", titre: "Bienvenue parmi nous", sousTitre: "Léon", theme: "givre" }],
    ["#ex2", { date: "2024-06-22", heure: "23:00", lat: 44.8378, lon: -0.5792, lieu: "Bordeaux, France", titre: "Le soir où l'on s'est dit oui", sousTitre: "Inès & Tom", theme: "laiton" }],
    ["#ex3", { date: "2023-12-31", heure: "23:59", lat: 48.8566, lon: 2.3522, lieu: "Paris, France", titre: "La nuit où tout a commencé", sousTitre: "Léa & Sami", theme: "aurore" }],
  ];
  for (const [sel, prm] of ex) { const cv = $(sel); if (cv) await renderPoster(cv, prm, { w: 600 }); }
}

function init() {
  const q = new URLSearchParams(location.search);
  // pré-remplissage depuis un lien (ex. /poster/?date=2026-02-14&heure=21:30)
  if (/^\d{4}-\d{2}-\d{2}$/.test(q.get("date") || "")) p.date = q.get("date");
  if (/^\d{2}:\d{2}$/.test(q.get("heure") || "")) p.heure = q.get("heure");
  $("#pTitre").value = p.titre; $("#pDate").value = p.date; $("#pHeure").value = p.heure; $("#pLieu").value = p.lieu;
  $("#themes").innerHTML = Object.entries(THEMES).map(([k, th], i) => `<label class="pastille"><input type="radio" name="theme" value="${k}"${i === 0 ? " checked" : ""}><span style="--a:${th.papier};--b:${th.disque}"></span>${th.nom}</label>`).join("");
  ["#pTitre", "#pSous", "#pDate", "#pHeure"].forEach(s => $(s).addEventListener("input", apercu));
  document.querySelectorAll("input[name=theme]").forEach(r => r.addEventListener("change", apercu));
  $("#formLieu").addEventListener("submit", chercheLieu);
  $("#btnLieu").addEventListener("click", chercheLieu);
  $("#maPosition").onclick = () => navigator.geolocation?.getCurrentPosition(g => { p.lat = g.coords.latitude; p.lon = g.coords.longitude; p.lieu = "Ma position"; $("#pLieu").value = p.lieu; apercu(); });
  $("#btnAcheter").onclick = acheter;
  occasions();
  if ("IntersectionObserver" in window && $("#ex1")) { const io = new IntersectionObserver(e => { if (e[0].isIntersecting) { io.disconnect(); galerie(); } }, { rootMargin: "400px" }); io.observe($("#ex1")); } else galerie();
  if (q.get("achat") === "annule") $("#msgAchat").textContent = "Paiement annulé : rien n'a été débité. Ton affiche t'attend.";
  apercu();
}
init();
