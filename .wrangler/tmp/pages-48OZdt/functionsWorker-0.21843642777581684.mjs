var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-1XlwCN/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// _shared.js
var json = /* @__PURE__ */ __name((status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra } }), "json");
var EMAIL_RX = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;
function site(env) {
  return (env.SITE || "https://voute.pages.dev").replace(/\/$/, "");
}
__name(site, "site");
function sameOrigin(request, env) {
  const o = request.headers.get("origin");
  if (!o)
    return true;
  const ok = [site(env), "https://voute.pages.dev", "http://127.0.0.1:8791", "http://localhost:8791"];
  try {
    const u = new URL(o);
    return ok.includes(u.origin) || u.hostname.endsWith(".voute.pages.dev");
  } catch {
    return false;
  }
}
__name(sameOrigin, "sameOrigin");
async function stripe(env, method, path, params) {
  const key = (env.STRIPE_SECRET_KEY || "").trim();
  if (!key)
    return { ok: false, status: 503, body: { error: { type: "no_key" } } };
  const url = "https://api.stripe.com/v1" + path + (method === "GET" && params ? "?" + params.toString() : "");
  const r = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: method === "GET" ? void 0 : params,
    signal: AbortSignal.timeout(2e4)
  });
  const body = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body };
}
__name(stripe, "stripe");
var enc = new TextEncoder();
var b64u = /* @__PURE__ */ __name((buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), "b64u");
var fromB64u = /* @__PURE__ */ __name((s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)), "fromB64u");
async function hkey(env) {
  return crypto.subtle.importKey("raw", enc.encode((env.TOKEN_SECRET || "").trim()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
__name(hkey, "hkey");
async function signToken(env, obj) {
  const p = b64u(enc.encode(JSON.stringify(obj)));
  const s = await crypto.subtle.sign("HMAC", await hkey(env), enc.encode(p));
  return p + "." + b64u(s);
}
__name(signToken, "signToken");
async function readToken(env, t) {
  try {
    const [p, s] = String(t || "").split(".");
    if (!p || !s || !(env.TOKEN_SECRET || "").trim())
      return null;
    const ok = await crypto.subtle.verify("HMAC", await hkey(env), fromB64u(s), enc.encode(p));
    if (!ok)
      return null;
    const o = JSON.parse(new TextDecoder().decode(fromB64u(p)));
    return o.exp && o.exp > Date.now() && Array.isArray(o.ids) ? o : null;
  } catch {
    return null;
  }
}
__name(readToken, "readToken");
function purchaseOf(s) {
  const m = s.metadata || {};
  if (m.app !== "voute" || s.payment_status !== "paid")
    return null;
  const out = { id: s.id, sku: m.sku, plus: m.sku === "plus" || m.bump === "1", date: s.created };
  if (m.sku === "poster")
    out.poster = {
      titre: m.titre || "",
      sousTitre: m.sous || "",
      lieu: m.lieu || "",
      date: m.date,
      heure: m.heure,
      lat: +m.lat,
      lon: +m.lon,
      utc: m.utc || null,
      theme: m.theme || "encre"
    };
  return out;
}
__name(purchaseOf, "purchaseOf");
async function sendMail(env, { to, subject, text, reply_to }) {
  const key = (env.RESEND_API_KEY || "").trim();
  if (!key)
    return false;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM || "Vo\xFBte <voute@cliploc.com>", to: [to], subject, text, ...reply_to ? { reply_to } : {} }),
    signal: AbortSignal.timeout(15e3)
  });
  if (!r.ok)
    console.error("mail_error", r.status, (await r.text().catch(() => "")).slice(0, 200));
  return r.ok;
}
__name(sendMail, "sendMail");

