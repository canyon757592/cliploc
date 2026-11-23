/* Récupérer ses achats avec l'e-mail utilisé pour payer (pas de compte, pas de mot de passe). */
import { enregistre } from "./achats.js";
import { livre } from "./merci.js";

const $ = s => document.querySelector(s);

async function avecLien(t) {
  const box = $("#restaurations");
  box.innerHTML = `<p class="discret">Vérification du lien…</p>`;
  let j = {}; try { const r = await fetch("/api/restore?t=" + encodeURIComponent(t)); j = await r.json(); } catch (e) {}
  if (!j.ok) { box.innerHTML = `<p>Ce lien a expiré ou n'est pas valide. Demande un nouveau lien ci-dessous.</p>`; return; }
  if (!j.achats.length) { box.innerHTML = `<p>Aucun achat trouvé pour ce lien.</p>`; return; }
  box.innerHTML = "";
  j.achats.forEach(a => { enregistre(a); livre(a, box); });
}

function init() {
  const t = new URLSearchParams(location.search).get("t");
  if (t) avecLien(t);
  $("#formRestaurer")?.addEventListener("submit", async e => {
    e.preventDefault();
    const m = $("#msgRest"), b = e.submitter || $("#formRestaurer button");
    const email = $("#rEmail").value.trim();
    if (!email) { m.className = "msg err"; m.textContent = "Indique l'e-mail utilisé pour payer."; return; }
    b.disabled = true; m.className = "msg"; m.textContent = "Envoi…";
    let r; try { r = await fetch("/api/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); } catch (e2) {}
    b.disabled = false;
    if (r && r.ok) { m.className = "msg ok"; m.textContent = "Si un achat correspond à cette adresse, un e-mail avec un lien vient de partir. Pense à regarder dans les indésirables."; }
    else if (r && r.status === 503) { m.className = "msg err"; m.textContent = "La récupération ouvre en même temps que le paiement en ligne, très bientôt."; }
    else { m.className = "msg err"; m.textContent = "Vérifie l'adresse et réessaie."; }
  });
}
init();
