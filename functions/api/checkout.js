// Crée une session de paiement Stripe. Les PRIX sont fixés ici, jamais par le navigateur.
import { json, site, sameOrigin, stripe } from "../_shared.js";

const PRIX = { plus: 299, poster: 499, bump: 149 }; // en centimes, TTC
const THEMES = ["encre", "givre", "laiton"];
const txt = (v, n) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n) : "");

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request, env)) return json(403, { error: "forbidden" });
  let b;
  try { const t = await request.text(); if (t.length > 4000) throw 0; b = JSON.parse(t); } catch { return json(400, { error: "invalid_request" }); }
  if (!(env.STRIPE_SECRET_KEY || "").trim()) return json(503, { error: "payments_unavailable" });
  // Contenu numérique livré tout de suite : accord exprès et renonciation au droit de rétractation (art. L221-28 13° du Code de la consommation)
  if (b.consent !== true) return json(400, { error: "consent_required" });

  const S = site(env);
  const f = new URLSearchParams();
  let k = 0;
  const line = (name, cents) => {
    f.set(`line_items[${k}][quantity]`, "1");
    f.set(`line_items[${k}][price_data][currency]`, "eur");
    f.set(`line_items[${k}][price_data][unit_amount]`, String(cents));
    f.set(`line_items[${k}][price_data][product_data][name]`, name);
    k++;
  };
  const meta = { app: "voute", consent: "1", consent_at: new Date().toISOString() };

  if (b.sku === "plus") {
    line("Voûte+ : toutes les fonctions du viseur, à vie", PRIX.plus);
    meta.sku = "plus";
    f.set("cancel_url", `${S}/ciel/?achat=annule`);
  } else if (b.sku === "poster") {
    const p = b.poster || {};
    const date = txt(p.date, 10), heure = txt(p.heure, 5), lat = Number(p.lat), lon = Number(p.lon);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || +date.slice(0, 4) < 1800 || +date.slice(0, 4) > 2200) return json(400, { error: "invalid_date" });
    if (!/^\d{2}:\d{2}$/.test(heure)) return json(400, { error: "invalid_time" });
    if (!(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180)) return json(400, { error: "invalid_place" });
    const theme = THEMES.includes(p.theme) ? p.theme : "encre";
    const utc = txt(p.utc, 30);
    Object.assign(meta, { sku: "poster", titre: txt(p.titre, 80), sous: txt(p.sousTitre, 70), lieu: txt(p.lieu, 90), date, heure, lat: lat.toFixed(5), lon: lon.toFixed(5), theme, ...(utc ? { utc } : {}) });
    line(`Poster carte du ciel (HD) : ${meta.titre || "le ciel de cette nuit-là"}`.slice(0, 120), PRIX.poster);
    if (b.bump === true && b.dejaPlus !== true) { line("Voûte+ avec le poster : toutes les fonctions du viseur, à vie", PRIX.bump); meta.bump = "1"; }
    f.set("cancel_url", `${S}/poster/?achat=annule`);
  } else return json(400, { error: "invalid_choice" });

  f.set("mode", "payment");
  f.set("locale", "fr");
  f.set("success_url", `${S}/merci/?s={CHECKOUT_SESSION_ID}`);
  f.set("customer_creation", "always");
  f.set("invoice_creation[enabled]", "true");
  f.set("custom_text[submit][message]", "Contenu numérique disponible dès le paiement. Tu as accepté qu'il te soit livré immédiatement et renoncé à ton droit de rétractation.");
  for (const [mk, mv] of Object.entries(meta)) { f.set(`metadata[${mk}]`, String(mv)); f.set(`payment_intent_data[metadata][${mk}]`, String(mv)); }

  const r = await stripe(env, "POST", "/checkout/sessions", f);
  if (!r.ok || typeof r.body.url !== "string") {
    console.error("stripe_error", r.status, JSON.stringify(r.body?.error?.code || r.body?.error?.type || ""));
    return json(502, { error: "provider_error" });
  }
  return json(200, { url: r.body.url });
}
