/* Cliploc : connexion réelle (Supabase Auth), crédits et vidéos côté serveur, Animation IA.
   Aucun secret ici : la clé ci-dessous est la clé PUBLIQUE de Supabase, protégée par les règles d'accès de la base.
   La clé fal.ai reste dans les Edge Functions et n'arrive jamais dans le navigateur. */
(function () {
  "use strict";
  const URL_ = "https://jfvzharrtvltotolfruz.supabase.co", KEY = "sb_publishable_q23wdg3QdKuxTfJX7y-CAQ_2vpP5K-U";
  const SK = "vt_sess";
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- session ---------- */
  let sess = null;
  try { sess = JSON.parse(localStorage.getItem(SK) || "null") } catch (e) { sess = null }
  if (sess && !(typeof sess.a === "string" && typeof sess.r === "string" && typeof sess.m === "string")) sess = null;
  const keep = s => { sess = s; try { s ? localStorage.setItem(SK, JSON.stringify(s)) : localStorage.removeItem(SK) } catch (e) {} };
  const hdr = tok => ({ apikey: KEY, Authorization: "Bearer " + (tok || KEY), "Content-Type": "application/json" });

  async function call(path, body, tok, method) {
    let r;
    try { r = await fetch(URL_ + path, { method: method || "POST", headers: hdr(tok), body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" }) }
    catch (e) { return { ok: false, status: 0, j: { msg: "network" } } }
    let j = null; try { j = await r.json() } catch (e) { j = null }
    return { ok: r.ok, status: r.status, j };
  }
  const fromAuth = j => ({ a: j.access_token, r: j.refresh_token, e: Date.now() + (Number(j.expires_in) || 3600) * 1000, u: j.user && j.user.id, m: j.user && j.user.email });

  const AUTH_MSG = [
    [/invalid_credentials|Invalid login/i, "Email ou mot de passe incorrect."],
    [/email_not_confirmed/i, "Confirme d'abord ton email : clique sur le lien reçu par mail, puis reconnecte-toi."],
    [/user_already_exists|email_exists|already registered/i, "Un compte existe déjà avec cet email. Connecte-toi."],
    [/weak_password|password/i, "Mot de passe trop faible : choisis-en un plus long, avec des lettres et des chiffres."],
    [/rate_limit|too many|over_/i, "Trop de tentatives. Réessaie dans quelques minutes."],
    [/network/i, "Pas de connexion. Vérifie ton réseau et réessaie."]
  ];
  const authErr = res => { const t = JSON.stringify(res.j || {}) + " " + res.status; for (const [re, m] of AUTH_MSG) if (re.test(t)) return m; return "Connexion impossible pour le moment. Réessaie dans un instant." };

  let refreshing = null;
  async function token() {
    if (!sess) return null;
    if (sess.e - Date.now() > 60000) return sess.a;
    if (!refreshing) refreshing = (async () => {
      const res = await call("/auth/v1/token?grant_type=refresh_token", { refresh_token: sess.r });
      if (res.ok && res.j && res.j.access_token) keep(fromAuth(res.j)); else if (res.status >= 400 && res.status < 500) keep(null);
      refreshing = null;
    })();
    await refreshing;
    return sess ? sess.a : null;
  }

  async function signUp(email, password) {
    const res = await call("/auth/v1/signup", { email, password });
    if (!res.ok) return { ok: false, error: authErr(res) };
    if (res.j && res.j.access_token) { keep(fromAuth(res.j)); return { ok: true, email: sess.m } }
    return { ok: true, pending: true };
  }
  async function signIn(email, password) {
    const res = await call("/auth/v1/token?grant_type=password", { email, password });
    if (!res.ok || !res.j || !res.j.access_token) return { ok: false, error: authErr(res) };
    keep(fromAuth(res.j)); return { ok: true, email: sess.m };
  }
  async function signOut() {
    const t = sess && sess.a; keep(null);
    if (t) call("/auth/v1/logout", {}, t).catch(() => {});
  }
  /* Lien de confirmation par email : Supabase renvoie ici avec #access_token=… */
  async function fromHash() {
    const h = location.hash || "";
    if (h.indexOf("access_token=") < 0) return false;
    const p = new URLSearchParams(h.slice(1)), a = p.get("access_token"), r = p.get("refresh_token");
    try { history.replaceState(null, "", location.pathname + location.search) } catch (e) {}
    if (!a || !r || a.length > 4000 || r.length > 400) return false;
    const u = await call("/auth/v1/user", undefined, a, "GET");
    if (!u.ok || !u.j || !u.j.email) return false;
    keep({ a, r, e: Date.now() + (Number(p.get("expires_in")) || 3600) * 1000, u: u.j.id, m: u.j.email });
    return true;
  }

  /* ---------- données du compte ---------- */
  async function profile() {
    const t = await token(); if (!t) return null;
    const res = await call("/rest/v1/profiles?select=credits,plan,ebook&limit=1", undefined, t, "GET");
    return res.ok && Array.isArray(res.j) && res.j[0] ? res.j[0] : null;
  }
  async function ledger() {
    const t = await token(); if (!t) return [];
    const res = await call("/rest/v1/credit_ledger?select=delta,reason,created_at&order=created_at.desc&limit=60", undefined, t, "GET");
    return res.ok && Array.isArray(res.j) ? res.j : [];
  }
  async function flags() {
    const res = await call("/rest/v1/rpc/public_flags", {});
    return res.ok && res.j && typeof res.j === "object" ? { ai: res.j.ai === true, pay: res.j.pay === true } : { ai: false, pay: false };
  }

  const RPC_MSG = {
    no_credits: "Il te manque des crédits pour cette vidéo.", plan_required: "Ta formule ne permet pas ce style ou cette option.",
    rate_limited: "Tu as lancé beaucoup de vidéos en peu de temps. Réessaie dans une heure.", invalid_url: "Le lien de l'annonce n'est pas valide.",
    ai_unavailable: "L'animation IA est momentanément indisponible. Choisis une vidéo sans IA.", service_paused: "Le service est en pause quelques minutes. Réessaie bientôt.",
    auth_required: "Ta session a expiré. Reconnecte-toi.", unknown_user: "Compte introuvable. Reconnecte-toi."
  };
  async function rpc(name, args) {
    const t = await token(); if (!t) throw new Error("Ta session a expiré. Reconnecte-toi.");
    const res = await call("/rest/v1/rpc/" + name, args, t);
    if (!res.ok) {
      const m = String((res.j && (res.j.message || res.j.msg)) || "");
      const k = Object.keys(RPC_MSG).find(x => m.indexOf(x) >= 0);
      throw new Error(k ? RPC_MSG[k] : "Une erreur est survenue. Réessaie dans un instant.");
    }
    return res.j;
  }
  const startJob = p => rpc("start_job", { p_url: p.url, p_duration: p.duration, p_quality: p.quality, p_fmt: p.fmt, p_motion: p.motion, p_grade: p.grade, p_ai: !!p.ai });
  const finishJob = (id, ok, err) => rpc("finish_job", { p_job: id, p_ok: !!ok, p_error: err ? String(err).slice(0, 200) : null });
  const sweep = () => rpc("sweep_my_jobs", {});
  const refundClips = id => rpc("refund_failed_clips", { p_job: id });

  /* ---------- Animation IA ---------- */
  /* Réduit une photo en JPEG (≤ 1,3 Mo en base64) pour l'envoyer à l'IA. */
  async function toJpeg(file) {
    const bmp = await createImageBitmap(file), k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.max(2, Math.round(bmp.width * k)); c.height = Math.max(2, Math.round(bmp.height * k));
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); bmp.close && bmp.close();
    for (const q of [0.86, 0.76, 0.66, 0.55]) {
      const b = await new Promise(r => c.toBlob(r, "image/jpeg", q));
      const u = await new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(f.result); f.onerror = rej; f.readAsDataURL(b) });
      if (u.length <= 1300000) return u;
    }
    throw new Error("photo trop lourde");
  }

  /* Envoie les plans (2 en parallèle au maximum, limite des nouveaux comptes fal), attend chaque MP4. */
  async function aiClips(o) {
    const n = o.images.length, out = new Array(n).fill(null), CONC = o.concurrency || 2, MAXWAIT = 8 * 60 * 1000;
    let next = 0, done = 0, stop = false, fatal = null;
    const tick = () => o.onProgress && o.onProgress(done, n);
    async function fn(name, body) {
      const t = await token(); if (!t) { fatal = fatal || "session"; return null }
      try { return await fetch(URL_ + "/functions/v1/" + name, { method: "POST", headers: hdr(t), body: JSON.stringify(body), cache: "no-store" }) } catch (e) { return null }
    }
    async function one(i) {
      let img; try { img = await toJpeg(o.images[i]) } catch (e) { return }
      const s = await fn("ai-animate", { job_id: o.job, idx: i, image: img });
      if (!s) return;
      if (s.status === 503 || s.status === 429) { stop = true; return }        // IA coupée ou plafond du jour : on arrête d'envoyer
      if (s.status === 401) { fatal = "session"; return }
      if (!s.ok) return;
      const t0 = Date.now();
      while (Date.now() - t0 < MAXWAIT) {
        await sleep(5000);
        if (o.signal && o.signal.aborted) return;
        const r = await fn("ai-result", { job_id: o.job, idx: i });
        if (!r) continue;
        if (r.status === 401) { fatal = "session"; return }
        const ct = r.headers.get("content-type") || "";
        if (ct.indexOf("video/") === 0) { const b = await r.blob(); if (b.size > 1000) out[i] = b; return }
        let j = null; try { j = await r.json() } catch (e) {}
        if (j && j.status === "failed") return;
        if (r.status === 503) { stop = true; return }
      }
    }
    async function worker() { while (!stop && !fatal) { const i = next++; if (i >= n) return; await one(i); done++; tick() } }
    tick();
    await Promise.all(Array.from({ length: Math.min(CONC, n) }, worker));
    if (fatal) throw new Error("Ta session a expiré pendant l'animation. Reconnecte-toi puis recommence.");
    let refunded = 0;
    try { refunded = Number(await refundClips(o.job)) || 0 } catch (e) { refunded = 0 }
    return { clips: out, refunded };
  }

  /* Paiement : le serveur calcule le prix et renvoie l'adresse de la page de paiement Stripe. */
  async function checkout(spec) {
    const t = await token(); if (!t) throw new Error("Ta session a expiré. Reconnecte-toi.");
    let r; try { r = await fetch(URL_ + "/functions/v1/create-checkout", { method: "POST", headers: hdr(t), body: JSON.stringify(spec), cache: "no-store" }) }
    catch (e) { throw new Error("Pas de connexion. Réessaie dans un instant.") }
    let j = null; try { j = await r.json() } catch (e) {}
    if (!r.ok) {
      const e = j && j.error;
      throw new Error(e === "payments_unavailable" ? "Le paiement en ligne n'est pas encore ouvert." : e === "already_owned" ? "Tu as déjà la formation Airbnb." : e === "already_subscribed" ? "Tu as déjà un abonnement actif. Pour en changer, résilie-le d'abord depuis Mon compte." : "Le paiement n'a pas pu démarrer. Réessaie dans un instant.");
    }
    return j;
  }

  /* Portail Stripe : résilier, changer de carte, factures. */
  async function portal(action) {
    const t = await token(); if (!t) throw new Error("Ta session a expiré. Reconnecte-toi.");
    let r; try { r = await fetch(URL_ + "/functions/v1/customer-portal", { method: "POST", headers: hdr(t), body: JSON.stringify(action === "cancel" ? { action: "cancel" } : {}), cache: "no-store" }) }
    catch (e) { throw new Error("Pas de connexion. Réessaie dans un instant.") }
    let j = null; try { j = await r.json() } catch (e) {}
    if (!r.ok || !j || typeof j.url !== "string" || !/^https:\/\/billing\.stripe\.com\//.test(j.url))
      throw new Error(j && j.error === "no_customer" ? "Aucun abonnement trouvé sur ce compte." : "La gestion de l'abonnement n'a pas pu s'ouvrir. Réessaie dans un instant ou écris-nous.");
    return j.url;
  }

  /* Formation (PDF) : fichier privé. Le serveur ne le donne qu'aux comptes qui l'ont payée (règle d'accès sur le stockage). */
  async function ebook() {
    const tok = await token();
    if (!tok) return { ok: false, error: "Connecte-toi pour télécharger la formation." };
    let r;
    try { r = await fetch(URL_ + "/storage/v1/object/authenticated/ebook/formation-cliploc.pdf", { headers: { apikey: KEY, Authorization: "Bearer " + tok }, cache: "no-store" }) }
    catch (e) { return { ok: false, error: "Pas de connexion. Vérifie ton réseau et réessaie." } }
    if (r.status >= 400 && r.status < 500) return { ok: false, error: "La formation n'est pas disponible sur ce compte." };
    if (!r.ok) return { ok: false, error: "Téléchargement impossible pour le moment. Réessaie dans un instant." };
    let b; try { b = await r.blob() } catch (e) { b = null }
    if (!b || !b.size) return { ok: false, error: "Téléchargement impossible pour le moment. Réessaie dans un instant." };
    return { ok: true, blob: new Blob([b], { type: "application/pdf" }) };
  }
  window.CL = { ebook, portal, checkout, session: () => sess, restore: fromHash, signUp, signIn, signOut, profile, ledger, flags, sweep, startJob, finishJob, aiClips };
})();
