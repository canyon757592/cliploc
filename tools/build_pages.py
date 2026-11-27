#!/usr/bin/env python3
"""Génère les pages statiques indexables (exemples, guides) et le sitemap.

Usage : python3 tools/build_pages.py   (depuis la racine du dépôt)
Les textes sont ici ; modifier puis relancer, puis tools/stamp.py.
"""
import json, os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://cliploc.com"
TODAY = "2026-11-22"
ORG = {"@type": "Organization", "@id": SITE + "/#org", "name": "Cliploc", "url": SITE + "/",
       "logo": SITE + "/icon-512.png", "email": "contact@cliploc.com"}


def stamp(rel):
    import hashlib
    return hashlib.sha1(open(os.path.join(ROOT, rel), "rb").read()).hexdigest()[:8]


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + "</script>"


def page(path, title, desc, body, schema, current="", og_type="article", wide=False, extra_head=""):
    url = SITE + path
    nav = [("/exemples/", "Exemples", "ex"), ("/guides/", "Guides", "gd"), ("/carte/", "Carte", "ct")]
    navh = "".join(f'<a href="{h}" class="opt"{" aria-current=page" if k == current else ""}>{t}</a>' for h, t, k in nav)
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="Cliploc">
<meta property="og:locale" content="fr_FR">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="{SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FBF3E8">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/plus-jakarta-sans-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/pages.css">
{extra_head}{''.join(ld(s) for s in schema)}
</head>
<body>
<a class="skip" href="#main">Aller au contenu</a>
<header><div class="hd">
<a class="logo" href="/" aria-label="Cliploc, accueil"><i></i>Cliploc</a>
<nav aria-label="Navigation">{navh}<a class="btn" href="/">Créer ma vidéo</a></nav>
</div></header>
<main id="main"{' class="wide"' if wide else ''}>
{body}
</main>
<footer>
<a class="logo" href="/" style="justify-content:center"><i></i>Cliploc</a>
<nav aria-label="Liens du site"><a href="/">Créer une vidéo</a><a href="/exemples/">Exemples</a><a href="/guides/">Guides</a><a href="/carte/">Carte des locations</a><a href="/#pr">Formules</a><a href="/#mentions">Mentions légales</a><a href="/#cgv">CGV</a><a href="/#privacy">Confidentialité</a><a href="/#contact">Contact</a></nav>
<div>© Cliploc · non affilié à Airbnb</div>
</footer>
</body>
</html>
"""


def crumbs(items):
    vis = " › ".join(f'<a href="{h}">{t}</a>' if h else t for t, h in items)
    sch = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": t, **({"item": SITE + h} if h else {})}
        for i, (t, h) in enumerate(items)]}
    return f'<p class="crumb">{vis}</p>', sch


def article_schema(path, title, desc):
    return {"@context": "https://schema.org", "@type": "Article", "headline": title, "description": desc,
            "inLanguage": "fr-FR", "datePublished": TODAY, "dateModified": TODAY,
            "author": {"@type": "Organization", "name": "Cliploc", "url": SITE + "/"},
            "publisher": ORG, "mainEntityOfPage": SITE + path, "image": SITE + "/og.png"}


CTA = """<div class="box cta"><p><b>Prête en quelques minutes, à partir de tes photos.</b><br>Colle le lien de ton annonce, ajoute tes photos, choisis la durée et le style.</p><a class="btn" href="/">Créer ma vidéo →</a></div>"""

GUIDES = [
 {
  "slug": "video-annonce-airbnb",
  "h1": "Comment faire une vidéo de ton annonce Airbnb, sans tournage",
  "title": "Faire une vidéo de son annonce Airbnb à partir des photos | Cliploc",
  "desc": "Choix des photos, ordre de la visite, durée, format vertical, musique : la méthode pour transformer les photos d'une location saisonnière en vidéo qui donne envie de réserver.",
  "card": "Les photos à garder, l'ordre de la visite, la bonne durée et le bon format.",
  "body": """
