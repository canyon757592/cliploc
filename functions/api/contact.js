// Formulaire de contact : le message part par e-mail au propriétaire du site, la réponse ira vers l'e-mail du visiteur.
// Texte brut uniquement, champ piège contre les robots, longueurs contrôlées.
import { json, sameOrigin, sendMail, EMAIL_RX } from "../_shared.js";

const SUJETS = { question: "Question", achat: "Problème avec un achat", partenariat: "Partenariat ou presse", autre: "Autre" };

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request, env)) return json(403, { error: "forbidden" });
  let b;
  try { const t = await request.text(); if (t.length > 8000) throw 0; b = JSON.parse(t); } catch { return json(400, { error: "invalid_request" }); }
  if (typeof b?.site === "string" && b.site.trim()) return json(200, { ok: true }); // robot
  const email = typeof b?.email === "string" ? b.email.trim() : "";
  const nom = typeof b?.nom === "string" ? b.nom.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 80) : "";
  const message = typeof b?.message === "string" ? b.message.replace(/\u0000/g, "").trim() : "";
  const sujet = SUJETS[b?.sujet] || "Autre";
  if (!EMAIL_RX.test(email) || email.length > 254 || message.length < 10 || message.length > 3000) return json(400, { error: "invalid_request" });
  if (!env.CONTACT_TO) return json(503, { error: "contact_unavailable" });
  const ok = await sendMail(env, {
    to: env.CONTACT_TO, reply_to: email,
    subject: `Lunétoiles : ${sujet}${nom ? " (" + nom + ")" : ""}`,
    text: `De : ${nom || "(sans nom)"} <${email}>\nSujet : ${sujet}\n\n${message}\n\nRéponds directement à cet e-mail : la réponse part vers ${email}.`,
  });
  return ok ? json(200, { ok: true }) : json(502, { error: "contact_unavailable" });
}
