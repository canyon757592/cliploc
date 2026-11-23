// Récupérer ses achats sans compte : on envoie un lien signé (valable 1 h) à l'adresse utilisée pour payer.
// Réponse identique qu'il y ait des achats ou non : on ne révèle pas qui a acheté quoi.
import { json, site, sameOrigin, stripe, purchaseOf, signToken, readToken, sendMail, EMAIL_RX } from "../_shared.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request, env)) return json(403, { error: "forbidden" });
  let b; try { b = await request.json(); } catch { return json(400, { error: "invalid_request" }); }
  const email = typeof b?.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!EMAIL_RX.test(email) || email.length > 254) return json(400, { error: "invalid_email" });
  if (!(env.STRIPE_SECRET_KEY || "").trim()) return json(503, { error: "payments_unavailable" });

  const q = new URLSearchParams({ "customer_details[email]": email, status: "complete", limit: "100" });
  const r = await stripe(env, "GET", "/checkout/sessions", q);
  const ids = r.ok ? (r.body.data || []).map(purchaseOf).filter(Boolean).map(p => p.id) : [];
  if (ids.length) {
    const t = await signToken(env, { ids: ids.slice(0, 40), exp: Date.now() + 3600_000 });
    await sendMail(env, {
      to: email,
      subject: "Tes achats Lunétoiles",
      text: `Bonjour,\n\nVoici le lien pour retrouver tes achats Lunétoiles sur ce téléphone ou cet ordinateur (valable une heure) :\n\n${site(env)}/restaurer/?t=${t}\n\nSi tu n'as rien demandé, ignore simplement cet e-mail.\n\nLunétoiles`,
    });
  }
  return json(200, { ok: true });
}

export async function onRequestGet({ request, env }) {
  const t = new URL(request.url).searchParams.get("t");
  const o = await readToken(env, t);
  if (!o) return json(401, { error: "lien_expire" });
  const achats = [];
  for (const id of o.ids) {
    const r = await stripe(env, "GET", "/checkout/sessions/" + encodeURIComponent(id));
    const p = r.ok ? purchaseOf(r.body) : null;
    if (p) achats.push(p);
  }
  return json(200, { ok: true, achats });
}
