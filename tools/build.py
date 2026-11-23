#!/usr/bin/env python3
"""Génère les pages statiques de Lunétoiles (en-tête, pied de page et référencement communs)."""
import json, os, re, html, hashlib, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://lunetoiles.pages.dev"
TODAY = datetime.date.today().isoformat()

def ver(path):
    with open(os.path.join(ROOT, path.lstrip("/")), "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:8]

LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M15.5 4.5a11.5 11.5 0 1 0 12 15.4A9 9 0 1 1 15.5 4.5z" fill="#f4efe2"/><path d="M24 5l1.1 3.3 3.4 1.2-3.4 1.1L24 14l-1.1-3.4-3.4-1.1 3.4-1.2z" fill="#9d84ff"/><circle cx="27.5" cy="16.5" r=".9" fill="#c8a45d"/></svg>'

SON = '<button class="btn-son" id="btnSon" type="button" aria-pressed="true" aria-label="Couper les sons"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path class="ondes" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path class="barre" d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>'
NAV = [("/affiche/", "Affiche des étoiles"), ("/carnet/", "Carnet des étoiles"), ("/guides/", "Guides"), ("/tarifs/", "Tarifs"), ("/contact/", "Contact")]

def head(title, desc, path, extra_css="", ld=None, noindex=False, og_img="/assets/img/og.png"):
    css = f'<link rel="stylesheet" href="/assets/css/site.css?v={ver("assets/css/site.css")}">'
    if extra_css:
        css += f'\n<link rel="stylesheet" href="/assets/css/{extra_css}?v={ver("assets/css/" + extra_css)}">'
    lds = ""
    for x in (ld or []):
        lds += '\n<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + "</script>"
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{SITE}{path}">
{'<meta name="robots" content="noindex">' if noindex else ''}
<meta name="theme-color" content="#10234a">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Lunétoiles">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{SITE}{path}">
<meta property="og:image" content="{SITE}{og_img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preload" href="/assets/fonts/bodoni-moda-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
{css}{lds}
</head>"""

def header(path):
    links = "".join(f'<a href="{h}"{" aria-current=page" if path.startswith(h) else ""}>{t}</a>' for h, t in NAV)
    return f"""<a class="saut" href="#contenu">Aller au contenu</a>
<canvas id="fond" aria-hidden="true"></canvas>
<p class="bandeau">Idée cadeau pour Noël : <a href="/carnet/">le Carnet des étoiles</a>, 26 pages à offrir, 0,99&nbsp;€ pendant le lancement.</p>
<header class="entete"><div class="cadre">
<a class="marque" href="/" aria-label="Lunétoiles, accueil">{LOGO}Lunétoiles</a>
{SON}
<button class="burger" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
<nav id="nav" class="nav" aria-label="Navigation principale">{links}<a class="bouton petit" href="/ciel/">Ouvrir le ciel</a></nav>
</div></header>"""

FOOTER = f"""<footer class="pied"><div class="cadre">
<div><h2>Lunétoiles</h2><p>Pointe ton téléphone vers le ciel, Lunétoiles te dit ce que tu regardes. Directement dans le navigateur, sans compte.</p></div>
<div><ul><li><a href="/ciel/">Ouvrir le ciel</a></li><li><a href="/affiche/">Affiche des étoiles</a></li><li><a href="/carnet/">Carnet des étoiles</a></li><li><a href="/tarifs/">Tarifs</a></li><li><a href="/restaurer/">Récupérer un achat</a></li></ul></div>
<div><ul><li><a href="/guides/">Guides</a></li><li><a href="/faq/">Questions fréquentes</a></li><li><a href="/contact/">Contact</a></li></ul></div>
<div><ul><li><a href="/mentions-legales/">Mentions légales</a></li><li><a href="/cgv/">Conditions de vente</a></li><li><a href="/confidentialite/">Confidentialité</a></li><li><a href="/licences/">Licences et sources</a></li></ul></div>
<p class="credits">Positions calculées avec Astronomy Engine (Don Cross, licence MIT) et le catalogue d'étoiles de d3-celestial (Olaf Frohn, licence BSD). Recherche de lieux : © les contributeurs d'OpenStreetMap. Fuseaux horaires : Natural Earth.</p>
</div></footer>"""

def page(path, title, desc, body, scripts=(), extra_css="", ld=None, noindex=False, body_cls="", bare=False, astro=False):
    s = (f'\n<script src="/assets/js/astronomy.min.js?v={ver("/assets/js/astronomy.min.js")}" defer></script>' if astro else "") + "".join(f'\n<script type="module" src="{x}?v={ver(x)}"></script>' for x in scripts)
    s += f'\n<script type="module" src="/assets/js/ambiance.js?v={ver("/assets/js/ambiance.js")}"></script>'
    s += f'\n<script src="/assets/js/site.js?v={ver("/assets/js/site.js")}" defer></script>' if not bare else ""
    out = head(title, desc, path, extra_css, ld, noindex) + f'\n<body{" class=" + chr(34) + body_cls + chr(34) if body_cls else ""}>\n'
    if not bare:
        out += header(path) + f'\n<main id="contenu">\n{body}\n</main>\n' + FOOTER
    else:
        out += body
    out += s + "\n</body>\n</html>\n"
    dest = os.path.join(ROOT, path.strip("/"), "index.html") if path != "/404.html" else os.path.join(ROOT, "404.html")
    if path == "/":
        dest = os.path.join(ROOT, "index.html")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w", encoding="utf-8") as f:
        f.write(out)
    return path

PAGES = []
ORG = {"@context": "https://schema.org", "@type": "Organization", "name": "Lunétoiles", "url": SITE, "logo": SITE + "/icon-512.png"}
APP = {"@context": "https://schema.org", "@type": "WebApplication", "name": "Lunétoiles", "url": SITE + "/ciel/", "applicationCategory": "EducationalApplication", "operatingSystem": "iOS, Android, Windows, macOS",
       "description": "Pointe ton téléphone vers le ciel : Lunétoiles affiche le nom des étoiles, des constellations et des planètes.", "inLanguage": "fr",
       "offers": [{"@type": "Offer", "price": "0", "priceCurrency": "EUR", "name": "Viseur gratuit"}, {"@type": "Offer", "price": "0.99", "priceCurrency": "EUR", "name": "Pass des étoiles"}]}

# ---------------------------------------------------------------- accueil
FAQ_COURTE = [
    ("C'est vraiment gratuit ?", "Oui. Le viseur, les 921 étoiles les plus brillantes, les 88 constellations, les planètes et la Lune sont gratuits, sans publicité et sans compte. Le Pass, l'Affiche et le Carnet des étoiles sont des achats uniques, facultatifs."),
    ("Faut-il installer une application ?", "Non. Lunétoiles s'ouvre dans le navigateur de ton téléphone. Pour l'avoir sous la main, ajoute-la à ton écran d'accueil : elle se lance alors comme une application, même avec peu de réseau."),
    ("Mes données partent quelque part ?", "Non. La caméra, l'orientation du téléphone et ta position servent uniquement sur ton téléphone, pour calculer le ciel. Rien n'est enregistré ni envoyé."),
]
def details(qs):
    return "".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in qs)

def offres4(titre_niv="h3"):
    h = titre_niv
    return f"""<div class="offres quatre">
<div class="offre" data-revele><span class="tag">Gratuit</span><{h}>Le viseur</{h}><p class="prix">0&nbsp;€</p><ul><li>921 étoiles brillantes</li><li>88 constellations et leurs tracés</li><li>Planètes, Lune et Soleil</li><li>Mode rouge pour la nuit</li></ul><a class="lien-sec" href="/ciel/">Ouvrir le ciel</a></div>
<div class="offre vedette" data-revele><span class="tag">Le plus utile</span><{h}>Pass des étoiles</{h}><p class="prix">0,99&nbsp;€ <small>une fois</small></p><ul><li>Les 5&nbsp;044 étoiles du catalogue</li><li>Le ciel à n'importe quelle date</li><li>Une flèche qui te guide vers l'astre</li><li>Heures de lever et de coucher</li></ul><a class="bouton" href="/ciel/?pass=1">Prendre le Pass</a></div>
<div class="offre" data-revele><span class="tag">Idée cadeau</span><{h}>Affiche des étoiles</{h}><p class="prix">4,99&nbsp;€ <small>l'affiche</small></p><ul><li>Le ciel exact d'une date et d'un lieu</li><li>Prénoms, titre, 4 styles</li><li>Fichier HD prêt à imprimer</li><li>Livré tout de suite</li></ul><a class="lien-sec" href="/affiche/">Créer une affiche</a></div>
<div class="offre" data-revele><span class="tag">Lancement</span><{h}>Carnet des étoiles</{h}><p class="prix">0,99&nbsp;€ <small>le PDF</small></p><ul><li>26 pages pour lire le ciel</li><li>Planches et cartes des saisons</li><li>Lune, planètes, étoiles filantes</li><li>Page de dédicace pour l'offrir</li></ul><a class="lien-sec" href="/carnet/">Voir le carnet</a></div>
</div>"""

PAGES.append(page("/", "Lunétoiles : pointe ton téléphone vers le ciel et reconnais les étoiles",
    "Le nom des étoiles, des constellations et des planètes, en direct sur l'écran de ton téléphone. Gratuit, dans le navigateur, sans inscription. Affiches du ciel et carnet à offrir.",
f"""<section class="heros"><div class="cadre">
<div>
<h1>Pointe ton téléphone vers le ciel.</h1>
<p class="chapo">Lunétoiles affiche le nom de chaque étoile, constellation et planète que tu regardes. Directement dans ton navigateur&nbsp;: rien à installer, pas de compte.</p>
<div class="boutons"><a class="bouton grand" href="/ciel/" data-son="ouvre">Ouvrir le ciel</a><a class="lien-sec" href="/affiche/">Offrir une Affiche des étoiles</a></div>
<p class="rassure">Gratuit. Marche sur iPhone et Android. Sur ordinateur, on fait glisser le ciel à la souris.</p>
</div>
<figure class="dome-cadre" style="margin:0">
<a class="dome-lien" href="/ciel/" data-son="ouvre" aria-label="Ouvrir le ciel en direct">
<canvas id="dome" role="img" aria-label="Carte du ciel réel au-dessus de Paris en ce moment, avec les étoiles, les constellations et les planètes"></canvas>
<span class="invite">Touche pour ouvrir le ciel</span></a>
<figcaption class="legende-dome"><span id="domeLieu">Le vrai ciel au-dessus de Paris, en ce moment.</span> <button type="button" id="maPos">Voir le ciel au-dessus de moi</button></figcaption>
</figure>
</div></section>

<section class="profond" aria-labelledby="t-cesoir"><div class="cadre cesoir">
<div class="texte" data-revele>
<h2 id="t-cesoir">Ce qui brille au-dessus de toi</h2>
<p class="chapo" style="margin-top:18px">Calculé à l'instant pour ta position. Touche une planète pour la retrouver dans le viseur.</p>
<p class="discret">Pas besoin d'un ciel parfait&nbsp;: les planètes et la Lune se voient même en ville.</p>
</div>
<div data-revele><p class="discret" id="ceSoirQuand" style="margin-bottom:10px">En ce moment</p><ul class="astres" id="astres" aria-live="polite"><li><span class="nom">…</span><span class="ou">Calcul du ciel en cours</span></li></ul></div>
</div></section>

<section aria-label="Le savais-tu"><div class="cadre">
<div class="savais" data-revele><span class="etiquette">Le savais-tu&nbsp;?</span><div><p id="fait" aria-live="polite"></p><button type="button" id="faitSuivant" data-son="clic">Une autre</button></div></div>
</div></section>

<section class="profond" aria-labelledby="t-comment"><div class="cadre">
<h2 id="t-comment" data-revele>Trois gestes, et le ciel a des noms</h2>
<ol class="etapes">
<li data-revele><h3>Ouvre Lunétoiles sur ton téléphone</h3><p class="discret">Pas d'application à télécharger. La page s'ouvre en quelques secondes, même dehors avec peu de réseau.</p></li>
<li data-revele><h3>Autorise la caméra et l'orientation</h3><p class="discret">Lunétoiles s'en sert seulement pour savoir où pointe ton téléphone. Rien n'est enregistré ni envoyé.</p></li>
<li data-revele><h3>Lève le bras</h3><p class="discret">Les noms apparaissent par-dessus le vrai ciel. Touche une étoile ou une planète pour en savoir plus.</p></li>
</ol>
<p style="margin-top:36px" data-revele><a class="bouton" href="/ciel/" data-son="ouvre">Essayer maintenant</a></p>
</div></section>

<section aria-labelledby="t-poster"><div class="cadre poster-bloc">
<div class="encadre" data-revele style="max-width:420px;justify-self:center;width:100%;transform:rotate(-1.2deg)"><div class="passe"><canvas id="posterEx" role="img" aria-label="Exemple d'Affiche des étoiles : le ciel de Paris le 14 février 2026 à 21 h 30"></canvas></div></div>
<div class="texte" data-revele>
<h2 id="t-poster">Le cadeau qu'on n'attend pas&nbsp;: le ciel de leur jour</h2>
<p class="chapo" style="margin-top:18px">Votre rencontre, la naissance d'un enfant, un mariage, des 18 ans&nbsp;: Lunétoiles recalcule le ciel exact de ce soir-là, au-dessus de ce lieu-là.</p>
<p class="discret">Tu ajoutes les prénoms et un titre, tu choisis un style, et tu reçois tout de suite une affiche en haute définition à imprimer et encadrer. Parfait en cadeau de dernière minute.</p>
<p class="prix">4,99&nbsp;€ <small>l'Affiche des étoiles en HD</small></p>
<div class="boutons"><a class="bouton" href="/affiche/">Créer mon affiche</a><span class="discret petit">Aperçu gratuit avant de payer.</span></div>
</div>
</div></section>

<section class="profond" aria-labelledby="t-planche"><div class="cadre planche">
<div class="texte" data-revele>
<h2 id="t-planche">Un atlas qui tient dans la poche</h2>
<p class="chapo" style="margin-top:18px">921 étoiles brillantes, les 88 constellations avec leurs tracés, les planètes jusqu'à Neptune, la Lune et sa phase.</p>
<p class="discret">Les positions sont recalculées en continu à partir des modèles astronomiques de référence. Avec le Pass des étoiles, tu passes aux 5&nbsp;044 étoiles du catalogue et tu peux voyager dans le temps&nbsp;: le ciel de ta naissance, celui de la prochaine pluie d'étoiles filantes.</p>
</div>
<figure style="margin:0" data-revele><canvas id="planche" width="1040" height="1040" role="img" aria-label="Planche de la Grande Ourse, avec ses étoiles principales et leurs noms"></canvas><figcaption>La Grande Ourse, telle que la dessine Lunétoiles.</figcaption></figure>
</div></section>

<section aria-labelledby="t-carnet"><div class="cadre carnet-heros">
<img src="/assets/img/carnet/couverture.webp" width="520" height="738" alt="Couverture du Carnet des étoiles" loading="lazy" data-revele>
<div class="texte" data-revele>
<h2 id="t-carnet">Le Carnet des étoiles, à garder ou à offrir</h2>
<p class="chapo" style="margin-top:18px">26 pages pour apprendre à lire le ciel à l'œil nu&nbsp;: six constellations à connaître, le ciel des quatre saisons, la Lune, les planètes, les étoiles filantes.</p>
<div class="prix-lancement"><p class="prix">0,99&nbsp;€</p><span class="badge">Prix de lancement</span></div>
<div class="boutons"><a class="bouton" href="/carnet/">Découvrir le carnet</a><span class="discret petit">PDF à télécharger tout de suite, avec une page de dédicace.</span></div>
</div>
</div></section>

<section class="profond" aria-labelledby="t-offres"><div class="cadre">
<h2 id="t-offres" data-revele>Gratuit pour regarder. Moins d'un euro pour aller plus loin.</h2>
{offres4()}
</div></section>

<section aria-labelledby="t-faq"><div class="cadre">
<h2 id="t-faq" data-revele>Avant de lever les yeux</h2>
<div class="questions" style="margin-top:28px">{details(FAQ_COURTE)}</div>
<p style="margin-top:26px"><a href="/faq/">Toutes les questions</a></p>
</div></section>
<div class="barre-mobile"><a class="bouton" href="/ciel/" data-son="ouvre">Ouvrir le ciel</a></div>""",
    scripts=["/assets/js/home.js"], ld=[ORG, APP], body_cls="a-barre", astro=True))

# ---------------------------------------------------------------- viseur
ICON = {
 "cherche": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 "temps": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 "rouge": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
 "photo": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
 "reglages": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="7" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="10" cy="17" r="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
 "calage": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
}
PAGES.append(page("/ciel/", "Ouvrir le ciel : le viseur d'étoiles de Lunétoiles",
    "Pointe ton téléphone vers le ciel : les noms des étoiles, constellations et planètes s'affichent en direct. Gratuit, sans inscription.",
f"""<video id="cam" playsinline muted autoplay aria-hidden="true"></video>
<canvas id="ciel" role="img" aria-label="Le ciel en direct dans la direction où pointe ton téléphone. La liste des astres est disponible avec le bouton Chercher."></canvas>
<div class="reticule" aria-hidden="true"></div>
<header class="app-haut">
<a class="marque" href="/" aria-label="Lunétoiles, retour à l'accueil">{LOGO}<span class="sr">Lunétoiles</span></a>
<div class="outils" role="toolbar" aria-label="Outils du viseur">
<button class="outil" id="btnRecherche" type="button">{ICON['cherche']}<span>Chercher</span></button>
<button class="outil" id="btnTemps" type="button">{ICON['temps']}<span>Temps</span></button>
<button class="outil" id="btnRouge" type="button" aria-pressed="false">{ICON['rouge']}<span>Rouge</span></button>
<button class="outil" id="btnCapture" type="button">{ICON['photo']}<span>Partager</span></button>
<button class="outil" id="btnCalage" type="button" aria-pressed="false" hidden>{ICON['calage']}<span>Recaler</span></button>
<button class="outil" id="btnReglages" type="button">{ICON['reglages']}<span>Réglages</span></button>
</div>
</header>
<button class="bandeau-temps" id="bandeauTemps" type="button" hidden></button>
<div class="vise" id="vise" aria-live="polite"></div>
<div class="fleche" id="fleche" hidden><svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="26" fill="rgba(10,24,52,.85)" stroke="#ee5a43" stroke-width="2"/><path d="M18 28h18M30 20l8 8-8 8" fill="none" stroke="#f4efe2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span></div>
<div class="fiche" id="fiche" hidden aria-live="polite"></div>
<div class="calage" id="calage" hidden><p style="margin:0 0 8px">Fais glisser le ciel à gauche ou à droite pour l'aligner sur la Lune ou une étoile brillante que tu vois.</p><div class="ligne-temps" style="justify-content:center;margin:0"><button type="button" id="calageZero">Remettre à zéro</button><button type="button" id="calageOk">C'est aligné</button></div></div>

<section class="panneau" id="recherche" hidden aria-labelledby="t-rech"><button class="ferme" type="button" aria-label="Fermer">×</button>
<h2 id="t-rech">Chercher un astre</h2>
<label class="sr" for="filtre">Nom de l'astre</label><input class="filtre" id="filtre" type="search" placeholder="Saturne, Véga, Orion…" autocomplete="off">
<ul class="liste" id="liste"></ul></section>

<section class="panneau" id="temps" hidden aria-labelledby="t-temps"><button class="ferme" type="button" aria-label="Fermer">×</button>
<h2 id="t-temps">Voyager dans le temps</h2>
<label class="sr" for="quand">Date et heure</label><input class="filtre" id="quand" type="datetime-local">
<div class="ligne-temps"><button type="button" data-dt="-24">− 1 jour</button><button type="button" data-dt="-1">− 1 h</button><button type="button" data-dt="1">+ 1 h</button><button type="button" data-dt="24">+ 1 jour</button></div>
<button class="bouton petit" type="button" id="maintenant">Revenir à maintenant</button></section>

<section class="panneau" id="reglages" hidden aria-labelledby="t-reg"><button class="ferme" type="button" aria-label="Fermer">×</button>
<h2 id="t-reg">Réglages</h2>
<label class="reglage"><span>Image de la caméra</span><input type="checkbox" id="rCam"></label>
<label class="reglage"><span>Tracés des constellations</span><input type="checkbox" id="rLignes"></label>
<label class="reglage"><span>Noms</span><input type="checkbox" id="rNoms"></label>
<label class="reglage"><span>Étoiles faibles (Pass des étoiles)</span><input type="checkbox" id="rFaibles"></label>
<div class="reglage"><span>Sons</span><button class="lien-btn" type="button" id="btnSon" aria-pressed="true">Couper</button></div>
<label class="reglage"><span>Champ de vision</span><input type="range" id="rZoom" min="18" max="110" step="1"></label>
<div class="reglage"><span>Ciel vu depuis <span id="rLieu"></span></span><button class="lien-btn" type="button" id="rPos">Ma position</button></div>
<p class="petit discret" style="margin-top:14px">Noms décalés&nbsp;? Éloigne-toi des objets métalliques, fais un grand huit avec ton téléphone pour réveiller la boussole, puis utilise « Recaler ». Déjà acheté le Pass ailleurs&nbsp;? <a href="/restaurer/">Récupère-le</a>.</p>
<a class="cadeau-lien" href="/carnet/"><b>Le Carnet des étoiles à offrir</b>26 pages pour apprendre à lire le ciel, 0,99&nbsp;€.</a></section>

<aside class="carte-offre" id="offrePoster" hidden aria-label="Proposition"><button class="ferme" type="button" aria-label="Fermer">×</button>
<p>Un ciel qui compte pour toi&nbsp;? Lunétoiles redessine celui d'une rencontre ou d'une naissance, en Affiche des étoiles à offrir.</p><a class="bouton petit" href="/affiche/">Créer une affiche</a></aside>

<div class="rouge" id="rouge" hidden></div>
<div class="depart" id="depart"><div class="in">
<h1>Le ciel a des noms.</h1>
<p class="chapo" id="depTexte">Pointe ton téléphone vers le ciel&nbsp;: Lunétoiles affiche le nom de ce que tu regardes.</p>
<ul><li>Ta position, pour savoir quel ciel tu as au-dessus de toi</li><li>L'orientation du téléphone, pour savoir où tu vises</li><li>La caméra, pour voir les noms par-dessus le vrai ciel (facultatif)</li></ul>
<p class="petit discret">Tout reste dans ton téléphone. Rien n'est enregistré ni envoyé.</p>
<div class="boutons"><button class="bouton grand" type="button" id="btnGo">Commencer</button><button class="lien-btn" type="button" id="btnGlisser">Explorer sans capteurs</button></div>
<p class="msg" id="depMsg" role="alert"></p>
</div></div>""",
    scripts=["/assets/js/ciel.js"], extra_css="ciel.css", ld=[APP], body_cls="app", bare=True, astro=True))

# ---------------------------------------------------------------- affiche des étoiles
FAQ_AFFICHE = [
    ("Qu'est-ce que je reçois exactement ?", "Un fichier image en haute définition (PNG, 3000 × 4243 pixels), sans filigrane, qui représente le ciel réel à la date, à l'heure et au lieu choisis, avec ton titre et tes prénoms. Tu le télécharges juste après le paiement."),
    ("Le cadre et l'impression sont-ils compris ?", "Non : tu reçois le fichier. Tu l'imprimes chez toi, chez un imprimeur ou dans une borne photo, puis tu l'encadres. Le format correspond aux feuilles A4 et A3 et s'adapte à un cadre 30 × 40 cm."),
    ("Le ciel est-il vraiment exact ?", "Oui. Les étoiles et les planètes sont placées à leur vraie position pour ce moment-là, en tenant compte du fuseau horaire et de l'heure d'été du lieu. C'est un vrai calcul astronomique, pas un dessin au hasard."),
    ("Je n'ai pas l'heure exacte, c'est grave ?", "Non. Mets une heure approximative, le soir par exemple : le ciel tourne lentement, une heure de différence décale un peu les étoiles sans changer l'esprit de l'affiche."),
    ("Je peux la retélécharger plus tard ?", "Oui. Sur la page Récupérer un achat, indique l'e-mail utilisé pour payer : tu reçois un lien pour retélécharger ton affiche."),
]
PAGES.append(page("/affiche/", "Affiche des étoiles : le ciel exact d'une rencontre, d'une naissance ou d'un mariage",
    "Offre le ciel tel qu'il était au-dessus de vous un jour qui compte : rencontre, naissance, mariage, anniversaire. Affiche personnalisée en HD, aperçu gratuit, 4,99 €.",
f"""<div class="cadre page-tete"><h1>Offre le ciel d'un jour qui compte</h1>
<p class="chapo">Une affiche du vrai ciel, tel qu'il était au-dessus de vous à la date et au lieu de ton choix&nbsp;: une rencontre, une naissance, un mariage, un anniversaire.</p>
<ul class="points">
<li data-revele><h3>Le ciel exact</h3><p class="discret">Les étoiles et les planètes à leur vraie place ce soir-là, au-dessus de ce lieu-là, fuseau horaire compris.</p></li>
<li data-revele><h3>À votre nom</h3><p class="discret">Un titre, des prénoms, la date et le lieu, et quatre styles pour l'accorder à votre intérieur.</p></li>
<li data-revele><h3>Prêt à offrir ce soir</h3><p class="discret">Le fichier HD arrive tout de suite après le paiement. Tu l'imprimes en A4 ou en A3 et tu l'encadres.</p></li>
</ul></div>
<div class="cadre atelier" id="creer">
<div>
<p class="discret" style="margin-bottom:10px">Pour quelle occasion&nbsp;?</p>
<div class="puces" role="group" aria-label="Occasion">
<button type="button" class="puce" data-occ="rencontre" aria-pressed="false">Une rencontre</button>
<button type="button" class="puce" data-occ="naissance" aria-pressed="false">Une naissance</button>
<button type="button" class="puce" data-occ="mariage" aria-pressed="false">Un mariage</button>
<button type="button" class="puce" data-occ="anniversaire" aria-pressed="false">Un anniversaire</button>
<button type="button" class="puce" data-occ="souvenir" aria-pressed="false">Un souvenir</button>
</div>
<div class="champ"><label for="pTitre">Titre</label><input id="pTitre" maxlength="70" placeholder="La nuit où tout a commencé"></div>
<div class="champ"><label for="pSous">Prénoms ou sous-titre (facultatif)</label><input id="pSous" maxlength="60" placeholder="Léa &amp; Sami"></div>
<div class="duo"><div class="champ"><label for="pDate">Date</label><input id="pDate" type="date" min="1800-01-01" max="2200-12-31"></div>
<div class="champ"><label for="pHeure">Heure, sur place</label><input id="pHeure" type="time"></div></div>
<form class="champ" id="formLieu"><label for="pLieu">Lieu</label><div class="lieu-ligne"><input id="pLieu" autocomplete="off" placeholder="Ville, adresse…"><button class="bouton" type="button" id="btnLieu">Chercher</button></div>
<ul class="lieux" id="lieux" aria-live="polite"></ul><button type="button" class="lien-btn petit" id="maPosition" style="background:none;border:0;color:var(--etoile);text-decoration:underline;text-decoration-color:var(--laiton);cursor:pointer;padding:6px 0;align-self:flex-start;font:inherit;font-size:15px">Utiliser ma position</button></form>
<fieldset class="champ" style="border:0;padding:0;margin:0 0 24px"><legend style="font-weight:700;font-size:16px;margin-bottom:10px">Style</legend><div class="themes" id="themes"></div></fieldset>
<div class="achat-ligne"><p class="prix">4,99&nbsp;€</p><button class="bouton grand" type="button" id="btnAcheter">Recevoir mon affiche en HD</button></div>
<p class="msg" id="msgAchat"></p>
<p class="petit discret">Fichier PNG 3000 × 4243 pixels, sans filigrane. Impression et cadre non fournis. Paiement par carte, Apple Pay ou Google Pay.</p>
</div>
<div><div class="encadre apercu-cadre"><div class="passe"><canvas id="apercu" role="img" aria-label="Aperçu de ton affiche"></canvas></div></div><p class="discret petit" id="apercuTxt" style="margin-top:12px" aria-live="polite"></p></div>
</div>
<section class="profond" aria-labelledby="t-ex"><div class="cadre">
<h2 id="t-ex" data-revele>Trois histoires, trois ciels</h2>
<div class="galerie">
<figure data-revele><div class="encadre"><div class="passe"><canvas id="ex1" role="img" aria-label="Exemple : naissance à Lyon"></canvas></div></div><figcaption><b>Une naissance</b><span>Le ciel de Lyon, la nuit où Léon est né</span></figcaption></figure>
<figure data-revele><div class="encadre"><div class="passe"><canvas id="ex2" role="img" aria-label="Exemple : mariage à Bordeaux"></canvas></div></div><figcaption><b>Un mariage</b><span>Le ciel de Bordeaux, le soir du oui</span></figcaption></figure>
<figure data-revele><div class="encadre"><div class="passe"><canvas id="ex3" role="img" aria-label="Exemple : rencontre à Paris"></canvas></div></div><figcaption><b>Une rencontre</b><span>Le ciel de Paris, le soir du premier rendez-vous</span></figcaption></figure>
</div>
<p style="margin-top:40px;text-align:center" data-revele><a class="bouton" href="#creer">Créer la nôtre</a></p>
</div></section>
<section aria-labelledby="t-faq-a"><div class="cadre"><h2 id="t-faq-a" data-revele>Questions sur l'affiche</h2><div class="questions" style="margin-top:28px">{details(FAQ_AFFICHE)}</div></div></section>""",
    scripts=["/assets/js/poster.js"], astro=True, ld=[{"@context": "https://schema.org", "@type": "Product", "name": "Affiche des étoiles (fichier HD personnalisé)", "description": "Le ciel exact d'une date et d'un lieu, personnalisé, en fichier haute définition à imprimer.", "brand": {"@type": "Brand", "name": "Lunétoiles"}, "offers": {"@type": "Offer", "price": "4.99", "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": SITE + "/affiche/"}},
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ_AFFICHE]}]))

