/* Achats sans compte : les déblocages sont gardés sur l'appareil (localStorage).
   Stripe garde la preuve d'achat ; on peut tout récupérer avec l'e-mail utilisé pour payer (/restaurer/). */
const CLE = "voute.achats.v1";
const lire = () => { try { return JSON.parse(localStorage.getItem(CLE)) || { plus: false, posters: [] }; } catch (e) { return { plus: false, posters: [] }; } };
const ecrire = a => { try { localStorage.setItem(CLE, JSON.stringify(a)); } catch (e) {} };

export const achats = () => lire();
export const aPlus = () => lire().plus === true;
export function enregistre(p) {
  const a = lire();
  if (p.plus) a.plus = true;
  if (p.poster && !a.posters.some(x => x.id === p.id)) a.posters.push({ id: p.id, poster: p.poster, date: p.date });
  ecrire(a);
  return a;
}

export const PRIX = { plus: "2,99 €", poster: "4,99 €", bump: "1,49 €" };

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

/* Fenêtre de paiement réutilisable (Voûte+ ou poster) */
export function fenetrePaiement({ titre, prix, points, corps, note, extra, corpsFn, prixFn }) {
  let d = document.getElementById("fenPay");
  if (!d) { d = document.createElement("dialog"); d.id = "fenPay"; d.className = "fen"; document.body.append(d); }
  d.innerHTML = `
    <form method="dialog" class="fen-in">
      <button class="fen-x" value="x" aria-label="Fermer">×</button>
      <h2>${titre}</h2>
      <p class="fen-prix">${prix} <small>paiement unique, sans abonnement</small></p>
      <ul>${points.map(p => `<li>${p}</li>`).join("")}</ul>
      ${note ? `<p class="petit discret">${note}</p>` : ""}
      ${extra || ""}
      <label class="coche"><input type="checkbox" id="fenOk"> <span>J'accepte que le contenu numérique me soit fourni immédiatement après le paiement et je renonce à mon droit de rétractation. J'ai lu les <a href="/cgv/" target="_blank" rel="noopener">conditions de vente</a>.</span></label>
      <button type="button" class="bouton" id="fenGo">Payer ${prix}</button>
      <p class="msg err" id="fenMsg" role="alert"></p>
      <p class="petit discret">Paiement sécurisé par Stripe. Déjà acheté sur un autre appareil ? <a href="/restaurer/">Récupère ton achat</a>.</p>
    </form>`;
  const libelle = () => `Payer ${prixFn ? prixFn(d) : prix}`;
  const maj = () => { d.querySelector("#fenGo").textContent = libelle(); };
  d.querySelectorAll("input[data-maj]").forEach(i => i.addEventListener("change", maj));
  maj();
  d.querySelector("#fenGo").onclick = async () => {
    const ok = d.querySelector("#fenOk").checked, m = d.querySelector("#fenMsg");
    if (!ok) { m.textContent = "Coche la case pour continuer."; return; }
    const b = d.querySelector("#fenGo"); b.disabled = true; b.textContent = "Redirection vers le paiement…"; m.textContent = "";
    const r = await payer({ ...(corpsFn ? corpsFn(d) : corps), consent: true });
    if (r.erreur) { m.textContent = r.erreur; b.disabled = false; maj(); }
  };
  d.showModal ? d.showModal() : d.setAttribute("open", "");
  return d;
}

export function offrePlus() {
  return fenetrePaiement({
    titre: "Voûte+",
    prix: PRIX.plus,
    points: ["Les 5 044 étoiles du catalogue, jusqu'aux plus faibles", "Le voyage dans le temps : le ciel à n'importe quelle date et heure", "La flèche qui te guide vers l'astre que tu cherches", "Les heures de lever et de coucher des planètes et de la Lune"],
    note: "Valable à vie sur cet appareil. Tu pourras le récupérer sur un autre téléphone avec ton e-mail.",
    corps: { sku: "plus" },
  });
}
