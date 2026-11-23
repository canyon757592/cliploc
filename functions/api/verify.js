// Après le paiement : Stripe renvoie vers /merci/?s=<session>. On vérifie auprès de Stripe que c'est bien payé.
import { json, stripe, purchaseOf } from "../_shared.js";

export async function onRequestGet({ request, env }) {
  const s = new URL(request.url).searchParams.get("s") || "";
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(s)) return json(400, { error: "invalid_session" });
  const r = await stripe(env, "GET", "/checkout/sessions/" + encodeURIComponent(s));
  if (r.status === 503) return json(503, { error: "payments_unavailable" });
  if (!r.ok) return json(404, { error: "not_found" });
  const p = purchaseOf(r.body);
  if (!p) return json(402, { error: "not_paid" });
  return json(200, { ok: true, achat: p });
}