// api/checkout.js
var PRIX = { plus: 299, poster: 499, bump: 149 };
var THEMES = ["encre", "givre", "laiton"];
var txt = /* @__PURE__ */ __name((v, n) => typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n) : "", "txt");
async function onRequestPost({ request, env }) {
  if (!sameOrigin(request, env))
    return json(403, { error: "forbidden" });
  let b;
  try {
    const t = await request.text();
    if (t.length > 4e3)
      throw 0;
    b = JSON.parse(t);
  } catch {
    return json(400, { error: "invalid_request" });
  }
  if (!(env.STRIPE_SECRET_KEY || "").trim())
    return json(503, { error: "payments_unavailable" });
  if (b.consent !== true)
    return json(400, { error: "consent_required" });
  const S = site(env);
  const f = new URLSearchParams();
  let k = 0;
  const line = /* @__PURE__ */ __name((name, cents) => {
    f.set(`line_items[${k}][quantity]`, "1");
    f.set(`line_items[${k}][price_data][currency]`, "eur");
    f.set(`line_items[${k}][price_data][unit_amount]`, String(cents));
    f.set(`line_items[${k}][price_data][product_data][name]`, name);
    k++;
  }, "line");
  const meta = { app: "voute", consent: "1", consent_at: (/* @__PURE__ */ new Date()).toISOString() };
  if (b.sku === "plus") {
    line("Vo\xFBte+ : toutes les fonctions du viseur, \xE0 vie", PRIX.plus);
    meta.sku = "plus";
    f.set("cancel_url", `${S}/ciel/?achat=annule`);
  } else if (b.sku === "poster") {
    const p = b.poster || {};
    const date = txt(p.date, 10), heure = txt(p.heure, 5), lat = Number(p.lat), lon = Number(p.lon);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || +date.slice(0, 4) < 1800 || +date.slice(0, 4) > 2200)
      return json(400, { error: "invalid_date" });
    if (!/^\d{2}:\d{2}$/.test(heure))
      return json(400, { error: "invalid_time" });
    if (!(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180))
      return json(400, { error: "invalid_place" });
    const theme = THEMES.includes(p.theme) ? p.theme : "encre";
    const utc = txt(p.utc, 30);
    Object.assign(meta, { sku: "poster", titre: txt(p.titre, 80), sous: txt(p.sousTitre, 70), lieu: txt(p.lieu, 90), date, heure, lat: lat.toFixed(5), lon: lon.toFixed(5), theme, ...utc ? { utc } : {} });
    line(`Poster carte du ciel (HD) : ${meta.titre || "le ciel de cette nuit-l\xE0"}`.slice(0, 120), PRIX.poster);
    if (b.bump === true && b.dejaPlus !== true) {
      line("Vo\xFBte+ avec le poster : toutes les fonctions du viseur, \xE0 vie", PRIX.bump);
      meta.bump = "1";
    }
    f.set("cancel_url", `${S}/poster/?achat=annule`);
  } else
    return json(400, { error: "invalid_choice" });
  f.set("mode", "payment");
  f.set("locale", "fr");
  f.set("success_url", `${S}/merci/?s={CHECKOUT_SESSION_ID}`);
  f.set("customer_creation", "always");
  f.set("invoice_creation[enabled]", "true");
  f.set("custom_text[submit][message]", "Contenu num\xE9rique disponible d\xE8s le paiement. Tu as accept\xE9 qu'il te soit livr\xE9 imm\xE9diatement et renonc\xE9 \xE0 ton droit de r\xE9tractation.");
  for (const [mk, mv] of Object.entries(meta)) {
    f.set(`metadata[${mk}]`, String(mv));
    f.set(`payment_intent_data[metadata][${mk}]`, String(mv));
  }
  const r = await stripe(env, "POST", "/checkout/sessions", f);
  if (!r.ok || typeof r.body.url !== "string") {
    console.error("stripe_error", r.status, JSON.stringify(r.body?.error?.code || r.body?.error?.type || ""));
    return json(502, { error: "provider_error" });
  }
  return json(200, { url: r.body.url });
}
__name(onRequestPost, "onRequestPost");

