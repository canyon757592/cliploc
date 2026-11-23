// Téléchargement du Carnet des étoiles : seulement si Stripe confirme un paiement qui l'inclut.
// Le PDF est rangé dans /prive/, une adresse que le site refuse de servir directement.
import { json, stripe, purchaseOf } from "../_shared.js";

export async function onRequestGet({ request, env }) {
  const s = new URL(request.url).searchParams.get("s") || "";
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(s)) return json(400, { error: "invalid_session" });
  const r = await stripe(env, "GET", "/checkout/sessions/" + encodeURIComponent(s));
  if (r.status === 503) return json(503, { error: "payments_unavailable" });
  const p = r.ok ? purchaseOf(r.body) : null;
  if (!p || !p.carnet) return json(403, { error: "not_purchased" });
  const f = await env.ASSETS.fetch(new URL("/prive/carnet-des-etoiles.pdf", request.url));
  if (!f.ok) return json(500, { error: "file_missing" });
  return new Response(f.body, { headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="Carnet-des-etoiles-Lunetoiles.pdf"',
    "Cache-Control": "private, no-store",
  } });
}
