/* Retour de paiement : on vérifie auprès de Stripe (via le serveur), on débloque, on livre. */
import { enregistre, aPass } from "./achats.js";
import { renderPoster, HD } from "./poster-render.js";
import { son } from "./ambiance.js";

const $ = s => document.querySelector(s);

export async function telechargerHD(poster, bouton) {
  const txt = bouton?.textContent;
  if (bouton) { bouton.disabled = true; bouton.textContent = "Préparation du fichier HD…"; }
  const cv = document.createElement("canvas");
  await renderPoster(cv, poster, { w: HD.w, apercu: false });
  await new Promise(ok => cv.toBlob(b => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(b);
    a.download = `affiche-des-etoiles-${poster.date}.png`; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 8000); ok();
  }, "image/png"));
  if (bouton) { bouton.disabled = false; bouton.textContent = txt; }
  son("magie");
}

/* Livre un achat vérifié : affiche, carnet, pass */
export function livre(a, box) {
  if (a.poster) {
    const el = document.createElement("div"); el.className = "livraison";
    el.innerHTML = `<canvas aria-label="Aperçu de ton affiche"></canvas><div><h2>${a.poster.titre || "Ton affiche"}</h2><p class="discret">${a.poster.lieu || ""}</p><button class="bouton" type="button">Télécharger l'affiche HD</button><p class="petit discret">Fichier PNG 3000 × 4243 pixels. Pour l'impression, choisis « ajuster à la page » en A4 ou en A3.</p></div>`;
    box.append(el);
    renderPoster(el.querySelector("canvas"), a.poster, { w: 600 });
    el.querySelector("button").onclick = e => telechargerHD(a.poster, e.currentTarget);
  }
  if (a.carnet) box.insertAdjacentHTML("beforeend", `<div class="livraison"><img src="/assets/img/carnet/couverture.webp" alt="Couverture du Carnet des étoiles" width="260" height="368"><div><h2>Le Carnet des étoiles</h2><p class="discret">26 pages en PDF, à lire sur ton téléphone ou à imprimer. La deuxième page est une dédicace à remplir si tu l'offres.</p><a class="bouton" href="/api/livre?s=${encodeURIComponent(a.id)}" data-son="magie">Télécharger le Carnet (PDF)</a></div></div>`);
  if (a.pass) box.insertAdjacentHTML("beforeend", `<div class="livraison-plus"><h2>Le Pass des étoiles est activé sur cet appareil</h2><p>Toutes les étoiles, le voyage dans le temps et la flèche de guidage t'attendent dans le viseur. Sur un autre téléphone, récupère-le avec ton e-mail.</p><a class="bouton" href="/ciel/">Ouvrir le ciel</a></div>`);
}

async function init() {
  const box = $("#resultat"); if (!box) return;
  const s = new URLSearchParams(location.search).get("s");
  if (!s) { box.innerHTML = `<p>Aucun paiement à vérifier ici. Tu as déjà acheté ? <a href="/restaurer/">Récupère tes achats</a>.</p>`; return; }
  let r, j;
  try { r = await fetch("/api/verify?s=" + encodeURIComponent(s)); j = await r.json(); } catch (e) { j = {}; }
  if (!r || !r.ok || !j.achat) {
    const m = j?.error === "not_paid" ? "Le paiement n'est pas encore confirmé. Si tu as été débité, attends une minute et recharge cette page."
      : "Impossible de vérifier ton paiement pour le moment. Recharge la page dans un instant, ou récupère ton achat avec ton e-mail.";
    box.innerHTML = `<p>${m}</p><p><a href="/restaurer/">Récupérer mon achat</a> · <a href="/contact/">Nous écrire</a></p>`;
    return;
  }
  const a = j.achat; enregistre(a);
  $("#titreMerci").textContent = "Merci, c'est réglé.";
  box.innerHTML = ""; livre(a, box); son("magie");
  if (!a.pass && !aPass()) box.insertAdjacentHTML("beforeend", `<p class="suite">Pointe ton téléphone vers le ciel avec <a href="/ciel/">le viseur</a> : c'est gratuit.</p>`);
  if (!a.poster) box.insertAdjacentHTML("beforeend", `<p class="suite">Une date qui compte pour toi ? <a href="/affiche/">Offre-lui son Affiche des étoiles</a>.</p>`);
}
init();
