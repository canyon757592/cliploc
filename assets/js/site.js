/* Commun à toutes les pages : menu mobile, formulaire de contact */
const $ = s => document.querySelector(s);
const burger = $(".burger"), nav = $("#nav");
if (burger && nav) burger.addEventListener("click", () => {
  const o = nav.classList.toggle("ouvert");
  burger.setAttribute("aria-expanded", String(o));
  burger.textContent = o ? "Fermer" : "Menu";
});

const fc = $("#formContact");
if (fc) fc.addEventListener("submit", async e => {
  e.preventDefault();
  const m = $("#msgContact"), b = fc.querySelector("button[type=submit]");
  const d = Object.fromEntries(new FormData(fc).entries());
  if (!d.email || !d.message || d.message.trim().length < 10) { m.className = "msg err"; m.textContent = "Indique ton e-mail et un message d'au moins 10 caractères."; return; }
  b.disabled = true; m.className = "msg"; m.textContent = "Envoi…";
  let r; try { r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }); } catch (err) {}
  b.disabled = false;
  if (r && r.ok) { fc.reset(); m.className = "msg ok"; m.textContent = "Message envoyé. On te répond par e-mail, en général sous 48 heures."; }
  else { m.className = "msg err"; m.textContent = "L'envoi n'a pas marché. Réessaie dans un instant."; }
});