# ---------------------------------------------------------------- carnet des étoiles
FAQ_CARNET = [
    ("Sous quelle forme est le carnet ?", "Un fichier PDF de 26 pages au format A5. Il se lit très bien sur un téléphone ou une tablette, et s'imprime sur des feuilles A4 (deux pages par feuille) ou A5."),
    ("Comment l'offrir ?", "La deuxième page est une dédicace à remplir : « Ce carnet est offert à… par… le… ». Imprime-le, ou envoie simplement le PDF à la personne."),
    ("C'est pour quel âge ?", "Pour toute personne curieuse du ciel, à partir d'une dizaine d'années, et pour les parents qui veulent observer avec leurs enfants. Aucune connaissance n'est nécessaire."),
    ("Je le reçois quand ?", "Tout de suite après le paiement, en téléchargement. Tu peux le retélécharger plus tard avec l'e-mail utilisé pour payer."),
]
PAGES.append(page("/carnet/", "Le Carnet des étoiles : 26 pages pour apprendre à lire le ciel (PDF à offrir)",
    "Un livre numérique de 26 pages pour reconnaître les constellations, suivre la Lune et les planètes et observer les étoiles filantes. Page de dédicace pour l'offrir. 0,99 € au lancement.",
f"""<div class="cadre page-tete carnet-heros">
<img src="/assets/img/carnet/couverture.webp" width="520" height="738" alt="Couverture du Carnet des étoiles : le ciel de Noël dessiné en carte">
<div>
<h1>Le Carnet des étoiles</h1>
<p class="chapo">26 pages pour apprendre à lire le ciel à l'œil nu, à garder pour soi ou à offrir.</p>
<div class="prix-lancement"><p class="prix">0,99&nbsp;€</p><span class="badge">Prix de lancement</span></div>
<div class="boutons"><button class="bouton grand" type="button" id="btnCarnet">Recevoir le carnet</button></div>
<p class="msg" id="msgCarnet" role="status"></p>
<p class="discret petit" style="margin-top:14px">PDF téléchargeable tout de suite après le paiement. Carte bancaire, Apple Pay ou Google Pay.</p>
</div></div>
<section class="profond" aria-labelledby="t-dedans"><div class="cadre">
<h2 id="t-dedans" data-revele>Ce qu'il y a dedans</h2>
<div class="feuilles">
<img src="/assets/img/carnet/dedicace.webp" width="400" height="568" alt="Page de dédicace à remplir" loading="lazy" data-revele>
<img src="/assets/img/carnet/grande-ourse.webp" width="400" height="568" alt="Planche de la Grande Ourse" loading="lazy" data-revele>
<img src="/assets/img/carnet/ciel-hiver.webp" width="400" height="568" alt="Carte du ciel d'hiver" loading="lazy" data-revele>
<img src="/assets/img/carnet/lune.webp" width="400" height="568" alt="Les phases de la Lune" loading="lazy" data-revele>
</div>
<ol class="sommaire" style="margin-top:40px" data-revele>
<li>Avant de lever les yeux&nbsp;: préparer ses yeux et choisir son coin de ciel</li>
<li>Le ciel tourne&nbsp;: la Polaire et les étoiles qui ne se couchent jamais</li>
<li>Lire l'éclat d'une étoile, avec les plus brillantes vues de France</li>
<li>Couleurs et distances&nbsp;: regarder le ciel, c'est regarder le passé</li>
<li>Six formes à connaître, en planches dessinées</li>
<li>Le ciel des quatre saisons, en cartes</li>
<li>La Lune et ses phases</li>
<li>Les planètes visibles à l'œil nu</li>
<li>Étoiles filantes et autres merveilles</li>
<li>Petit lexique</li>
<li>Carnet d'observation à remplir</li>
</ol>
</div></section>
<section aria-labelledby="t-qui"><div class="cadre"><div class="prose">
<h2 id="t-qui" data-revele>Un cadeau pour qui&nbsp;?</h2>
<p data-revele>Pour un enfant qui pose mille questions sur la Lune. Pour un couple qui aime les nuits d'été dehors. Pour un parent qui veut montrer la Grande Ourse à ses enfants. Pour toi, tout simplement, la prochaine fois que tu lèveras les yeux.</p>
<p data-revele>Et avec le viseur gratuit de Lunétoiles, chaque page devient un exercice pratique&nbsp;: tu lis, tu sors, tu pointes ton téléphone, tu trouves.</p>
</div>
<div class="questions" style="margin-top:36px">{details(FAQ_CARNET)}</div>
</div></section>""",
    scripts=["/assets/js/carnet.js"], ld=[{"@context": "https://schema.org", "@type": "Book", "name": "Le Carnet des étoiles", "bookFormat": "https://schema.org/EBook", "numberOfPages": 26, "inLanguage": "fr", "author": {"@type": "Organization", "name": "Lunétoiles"}, "offers": {"@type": "Offer", "price": "0.99", "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": SITE + "/carnet/"}},
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ_CARNET]}]))

