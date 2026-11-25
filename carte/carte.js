/* Carte des locations courte durée par département.
   Chiffres : Eurostat (tour_ce_oan3). Contours : IGN Admin Express via france-geojson. Fond : OpenStreetMap. */
(() => {
  "use strict";
  const app = document.getElementById("carte");
  if (!app || !window.L) return;
  const NF = new Intl.NumberFormat("fr-FR");
  const court = v => v >= 1e6 ? (v / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " M" : NF.format(Math.round(v / 1000)) + " k";
  const evo = d => 100 * (d.v / d.p - 1);
  const etr = d => 100 * d.e / d.v;
  const signe = x => (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %";
  const M = {
    v: { l: "Nuitées réservées en 2025", c: "nuitées 2025", get: d => d.v, f: v => NF.format(v), fc: court },
    evo: { l: "Évolution par rapport à 2024", c: "évolution sur un an", get: evo, f: signe, fc: x => signe(Math.round(x)) },
    etr: { l: "Part de voyageurs étrangers", c: "part d'étrangers", get: etr, f: x => Math.round(x) + " %", fc: x => Math.round(x) + " %" },
  };
  const TEINTES = ["#FBE4D8", "#F4B49F", "#E57466", "#C42F4C", "#7E0F2B"];
  const $ = s => app.querySelector(s);
  const fiche = $(".fiche"), leg = $(".leg"), liste = $(".rang ol"), plus = $(".rang .tout"), champ = $("#cherche");
  let accueil = null, D = null, mesure = "v", seuils = [], choix = null, tout = false, couche = null;
  const parCode = {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const carte = L.map($(".cv .mp"), { zoomSnap: 0.25, scrollWheelZoom: false, dragging: !L.Browser.mobile, tap: true, minZoom: 4, maxZoom: 11 })
    .setView([46.6, 2.4], 5.5);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a>',
  }).addTo(carte);
  L.control.scale({ imperial: false }).addTo(carte);

  function calcule() {
    const v = D.deps.filter(d => !d.dom).map(M[mesure].get).sort((a, b) => a - b);
    seuils = [0.2, 0.4, 0.6, 0.8].map(p => v[Math.floor(p * v.length)]);
  }
  const teinte = x => TEINTES[seuils.filter(s => x >= s).length];
  const style = f => {
    const d = parCode[f.properties.c], on = choix === d;
    return { fillColor: teinte(M[mesure].get(d)), fillOpacity: 0.72, color: on ? "#1d1930" : "#fff", weight: on ? 3 : 1, opacity: 1 };
  };

  function dessine() {
    calcule();
    couche.setStyle(style);
    legende(); rang(); montre();
  }

  function legende() {
    const m = M[mesure];
    const lab = TEINTES.map((_, i) => i === 0 ? `moins de ${m.fc(seuils[0])}` : i === 4 ? `${m.fc(seuils[3])} et plus` : `${m.fc(seuils[i - 1])} à ${m.fc(seuils[i])}`);
    leg.innerHTML = `<p>${m.l}</p><ul>${TEINTES.map((c, i) => `<li><i style="background:${c}"></i>${lab[i]}</li>`).join("")}</ul>`;
  }

  function rang() {
    const m = M[mesure], zs = D.deps.slice().sort((a, b) => m.get(b) - m.get(a));
    const max = Math.max(...zs.map(m.get)), min = Math.min(0, ...zs.map(m.get)), vis = tout ? zs : zs.slice(0, 10);
    liste.innerHTML = vis.map(d =>
      `<li><button type="button" data-c="${d.c}"${choix === d ? ' aria-pressed="true"' : ""}><span class="nm">${esc(d.n)} <small>${d.c}</small></span><span class="br"><i style="width:${Math.max(2, 100 * (m.get(d) - min) / (max - min))}%"></i></span><b>${m.f(m.get(d))}</b></button></li>`).join("");
    plus.textContent = tout ? "Afficher les 10 premiers" : `Afficher les ${zs.length} départements`;
    $(".rang h2").textContent = `Classement : ${m.c}`;
  }

  const ligne = (t, v) => `<div><dt>${t}</dt><dd>${v}</dd></div>`;
  function montre() {
    const d = choix;
    if (!d) {
      fiche.innerHTML = `<p class="qui">France entière</p><h2>${NF.format(D.total)} nuitées</h2><dl>`
        + ligne("En 2024", NF.format(D.total_prec))
        + ligne("Évolution sur un an", signe(100 * (D.total / D.total_prec - 1)))
        + ligne("Départements", D.deps.length) + `</dl><p class="aide">Touche un département sur la carte, ou cherche-le, pour voir ses chiffres.</p>`;
      return;
    }
    fiche.innerHTML = `<p class="qui">${d.dom ? "Outre-mer" : "Département"} ${d.c}</p><h2>${esc(d.n)}</h2><dl>`
      + ligne("Nuitées réservées en 2025", NF.format(d.v))
      + ligne("En 2024", NF.format(d.p))
      + ligne("Évolution sur un an", signe(evo(d)))
      + ligne("Voyageurs étrangers", Math.round(etr(d)) + " %")
      + ligne("Part de la France", (100 * d.v / D.total).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %")
      + ligne("Rang national", `${d.r}<sup>e</sup> sur ${D.deps.length}`) + `</dl>`
      + `<a class="btn pv" href="/">Fais la vidéo de ton annonce</a>`
      + `<button type="button" class="lien retour">Revenir à la France entière</button>`;
  }

  function choisit(d, zoom) {
    choix = choix === d ? null : d;
    couche.setStyle(style);
    if (choix && !choix.dom) {
      couche.eachLayer(l => { if (l.feature.properties.c === choix.c) { l.bringToFront(); if (zoom) carte.flyToBounds(l.getBounds(), { maxZoom: 7.5, padding: [30, 30], duration: 0.6 }); } });
    } else if (!choix && zoom) carte.flyToBounds(accueil, { padding: [8, 8], duration: 0.6 });
    liste.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(!!choix && b.dataset.c === choix.c)));
    app.querySelectorAll(".dom button").forEach(b => b.setAttribute("aria-pressed", String(!!choix && b.dataset.c === choix.c)));
    montre();
  }

  function versFiche() {
    const r = fiche.getBoundingClientRect();
    if (r.top > innerHeight - 80 || r.bottom < 80) fiche.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  fetch("/carte/data/france.json").then(r => { if (!r.ok) throw 0; return r.json(); }).then(data => {
    D = data;
    D.deps.forEach(d => { parCode[d.c] = d; });
    couche = L.geoJSON(D.geo, {
      style,
      onEachFeature: (f, l) => {
        const d = parCode[f.properties.c];
        l.bindTooltip(() => `<b>${esc(d.n)}</b><br>${M[mesure].f(M[mesure].get(d))}`, { sticky: true, direction: "top", className: "bulle" });
        l.on({
          click: () => { choisit(d, false); versFiche(); },
          mouseover: () => { if (choix !== d) l.setStyle({ weight: 2.5, color: "#1d1930" }); },
          mouseout: () => couche.resetStyle(l),
        });
      },
    }).addTo(carte);
    accueil = couche.getBounds();
    carte.fitBounds(accueil, { padding: [8, 8] });
    $(".dom").innerHTML = "<span>Outre-mer :</span>" + D.deps.filter(d => d.dom).sort((a, b) => a.c.localeCompare(b.c))
      .map(d => `<button type="button" data-c="${d.c}" aria-pressed="false">${esc(d.n)}</button>`).join("");
    $("#deps").innerHTML = D.deps.slice().sort((a, b) => a.n.localeCompare(b.n, "fr")).map(d => `<option value="${esc(d.n)} (${d.c})">`).join("");
    app.classList.remove("charge");
    dessine();
  }).catch(() => { fiche.innerHTML = "<p>La carte n'a pas pu se charger. Recharge la page.</p>"; });

  app.querySelector(".mesures").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || !D) return;
    mesure = b.dataset.m;
    app.querySelectorAll(".mesures button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    dessine();
  });
  liste.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { choisit(parCode[b.dataset.c], true); versFiche(); } });
  app.querySelector(".dom").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { choisit(parCode[b.dataset.c], false); versFiche(); } });
  fiche.addEventListener("click", e => { if (e.target.closest(".retour")) choisit(null, true); });
  plus.addEventListener("click", () => { tout = !tout; rang(); });
  $(".recherche").addEventListener("submit", e => {
    e.preventDefault();
    const q = champ.value.trim().toLowerCase();
    if (!q || !D) return;
    const m = q.match(/\(([0-9ab]{2,3})\)\s*$/i);
    const d = (m && parCode[m[1].toUpperCase()]) || parCode[q.toUpperCase()] || D.deps.find(x => x.n.toLowerCase() === q)
      || D.deps.find(x => x.n.toLowerCase().startsWith(q)) || D.deps.find(x => x.n.toLowerCase().includes(q));
    const msg = $(".recherche .msg");
    if (!d) { msg.textContent = "Aucun département trouvé. Essaie un nom ou un numéro, comme 33."; return; }
    msg.textContent = "";
    choix = null;
    choisit(d, true);
    versFiche();
  });
  champ.addEventListener("change", () => { if (/\)\s*$/.test(champ.value)) $(".recherche").requestSubmit(); });
})();
