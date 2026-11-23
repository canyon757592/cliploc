// Outils communs aux fonctions serveur de Voûte (Cloudflare Pages Functions).
// Aucune base de données : Stripe garde la trace des achats, le navigateur garde les déblocages.
export const json = (status, body, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra } });

export const EMAIL_RX = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;

export function site(env) { return (env.SITE || "https://voute.pages.dev").replace(/\/$/, ""); }

// Refuse les requêtes d'écriture venant d'un autre site
export function sameOrigin(request, env) {
  const o = request.headers.get("origin");
  if (!o) return true;
  const ok = [site(env), "https://voute.pages.dev", "http://127.0.0.1:8791", "http://localhost:8791"];
  try { const u = new URL(o); return ok.includes(u.origin) || u.hostname.endsWith(".voute.pages.dev"); } catch { return false; }
}

export async function stripe(env, method, path, params) {
  const key = (env.STRIPE_SECRET_KEY || "").trim();
  if (!key) return { ok: false, status: 503, body: { error: { type: "no_key" } } };
  const url = "https://api.stripe.com/v1" + path + (method === "GET" && params ? "?" + params.toString() : "");
  const r = await fetch(url, {
    method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: method === "GET" ? undefined : params, signal: AbortSignal.timeout(20000),
  });
  const body = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body };
}

const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
async function hkey(env) {
  return crypto.subtle.importKey("raw", enc.encode((env.TOKEN_SECRET || "").trim()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
export async function signToken(env, obj) {
  const p = b64u(enc.encode(JSON.stringify(obj)));
  const s = await crypto.subtle.sign("HMAC", await hkey(env), enc.encode(p));
  return p + "." + b64u(s);
}
export async function readToken(env, t) {
  try {
    const [p, s] = String(t || "").split(".");
    if (!p || !s || !(env.TOKEN_SECRET || "").trim()) return null;
    const ok = await crypto.subtle.verify("HMAC", await hkey(env), fromB64u(s), enc.encode(p));
    if (!ok) return null;
    const o = JSON.parse(new TextDecoder().decode(fromB64u(p)));
    return o.exp && o.exp > Date.now() && Array.isArray(o.ids) ? o : null;
  } catch { return null; } // lien abîmé ou falsifié
}

// Un achat Voûte payé, sous une forme que le navigateur peut utiliser
export function purchaseOf(s) {
  const m = s.metadata || {};
  if (m.app !== "voute" || s.payment_status !== "paid") return null;
  const out = { id: s.id, sku: m.sku, plus: m.sku === "plus" || m.bump === "1", date: s.created };
  if (m.sku === "poster") out.poster = {
    titre: m.titre || "", sousTitre: m.sous || "", lieu: m.lieu || "", date: m.date, heure: m.heure,
    lat: +m.lat, lon: +m.lon, utc: m.utc || null, theme: m.theme || "encre",
  };
  return out;
}

export async function sendMail(env, { to, subject, text, reply_to }) {
  const key = (env.RESEND_API_KEY || "").trim();
  if (!key) return false;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM || "Voûte <voute@cliploc.com>", to: [to], subject, text, ...(reply_to ? { reply_to } : {}) }),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) console.error("mail_error", r.status, (await r.text().catch(() => "")).slice(0, 200));
  return r.ok;
}