# ---------------------------------------------------------------- tarifs
PAGES.append(page("/tarifs/", "Tarifs de Lunétoiles : viseur gratuit, Pass à 0,99 €, Affiche à 4,99 €, Carnet à 0,99 €",
    "Le viseur d'étoiles est gratuit. Pass des étoiles 0,99 €, Affiche des étoiles 4,99 €, Carnet des étoiles 0,99 €. Paiements uniques, sans abonnement, sans compte.",
f"""<div class="cadre page-tete"><h1>Des prix simples, sans abonnement</h1>
<p class="chapo">Regarder le ciel est gratuit. Tu paies une seule fois ce que tu veux en plus, et c'est tout.</p></div>
<div class="cadre" style="padding-bottom:clamp(56px,8vw,110px)">
{offres4("h2")}
<div class="prose" style="margin-top:56px" data-revele>
<h2>Bon à savoir</h2>
<p>Les prix sont affichés toutes taxes comprises. Le paiement passe par Stripe, par carte bancaire, Apple Pay ou Google Pay selon ton appareil&nbsp;: Lunétoiles ne voit jamais les numéros de carte. Les options se cumulent dans un même paiement, au même prix.</p>
<p>Comme il n'y a pas de compte, tes achats sont gardés sur ton appareil. Si tu changes de téléphone ou vides ton navigateur, tu les récupères en quelques secondes avec l'e-mail utilisé pour payer, depuis la page <a href="/restaurer/">Récupérer un achat</a>.</p>
<p>Les achats sont des contenus numériques livrés immédiatement&nbsp;: au moment de payer, tu acceptes cette livraison immédiate et tu renonces au droit de rétractation. Si quelque chose ne marche pas, <a href="/contact/">écris-nous</a>, on trouve une solution.</p>
</div></div>""", ld=[ORG]))

