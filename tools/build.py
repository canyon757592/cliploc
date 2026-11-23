#!/usr/bin/env python3
"""Génère les pages statiques de Voûte (en-tête, pied de page et référencement communs)."""
import json, os, re, html, hashlib, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://voute.pages.dev"
TODAY = datetime.date.today().isoformat()

def ver(path):
    with open(os.path.join(ROOT, path.lstrip("/")), "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:8]

LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 27a13 13 0 0 1 26 0" fill="none" stroke="#c8a45d" stroke-width="1.6"/><path d="M16 6l1.5 4.5L22 12l-4.5 1.5L16 18l-1.5-4.5L10 12l4.5-1.5z" fill="#f4efe2"/><circle cx="24.5" cy="20" r="1.1" fill="#f4efe2"/><circle cx="7.5" cy="19" r=".8" fill="#f4efe2"/></svg>'

NAV = [("/poster/", "Poster du ciel"), ("/tarifs/", "Tarifs"), ("/guides/", "Guides"), ("/contact/", "Contact")]

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
<meta property="og:site_name" content="Voûte">
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
<header class="entete"><div class="cadre">
<a class="marque" href="/" aria-label="Voûte, accueil">{LOGO}Voûte</a>
<button class="burger" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
<nav id="nav" class="nav" aria-label="Navigation principale">{links}<a class="bouton petit" href="/ciel/">Ouvrir le ciel</a></nav>
</div></header>"""

FOOTER = f"""<footer class="pied"><div class="cadre">
<div><h2>Voûte</h2><p>Pointe ton téléphone vers le ciel, Voûte te dit ce que tu regardes. Directement dans le navigateur, sans compte.</p></div>
<div><ul><li><a href="/ciel/">Ouvrir le ciel</a></li><li><a href="/poster/">Poster du ciel</a></li><li><a href="/tarifs/">Tarifs</a></li><li><a href="/restaurer/">Récupérer un achat</a></li></ul></div>
<div><ul><li><a href="/guides/">Guides</a></li><li><a href="/faq/">Questions fréquentes</a></li><li><a href="/contact/">Contact</a></li></ul></div>
<div><ul><li><a href="/mentions-legales/">Mentions légales</a></li><li><a href="/cgv/">Conditions de vente</a></li><li><a href="/confidentialite/">Confidentialité</a></li><li><a href="/licences/">Licences et sources</a></li></ul></div>
<p class="credits">Positions calculées avec Astronomy Engine (Don Cross, licence MIT) et le catalogue d'étoiles de d3-celestial (Olaf Frohn, licence BSD). Recherche de lieux : © les contributeurs d'OpenStreetMap. Fuseaux horaires : Natural Earth.</p>
</div></footer>"""

def page(path, title, desc, body, scripts=(), extra_css="", ld=None, noindex=False, body_cls="", bare=False, astro=False):
    s = (f'\n<script src="/assets/js/astronomy.min.js?v={ver("/assets/js/astronomy.min.js")}" defer></script>' if astro else "") + "".join(f'\n<script type="module" src="{x}?v={ver(x)}"></script>' for x in scripts)
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
ORG = {"@context": "https://schema.org", "@type": "Organization", "name": "Voûte", "url": SITE, "logo": SITE + "/icon-512.png"}
APP = {"@context": "https://schema.org", "@type": "WebApplication", "name": "Voûte", "url": SITE + "/ciel/", "applicationCategory": "EducationalApplication", "operatingSystem": "iOS, Android, Windows, macOS",
       "description": "Pointe ton téléphone vers le ciel : Voûte affiche le nom des étoiles, des constellations et des planètes.", "inLanguage": "fr",
       "offers": [{"@type": "Offer", "price": "0", "priceCurrency": "EUR", "name": "Viseur gratuit"}, {"@type": "Offer", "price": "2.99", "priceCurrency": "EUR", "name": "Voûte+"}]}

# ---------------------------------------------------------------- accueil
FAQ_COURTE = [
    ("C'est vraiment gratuit ?", "Oui. Le viseur, les 921 étoiles les plus brillantes, les 88 constellations, les planètes et la Lune sont gratuits, sans publicité et sans compte. Voûte+ et les posters sont des achats uniques, facultatifs."),
    ("Faut-il installer une application ?", "Non. Voûte s'ouvre dans le navigateur de ton téléphone. Si tu veux l'avoir sous la main, ajoute-la à ton écran d'accueil : elle se lance alors comme une application, même avec peu de réseau."),
    ("Mes données partent quelque part ?", "Non. La caméra, l'orientation du téléphone et ta position servent uniquement sur ton téléphone, pour calculer le ciel. Rien n'est enregistré ni envoyé."),
]
def details(qs):
    return "".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in qs)

PAGES.append(page("/", "Voûte : pointe ton téléphone vers le ciel et reconnais les étoiles",
    "Le nom des étoiles, des constellations et des planètes, en direct sur l'écran de ton téléphone. Gratuit, dans le navigateur, sans inscription.",
f"""<section class="heros"><div class="cadre">
<div>
<h1>Pointe ton téléphone vers le ciel.</h1>
<p class="chapo">Voûte affiche le nom de chaque étoile, constellation et planète que tu regardes. Directement dans ton navigateur&nbsp;: rien à installer, pas de compte.</p>
<div class="boutons"><a class="bouton" href="/ciel/">Ouvrir le ciel</a><a class="lien-sec" href="/poster/">Ou offrir un poster du ciel</a></div>
<p class="rassure">Gratuit. Marche sur iPhone et Android. Sur ordinateur, on fait glisser le ciel à la souris.</p>
</div>
<figure class="dome-cadre" style="margin:0">
<canvas id="dome" role="img" aria-label="Carte du ciel réel au-dessus de Paris en ce moment, avec les étoiles, les constellations et les planètes"></canvas>
<figcaption class="legende-dome"><span id="domeLieu">Le ciel au-dessus de Paris, en ce moment.</span> <button type="button" id="maPos">Voir le ciel au-dessus de moi</button></figcaption>
</figure>
</div></section>

<section class="profond" aria-labelledby="t-cesoir"><div class="cadre cesoir">
<div class="texte">
<h2 id="t-cesoir">Ce qui brille au-dessus de toi</h2>
<p class="chapo" style="margin-top:18px">Calculé à l'instant pour ta position. Pas besoin d'un ciel parfait&nbsp;: les planètes et la Lune se voient même en ville.</p>
<p><a class="lien-sec" href="/ciel/">Voir exactement où regarder</a></p>
</div>
<div><p class="discret" id="ceSoirQuand" style="margin-bottom:10px">En ce moment</p><ul class="astres" id="astres" aria-live="polite"><li><span class="nom">…</span><span class="ou">Calcul du ciel en cours</span></li></ul></div>
</div></section>

<section aria-labelledby="t-comment"><div class="cadre">
<h2 id="t-comment">Trois gestes, et le ciel a des noms</h2>
<ol class="etapes">
<li><h3>Ouvre Voûte sur ton téléphone</h3><p class="discret">Pas d'application à télécharger. La page s'ouvre en quelques secondes, même dehors avec peu de réseau.</p></li>
<li><h3>Autorise la caméra et l'orientation</h3><p class="discret">Voûte s'en sert seulement pour savoir où pointe ton téléphone. Rien n'est enregistré ni envoyé.</p></li>
<li><h3>Lève le bras</h3><p class="discret">Les noms apparaissent par-dessus le vrai ciel. Touche une étoile ou une planète pour en savoir plus.</p></li>
</ol>
</div></section>

<section class="profond" aria-labelledby="t-planche"><div class="cadre planche">
<div class="texte">
<h2 id="t-planche">Un atlas qui tient dans la poche</h2>
<p class="chapo" style="margin-top:18px">921 étoiles brillantes, les 88 constellations avec leurs tracés, les planètes jusqu'à Neptune, la Lune et sa phase.</p>
<p class="discret">Les positions sont recalculées en continu à partir des modèles astronomiques de référence, avec une précision bien meilleure que ce que l'œil peut distinguer. Avec Voûte+, tu passes aux 5&nbsp;044 étoiles du catalogue et tu peux voyager dans le temps&nbsp;: le ciel de ta naissance, celui de la prochaine pluie d'étoiles filantes.</p>
</div>
<figure style="margin:0"><canvas id="planche" width="1040" height="1040" role="img" aria-label="Planche de la Grande Ourse, avec ses étoiles principales et leurs noms"></canvas><figcaption>La Grande Ourse, telle que la dessine Voûte.</figcaption></figure>
</div></section>

<section aria-labelledby="t-poster"><div class="cadre poster-bloc">
<div class="poster-apercu"><canvas id="posterEx" role="img" aria-label="Exemple de poster : le ciel de Paris le 14 février 2026 à 21 h 30"></canvas></div>
<div class="texte">
<h2 id="t-poster">Le ciel d'un jour qui compte</h2>
<p class="chapo" style="margin-top:18px">Une rencontre, une naissance, un mariage&nbsp;: choisis la date, l'heure et le lieu.</p>
<p class="discret">Voûte recalcule le ciel exact de ce moment-là et le dessine comme une planche d'atlas, avec tes mots. Tu télécharges un fichier haute définition, prêt à imprimer en A4 ou en A3.</p>
<p class="prix">4,99&nbsp;€ <small>le poster en haute définition</small></p>
<div class="boutons"><a class="bouton" href="/poster/">Créer mon poster</a><span class="discret petit">Aperçu gratuit&nbsp;: tu ne paies que si tu le veux en HD.</span></div>
</div>
</div></section>

<section class="profond" aria-labelledby="t-offres"><div class="cadre">
<h2 id="t-offres">Gratuit pour regarder. Une fois pour aller plus loin.</h2>
<div class="offres">
<div class="offre"><h3>Le viseur</h3><p class="prix">0&nbsp;€</p><ul><li>921 étoiles brillantes</li><li>88 constellations et leurs tracés</li><li>Planètes, Lune et Soleil</li><li>Mode rouge pour garder la vision de nuit</li></ul><a class="lien-sec" href="/ciel/">Ouvrir le ciel</a></div>
<div class="offre vedette"><h3>Voûte+</h3><p class="prix">2,99&nbsp;€ <small>une fois</small></p><ul><li>Les 5&nbsp;044 étoiles du catalogue</li><li>Le ciel à n'importe quelle date</li><li>Une flèche qui te guide vers l'astre cherché</li><li>Heures de lever et de coucher</li></ul><a class="bouton" href="/ciel/?plus=1">Passer à Voûte+</a></div>
<div class="offre"><h3>Poster du ciel</h3><p class="prix">4,99&nbsp;€ <small>par poster</small></p><ul><li>Le ciel exact d'une date et d'un lieu</li><li>Trois styles, tes textes</li><li>Fichier HD prêt à imprimer</li><li>Récupérable avec ton e-mail</li></ul><a class="lien-sec" href="/poster/">Créer un poster</a></div>
</div>
</div></section>

<section aria-labelledby="t-faq"><div class="cadre">
<h2 id="t-faq">Avant de lever les yeux</h2>
<div class="questions" style="margin-top:28px">{details(FAQ_COURTE)}</div>
<p style="margin-top:26px"><a href="/faq/">Toutes les questions</a></p>
</div></section>
<div class="barre-mobile"><a class="bouton" href="/ciel/">Ouvrir le ciel</a></div>""",
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
PAGES.append(page("/ciel/", "Ouvrir le ciel : le viseur d'étoiles de Voûte",
    "Pointe ton téléphone vers le ciel : les noms des étoiles, constellations et planètes s'affichent en direct. Gratuit, sans inscription.",
f"""<video id="cam" playsinline muted autoplay aria-hidden="true"></video>
<canvas id="ciel" role="img" aria-label="Le ciel en direct dans la direction où pointe ton téléphone. La liste des astres est disponible avec le bouton Chercher."></canvas>
<div class="reticule" aria-hidden="true"></div>
<header class="app-haut">
<a class="marque" href="/" aria-label="Voûte, retour à l'accueil">{LOGO}<span class="sr">Voûte</span></a>
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
<label class="reglage"><span>Étoiles faibles (Voûte+)</span><input type="checkbox" id="rFaibles"></label>
<label class="reglage"><span>Champ de vision</span><input type="range" id="rZoom" min="18" max="110" step="1"></label>
<div class="reglage"><span>Ciel vu depuis <span id="rLieu"></span></span><button class="lien-btn" type="button" id="rPos">Ma position</button></div>
<p class="petit discret" style="margin-top:14px">Noms décalés&nbsp;? Éloigne-toi des objets métalliques, fais un grand huit avec ton téléphone pour réveiller la boussole, puis utilise « Recaler ». Déjà acheté Voûte+ ailleurs&nbsp;? <a href="/restaurer/">Récupère-le</a>.</p></section>

<aside class="carte-offre" id="offrePoster" hidden aria-label="Proposition"><button class="ferme" type="button" aria-label="Fermer">×</button>
<p>Un ciel qui compte pour toi&nbsp;? Voûte peut redessiner celui d'une rencontre ou d'une naissance, en poster.</p><a class="bouton petit" href="/poster/">Créer un poster</a></aside>

<div class="rouge" id="rouge" hidden></div>
<div class="depart" id="depart"><div class="in">
<h1>Le ciel a des noms.</h1>
<p class="chapo" id="depTexte">Pointe ton téléphone vers le ciel&nbsp;: Voûte affiche le nom de ce que tu regardes.</p>
<ul><li>Ta position, pour savoir quel ciel tu as au-dessus de toi</li><li>L'orientation du téléphone, pour savoir où tu vises</li><li>La caméra, pour voir les noms par-dessus le vrai ciel (facultatif)</li></ul>
<p class="petit discret">Tout reste dans ton téléphone. Rien n'est enregistré ni envoyé.</p>
<div class="boutons"><button class="bouton" type="button" id="btnGo">Commencer</button><button class="lien-btn" type="button" id="btnGlisser">Explorer sans capteurs</button></div>
<p class="msg" id="depMsg" role="alert"></p>
</div></div>""",
    scripts=["/assets/js/ciel.js"], extra_css="ciel.css", ld=[APP], body_cls="app", bare=True, astro=True))

# ---------------------------------------------------------------- poster
PAGES.append(page("/poster/", "Poster carte du ciel personnalisé : le ciel d'une date et d'un lieu",
    "Le ciel exact de ta rencontre, d'une naissance ou d'un mariage, dessiné comme une planche d'atlas. Aperçu gratuit, fichier HD prêt à imprimer pour 4,99 €.",
"""<div class="cadre page-tete"><h1>Le ciel d'un jour qui compte</h1>
<p class="chapo">Choisis la date, l'heure et le lieu. Voûte recalcule la position réelle des étoiles et des planètes à ce moment-là.</p></div>
<div class="cadre atelier">
<div>
<div class="champ"><label for="pTitre">Titre</label><input id="pTitre" maxlength="70" placeholder="La nuit où tout a commencé"></div>
<div class="champ"><label for="pSous">Sous-titre (facultatif)</label><input id="pSous" maxlength="60" placeholder="Léa &amp; Sami"></div>
<div class="duo"><div class="champ"><label for="pDate">Date</label><input id="pDate" type="date" min="1800-01-01" max="2200-12-31"></div>
<div class="champ"><label for="pHeure">Heure, sur place</label><input id="pHeure" type="time"></div></div>
<form class="champ" id="formLieu"><label for="pLieu">Lieu</label><div class="lieu-ligne"><input id="pLieu" autocomplete="off" placeholder="Ville, adresse…"><button class="bouton" type="button" id="btnLieu">Chercher</button></div>
<ul class="lieux" id="lieux" aria-live="polite"></ul><button type="button" class="lien-btn petit" id="maPosition" style="background:none;border:0;color:var(--etoile);text-decoration:underline;text-decoration-color:var(--laiton);cursor:pointer;padding:6px 0;align-self:flex-start;font:inherit;font-size:15px">Utiliser ma position</button></form>
<fieldset class="champ" style="border:0;padding:0;margin:0 0 24px"><legend style="font-weight:700;font-size:16px;margin-bottom:10px">Style</legend><div class="themes" id="themes"></div></fieldset>
<div class="achat-ligne"><p class="prix">4,99&nbsp;€</p><button class="bouton" type="button" id="btnAcheter">Télécharger en HD</button></div>
<p class="msg" id="msgAchat"></p>
<p class="petit discret">Fichier PNG 3000 × 4243 pixels, sans filigrane, prêt à imprimer en A4 ou en A3. L'heure est celle du lieu choisi&nbsp;: Voûte gère les fuseaux horaires et l'heure d'été.</p>
</div>
<div><div class="apercu-cadre"><canvas id="apercu" role="img" aria-label="Aperçu de ton poster"></canvas></div><p class="discret petit" id="apercuTxt" style="margin-top:12px" aria-live="polite"></p></div>
</div>
<section class="profond"><div class="cadre"><h2>Comment ça se passe</h2>
<ol class="etapes"><li><h3>Tu composes</h3><p class="discret">Date, heure, lieu, tes mots et un style. L'aperçu se met à jour à chaque changement.</p></li>
<li><h3>Tu paies 4,99&nbsp;€</h3><p class="discret">Paiement unique et sécurisé par Stripe. Pas d'abonnement, pas de compte à créer.</p></li>
<li><h3>Tu télécharges</h3><p class="discret">Le fichier HD se télécharge tout de suite. Tu peux le récupérer plus tard avec ton e-mail.</p></li></ol></div></section>""",
    scripts=["/assets/js/poster.js"], astro=True, ld=[{"@context": "https://schema.org", "@type": "Product", "name": "Poster carte du ciel personnalisé (fichier HD)", "description": "Le ciel exact d'une date et d'un lieu, en fichier haute définition à imprimer.", "brand": {"@type": "Brand", "name": "Voûte"}, "offers": {"@type": "Offer", "price": "4.99", "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": SITE + "/poster/"}}]))

# ---------------------------------------------------------------- tarifs
PAGES.append(page("/tarifs/", "Tarifs de Voûte : gratuit, Voûte+ à 2,99 €, poster à 4,99 €",
    "Le viseur d'étoiles est gratuit. Voûte+ coûte 2,99 € une seule fois, le poster carte du ciel 4,99 €. Sans abonnement, sans compte.",
"""<div class="cadre page-tete"><h1>Des prix simples, sans abonnement</h1>
<p class="chapo">Regarder le ciel est gratuit. Tu paies une seule fois si tu veux aller plus loin, et c'est tout.</p></div>
<div class="cadre" style="padding-bottom:clamp(56px,8vw,110px)">
<div class="offres" style="margin-top:0">
<div class="offre"><h2 style="font-size:30px">Le viseur</h2><p class="prix">0&nbsp;€</p><ul><li>Reconnaissance en direct avec la caméra</li><li>921 étoiles brillantes, dont toutes celles visibles en ville</li><li>88 constellations, tracés et noms</li><li>Planètes, Lune et sa phase, Soleil</li><li>Mode rouge pour la vision de nuit</li><li>Capture à partager</li></ul><a class="lien-sec" href="/ciel/">Ouvrir le ciel</a></div>
<div class="offre vedette"><h2 style="font-size:30px">Voûte+</h2><p class="prix">2,99&nbsp;€ <small>une seule fois</small></p><ul><li>Tout le viseur gratuit</li><li>Les 5&nbsp;044 étoiles du catalogue</li><li>Voyage dans le temps, à n'importe quelle date</li><li>Flèche de guidage vers l'astre cherché</li><li>Heures de lever et de coucher</li><li>Récupérable sur un autre téléphone</li></ul><a class="bouton" href="/ciel/?plus=1">Passer à Voûte+</a></div>
<div class="offre"><h2 style="font-size:30px">Poster du ciel</h2><p class="prix">4,99&nbsp;€ <small>par poster</small></p><ul><li>Le ciel exact d'une date et d'un lieu</li><li>Fuseaux horaires et heure d'été gérés</li><li>Trois styles, titre et sous-titre</li><li>Fichier PNG 3000 × 4243, sans filigrane</li><li>Voûte+ en option pour 1,49&nbsp;€</li></ul><a class="lien-sec" href="/poster/">Créer un poster</a></div>
</div>
<div class="prose" style="margin-top:56px">
<h2>Bon à savoir</h2>
<p>Les prix sont affichés toutes taxes comprises. Le paiement passe par Stripe&nbsp;: Voûte ne voit jamais les numéros de carte.</p>
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
<li><strong>Regarder son téléphone en plein écran blanc.</strong> Il faut une vingtaine de minutes pour que les yeux s'habituent au noir. Le mode rouge de Voûte est fait pour ça.</li></ul>
<p class="note">Pour t'entraîner, ouvre <a href="/ciel/">le viseur</a> et vise une étoile brillante&nbsp;: Voûte affiche son nom et la constellation à laquelle elle appartient.</p>"""),
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
<li><strong>Surveille la Lune.</strong> Une pleine Lune efface les plus faibles. Le voyage dans le temps de Voûte+ montre où elle sera la nuit choisie.</li>
<li><strong>Laisse tes yeux s'habituer.</strong> Vingt minutes sans écran blanc, ou le mode rouge de Voûte.</li></ul>
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
<p class="note">Dans <a href="/ciel/">le viseur</a>, cherche « Étoile polaire »&nbsp;: avec Voûte+, une flèche te guide jusqu'à elle.</p>"""),
]
for slug, titre, desc, corps in GUIDES:
    PAGES.append(page(f"/guides/{slug}/", f"{titre} | Voûte", desc,
        f"""<article class="cadre"><header class="page-tete"><p><a href="/guides/">Guides</a></p><h1>{titre}</h1></header>
<div class="prose" style="padding-bottom:clamp(56px,8vw,110px)">{corps}
<p style="margin-top:40px"><a class="bouton" href="/ciel/">Ouvrir le ciel</a></p></div></article>""",
        ld=[{"@context": "https://schema.org", "@type": "Article", "headline": titre, "description": desc, "inLanguage": "fr", "datePublished": TODAY, "dateModified": TODAY, "author": {"@type": "Organization", "name": "Voûte"}, "publisher": {"@type": "Organization", "name": "Voûte", "logo": {"@type": "ImageObject", "url": SITE + "/icon-512.png"}}, "mainEntityOfPage": SITE + f"/guides/{slug}/"}]))