// api/contact.js
var SUJETS = { question: "Question", achat: "Probl\xE8me avec un achat", partenariat: "Partenariat ou presse", autre: "Autre" };
async function onRequestPost2({ request, env }) {
  if (!sameOrigin(request, env))
    return json(403, { error: "forbidden" });
  let b;
  try {
    const t = await request.text();
    if (t.length > 8e3)
      throw 0;
    b = JSON.parse(t);
  } catch {
    return json(400, { error: "invalid_request" });
  }
  if (typeof b?.site === "string" && b.site.trim())
    return json(200, { ok: true });
  const email = typeof b?.email === "string" ? b.email.trim() : "";
  const nom = typeof b?.nom === "string" ? b.nom.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 80) : "";
  const message = typeof b?.message === "string" ? b.message.replace(/\u0000/g, "").trim() : "";
  const sujet = SUJETS[b?.sujet] || "Autre";
  if (!EMAIL_RX.test(email) || email.length > 254 || message.length < 10 || message.length > 3e3)
    return json(400, { error: "invalid_request" });
  if (!env.CONTACT_TO)
    return json(503, { error: "contact_unavailable" });
  const ok = await sendMail(env, {
    to: env.CONTACT_TO,
    reply_to: email,
    subject: `Vo\xFBte : ${sujet}${nom ? " (" + nom + ")" : ""}`,
    text: `De : ${nom || "(sans nom)"} <${email}>
Sujet : ${sujet}

${message}

R\xE9ponds directement \xE0 cet e-mail : la r\xE9ponse part vers ${email}.`
  });
  return ok ? json(200, { ok: true }) : json(502, { error: "contact_unavailable" });
}
__name(onRequestPost2, "onRequestPost");

// api/restore.js
async function onRequestPost3({ request, env }) {
  if (!sameOrigin(request, env))
    return json(403, { error: "forbidden" });
  let b;
  try {
    b = await request.json();
  } catch {
    return json(400, { error: "invalid_request" });
  }
  const email = typeof b?.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!EMAIL_RX.test(email) || email.length > 254)
    return json(400, { error: "invalid_email" });
  if (!(env.STRIPE_SECRET_KEY || "").trim())
    return json(503, { error: "payments_unavailable" });
  const q = new URLSearchParams({ "customer_details[email]": email, status: "complete", limit: "100" });
  const r = await stripe(env, "GET", "/checkout/sessions", q);
  const ids = r.ok ? (r.body.data || []).map(purchaseOf).filter(Boolean).map((p) => p.id) : [];
  if (ids.length) {
    const t = await signToken(env, { ids: ids.slice(0, 40), exp: Date.now() + 36e5 });
    await sendMail(env, {
      to: email,
      subject: "Tes achats Vo\xFBte",
      text: `Bonjour,

Voici le lien pour retrouver tes achats Vo\xFBte sur ce t\xE9l\xE9phone ou cet ordinateur (valable une heure) :

${site(env)}/restaurer/?t=${t}

Si tu n'as rien demand\xE9, ignore simplement cet e-mail.

Vo\xFBte`
    });
  }
  return json(200, { ok: true });
}
__name(onRequestPost3, "onRequestPost");
async function onRequestGet({ request, env }) {
  const t = new URL(request.url).searchParams.get("t");
  const o = await readToken(env, t);
  if (!o)
    return json(401, { error: "lien_expire" });
  const achats = [];
  for (const id of o.ids) {
    const r = await stripe(env, "GET", "/checkout/sessions/" + encodeURIComponent(id));
    const p = r.ok ? purchaseOf(r.body) : null;
    if (p)
      achats.push(p);
  }
  return json(200, { ok: true, achats });
}
__name(onRequestGet, "onRequestGet");

// api/verify.js
async function onRequestGet2({ request, env }) {
  const s = new URL(request.url).searchParams.get("s") || "";
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(s))
    return json(400, { error: "invalid_session" });
  const r = await stripe(env, "GET", "/checkout/sessions/" + encodeURIComponent(s));
  if (r.status === 503)
    return json(503, { error: "payments_unavailable" });
  if (!r.ok)
    return json(404, { error: "not_found" });
  const p = purchaseOf(r.body);
  if (!p)
    return json(402, { error: "not_paid" });
  return json(200, { ok: true, achat: p });
}
__name(onRequestGet2, "onRequestGet");

// ../.wrangler/tmp/pages-48OZdt/functionsRoutes-0.10426966603341326.mjs
var routes = [
  {
    routePath: "/api/checkout",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/restore",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/restore",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/verify",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  }
];

// ../../../../tmp/wr/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../tmp/wr/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: () => {
            isFailOpen = true;
          }
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../../tmp/wr/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../tmp/wr/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-1XlwCN/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../../tmp/wr/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-1XlwCN/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.21843642777581684.mjs.map
