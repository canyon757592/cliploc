/* Créateur de poster : date, heure, lieu -> le ciel exact de ce moment-là. Aperçu gratuit, HD après paiement. */
import { renderPoster, localToUTC } from "./poster-render.js";
import { fenetrePaiement, aPlus, PRIX } from "./achats.js";
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
    box.querySelectorAll("button").forEach(b => b.onclick = () => {
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
  const dejaPlus = aPlus();
  fenetrePaiement({
    titre: "Ton poster en HD",
    prix: PRIX.poster,
    points: ["Fichier haute définition 3000 × 4243 pixels, sans filigrane", "Prêt à imprimer en A4 ou en A3, ou à encadrer en 30 × 40 cm", "Téléchargeable tout de suite, et à nouveau plus tard avec ton e-mail"],
    extra: dejaPlus ? "" : `<label class="coche"><input type="checkbox" id="fenBump" data-maj> <span><b>Ajoute Voûte+ pour ${PRIX.bump}</b> au lieu de ${PRIX.plus} : toutes les étoiles, le voyage dans le temps et la flèche de guidage dans le viseur.</span></label>`,
    prixFn: d => d.querySelector("#fenBump")?.checked ? "6,48 €" : PRIX.poster,
    corpsFn: d => ({ sku: "poster", poster: { ...p }, bump: !!d.querySelector("#fenBump")?.checked, dejaPlus }),
  });
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
  if (q.get("achat") === "annule") $("#msgAchat").textContent = "Paiement annulé : rien n'a été débité. Ton poster t'attend.";
  apercu();
}
init();