<p class="lead">Tu as déjà de bonnes photos de ton logement. Bien assemblées, elles suffisent pour une vidéo courte qui montre l'enchaînement des pièces, la lumière et les volumes : de quoi la publier sur les réseaux ou l'envoyer à un voyageur qui hésite.</p>

<h2>1. Garde 8 à 12 photos, pas toutes</h2>
<p>Une vidéo n'est pas un album. Retiens les photos les plus nettes et les plus lumineuses, une ou deux par pièce, et supprime les doublons (deux angles presque identiques du même salon). Préfère les photos horizontales de bonne définition : elles supportent mieux le recadrage en vertical.</p>
<ul>
<li><b>À garder :</b> la vue ou l'extérieur, le séjour, la cuisine, chaque chambre, la salle de bain, la terrasse ou la piscine.</li>
<li><b>À écarter :</b> les photos sombres ou floues, les plans serrés sur un objet, tout ce qui montre des personnes ou une adresse lisible.</li>
<li><b>Attention aux écrans :</b> une télévision qui affiche un film ou une série diffuse une image protégée. Choisis une photo où l'écran est éteint.</li>
</ul>

<h2>2. Mets les photos dans l'ordre d'une visite</h2>
<p>Ouvre sur ton plus beau plan (la vue, la piscine, la façade) pour accrocher l'œil dès la première seconde. Ensuite, fais « entrer » le voyageur : séjour, cuisine, chambres, salle de bain. Termine sur un plan fort, idéalement l'extérieur au coucher du soleil ou la vue de nuit, pour laisser une dernière image marquante.</p>

<h2>3. Choisis la durée selon l'usage</h2>
<table>
<tr><th>Durée</th><th>Pour quoi faire</th></tr>
<tr><td>15 secondes</td><td>Une accroche pour les stories et les Reels : 4 à 6 photos, les plus spectaculaires.</td></tr>
<tr><td>30 secondes</td><td>Le format polyvalent : réseaux, message privé, site de réservation.</td></tr>
<tr><td>45 à 60 secondes</td><td>Une visite complète, pièce par pièce, à envoyer à un voyageur qui pose des questions.</td></tr>
</table>
<p>Compte 2 à 4 secondes par photo : assez pour voir la pièce, pas assez pour s'ennuyer.</p>

<h2>4. Le bon format pour chaque endroit</h2>
<ul>
<li><b>Vertical 9:16</b> (1080 × 1920 en Full HD) : Reels Instagram, TikTok, YouTube Shorts, stories, WhatsApp.</li>
<li><b>Carré 1:1</b> : fil Instagram et Facebook.</li>
<li><b>Horizontal 16:9</b> : YouTube, ton site, une présentation sur ordinateur.</li>
</ul>
<p>Le vertical est le format le plus utile aujourd'hui : c'est celui qui occupe tout l'écran du téléphone.</p>

