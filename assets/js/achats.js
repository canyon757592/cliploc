/* Achats sans compte : les déblocages sont gardés sur l'appareil (localStorage).
   Stripe garde la preuve d'achat ; tout se récupère avec l'e-mail utilisé pour payer (/restaurer/). */
import { son } from "./ambiance.js";
const CLE = "lunetoiles.achats.v1";
const vide = () => ({ pass: false, posters: [], carnets: [] });
const lire = () => { try { return { ...vide(), ...(JSON.parse(localStorage.getItem(CLE)) || {}) }; } catch (e) { return vide(); } };
const ecrire = a => { try { localStorage.setItem(CLE, JSON.stringify(a)); } catch (e) {} };

export const achats = () => lire();
export const aPass = () => lire().pass === true;
export function enregistre(p) {
  const a = lire();
  if (p.pass) a.pass = true;
  if (p.carnet && !a.carnets.includes(p.id)) a.carnets.push(p.id);
  if (p.poster && !a.posters.some(x => x.id === p.id)) a.posters.push({ id: p.id, poster: p.poster, date: p.date });
  ecrire(a);
  return a;
}

export const OFFRES = {
  pass: { nom: "Pass des étoiles", prix: 0.99 },
  affiche: { nom: "Affiche des étoiles", prix: 4.99 },
  carnet: { nom: "Carnet des étoiles", prix: 0.99 },
};
export const eur = n => n.toFixed(2).replace(".", ",") + " €";

/* Lance le paiement Stripe ; le prix est calculé par le serveur */
export async function payer(corps) {
  let r;
  try { r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) }); }
  catch (e) { return { erreur: "Connexion impossible. Vérifie ton réseau et réessaie." }; }
  const j = await r.json().catch(() => ({}));
  if (r.ok && j.url) { location.href = j.url; return { ok: true }; }
  if (j.error === "payments_unavailable") return { erreur: "Le paiement en ligne ouvre très bientôt. Repasse dans quelques jours !" };
  if (j.error === "consent_required") return { erreur: "Coche la case pour continuer." };
  return { erreur: "Le paiement n'a pas pu démarrer. Réessaie dans un instant." };
}

/* Fenêtre de paiement : une offre principale + options cochables (« extras ») */
export function fenetrePaiement({ sku, titre, points, note, extras = [], corps = {} }) {
  const base = OFFRES[sku].prix;
  let d = document.getElementById("fenPay");
  if (!d) { d = document.createElement("dialog"); d.id = "fenPay"; d.className = "fen"; document.body.append(d); }
  const TEXTES = {
    pass: `<b>Ajoute le Pass des étoiles, ${eur(OFFRES.pass.prix)}</b> : toutes les étoiles, le voyage dans le temps et la flèche de guidage dans le viseur.`,
    carnet: `<b>Ajoute le Carnet des étoiles, ${eur(OFFRES.carnet.prix)}</b> : 26 pages en PDF pour apprendre à lire le ciel, avec une page de dédicace pour l'offrir.`,
  };
  const options = extras.filter(x => TEXTES[x] && !(x === "pass" && aPass())).map(x => ({ k: x, html: TEXTES[x] }));
  d.innerHTML = `
    <form method="dialog" class="fen-in">
      <button class="fen-x" value="x" aria-label="Fermer">×</button>
      <h2>${titre}</h2>
      <p class="fen-prix">${eur(base)} <small>paiement unique, sans abonnement</small></p>
      <ul>${points.map(p => `<li>${p}</li>`).join("")}</ul>
      ${note ? `<p class="petit discret">${note}</p>` : ""}
      ${options.map(o => `<label class="coche option"><input type="checkbox" data-extra="${o.k}"> <span>${o.html}</span></label>`).join("")}
      <label class="coche"><input type="checkbox" id="fenOk"> <span>J'accepte que le contenu numérique me soit fourni immédiatement après le paiement et je renonce à mon droit de rétractation. J'ai lu les <a href="/cgv/" target="_blank" rel="noopener">conditions de vente</a>.</span></label>
      <button type="button" class="bouton" id="fenGo">Payer</button>
      <p class="msg err" id="fenMsg" role="alert"></p>
      <p class="petit discret">Paiement sécurisé par Stripe : carte bancaire, Apple Pay ou Google Pay selon ton appareil. Déjà acheté ? <a href="/restaurer/">Récupère ton achat</a>.</p>
    </form>`;
  const choisis = () => [...d.querySelectorAll("[data-extra]:checked")].map(i => i.dataset.extra);
  const total = () => base + choisis().reduce((s, k) => s + OFFRES[k].prix, 0);
  const maj = () => { d.querySelector("#fenGo").textContent = `Payer ${eur(total())}`; };
  d.querySelectorAll("[data-extra]").forEach(i => i.addEventListener("change", () => { maj(); son("petit"); }));
  maj();
  d.querySelector("#fenGo").onclick = async () => {
    const ok = d.querySelector("#fenOk").checked, m = d.querySelector("#fenMsg");
    if (!ok) { m.textContent = "Coche la case pour continuer."; return; }
    const b = d.querySelector("#fenGo"); b.disabled = true; b.textContent = "Redirection vers le paiement…"; m.textContent = "";
    const r = await payer({ sku, ...corps, extras: choisis(), consent: true });
    if (r.erreur) { m.textContent = r.erreur; b.disabled = false; maj(); }
  };
  d.showModal ? d.showModal() : d.setAttribute("open", "");
  son("ouvre");
  return d;
}

export function offrePass() {
  return fenetrePaiement({
    sku: "pass", titre: "Pass des étoiles",
    points: ["Les 5 044 étoiles du catalogue, jusqu'aux plus faibles", "Le voyage dans le temps : le ciel à n'importe quelle date et heure", "La flèche qui te guide vers l'astre que tu cherches", "Les heures de lever et de coucher des planètes et de la Lune"],
    note: "Valable à vie sur cet appareil, récupérable sur un autre téléphone avec ton e-mail.",
    extras: ["carnet"],
  });
}
export function offreCarnet() {
  return fenetrePaiement({
    sku: "carnet", titre: "Carnet des étoiles",
    points: ["26 pages en PDF, à lire sur téléphone ou à imprimer", "Six planches de constellations et les cartes du ciel des quatre saisons", "La Lune, les planètes, les étoiles filantes, un lexique", "Une page de dédicace pour l'offrir"],
    note: "Téléchargement immédiat après le paiement, et à nouveau plus tard avec ton e-mail.",
    extras: ["pass"],
  });
}