# ---------------------------------------------------------------- guides
GUIDES = [
  ("reconnaitre-les-constellations", "Reconnaître les constellations quand on débute",
   "Par où commencer pour reconnaître les constellations à l'œil nu : les repères faciles, l'ordre conseillé et les erreurs à éviter.",
   """<p>Le ciel paraît d'abord plein de points tous pareils. En réalité, quelques formes très reconnaissables servent de repères, et toutes les autres se trouvent à partir d'elles. Voici l'ordre qui marche le mieux.</p>
<h2>1. Commence par la Grande Ourse</h2>
<p>Sept étoiles assez brillantes dessinent une grande casserole. Depuis la France, elle ne se couche jamais&nbsp;: elle tourne autour du nord toute l'année. Au printemps elle est haute dans le ciel, en automne elle frôle l'horizon nord.</p>
<h2>2. Trouve l'étoile Polaire</h2>
<p>Prolonge le bord de la casserole opposé au manche, environ cinq fois sa longueur&nbsp;: tu tombes sur une étoile seule, pas très brillante. C'est la Polaire, au bout de la Petite Ourse. Elle indique le nord à moins d'un degré près. <a href="/guides/trouver-etoile-polaire/">Le détail est dans ce guide</a>.</p>
<h2>3. Passe au W de Cassiopée</h2>
<p>De l'autre côté de la Polaire par rapport à la Grande Ourse, cinq étoiles forment un W ou un M selon la saison. C'est un excellent repère en automne et en hiver.</p>
<h2>4. En hiver, Orion</h2>
<p>Trois étoiles alignées et serrées au milieu d'un grand rectangle&nbsp;: la ceinture d'Orion est la forme la plus facile du ciel d'hiver. Bételgeuse, orangée, et Rigel, bleutée, sont aux coins opposés. En prolongeant la ceinture vers le bas à gauche, tu trouves Sirius, l'étoile la plus brillante de la nuit.</p>
<h2>5. En été, le triangle d'été</h2>
<p>Trois étoiles très brillantes forment un grand triangle presque au-dessus de ta tête&nbsp;: Véga dans la Lyre, Déneb dans le Cygne et Altaïr dans l'Aigle. Une fois ce triangle trouvé, le Cygne se dessine comme une grande croix le long de la Voie lactée.</p>
<h2>Les erreurs classiques</h2>
<ul><li><strong>Chercher trop petit.</strong> Les constellations sont plus grandes qu'on ne l'imagine&nbsp;: la Grande Ourse fait à peu près la largeur de deux mains tendues à bout de bras.</li>
<li><strong>Prendre une planète pour une étoile.</strong> Un point très brillant qui ne scintille presque pas est souvent Vénus, Jupiter ou Saturne.</li>
<li><strong>Regarder son téléphone en plein écran blanc.</strong> Il faut une vingtaine de minutes pour que les yeux s'habituent au noir. Le mode rouge de Lunétoiles est fait pour ça.</li></ul>
<p class="note">Pour t'entraîner, ouvre <a href="/ciel/">le viseur</a> et vise une étoile brillante&nbsp;: Lunétoiles affiche son nom et la constellation à laquelle elle appartient.</p>"""),
  ("etoile-du-berger", "L'étoile du berger n'est pas une étoile",
   "L'étoile du berger, ce point très brillant le soir ou le matin, est en réalité la planète Vénus. Pourquoi elle brille autant et quand la voir.",
   """<p>Ce point très lumineux qui apparaît juste après le coucher du soleil, parfois avant toutes les étoiles, porte un joli nom&nbsp;: l'étoile du berger. Pourtant ce n'est pas une étoile. C'est Vénus, la planète la plus proche de la Terre.</p>
<h2>Pourquoi elle brille autant</h2>
<p>Vénus est entourée d'épais nuages qui renvoient une grande partie de la lumière du Soleil. Elle passe aussi relativement près de nous. Résultat&nbsp;: après le Soleil et la Lune, c'est l'astre le plus brillant du ciel, au point d'être parfois visible en plein jour quand on sait exactement où regarder.</p>
<h2>Le soir ou le matin, jamais au milieu de la nuit</h2>
<p>Vénus tourne autour du Soleil plus près que nous. Vue depuis la Terre, elle ne s'en éloigne donc jamais beaucoup&nbsp;: on la voit soit à l'ouest après le coucher du Soleil, soit à l'est avant son lever. D'où son nom&nbsp;: c'était l'astre qui accompagnait les bergers quand ils rentraient ou partaient avec leurs troupeaux.</p>
<h2>Comment la reconnaître</h2>
<ul><li>Elle est beaucoup plus brillante que toutes les étoiles autour.</li>
<li>Elle scintille très peu, contrairement aux étoiles proches de l'horizon.</li>
<li>Elle est basse, près de l'endroit où le Soleil vient de se coucher ou va se lever.</li></ul>
<p>Selon les périodes, Vénus peut disparaître du ciel pendant quelques semaines, quand elle passe du côté du Soleil.</p>
<p class="note">Pour savoir si Vénus est visible ce soir et dans quelle direction, regarde la liste « Ce qui brille au-dessus de toi » sur <a href="/">l'accueil</a>, ou cherche « Vénus » dans <a href="/ciel/">le viseur</a>.</p>"""),
  ("etoiles-filantes", "Voir des étoiles filantes : les meilleures nuits de l'année",
   "Les grandes pluies d'étoiles filantes de l'année (Perséides, Géminides, Quadrantides…), comment les observer et à quelle heure.",
   """<p>Des étoiles filantes passent toutes les nuits, mais certaines nuits elles sont bien plus nombreuses. Ces «&nbsp;pluies&nbsp;» reviennent chaque année aux mêmes dates, quand la Terre traverse les poussières laissées par une comète.</p>
<h2>Les rendez-vous de l'année</h2>
<ul><li><strong>Début janvier, les Quadrantides.</strong> Un maximum très court, de quelques heures, souvent assez intense. Il fait froid, mais les nuits sont longues.</li>
<li><strong>Fin avril, les Lyrides.</strong> Une pluie modeste, qui réserve parfois de bonnes surprises.</li>
<li><strong>Début mai, les Êta Aquarides.</strong> Plus belles depuis l'hémisphère Sud, discrètes depuis la France.</li>
<li><strong>Mi-août, les Perséides.</strong> La plus célèbre&nbsp;: nuits douces, plusieurs dizaines d'étoiles filantes par heure dans un ciel bien noir, autour du 12 et du 13 août.</li>
<li><strong>Fin octobre, les Orionides.</strong> Des météores rapides, liés à la comète de Halley.</li>
<li><strong>Mi-novembre, les Léonides.</strong> Généralement calmes, avec des sursauts certaines années.</li>
<li><strong>Mi-décembre, les Géminides.</strong> Souvent la plus généreuse de l'année, autour du 13 et du 14 décembre, avec des météores lents et brillants.</li></ul>
<h2>Bien observer</h2>
<ul><li><strong>Fuis les lumières.</strong> Quelques kilomètres hors de la ville changent tout.</li>
<li><strong>Attends après minuit.</strong> Pour la plupart des pluies, la deuxième moitié de la nuit est la meilleure.</li>
<li><strong>Allonge-toi et regarde large.</strong> Pas besoin de jumelles ni de télescope&nbsp;: les étoiles filantes partent dans toutes les directions.</li>
<li><strong>Surveille la Lune.</strong> Une pleine Lune efface les plus faibles. Le voyage dans le temps du Pass des étoiles montre où elle sera la nuit choisie.</li>
<li><strong>Laisse tes yeux s'habituer.</strong> Vingt minutes sans écran blanc, ou le mode rouge de Lunétoiles.</li></ul>
<p class="note">Les nombres annoncés à la télévision correspondent à un ciel parfait, le radiant au zénith. Dans la réalité, compte souvent deux à quatre fois moins, ce qui reste un très beau spectacle.</p>"""),
  ("trouver-etoile-polaire", "Trouver l'étoile Polaire en trente secondes",
   "La méthode simple pour trouver l'étoile Polaire et le nord à partir de la Grande Ourse, en toute saison.",
   """<p>L'étoile Polaire n'est pas l'étoile la plus brillante du ciel, contrairement à une idée reçue. Elle est en revanche presque immobile&nbsp;: toute la nuit, tout le ciel semble tourner autour d'elle. C'est pour ça qu'elle indique le nord.</p>
<h2>La méthode de la casserole</h2>
<ol><li>Trouve la Grande Ourse, la grande casserole de sept étoiles.</li>
<li>Repère les deux étoiles du bord de la casserole, à l'opposé du manche. Elles s'appellent Merak et Dubhe.</li>
<li>Trace une ligne de Merak vers Dubhe et prolonge-la d'environ cinq fois la distance entre les deux.</li>
<li>Tu arrives sur une étoile isolée, moyennement brillante&nbsp;: c'est la Polaire.</li></ol>
<h2>Si la Grande Ourse est cachée</h2>
<p>En automne, la Grande Ourse est basse et peut se cacher derrière les arbres ou les immeubles. Utilise alors Cassiopée, le grand W de l'autre côté du pôle&nbsp;: la Polaire se trouve à peu près à mi-chemin entre Cassiopée et la Grande Ourse.</p>
<h2>Un bonus pour les curieux</h2>
<p>La hauteur de la Polaire au-dessus de l'horizon est presque égale à ta latitude. À Paris, elle est à environ 49 degrés de hauteur. À Marseille, autour de 43. Sur l'équateur, elle touche l'horizon.</p>
<p class="note">Dans <a href="/ciel/">le viseur</a>, cherche « Étoile polaire »&nbsp;: avec le Pass des étoiles, une flèche te guide jusqu'à elle.</p>"""),
]
for slug, titre, desc, corps in GUIDES:
    PAGES.append(page(f"/guides/{slug}/", f"{titre} | Lunétoiles", desc,
        f"""<article class="cadre"><header class="page-tete"><p><a href="/guides/">Guides</a></p><h1>{titre}</h1></header>
<div class="prose" style="padding-bottom:clamp(56px,8vw,110px)">{corps}
<p style="margin-top:40px"><a class="bouton" href="/ciel/">Ouvrir le ciel</a></p></div></article>""",
        ld=[{"@context": "https://schema.org", "@type": "Article", "headline": titre, "description": desc, "inLanguage": "fr", "datePublished": TODAY, "dateModified": TODAY, "author": {"@type": "Organization", "name": "Lunétoiles"}, "publisher": {"@type": "Organization", "name": "Lunétoiles", "logo": {"@type": "ImageObject", "url": SITE + "/icon-512.png"}}, "mainEntityOfPage": SITE + f"/guides/{slug}/"}]))