<h2>5. Donne du mouvement aux photos</h2>
<p>Une photo fixe affichée trois secondes paraît figée. Un léger zoom ou un panoramique lent (l'effet « Ken Burns ») donne l'impression d'une caméra qui avance dans la pièce. Garde des mouvements doux et réguliers : la vidéo doit donner envie, pas le mal de mer.</p>

<h2>6. Texte et musique : simple et sans risque</h2>
<p>À l'écran, quelques mots suffisent : la ville, le type de logement, un point fort (« vue mer », « piscine chauffée », « 6 couchages »). Pour la musique, utilise uniquement une musique libre de droits ou celle proposée par la plateforme où tu publies. Une musique commerciale ajoutée sans licence peut faire couper le son, bloquer la vidéo ou la rendre indisponible dans certains pays.</p>

<h2>7. Où publier ta vidéo</h2>
<ul>
<li>Sur tes réseaux : Instagram, TikTok, Facebook, YouTube Shorts.</li>
<li>En message privé : WhatsApp, SMS ou email, pour un voyageur qui hésite entre deux logements.</li>
<li>Sur ton site de réservation directe et ta fiche Google, si tu en as.</li>
<li>Sur les sites d'annonces qui acceptent la vidéo, selon le type d'annonce et de compte.</li>
</ul>
<p>Chaque plateforme a ses propres règles (durée maximale, formats acceptés, contenus autorisés) : vérifie-les avant de publier.</p>

<div class="tip"><b>Règle d'or :</b> montre le logement tel qu'il est. Une vidéo trop flatteuse attire des réservations, puis des avis déçus.</div>

<h2>Les erreurs les plus fréquentes</h2>
<ul>
<li>Trop de photos : la vidéo s'étire et on décroche avant la fin.</li>
<li>Une première image faible : l'entrée ou un couloir au lieu de la vue.</li>
<li>Un texte trop petit, illisible sur téléphone.</li>
<li>Le mauvais format : une vidéo horizontale publiée en story, avec de grandes bandes noires.</li>
<li>Des photos dont tu n'as pas les droits : demande l'accord du propriétaire ou du photographe.</li>
</ul>

<h2>Le faire en quelques minutes avec Cliploc</h2>
<p>Avec Cliploc, tu colles le lien de ton annonce, tu ajoutes tes photos, puis tu choisis la durée (15 à 60 secondes), la qualité (HD à 4K), le mouvement de caméra et le format. Tes photos prennent du relief et une caméra virtuelle s'y déplace : elle avance dans les pièces et survole la terrasse. La vidéo est livrée sans filigrane. Tu peux voir le résultat sur la page <a href="/exemples/">exemples</a>.</p>
"""
 },
 {
  "slug": "reels-tiktok-location-saisonniere",
  "h1": "Reels et TikTok pour ta location saisonnière : le guide pratique",
  "title": "Reels Instagram et TikTok pour location saisonnière : le guide | Cliploc",
  "desc": "Format, premières secondes, texte à l'écran, légende, hashtags, rythme de publication : comment utiliser les vidéos courtes pour faire connaître une location saisonnière.",
  "card": "Format, accroche, légende et rythme de publication pour faire connaître ton logement.",
  "body": """
<p class="lead">Les fils d'Instagram, de TikTok et de YouTube sont faits de vidéos verticales. Beaucoup de voyageurs y découvrent des destinations et des logements en faisant défiler leur écran. Une vidéo courte de ton logement te donne une place dans ce fil.</p>

<h2>Le format technique, une fois pour toutes</h2>
<ul>
<li><b>Vertical 9:16</b>, en 1080 × 1920 (Full HD) au minimum.</li>
<li><b>Fichier MP4</b>, le format accepté partout.</li>
<li><b>Zone de sécurité :</b> garde le texte au centre de l'image. Le haut et le bas sont recouverts par le nom du compte, la légende et les boutons.</li>
</ul>

<h2>Les deux premières secondes décident de tout</h2>
<p>La personne qui fait défiler son fil décide presque immédiatement si elle s'arrête. Commence donc par l'image la plus forte : la vue, la piscine, la terrasse au coucher du soleil. Garde l'entrée, les couloirs et la salle de bain pour plus tard.</p>

<h2>Le texte à l'écran</h2>
<p>Une idée par écran, en gros caractères, avec un bon contraste. Par exemple : « Appartement vue sur la ville », puis « 2 chambres · balcon », puis « Réserve en direct, lien en bio ». Beaucoup de gens regardent sans le son : le texte doit suffire à comprendre.</p>

<h2>La légende et les hashtags</h2>
<p>Dans la légende, réponds aux questions qu'un voyageur se pose : où, pour combien de personnes, ce qui rend le logement unique, comment réserver. Pour les hashtags, quelques mots-clés de lieu (la ville, la région, le quartier) sont plus utiles qu'une longue liste de hashtags génériques.</p>

<h2>Une vidéo, plusieurs déclinaisons</h2>
<p>Tu n'as pas besoin d'un nouveau tournage à chaque publication. À partir des mêmes photos, tu peux publier :</p>
<ul>
<li>une accroche de 15 secondes avec les trois plus beaux plans ;</li>
<li>une visite de 30 secondes, pièce par pièce ;</li>
<li>une version de nuit ou de coucher de soleil, avec une autre ambiance de couleurs ;</li>
<li>une version carrée pour le fil Instagram et Facebook.</li>
</ul>

<h2>Le rythme de publication</h2>
<p>La régularité compte plus que la quantité. Une ou deux publications par semaine, tenues dans la durée, valent mieux qu'une semaine intensive suivie d'un mois de silence. Alterne les logements, les saisons et les points de vue.</p>

<h2>Ce qu'il faut regarder dans les statistiques</h2>
<p>Les vues ne disent pas tout. Regarde surtout combien de temps les gens restent sur la vidéo, combien l'enregistrent ou la partagent, et combien t'écrivent ensuite. Sur Instagram, les statistiques détaillées demandent un compte professionnel ou créateur, gratuit à activer dans les réglages.</p>

<div class="tip"><b>Musique :</b> utilise les musiques proposées par l'application au moment de publier, ou une musique libre de droits. Une musique ajoutée sans licence peut faire couper le son de ta vidéo.</div>

<h2>Préparer tes vidéos avec Cliploc</h2>
<p>Cliploc monte tes photos en vidéo verticale, carrée ou horizontale, de 15 à 60 secondes, avec un mouvement de caméra au choix (dynamique, visite, drone, cinéma) et plusieurs ambiances de couleurs. Pour la méthode complète, lis aussi <a href="/guides/video-annonce-airbnb/">comment faire une vidéo de ton annonce</a>.</p>
"""
 },
 {
  "slug": "video-conciergerie-airbnb",
  "h1": "Conciergerie Airbnb : proposer des vidéos à tes propriétaires",
  "title": "Conciergerie Airbnb : proposer des vidéos de logement | Cliploc",
  "desc": "Pourquoi et comment une conciergerie ou un freelance peut proposer des vidéos de logement aux propriétaires : ce qu'il faut livrer, les droits sur les photos, la méthode et le message de prospection.",
  "card": "Une offre de plus pour tes propriétaires : quoi livrer, les droits, la méthode.",
  "body": """
<p class="lead">Pour une conciergerie ou un freelance qui travaille avec des hôtes, la vidéo de logement est un service simple à ajouter : elle se voit, elle se partage, et elle se produit à partir des photos qui existent déjà.</p>

<h2>Pourquoi proposer des vidéos</h2>
<ul>
<li><b>Te démarquer</b> quand tu démarches de nouveaux propriétaires : tu montres un résultat concret, pas une promesse.</li>
<li><b>Alimenter tes propres réseaux</b> avec les logements que tu gères.</li>
<li><b>Aider tes équipes</b> à répondre aux voyageurs qui hésitent, avec une vidéo envoyée en message privé.</li>
</ul>

<h2>Ce que tu livres</h2>
<p>Une offre claire tient en une ligne. Par exemple, par logement :</p>
<ul>
<li>une vidéo verticale de 30 secondes pour les réseaux et les messages ;</li>
<li>une version courte de 15 secondes pour les stories ;</li>
<li>en option, une version carrée ou horizontale.</li>
</ul>

<h2>Les photos et les droits : à régler avant tout</h2>
<p>Les photos d'une annonce appartiennent au propriétaire du logement ou au photographe qui les a prises, selon leur contrat. Avant de monter une vidéo et de la publier, obtiens leur accord écrit, en précisant les usages : réseaux de la conciergerie, publicité, envoi aux voyageurs. Un simple email de confirmation suffit souvent, mais il doit exister.</p>

<h2>La méthode en 5 étapes</h2>
<ol>
<li><b>Récupère les photos</b> en bonne définition, plutôt que des captures d'écran de l'annonce.</li>
<li><b>Choisis 8 à 12 photos</b> et l'ordre de la visite, en ouvrant sur le plan le plus fort.</li>
<li><b>Monte la vidéo</b> dans la durée et le format voulus.</li>
<li><b>Fais-la valider</b> par le propriétaire.</li>
<li><b>Livre le fichier</b> et propose un plan de publication : quand, où, avec quelle légende.</li>
</ol>

<h2>Fixer ton prix</h2>
<p>Ton prix dépend de ton marché, du temps passé (sélection des photos, échanges, publication) et de ce que tu inclus. Deux approches courantes : une option facturée à l'unité, ou un service inclus dans un pack premium pour te démarquer. Dans tous les cas, annonce un prix clair avant de commencer.</p>

<h2>Un message de prospection prêt à adapter</h2>
<div class="box"><p style="margin:0">Bonjour [prénom], je gère des locations saisonnières à [ville]. J'ai préparé une courte vidéo de votre logement à partir des photos de votre annonce, pour vous montrer ce que cela donnerait sur les réseaux et dans les messages aux voyageurs. Voulez-vous que je vous l'envoie ?</p></div>
<p>Préparer la vidéo avant d'écrire rend la démarche concrète. Ne la publie pas sans l'accord du propriétaire.</p>

<h2>Produire les vidéos avec Cliploc</h2>
<p>Cliploc est pensé pour ce travail : tu colles le lien de l'annonce, tu ajoutes les photos et la vidéo est prête en quelques minutes, sans filigrane. Les <a href="/#pr">formules mensuelles</a> donnent des crédits chaque mois pour enchaîner les logements. Vois le rendu sur la page <a href="/exemples/">exemples</a>.</p>
"""
 },
]

FORMATS = [  # code, nom, titre de section, usage, largeur, hauteur d'affichage, suffixe de fichier, classe
    ("v", "vertical", "Vertical", "pour les Reels, TikTok et les stories", 540, 960, "", ""),
    ("s", "carré", "Carré", "pour le fil Instagram et Facebook", 540, 540, "_s", " sq"),
    ("h", "horizontal", "Horizontal", "pour YouTube et ton site", 960, 540, "_h", " hz"),
]

VIDEOS = [
 ("villa_piscine", "Villa avec piscine à débordement", "Visite d'une villa avec piscine à débordement et vue sur la ville, au coucher du soleil puis de nuit. Style drone, 30 secondes, Full HD vertical.", 30, "Drone · 30 s · Full HD"),
 ("appart_skyline", "Appartement en hauteur", "Appartement en étage élevé avec balcon et vue sur les tours : séjour, chambres, salle de bain. Style dynamique, 30 secondes, Full HD vertical.", 30, "Dynamique · 30 s · Full HD"),
 ("villa_cinema", "Villa vue sur la ville, style cinéma", "Accroche de 15 secondes d'une villa avec terrasse, piscine et vue panoramique, avec un étalonnage cinéma.", 15, "Cinéma · 15 s · Full HD"),
 ("appart_visite", "Appartement 2 chambres, visite complète", "Visite pièce par pièce d'un appartement de deux chambres : séjour, chambres, dressing, salle de bain, balcon. Style visite, 45 secondes, HD vertical.", 45, "Visite · 45 s · HD"),
 ("appart_nuit", "Appartement de nuit, style cinéma", "Accroche de nuit de 15 secondes : balcon, vue sur la ville illuminée, chambre et salon.", 15, "Cinéma · 15 s · Full HD"),
]


def build():
    out = []
    # ----- guides -----
    for g in GUIDES:
        path = f"/guides/{g['slug']}/"
        cr, crs = crumbs([("Accueil", "/"), ("Guides", "/guides/"), (g["h1"], None)])
        others = [o for o in GUIDES if o is not g]
        more = '<h2>À lire aussi</h2><div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">' + "".join(
            f'<a class="card" href="/guides/{o["slug"]}/"><b>{o["h1"]}</b><span>{o["card"]}</span></a>' for o in others) + "</div>"
        body = f'{cr}<p class="kk">Guide</p><h1>{g["h1"]}</h1><p class="meta">Mis à jour le 22 novembre 2026 · par l\'équipe Cliploc</p>{g["body"]}{CTA}{more}'
        out.append((path, page(path, g["title"], g["desc"], body, [article_schema(path, g["h1"], g["desc"]), crs], "gd")))
    # ----- index des guides -----
    cr, crs = crumbs([("Accueil", "/"), ("Guides", None)])
    cards = "".join(f'<a class="card" href="/guides/{g["slug"]}/"><b>{g["h1"]}</b><span>{g["card"]}</span></a>' for g in GUIDES)
    body = f'{cr}<p class="kk">Guides</p><h1>Guides vidéo pour la location saisonnière</h1><p class="lead">Des méthodes simples pour transformer les photos d\'un logement en vidéo, la publier au bon endroit et en faire un service pour tes propriétaires.</p><div class="cards">{cards}</div>{CTA}'
    coll = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Guides vidéo pour la location saisonnière",
            "url": SITE + "/guides/", "inLanguage": "fr-FR", "isPartOf": {"@id": SITE + "/#site"},
            "hasPart": [{"@type": "Article", "headline": g["h1"], "url": f"{SITE}/guides/{g['slug']}/"} for g in GUIDES]}
    out.append(("/guides/", page("/guides/", "Guides vidéo pour location saisonnière et Airbnb | Cliploc",
                                  "Méthodes pratiques pour créer des vidéos de logement : annonce Airbnb, Reels et TikTok, offre vidéo pour conciergerie.",
                                  body, [coll, crs], "gd", "website", wide=True)))
    # ----- exemples : chaque vidéo en vertical, carré et horizontal -----
    cr, crs = crumbs([("Accueil", "/"), ("Exemples", None)])
    vids, sections = [], []
    for fk, fname, flabel, usage, fw, fh, suf, cls in FORMATS:
        figs = []
        for k, t, d, s, m in VIDEOS:
            if not os.path.exists(os.path.join(ROOT, "examples", f"{k}{suf}.mp4")): continue
            figs.append(f'<figure class="vc"><video controls playsinline preload="none" poster="/examples/thumb/{k}{suf}.jpg" width="{fw}" height="{fh}" aria-label="{html.escape(t)}, format {fname}"><source src="/examples/{k}{suf}.mp4" type="video/mp4"></video><figcaption><b>{t}</b><span>{m}</span></figcaption></figure>')
            vids.append({"@context": "https://schema.org", "@type": "VideoObject", "name": f"{t} (format {fname})", "description": d.replace(" vertical.", ".") + f" Format {fname}.",
                         "thumbnailUrl": f"{SITE}/examples/{k}{suf}.jpg", "contentUrl": f"{SITE}/examples/{k}{suf}.mp4",
                         "uploadDate": "2026-11-22T00:00:00+01:00", "duration": f"PT{s}S", "inLanguage": "fr-FR",
                         "publisher": ORG})
        if figs:
            sections.append(f'<h2>{flabel}, {usage}</h2><div class="vg{cls}">{"".join(figs)}</div>')
    body = (f'{cr}<p class="kk">Exemples</p><h1>Exemples de vidéos d\'annonce réalisées avec Cliploc</h1>'
            f'<p class="lead">Ces vidéos ont été montées avec Cliploc, à partir des photos de vrais logements : une villa avec piscine et un appartement en hauteur. Chacune existe en trois formats : vertical, carré et horizontal. Les tiennes seront faites avec les photos de ton annonce.</p>'
            f'{"".join(sections)}'
            f'<h2>Ce que tu choisis pour chaque vidéo</h2><ul><li><b>La durée :</b> 15, 30, 45 ou 60 secondes.</li><li><b>La qualité :</b> HD, Full HD ou 4K.</li><li><b>Le mouvement :</b> dynamique, visite, drone ou cinéma.</li><li><b>Les couleurs :</b> naturel, chaud, frais, cinéma et d\'autres ambiances.</li><li><b>Le format :</b> vertical, carré ou horizontal.</li></ul>'
            f'<p>Pour bien choisir tes photos et l\'ordre de la visite, lis le guide <a href="/guides/video-annonce-airbnb/">comment faire une vidéo de ton annonce Airbnb</a>.</p>{CTA}')
    out.append(("/exemples/", page("/exemples/", "Exemples de vidéos d'annonce Airbnb et location saisonnière | Cliploc",
                                    "Regarde des vidéos réalisées avec Cliploc à partir des photos de vrais logements, en vertical, carré et horizontal : villa avec piscine, appartement avec vue.",
                                    body, vids + [crs], "ex", "website", wide=True,
                                    extra_head=f'<link rel="preload" as="image" href="/examples/thumb/{VIDEOS[0][0]}.jpg" fetchpriority="high">\n')))
    # ----- carte des locations courte durée (Eurostat, par département) -----
    fr = os.path.join(ROOT, "carte", "data", "france.json")
    if os.path.exists(fr):
        D = json.load(open(fr, encoding="utf-8"))
        nf = lambda n: f"{n:,}".replace(",", "\u202f")
        pc = lambda x: f"{x:+.1f}".replace(".", ",").replace("-", "−") + "\u00a0%"
        cr, crs = crumbs([("Accueil", "/"), ("Carte des locations", None)])
        deps = D["deps"]
        evo = lambda d: 100 * (d["v"] / d["p"] - 1)
        top = "".join(f'<tr><td>{d["r"]}</td><td>{html.escape(d["n"])} ({d["c"]})</td><td>{nf(d["v"])}</td><td>{pc(evo(d))}</td><td>{round(100 * d["e"] / d["v"])}\u00a0%</td></tr>' for d in deps[:15])
        hausse = sorted(deps, key=lambda d: -evo(d))[:5]
        etr = sorted(deps, key=lambda d: -d["e"] / d["v"])[:5]
        tot, prec = D["total"], D["total_prec"]
        h1 = "Carte des locations courte durée en France"
        desc = (f"Carte interactive des nuitées réservées sur Airbnb, Booking, Expedia et Tripadvisor en 2025, département par département : "
                f"{nf(tot)} nuitées en France ({pc(100 * (tot / prec - 1))} sur un an). Chiffres officiels Eurostat.")
        body = (f'{cr}<p class="kk">Carte</p><h1>{h1}</h1>'
                f'<p class="lead">Où les voyageurs réservent-ils le plus de nuits en location type Airbnb ? Les chiffres officiels de 2025 pour les 101 départements, publiés par Eurostat à partir des données d\'Airbnb, Booking, Expedia et Tripadvisor.</p>'
                f'<section class="ct charge" id="carte" aria-label="Carte interactive">'
                f'<form class="recherche" role="search"><label for="cherche">Ton département</label><input id="cherche" list="deps" autocomplete="off" placeholder="Nom ou numéro, par exemple Gironde ou 33"><datalist id="deps"></datalist><button type="submit">Voir</button><p class="msg" role="status"></p></form>'
                f'<div class="bar"><div class="seg mesures" role="group" aria-label="Chiffre affiché"><button type="button" data-m="v" aria-pressed="true">Nuitées</button><button type="button" data-m="evo" aria-pressed="false">Évolution</button><button type="button" data-m="etr" aria-pressed="false">Voyageurs étrangers</button></div></div>'
                f'<div class="grille"><div><div class="cv"><div class="mp" role="region" aria-label="Carte de France des nuitées par département"></div></div><div class="leg"></div><div class="dom"></div></div>'
                f'<aside class="fiche" aria-live="polite"><p>Chargement de la carte…</p></aside></div>'
                f'<div class="rang"><h2>Classement</h2><ol></ol><button type="button" class="lien tout"></button></div>'
                f'<noscript><p>La carte a besoin de JavaScript. Les principaux chiffres sont dans le tableau plus bas.</p></noscript></section>'
                f'<h2>Ce que montre cette carte</h2><ul>'
                f'<li><b>Nuitées réservées :</b> le nombre de nuits passées par des voyageurs dans des logements loués via Airbnb, Booking.com, Expedia et Tripadvisor. Une nuit pour quatre personnes compte quatre nuitées.</li>'
                f'<li><b>Les quatre plateformes ensemble :</b> Eurostat ne publie pas Airbnb à part. Ce sont des logements de particuliers et de professionnels, pas les hôtels.</li>'
                f'<li><b>Évolution :</b> la comparaison entre 2025 et 2024 pour le même département.</li>'
                f'<li><b>Voyageurs étrangers :</b> la part des nuitées réservées par des voyageurs qui ne résident pas en France.</li></ul>'
                f'<h2>Les 15 départements où l\'on réserve le plus</h2>'
                f'<div class="tw"><table class="tb"><tr><th>Rang</th><th>Département</th><th>Nuitées 2025</th><th>Sur un an</th><th>Étrangers</th></tr>{top}</table></div>'
                f'<h2>Plus forte hausse sur un an</h2><p>{", ".join(f"{html.escape(d['n'])} ({pc(evo(d))})" for d in hausse)}.</p>'
                f'<h2>Le plus de voyageurs étrangers</h2><p>{", ".join(f"{html.escape(d['n'])} ({round(100 * d['e'] / d['v'])}\u00a0%)" for d in etr)}.</p>'
                f'<div class="box cta"><p><b>Tu loues dans un de ces départements ?</b><br>Fais ressortir ton annonce avec une vidéo, à partir des photos que tu as déjà.</p><a class="btn" href="/">Créer ma vidéo →</a></div>'
                f'<p class="source">Chiffres : <a href="https://ec.europa.eu/eurostat/databrowser/view/tour_ce_oan3/default/table?lang=fr" rel="noopener">Eurostat, jeu tour_ce_oan3</a> (nuitées dans les hébergements de courte durée réservés via des plateformes en ligne, par région NUTS 3), données 2024 et 2025. '
                f'Contours des départements : IGN Admin Express (Licence Ouverte), via france-geojson. Fond de carte : © contributeurs OpenStreetMap. '
                f'Cliploc n\'est affilié ni à Airbnb, ni à Booking, ni à Expedia, ni à Tripadvisor.</p>'
                f'<script src="/vendor/leaflet-1.9.4/leaflet.js" defer></script>'
                f'<script src="/carte/carte.js?v={stamp("carte/carte.js")}" defer></script>')
        ds = {"@context": "https://schema.org", "@type": "Dataset", "name": "Nuitées en location courte durée par département (2024-2025)",
              "description": desc, "url": SITE + "/carte/", "inLanguage": "fr-FR", "isBasedOn": "https://ec.europa.eu/eurostat/databrowser/view/tour_ce_oan3/default/table",
              "creator": ORG, "temporalCoverage": "2024/2025", "spatialCoverage": {"@type": "Place", "name": "France", "address": {"@type": "PostalAddress", "addressCountry": "FR"}}}
        out.append(("/carte/", page("/carte/", "Carte des locations Airbnb en France par département (2025) | Cliploc", desc, body, [ds, crs], "ct", "website", wide=True,
                                    extra_head=f'<link rel="preload" href="/carte/data/france.json" as="fetch" crossorigin>\n<link rel="stylesheet" href="/vendor/leaflet-1.9.4/leaflet.css">\n<link rel="stylesheet" href="/carte/carte.css?v={stamp("carte/carte.css")}">\n')))
    for path, h in out:
        d = os.path.join(ROOT, path.strip("/"))
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "index.html"), "w", encoding="utf-8") as f:
            f.write(h)
    # ----- sitemap (pages + vidéos) -----
    urls = ["/", "/exemples/", "/guides/"] + (["/carte/"] if os.path.exists(os.path.join(ROOT, "carte", "data", "france.json")) else []) + [f"/guides/{g['slug']}/" for g in GUIDES]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">']
    for u in urls:
        sm.append(f"  <url><loc>{SITE}{u}</loc><lastmod>{TODAY}</lastmod>")
        if u == "/exemples/":
            for v in vids:
                if v.get("@type") != "VideoObject": continue
                sm.append(f"    <video:video><video:thumbnail_loc>{v['thumbnailUrl']}</video:thumbnail_loc><video:title>{html.escape(v['name'])}</video:title><video:description>{html.escape(v['description'])}</video:description><video:content_loc>{v['contentUrl']}</video:content_loc><video:duration>{v['duration'][2:-1]}</video:duration><video:publication_date>{v['uploadDate']}</video:publication_date><video:family_friendly>yes</video:family_friendly></video:video>")
        sm.append("  </url>")
    sm.append("</urlset>")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write("\n".join(sm) + "\n")
    print("pages :", [p for p, _ in out])


if __name__ == "__main__":
    build()