PAGES.append(page("/guides/", "Guides pour observer le ciel | Voûte",
    "Reconnaître les constellations, trouver l'étoile Polaire, voir les étoiles filantes : des guides simples pour observer le ciel à l'œil nu.",
    """<div class="cadre page-tete"><h1>Apprendre le ciel</h1><p class="chapo">Des guides courts, pour observer à l'œil nu, sans matériel.</p></div>
<div class="cadre" style="padding-bottom:clamp(56px,8vw,110px)"><ul class="cartes-guides">""" +
    "".join(f'<li><a href="/guides/{s}/"><h2>{t}</h2><p class="discret">{d}</p></a></li>' for s, t, d, _ in GUIDES) + "</ul></div>", ld=[ORG]))

# ---------------------------------------------------------------- FAQ
FAQ = FAQ_COURTE + [
  ("Pourquoi les noms sont parfois un peu décalés ?", "Voûte se sert de la boussole du téléphone, qui peut être perturbée par du métal, une coque aimantée ou des appareils électriques. Éloigne-toi de ces objets, fais un grand huit avec ton téléphone pour la réveiller, puis utilise le bouton « Recaler » pour aligner le ciel sur la Lune ou une étoile brillante."),
  ("Ça marche en ville ?", "Oui. En ville tu verras surtout les étoiles les plus brillantes, les planètes et la Lune, et c'est justement ce que Voûte montre en priorité. Les étoiles faibles demandent un ciel noir, loin des lumières."),
  ("Et sur ordinateur ?", "Sur ordinateur, il n'y a ni boussole ni gyroscope : tu explores le ciel en le faisant glisser à la souris, et tu zoomes avec la molette."),
  ("Voûte+ est-il un abonnement ?", "Non. Voûte+ coûte 2,99 € une seule fois, pour toujours. Il n'y a aucun prélèvement ensuite."),
  ("J'ai changé de téléphone, comment récupérer mes achats ?", "Va sur la page Récupérer un achat et indique l'e-mail utilisé pour payer. Tu reçois un lien qui réactive Voûte+ et te permet de retélécharger tes posters."),
  ("Quel format pour le poster ?", "Un fichier PNG de 3000 × 4243 pixels, au format A (celui des feuilles A4 et A3). Il s'imprime très bien en A4 ou en A3, et s'adapte à un cadre 30 × 40 cm."),
  ("Le ciel du poster est-il exact ?", "Oui : Voûte calcule la position réelle des étoiles et des planètes pour la date, l'heure et le lieu choisis, en tenant compte du fuseau horaire et de l'heure d'été du lieu."),
  ("Peut-on acheter une étoile ou lui donner un nom ?", "Non, et méfie-toi des sites qui le proposent : aucune autorité astronomique ne reconnaît ces noms vendus. Le poster de Voûte est un souvenir du ciel réel, pas un titre de propriété."),
  ("Puis-je être remboursé ?", "Les achats sont des contenus numériques livrés immédiatement, ce qui supprime le droit de rétractation, et tu l'acceptes au moment de payer. Si un achat ne fonctionne pas, écris-nous : on le règle."),
]
PAGES.append(page("/faq/", "Questions fréquentes | Voûte",
    "Tout savoir sur Voûte : gratuité, confidentialité, boussole, Voûte+, poster du ciel et récupération des achats.",
    f"""<div class="cadre page-tete"><h1>Questions fréquentes</h1></div>
<div class="cadre questions" style="padding-bottom:clamp(56px,8vw,110px)">{details(FAQ)}
<p style="margin-top:30px">Une autre question&nbsp;? <a href="/contact/">Écris-nous</a>.</p></div>""",
    ld=[{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]))

# ---------------------------------------------------------------- contact
PAGES.append(page("/contact/", "Contact | Voûte", "Une question, un souci avec un achat, une idée ? Écris à Voûte, on répond par e-mail.",
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
PAGES.append(page("/merci/", "Merci | Voûte", "Ton achat Voûte.",
"""<div class="cadre page-tete"><h1 id="titreMerci">Vérification de ton paiement…</h1></div>
<div class="cadre texte" id="resultat" style="padding-bottom:clamp(56px,8vw,110px)" aria-live="polite"><p class="discret">Un instant, on vérifie auprès de Stripe.</p></div>""",
    scripts=["/assets/js/merci.js"], noindex=True, astro=True))
PAGES.append(page("/restaurer/", "Récupérer un achat | Voûte", "Récupère Voûte+ et tes posters sur un nouvel appareil avec l'e-mail utilisé pour payer.",
"""<div class="cadre page-tete"><h1>Récupérer un achat</h1><p class="chapo">Pas de compte chez Voûte&nbsp;: tes achats sont liés à l'e-mail utilisé pour payer.</p></div>
<div class="cadre" style="padding-bottom:clamp(56px,8vw,110px)"><div id="restaurations" aria-live="polite"></div>
<form id="formRestaurer" class="texte" style="margin-top:24px"><div class="champ"><label for="rEmail">E-mail utilisé pour payer</label><input id="rEmail" type="email" autocomplete="email" required></div>
<button class="bouton" type="submit">Recevoir le lien</button><p class="msg" id="msgRest" role="status"></p>
<p class="petit discret">Tu reçois un lien valable une heure. Ouvre-le sur l'appareil où tu veux retrouver tes achats.</p></form></div>""",
    scripts=["/assets/js/restaurer.js"], noindex=True, astro=True))

# ---------------------------------------------------------------- légal
AC = '<span class="a-completer">[à compléter]</span>'
PAGES.append(page("/mentions-legales/", "Mentions légales | Voûte", "Mentions légales du site Voûte.",
f"""<div class="cadre page-tete"><h1>Mentions légales</h1></div>
<div class="cadre prose" style="padding-bottom:clamp(56px,8vw,110px)">
<h2>Éditeur</h2><p>Le site voute.pages.dev est édité par {AC} (nom et prénom), entrepreneur individuel (micro-entreprise), SIRET {AC}, domicilié {AC}.<br>Contact&nbsp;: via le <a href="/contact/">formulaire de contact</a>.<br>Directeur de la publication&nbsp;: {AC}.</p>
<h2>Hébergement</h2><p>Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis.</p>
<h2>Paiements</h2><p>Les paiements sont traités par Stripe Payments Europe, Ltd. (Irlande). Voûte n'a jamais accès aux numéros de carte.</p>
<h2>Propriété intellectuelle</h2><p>Les textes, le design et le code de Voûte sont protégés. Les données astronomiques et les bibliothèques libres utilisées sont listées avec leurs licences sur la page <a href="/licences/">Licences et sources</a>.</p>
</div>""", noindex=False))
PAGES.append(page("/cgv/", "Conditions générales de vente | Voûte", "Conditions générales de vente de Voûte : Voûte+ et posters carte du ciel.",
f"""<div class="cadre page-tete"><h1>Conditions générales de vente</h1><p class="discret">En vigueur au {datetime.date.today().strftime('%d/%m/%Y')}.</p></div>
<div class="cadre prose" style="padding-bottom:clamp(56px,8vw,110px)">
<h2>1. Vendeur</h2><p>Les ventes sont conclues avec l'éditeur du site, désigné dans les <a href="/mentions-legales/">mentions légales</a>.</p>
<h2>2. Produits</h2><p><strong>Voûte+</strong>&nbsp;: déblocage à vie, sur l'appareil utilisé, des fonctions avancées du viseur (catalogue complet d'étoiles, voyage dans le temps, flèche de guidage, heures de lever et de coucher). Il peut être réactivé sur un autre appareil grâce à l'e-mail utilisé lors du paiement.</p>
<p><strong>Poster carte du ciel</strong>&nbsp;: fichier numérique au format PNG (3000 × 4243 pixels) représentant le ciel calculé pour la date, l'heure et le lieu choisis, avec les textes saisis par l'acheteur. L'impression n'est pas comprise. Les positions sont calculées à partir de modèles astronomiques reconnus&nbsp;; la représentation est artistique et ne constitue pas un document scientifique.</p>
<h2>3. Prix</h2><p>Voûte+&nbsp;: 2,99&nbsp;€. Poster&nbsp;: 4,99&nbsp;€. Voûte+ ajouté à l'achat d'un poster&nbsp;: 1,49&nbsp;€. Prix toutes taxes comprises. {AC} (mention TVA, par exemple «&nbsp;TVA non applicable, article 293 B du CGI&nbsp;» si tu bénéficies de la franchise en base).</p>
<h2>4. Commande et paiement</h2><p>Le paiement est exigible à la commande et se fait par carte ou autre moyen proposé par Stripe. La vente est conclue à la confirmation du paiement. Un reçu est envoyé par e-mail.</p>
<h2>5. Livraison</h2><p>Les contenus sont fournis immédiatement après le paiement&nbsp;: activation de Voûte+ sur l'appareil, téléchargement du poster. Ils restent récupérables depuis la page <a href="/restaurer/">Récupérer un achat</a>.</p>
<h2>6. Droit de rétractation</h2><p>Conformément à l'article L221-28, 13° du Code de la consommation, le droit de rétractation ne peut pas être exercé pour un contenu numérique fourni sans support matériel dont l'exécution a commencé avec l'accord préalable exprès du consommateur, qui a renoncé à ce droit. Cet accord et cette renonciation sont recueillis par une case à cocher avant chaque paiement.</p>
<h2>7. Garantie et réclamations</h2><p>Si un contenu acheté ne fonctionne pas comme décrit, contacte-nous via le <a href="/contact/">formulaire</a>&nbsp;: nous le corrigeons ou te remboursons. Les garanties légales de conformité applicables aux contenus numériques s'appliquent.</p>
<h2>8. Médiation</h2><p>En cas de litige non résolu, tu peux recourir gratuitement au médiateur de la consommation&nbsp;: {AC} (nom et site du médiateur). Plateforme européenne de règlement en ligne des litiges&nbsp;: https://ec.europa.eu/consumers/odr.</p>
<h2>9. Droit applicable</h2><p>Les présentes conditions sont soumises au droit français.</p>
</div>"""))
PAGES.append(page("/confidentialite/", "Confidentialité | Voûte", "Ce que Voûte fait (et ne fait pas) de tes données.",
f"""<div class="cadre page-tete"><h1>Confidentialité</h1><p class="chapo">Version courte&nbsp;: Voûte n'a pas de compte, pas de publicité et pas de traceur. Ce qui sert à calculer le ciel reste dans ton téléphone.</p></div>
<div class="cadre prose" style="padding-bottom:clamp(56px,8vw,110px)">
<h2>Ce qui reste sur ton appareil</h2><ul><li><strong>Caméra</strong>&nbsp;: l'image s'affiche derrière le ciel et n'est jamais enregistrée ni envoyée. Une capture n'est créée que si tu appuies sur «&nbsp;Partager&nbsp;».</li>
<li><strong>Orientation et boussole</strong>&nbsp;: utilisées en direct pour savoir où pointe ton téléphone.</li>
<li><strong>Position</strong>&nbsp;: utilisée pour calculer le ciel au-dessus de toi, jamais envoyée à Voûte.</li>
<li><strong>Réglages et achats</strong>&nbsp;: gardés dans le stockage local de ton navigateur.</li></ul>
<h2>Ce qui est transmis, et à qui</h2><ul><li><strong>Paiement</strong>&nbsp;: Stripe reçoit ton e-mail et tes informations de paiement pour traiter la commande. Pour un poster, les textes, la date et le lieu choisis sont enregistrés avec la commande, afin de pouvoir te le livrer à nouveau.</li>
<li><strong>Recherche de lieu</strong> (page poster)&nbsp;: le texte que tu tapes est envoyé au service Nominatim d'OpenStreetMap pour trouver les coordonnées.</li>
<li><strong>Contact et récupération d'achat</strong>&nbsp;: ton e-mail et ton message sont transmis par e-mail via Resend, uniquement pour te répondre ou t'envoyer ton lien.</li>
<li><strong>Hébergement</strong>&nbsp;: Cloudflare traite des données techniques de connexion (adresse IP) pour servir le site et le protéger.</li></ul>
<h2>Durées</h2><p>Les données de commande sont conservées le temps imposé par les obligations comptables (dix ans pour les pièces comptables). Les messages de contact sont conservés le temps de traiter ta demande.</p>
<h2>Tes droits</h2><p>Tu peux demander l'accès, la correction ou la suppression de tes données via le <a href="/contact/">formulaire de contact</a>. Tu peux aussi saisir la CNIL (cnil.fr). Responsable du traitement&nbsp;: l'éditeur indiqué dans les <a href="/mentions-legales/">mentions légales</a>.</p>
<h2>Cookies</h2><p>Voûte n'utilise aucun cookie publicitaire ni outil de mesure d'audience tiers.</p>
</div>"""))
PAGES.append(page("/licences/", "Licences et sources | Voûte", "Les données et bibliothèques libres utilisées par Voûte.",
"""<div class="cadre page-tete"><h1>Licences et sources</h1></div>
<div class="cadre prose" style="padding-bottom:clamp(56px,8vw,110px)">
<h2>Astronomy Engine</h2><p>Calcul des positions (planètes, Lune, rotation de la Terre). Copyright (c) 2019-2023 Don Cross. Licence MIT. https://github.com/cosinekitty/astronomy</p>
<h2>Catalogue d'étoiles et constellations</h2><p>Données de d3-celestial : Copyright (c) 2015, Olaf Frohn. All rights reserved. Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met: (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution. (3) Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.</p>
<h2>Fuseaux horaires</h2><p>Natural Earth, données dans le domaine public.</p>
<h2>Recherche de lieux</h2><p>Nominatim, données © les contributeurs d'OpenStreetMap, sous licence ODbL.</p>
<h2>Polices</h2><p>Bodoni Moda (The Bodoni Moda Project Authors) et Atkinson Hyperlegible (Braille Institute of America), sous licence SIL Open Font License 1.1.</p>
</div>"""))

# ---------------------------------------------------------------- 404
page("/404.html", "Page introuvable | Voûte", "Cette page n'existe pas.",
"""<div class="cadre page-tete" style="padding-bottom:clamp(80px,10vw,140px)"><h1>Cette étoile n'existe pas.</h1><p class="chapo">La page demandée est introuvable. Le ciel, lui, est toujours là.</p>
<div class="boutons"><a class="bouton" href="/ciel/">Ouvrir le ciel</a><a class="lien-sec" href="/">Retour à l'accueil</a></div></div>""", noindex=True)

# ---------------------------------------------------------------- sitemap, robots
idx = [p for p in PAGES if p not in ("/merci/", "/restaurer/")]
with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for p in idx:
        f.write(f"  <url><loc>{SITE}{p}</loc><lastmod>{TODAY}</lastmod></url>\n")
    f.write("</urlset>\n")
with open(os.path.join(ROOT, "robots.txt"), "w") as f:
    f.write(f"User-agent: *\nAllow: /\nDisallow: /merci/\nDisallow: /restaurer/\nDisallow: /api/\n\nSitemap: {SITE}/sitemap.xml\n")
print(len(PAGES), "pages")