PAGES.append(page("/guides/", "Guides pour observer le ciel | Lunétoiles",
    "Reconnaître les constellations, trouver l'étoile Polaire, voir les étoiles filantes : des guides simples pour observer le ciel à l'œil nu.",
    """<div class="cadre page-tete"><h1>Apprendre le ciel</h1><p class="chapo">Des guides courts, pour observer à l'œil nu, sans matériel.</p></div>
<div class="cadre" style="padding-bottom:clamp(56px,8vw,110px)"><ul class="cartes-guides">""" +
    "".join(f'<li><a href="/guides/{s}/"><h2>{t}</h2><p class="discret">{d}</p></a></li>' for s, t, d, _ in GUIDES) + "</ul></div>", ld=[ORG]))

# ---------------------------------------------------------------- FAQ
FAQ = FAQ_COURTE + [
  ("Pourquoi les noms sont parfois un peu décalés ?", "Lunétoiles se sert de la boussole du téléphone, qui peut être perturbée par du métal, une coque aimantée ou des appareils électriques. Éloigne-toi de ces objets, fais un grand huit avec ton téléphone pour la réveiller, puis utilise le bouton « Recaler » pour aligner le ciel sur la Lune ou une étoile brillante."),
  ("Ça marche en ville ?", "Oui. En ville tu verras surtout les étoiles les plus brillantes, les planètes et la Lune, et c'est justement ce que Lunétoiles montre en priorité. Les étoiles faibles demandent un ciel noir, loin des lumières."),
  ("Et sur ordinateur ?", "Sur ordinateur, il n'y a ni boussole ni gyroscope : tu explores le ciel en le faisant glisser à la souris, et tu zoomes avec la molette."),
  ("Le Pass des étoiles est-il un abonnement ?", "Non. Le Pass des étoiles coûte 0,99 € une seule fois, pour toujours. Aucun prélèvement ensuite. C'est pareil pour l'Affiche et le Carnet des étoiles : un paiement unique."),
  ("Comment je reçois ce que j'achète, sans compte ?", "Juste après le paiement, tu reviens sur Lunétoiles : le Pass s'active sur ton appareil, et l'affiche ou le carnet se téléchargent tout de suite. Stripe garde la preuve de ton achat, ce qui permet de tout récupérer plus tard avec ton e-mail."),
  ("J'ai changé de téléphone, comment récupérer mes achats ?", "Va sur la page Récupérer un achat et indique l'e-mail utilisé pour payer. Tu reçois un lien qui réactive le Pass et te permet de retélécharger tes affiches et ton carnet."),
  ("Quel format pour l'affiche ?", "Un fichier PNG de 3000 × 4243 pixels, au format A (celui des feuilles A4 et A3). Il s'imprime très bien en A4 ou en A3, et s'adapte à un cadre 30 × 40 cm."),
  ("Le ciel de l'affiche est-il exact ?", "Oui : Lunétoiles calcule la position réelle des étoiles et des planètes pour la date, l'heure et le lieu choisis, en tenant compte du fuseau horaire et de l'heure d'été du lieu."),
  ("Peut-on acheter une étoile ou lui donner un nom ?", "Non, et méfie-toi des sites qui le proposent : aucune autorité astronomique ne reconnaît ces noms vendus. L'Affiche des étoiles est un souvenir du ciel réel, pas un titre de propriété."),
  ("Puis-je être remboursé ?", "Les achats sont des contenus numériques livrés immédiatement, ce qui supprime le droit de rétractation, et tu l'acceptes au moment de payer. Si un achat ne fonctionne pas, écris-nous : on le règle."),
]
PAGES.append(page("/faq/", "Questions fréquentes | Lunétoiles",
    "Tout savoir sur Lunétoiles : gratuité, confidentialité, boussole, Pass, Affiche et Carnet des étoiles, récupération des achats.",
    f"""<div class="cadre page-tete"><h1>Questions fréquentes</h1></div>
<div class="cadre questions" style="padding-bottom:clamp(56px,8vw,110px)">{details(FAQ)}
<p style="margin-top:30px">Une autre question&nbsp;? <a href="/contact/">Écris-nous</a>.</p></div>""",
    ld=[{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]))

# ---------------------------------------------------------------- contact
PAGES.append(page("/contact/", "Contact | Lunétoiles", "Une question, un souci avec un achat, une idée ? Écris à Lunétoiles, on répond par e-mail.",
"""<div class="cadre page-tete"><h1>Écris-nous</h1><p class="chapo">Une question, un souci avec un achat, une idée&nbsp;? On répond par e-mail, en général sous 48 heures.</p></div>
<div class="cadre" style="padding-bottom:clamp(56px,8vw,110px)"><form id="formContact" class="texte" novalidate>
<div class="duo"><div class="champ"><label for="cNom">Prénom</label><input id="cNom" name="nom" autocomplete="given-name" maxlength="80"></div>
<div class="champ"><label for="cEmail">E-mail</label><input id="cEmail" name="email" type="email" autocomplete="email" required></div></div>
<div class="champ"><label for="cSujet">Sujet</label><select id="cSujet" name="sujet"><option value="question">Une question</option><option value="achat">Un problème avec un achat</option><option value="partenariat">Partenariat ou presse</option><option value="autre">Autre chose</option></select></div>
<div class="champ"><label for="cMsg">Message</label><textarea id="cMsg" name="message" required minlength="10" maxlength="3000"></textarea></div>
<div aria-hidden="true" style="position:absolute;left:-5000px"><label>Ne pas remplir <input name="site" tabindex="-1" autocomplete="off"></label></div>
<p class="petit discret">Ton e-mail sert uniquement à te répondre. Voir la <a href="/confidentialite/">politique de confidentialité</a>.</p>
<button class="bouton" type="submit">Envoyer</button><p class="msg" id="msgContact" role="status"></p>
</form>
<div class="prose" style="margin-top:48px"><h2>Pour un achat</h2><p>Indique l'e-mail utilisé pour payer. Tu peux aussi récupérer tes achats toi-même, tout de suite, depuis la page <a href="/restaurer/">Récupérer un achat</a>.</p></div></div>""", ld=[ORG]))

# ---------------------------------------------------------------- merci / restaurer
PAGES.append(page("/merci/", "Merci | Lunétoiles", "Ton achat Lunétoiles.",
"""<div class="cadre page-tete"><h1 id="titreMerci">Vérification de ton paiement…</h1></div>
<div class="cadre texte" id="resultat" style="padding-bottom:clamp(56px,8vw,110px)" aria-live="polite"><p class="discret">Un instant, on vérifie auprès de Stripe.</p></div>""",
    scripts=["/assets/js/merci.js"], noindex=True, astro=True))
PAGES.append(page("/restaurer/", "Récupérer un achat | Lunétoiles", "Récupère ton Pass, tes affiches et ton carnet sur un nouvel appareil avec l'e-mail utilisé pour payer.",
"""<div class="cadre page-tete"><h1>Récupérer un achat</h1><p class="chapo">Pas de compte chez Lunétoiles&nbsp;: tes achats sont liés à l'e-mail utilisé pour payer.</p></div>
<div class="cadre" style="padding-bottom:clamp(56px,8vw,110px)"><div id="restaurations" aria-live="polite"></div>
<form id="formRestaurer" class="texte" style="margin-top:24px"><div class="champ"><label for="rEmail">E-mail utilisé pour payer</label><input id="rEmail" type="email" autocomplete="email" required></div>
<button class="bouton" type="submit">Recevoir le lien</button><p class="msg" id="msgRest" role="status"></p>
<p class="petit discret">Tu reçois un lien valable une heure. Ouvre-le sur l'appareil où tu veux retrouver tes achats.</p></form></div>""",
    scripts=["/assets/js/restaurer.js"], noindex=True, astro=True))

# ---------------------------------------------------------------- légal
AC = '<span class="a-completer">[à compléter]</span>'
PAGES.append(page("/mentions-legales/", "Mentions légales | Lunétoiles", "Mentions légales du site Lunétoiles.",
f"""<div class="cadre page-tete"><h1>Mentions légales</h1></div>
<div class="cadre prose" style="padding-bottom:clamp(56px,8vw,110px)">
<h2>Éditeur</h2><p>Le site Lunétoiles (lunetoiles.pages.dev) est édité par {AC} (nom et prénom), entrepreneur individuel (micro-entreprise), SIRET {AC}, domicilié {AC}.<br>Contact&nbsp;: via le <a href="/contact/">formulaire de contact</a>.<br>Directeur de la publication&nbsp;: {AC}.</p>
<h2>Hébergement</h2><p>Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis.</p>
<h2>Paiements</h2><p>Les paiements sont traités par Stripe Payments Europe, Ltd. (Irlande). Lunétoiles n'a jamais accès aux numéros de carte.</p>
<h2>Propriété intellectuelle</h2><p>Les textes, le design et le code de Lunétoiles sont protégés. Les données astronomiques et les bibliothèques libres utilisées sont listées avec leurs licences sur la page <a href="/licences/">Licences et sources</a>.</p>
</div>""", noindex=False))
PAGES.append(page("/cgv/", "Conditions générales de vente | Lunétoiles", "Conditions générales de vente de Lunétoiles : Pass, Affiche et Carnet des étoiles.",
f"""<div class="cadre page-tete"><h1>Conditions générales de vente</h1><p class="discret">En vigueur au {datetime.date.today().strftime('%d/%m/%Y')}.</p></div>
<div class="cadre prose" style="padding-bottom:clamp(56px,8vw,110px)">
<h2>1. Vendeur</h2><p>Les ventes sont conclues avec l'éditeur du site, désigné dans les <a href="/mentions-legales/">mentions légales</a>.</p>
<h2>2. Produits</h2><p><strong>Pass des étoiles</strong>&nbsp;: déblocage à vie, sur l'appareil utilisé, des fonctions avancées du viseur (catalogue complet d'étoiles, voyage dans le temps, flèche de guidage, heures de lever et de coucher). Il peut être réactivé sur un autre appareil grâce à l'e-mail utilisé lors du paiement.</p>
<p><strong>Affiche des étoiles</strong>&nbsp;: fichier numérique au format PNG (3000 × 4243 pixels) représentant le ciel calculé pour la date, l'heure et le lieu choisis, avec les textes saisis par l'acheteur. L'impression n'est pas comprise. Les positions sont calculées à partir de modèles astronomiques reconnus&nbsp;; la représentation est artistique et ne constitue pas un document scientifique.</p>
<p><strong>Carnet des étoiles</strong>&nbsp;: livre numérique au format PDF (26 pages, format A5) consacré à l'observation du ciel à l'œil nu, téléchargeable après le paiement.</p>
<h2>3. Prix</h2><p>Pass des étoiles&nbsp;: 0,99&nbsp;€. Affiche des étoiles&nbsp;: 4,99&nbsp;€. Carnet des étoiles&nbsp;: 0,99&nbsp;€. Ces produits peuvent être ajoutés les uns aux autres dans un même paiement, au même prix. Prix toutes taxes comprises. {AC} (mention TVA, par exemple «&nbsp;TVA non applicable, article 293 B du CGI&nbsp;» si tu bénéficies de la franchise en base).</p>
<h2>4. Commande et paiement</h2><p>Le paiement est exigible à la commande et se fait par carte ou autre moyen proposé par Stripe. La vente est conclue à la confirmation du paiement. Un reçu est envoyé par e-mail.</p>
<h2>5. Livraison</h2><p>Les contenus sont fournis immédiatement après le paiement&nbsp;: activation du Pass sur l'appareil, téléchargement de l'affiche ou du carnet. Ils restent récupérables depuis la page <a href="/restaurer/">Récupérer un achat</a>.</p>
<h2>6. Droit de rétractation</h2><p>Conformément à l'article L221-28, 13° du Code de la consommation, le droit de rétractation ne peut pas être exercé pour un contenu numérique fourni sans support matériel dont l'exécution a commencé avec l'accord préalable exprès du consommateur, qui a renoncé à ce droit. Cet accord et cette renonciation sont recueillis par une case à cocher avant chaque paiement.</p>
<h2>7. Garantie et réclamations</h2><p>Si un contenu acheté ne fonctionne pas comme décrit, contacte-nous via le <a href="/contact/">formulaire</a>&nbsp;: nous le corrigeons ou te remboursons. Les garanties légales de conformité applicables aux contenus numériques s'appliquent.</p>
<h2>8. Médiation</h2><p>En cas de litige non résolu, tu peux recourir gratuitement au médiateur de la consommation&nbsp;: {AC} (nom et site du médiateur). Plateforme européenne de règlement en ligne des litiges&nbsp;: https://ec.europa.eu/consumers/odr.</p>
<h2>9. Droit applicable</h2><p>Les présentes conditions sont soumises au droit français.</p>
</div>"""))
PAGES.append(page("/confidentialite/", "Confidentialité | Lunétoiles", "Ce que Lunétoiles fait (et ne fait pas) de tes données.",
f"""<div class="cadre page-tete"><h1>Confidentialité</h1><p class="chapo">Version courte&nbsp;: Lunétoiles n'a pas de compte, pas de publicité et pas de traceur. Ce qui sert à calculer le ciel reste dans ton téléphone.</p></div>
<div class="cadre prose" style="padding-bottom:clamp(56px,8vw,110px)">
<h2>Ce qui reste sur ton appareil</h2><ul><li><strong>Caméra</strong>&nbsp;: l'image s'affiche derrière le ciel et n'est jamais enregistrée ni envoyée. Une capture n'est créée que si tu appuies sur «&nbsp;Partager&nbsp;».</li>
<li><strong>Orientation et boussole</strong>&nbsp;: utilisées en direct pour savoir où pointe ton téléphone.</li>
<li><strong>Position</strong>&nbsp;: utilisée pour calculer le ciel au-dessus de toi, jamais envoyée à Lunétoiles.</li>
<li><strong>Réglages et achats</strong>&nbsp;: gardés dans le stockage local de ton navigateur.</li></ul>
<h2>Ce qui est transmis, et à qui</h2><ul><li><strong>Paiement</strong>&nbsp;: Stripe reçoit ton e-mail et tes informations de paiement pour traiter la commande. Pour une affiche, les textes, la date et le lieu choisis sont enregistrés avec la commande, afin de pouvoir te le livrer à nouveau.</li>
<li><strong>Recherche de lieu</strong> (page affiche)&nbsp;: le texte que tu tapes est envoyé au service Nominatim d'OpenStreetMap pour trouver les coordonnées.</li>
<li><strong>Contact et récupération d'achat</strong>&nbsp;: ton e-mail et ton message sont transmis par e-mail via Resend, uniquement pour te répondre ou t'envoyer ton lien.</li>
<li><strong>Hébergement</strong>&nbsp;: Cloudflare traite des données techniques de connexion (adresse IP) pour servir le site et le protéger.</li></ul>
<h2>Durées</h2><p>Les données de commande sont conservées le temps imposé par les obligations comptables (dix ans pour les pièces comptables). Les messages de contact sont conservés le temps de traiter ta demande.</p>
<h2>Tes droits</h2><p>Tu peux demander l'accès, la correction ou la suppression de tes données via le <a href="/contact/">formulaire de contact</a>. Tu peux aussi saisir la CNIL (cnil.fr). Responsable du traitement&nbsp;: l'éditeur indiqué dans les <a href="/mentions-legales/">mentions légales</a>.</p>
<h2>Cookies</h2><p>Lunétoiles n'utilise aucun cookie publicitaire ni outil de mesure d'audience tiers.</p>
</div>"""))
PAGES.append(page("/licences/", "Licences et sources | Lunétoiles", "Les données et bibliothèques libres utilisées par Lunétoiles.",
"""<div class="cadre page-tete"><h1>Licences et sources</h1></div>
<div class="cadre prose" style="padding-bottom:clamp(56px,8vw,110px)">
<h2>Astronomy Engine</h2><p>Calcul des positions (planètes, Lune, rotation de la Terre). Copyright (c) 2019-2023 Don Cross. Licence MIT. https://github.com/cosinekitty/astronomy</p>
<h2>Catalogue d'étoiles et constellations</h2><p>Données de d3-celestial : Copyright (c) 2015, Olaf Frohn. All rights reserved. Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met: (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution. (3) Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.</p>
<h2>Fuseaux horaires</h2><p>Natural Earth, données dans le domaine public.</p>
<h2>Recherche de lieux</h2><p>Nominatim, données © les contributeurs d'OpenStreetMap, sous licence ODbL.</p>
<h2>Polices</h2><p>Bodoni Moda (The Bodoni Moda Project Authors) et Atkinson Hyperlegible (Braille Institute of America), sous licence SIL Open Font License 1.1.</p>
</div>"""))

# ---------------------------------------------------------------- 404
page("/404.html", "Page introuvable | Lunétoiles", "Cette page n'existe pas.",
"""<div class="cadre page-tete" style="padding-bottom:clamp(80px,10vw,140px)"><h1>Cette étoile n'existe pas.</h1><p class="chapo">La page demandée est introuvable. Le ciel, lui, est toujours là.</p>
<div class="boutons"><a class="bouton" href="/ciel/">Ouvrir le ciel</a><a class="lien-sec" href="/">Retour à l'accueil</a></div></div>""", noindex=True)

# ---------------------------------------------------------------- sitemap, robots
idx = [p for p in PAGES if p not in ("/merci/", "/restaurer/")]
with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for p in idx:
        f.write(f"  <url><loc>{SITE}{p}</loc><lastmod>{TODAY}</lastmod></url>\n")
    f.write("</urlset>\n")
with open(os.path.join(ROOT, "_redirects"), "w") as f:
    f.write("/poster/ /affiche/ 301\n/poster /affiche/ 301\n")
with open(os.path.join(ROOT, "robots.txt"), "w") as f:
    f.write(f"User-agent: *\nAllow: /\nDisallow: /merci/\nDisallow: /restaurer/\nDisallow: /api/\nDisallow: /prive/\n\nSitemap: {SITE}/sitemap.xml\n")
print(len(PAGES), "pages")
