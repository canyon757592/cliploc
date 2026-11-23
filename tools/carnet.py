#!/usr/bin/env python3
"""Génère « Le Carnet des étoiles » (PDF A5) de Lunétoiles.
Textes originaux ; positions d'étoiles tirées du catalogue d3-celestial (BSD-3) fourni avec le site."""
import json, math, os, datetime
from reportlab.lib.pagesizes import A5
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
                                NextPageTemplate, Flowable, Table, TableStyle, KeepTogether)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = "/tmp/carnet_fonts"
for name, f in [("Bodoni", "bodoni-moda-latin-500-normal.ttf"), ("Bodoni-It", "bodoni-moda-latin-400-italic.ttf"),
                ("Bodoni-BI", "bodoni-moda-latin-500-italic.ttf"), ("Atk", "atkinson-hyperlegible-latin-400-normal.ttf"),
                ("Atk-B", "atkinson-hyperlegible-latin-700-normal.ttf")]:
    pdfmetrics.registerFont(TTFont(name, os.path.join(FONTS, f)))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("Atk", normal="Atk", bold="Atk-B", italic="Atk", boldItalic="Atk-B")

NUIT = colors.HexColor("#10234a"); ABYSSE = colors.HexColor("#0a1834"); ETOILE = colors.HexColor("#f4efe2")
LAITON = colors.HexColor("#c8a45d"); VIOLET = colors.HexColor("#8b6cf6"); PAPIER = colors.HexColor("#f4f5fa")
ENCRE = colors.HexColor("#14284f"); BRUME = colors.HexColor("#56627e")
W, H = A5

sky = json.load(open(os.path.join(ROOT, "assets/data/sky.json"), encoding="utf-8"))
ST = sky["stars"]; N = len(ST) // 4
STARS = [(ST[i*4] / 100, ST[i*4+1] / 100, ST[i*4+2] / 100, ST[i*4+3] / 100) for i in range(N)]  # ra, dec, mag, bv
NAMES = {int(k): v for k, v in sky["names"].items()}
CONS = {c["id"]: c for c in sky["cons"]}
R = math.radians

def vec(ra, dec):
    a, d = R(ra), R(dec); return (math.cos(d) * math.cos(a), math.cos(d) * math.sin(a), math.sin(d))

# ---------------------------------------------------------------- styles
st = {
  "titre": ParagraphStyle("titre", fontName="Bodoni", fontSize=26, leading=30, textColor=ENCRE, spaceAfter=10),
  "chap": ParagraphStyle("chap", fontName="Bodoni-It", fontSize=11, leading=14, textColor=VIOLET, spaceAfter=4),
  "h2": ParagraphStyle("h2", fontName="Bodoni", fontSize=15, leading=19, textColor=ENCRE, spaceBefore=10, spaceAfter=5),
  "p": ParagraphStyle("p", fontName="Atk", fontSize=9.6, leading=14.2, textColor=ENCRE, spaceAfter=6.5),
  "pi": ParagraphStyle("pi", fontName="Atk", fontSize=9.6, leading=14.2, textColor=ENCRE, leftIndent=10, bulletIndent=0, spaceAfter=3.5),
  "note": ParagraphStyle("note", fontName="Bodoni-It", fontSize=10.5, leading=15, textColor=BRUME, leftIndent=10, borderPadding=(2, 0, 2, 8), spaceBefore=4, spaceAfter=8),
  "leg": ParagraphStyle("leg", fontName="Bodoni-It", fontSize=9, leading=12, textColor=BRUME, alignment=TA_CENTER, spaceBefore=4, spaceAfter=8),
  "toc": ParagraphStyle("toc", fontName="Atk", fontSize=10, leading=17, textColor=ENCRE),
  "cell": ParagraphStyle("cell", fontName="Atk", fontSize=8.6, leading=11, textColor=ENCRE),
  "cellb": ParagraphStyle("cellb", fontName="Atk-B", fontSize=8.6, leading=11, textColor=ENCRE),
}
P = lambda t, s="p": Paragraph(t, st[s])
def puces(items): return [Paragraph(t, st["pi"], bulletText="•") for t in items]

# ---------------------------------------------------------------- fonds de page
def fond_clair(c, doc):
    c.saveState(); c.setFillColor(PAPIER); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setStrokeColor(LAITON); c.setLineWidth(0.5); c.rect(9*mm, 9*mm, W - 18*mm, H - 18*mm, stroke=1, fill=0)
    c.setFont("Bodoni-It", 8); c.setFillColor(BRUME)
    c.drawCentredString(W / 2, 12.5*mm, f"Le Carnet des étoiles  ·  {doc.page}")
    c.restoreState()
def fond_nuit(c, doc):
    c.saveState(); c.setFillColor(ABYSSE); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setStrokeColor(LAITON); c.setLineWidth(0.6); c.rect(8*mm, 8*mm, W - 16*mm, H - 16*mm, stroke=1, fill=0)
    c.setFont("Bodoni-It", 8); c.setFillColor(LAITON); c.drawCentredString(W / 2, 11.5*mm, f"{doc.page}")
    c.restoreState()

# ---------------------------------------------------------------- dessins
def dessine_etoile(c, x, y, m, k=1.0, col=ETOILE):
    r = max(0.35, (5.3 - m) * 0.55) * k
    if m < 1.2:
        c.setFillColor(col); c.setFillAlpha(0.18); c.circle(x, y, r * 2.6, stroke=0, fill=1); c.setFillAlpha(1)
    c.setFillColor(col); c.circle(x, y, r, stroke=0, fill=1)

class Planche(Flowable):
    """Une constellation en projection gnomonique, vue de l'intérieur (est à gauche)."""
    def __init__(self, cid, w, h, champ=1.0, noms_max=3.2, aussi=()):
        super().__init__(); self.cid, self.w, self.h, self.champ, self.noms_max, self.aussi = cid, w, h, champ, noms_max, set(aussi)
    def wrap(self, *a): return self.w, self.h
    def draw(self):
        c = self.canv; con = CONS[self.cid]
        cen = vec(con["ra"] / 100, con["dec"] / 100)
        e = (-cen[1], cen[0], 0); l = math.hypot(*e); e = tuple(x / l for x in e)
        n = (cen[1]*e[2]-cen[2]*e[1], cen[2]*e[0]-cen[0]*e[2], cen[0]*e[1]-cen[1]*e[0])
        S = self.w * 1.05 * self.champ; cx, cy = self.w / 2, self.h / 2
        def P(v):
            z = sum(a*b for a, b in zip(v, cen))
            if z < 0.8: return None
            return (cx - sum(a*b for a, b in zip(v, e)) / z * S, cy + sum(a*b for a, b in zip(v, n)) / z * S)
        c.saveState(); c.setFillColor(NUIT); c.roundRect(0, 0, self.w, self.h, 6, stroke=0, fill=1)
        p = c.beginPath(); p.roundRect(0, 0, self.w, self.h, 6); c.clipPath(p, stroke=0)
        for oid, o in CONS.items():
            c.setStrokeColor(LAITON); c.setStrokeAlpha(0.95 if oid == self.cid else 0.2); c.setLineWidth(1.1 if oid == self.cid else 0.5)
            for seg in o["l"]:
                pts = [P(vec(seg[i] / 100, seg[i+1] / 100)) for i in range(0, len(seg), 2)]
                for a, b in zip(pts, pts[1:]):
                    if a and b: c.line(a[0], a[1], b[0], b[1])
        c.setStrokeAlpha(1)
        for i, (ra, dec, m, bv) in enumerate(STARS):
            if m > 5.4: break
            q = P(vec(ra, dec))
            if not q or not (0 <= q[0] <= self.w and 0 <= q[1] <= self.h): continue
            dessine_etoile(c, q[0], q[1], m, 1.05)
            nm = NAMES.get(i)
            if nm and ((nm[1] == self.cid and m < self.noms_max) or nm[0] in self.aussi):
                c.setFillColor(colors.HexColor("#d8b876")); c.setFont("Bodoni-It", 8.5); c.drawString(q[0] + 4, q[1] - 2.5, nm[0])
        c.restoreState()

def gmst_deg(dt):
    jd = dt.timestamp() / 86400 + 2440587.5
    return (280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360

class Dome(Flowable):
    """Le ciel entier au-dessus de Paris à une date (nord en haut, est à gauche)."""
    def __init__(self, dt_utc, taille, titre):
        super().__init__(); self.dt, self.t, self.titre = dt_utc, taille, titre
    def wrap(self, *a): return self.t, self.t + 14
    def draw(self):
        c = self.canv; lat, lon = 48.8566, 2.3522
        lst = gmst_deg(self.dt) + lon; Rr = self.t / 2 - 6; cx, cy = self.t / 2, self.t / 2 + 14
        def aa(ra, dec):
            ha, d, la = R(lst - ra), R(dec), R(lat)
            alt = math.asin(math.sin(d)*math.sin(la) + math.cos(d)*math.cos(la)*math.cos(ha))
            az = math.atan2(-math.sin(ha)*math.cos(d), math.cos(la)*math.sin(d) - math.sin(la)*math.cos(d)*math.cos(ha))
            return alt, az
        def P(ra, dec):
            alt, az = aa(ra, dec)
            if alt < 0: return None
            r = Rr * math.tan((math.pi/2 - alt) / 2)
            return (cx - r * math.sin(az), cy + r * math.cos(az))
        c.saveState(); c.setFillColor(NUIT); c.circle(cx, cy, Rr, stroke=0, fill=1)
        p = c.beginPath(); p.circle(cx, cy, Rr); c.clipPath(p, stroke=0)
        c.setStrokeColor(LAITON); c.setStrokeAlpha(0.6); c.setLineWidth(0.45)
        for o in CONS.values():
            for seg in o["l"]:
                pts = [P(seg[i] / 100, seg[i+1] / 100) for i in range(0, len(seg), 2)]
                for a, b in zip(pts, pts[1:]):
                    if a and b: c.line(a[0], a[1], b[0], b[1])
        c.setStrokeAlpha(1)
        for ra, dec, m, bv in STARS:
            if m > 4.8: break
            q = P(ra, dec)
            if q: dessine_etoile(c, q[0], q[1], m, 0.55)
        c.setFont("Bodoni-It", 6.2); c.setFillColor(colors.HexColor("#d8b876"))
        for o in CONS.values():
            if o["rk"] > 1: continue
            q = P(o["ra"] / 100, o["dec"] / 100)
            if q: c.drawCentredString(q[0], q[1], o["fr"])
        c.restoreState()
        c.setStrokeColor(LAITON); c.setLineWidth(0.8); c.circle(cx, cy, Rr, stroke=1, fill=0)
        c.setFont("Bodoni", 7); c.setFillColor(ENCRE)
        for l, a in (("N", 0), ("E", 90), ("S", 180), ("O", 270)):
            t = R(a); c.drawCentredString(cx - math.sin(t) * (Rr + 5) , cy + math.cos(t) * (Rr + 5) - 2.5, l)
        c.setFont("Bodoni-It", 9); c.setFillColor(BRUME); c.drawCentredString(cx, 2, self.titre)

class Phases(Flowable):
    """Les huit phases de la Lune, vues depuis l'hémisphère Nord."""
    NOMS = ["Nouvelle Lune", "Premier croissant", "Premier quartier", "Gibbeuse croissante", "Pleine Lune", "Gibbeuse décroissante", "Dernier quartier", "Dernier croissant"]
    def __init__(self, w): super().__init__(); self.w = w
    def wrap(self, *a): return self.w, 108
    def draw(self):
        c = self.canv; r = 13
        for k in range(8):
            col, row = k % 4, k // 4
            x = self.w * (col + 0.5) / 4; y = 80 - row * 56
            f = k / 8  # fraction du cycle
            c.setFillColor(NUIT); c.circle(x, y, r, stroke=0, fill=1)
            # partie éclairée : demi-disque + ellipse (terminateur)
            ill = (1 - math.cos(2 * math.pi * f)) / 2
            c.setFillColor(ETOILE)
            droite = f < 0.5
            if 0 < ill < 1:
                p = c.beginPath()
                steps = 40
                pts = []
                for s in range(steps + 1):  # bord du disque côté éclairé
                    a = -math.pi/2 + math.pi * s / steps
                    pts.append((x + (r * math.cos(a) if droite else -r * math.cos(a)), y + r * math.sin(a)))
                kx = r * (1 - 2 * ill)  # demi-axe horizontal du terminateur (signé)
                for s in range(steps + 1):
                    a = math.pi/2 - math.pi * s / steps
                    px = kx * math.cos(a)
                    pts.append((x + (px if droite else -px), y + r * math.sin(a)))
                p.moveTo(*pts[0])
                for q in pts[1:]: p.lineTo(*q)
                p.close(); c.drawPath(p, stroke=0, fill=1)
            elif ill >= 1: c.circle(x, y, r, stroke=0, fill=1)
            c.setStrokeColor(LAITON); c.setLineWidth(0.5); c.circle(x, y, r, stroke=1, fill=0)
            c.setFont("Atk", 6.6); c.setFillColor(ENCRE); c.drawCentredString(x, y - r - 9, self.NOMS[k])

class Rotation(Flowable):
    """Le ciel tourne autour de la Polaire : traînées circulaires."""
    def __init__(self, w): super().__init__(); self.w = w
    def wrap(self, *a): return self.w, 120
    def draw(self):
        c = self.canv; cx, cy = self.w / 2, 60
        c.setFillColor(NUIT); c.roundRect(0, 0, self.w, 120, 6, stroke=0, fill=1)
        c.setStrokeColor(LAITON); c.setLineWidth(0.7)
        import random; rnd = random.Random(7)
        for k in range(14):
            r = 9 + k * 7.5; a0 = rnd.uniform(0, 360)
            c.setStrokeAlpha(0.35 + 0.04 * (k % 5)); c.arc(cx - r, cy - r, cx + r, cy + r, a0, 70)
        c.setStrokeAlpha(1); c.setFillColor(ETOILE); c.circle(cx, cy, 2.6, stroke=0, fill=1)
        c.setFont("Bodoni-It", 8.5); c.setFillColor(colors.HexColor("#d8b876")); c.drawString(cx + 6, cy + 4, "Polaire")
        c.setFont("Atk", 7); c.setFillColor(ETOILE); c.drawCentredString(self.w / 2, 8, "En une heure, chaque étoile parcourt 15° autour de la Polaire.")

class Ligne(Flowable):
    def __init__(self, w, label): super().__init__(); self.w, self.label = w, label
    def wrap(self, *a): return self.w, 22
    def draw(self):
        c = self.canv; c.setFont("Atk", 9); c.setFillColor(BRUME); c.drawString(0, 8, self.label)
        c.setStrokeColor(LAITON); c.setLineWidth(0.5); c.line(c.stringWidth(self.label, "Atk", 9) + 6, 7, self.w, 7)

# ---------------------------------------------------------------- couverture
def couverture(c, doc):
    c.saveState(); c.setFillColor(ABYSSE); c.rect(0, 0, W, H, stroke=0, fill=1)
    # nébuleuse violette discrète
    for k in range(18, 0, -1):
        c.setFillColor(VIOLET); c.setFillAlpha(0.012 * (19 - k)); c.circle(W * 0.72, H * 0.62, k * 7, stroke=0, fill=1)
    c.setFillAlpha(1)
    d = Dome(datetime.datetime(2026, 12, 24, 21, 0, tzinfo=datetime.timezone.utc), W - 46*mm, "")
    d.canv = c; c.translate(23*mm, H * 0.33); d.draw(); c.translate(-23*mm, -H * 0.33)
    c.setFillColor(ETOILE); c.setFont("Bodoni", 30); c.drawCentredString(W / 2, H * 0.215, "Le Carnet")
    c.drawCentredString(W / 2, H * 0.215 - 32, "des étoiles")
    c.setFont("Bodoni-It", 11); c.setFillColor(LAITON); c.drawCentredString(W / 2, H * 0.215 - 54, "Lire le ciel à l'œil nu, saison après saison")
    c.setFont("Atk", 8); c.setFillColor(ETOILE); c.drawCentredString(W / 2, 14*mm, "Lunétoiles")
    c.restoreState()

# ---------------------------------------------------------------- contenu
def brillantes():
    rows = [[P("Étoile", "cellb"), P("Constellation", "cellb"), P("Éclat", "cellb"), P("Quand la voir", "cellb")]]
    saison = {"CMa": "hiver", "Boo": "printemps, été", "Lyr": "été, automne", "Aur": "hiver", "Ori": "hiver", "CMi": "hiver",
              "Aql": "été", "Tau": "hiver", "Sco": "été, très bas", "Vir": "printemps", "Gem": "hiver", "PsA": "automne, bas",
              "Cyg": "été, automne", "Leo": "printemps"}
    out = []
    for i, (ra, dec, m, bv) in enumerate(STARS):
        nm = NAMES.get(i)
        if nm and m < 1.4 and dec > -32 and nm[1] in saison:
            out.append((m, nm[0], CONS[nm[1]]["fr"], saison[nm[1]]))
    for m, n, con, s in sorted(out)[:14]:
        rows.append([P(n, "cell"), P(con, "cell"), P(f"{m:.2f}".replace(".", ","), "cell"), P(s, "cell")])
    t = Table(rows, colWidths=[30*mm, 32*mm, 15*mm, 34*mm])
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, 0), 0.8, LAITON), ("LINEBELOW", (0, 1), (-1, -1), 0.25, colors.HexColor("#d9dbe6")),
                           ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("TOPPADDING", (0, 0), (-1, -1), 2.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5)]))
    return t

def build(out):
    fw = W - 34*mm
    doc = BaseDocTemplate(out, pagesize=A5, title="Le Carnet des étoiles", author="Lunétoiles",
                          subject="Lire le ciel à l'œil nu", creator="Lunétoiles")
    fr = Frame(17*mm, 19*mm, fw, H - 36*mm, id="f", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    frn = Frame(17*mm, 17*mm, fw, H - 34*mm, id="fn", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate("couv", [fr], onPage=couverture), PageTemplate("clair", [fr], onPage=fond_clair),
                          PageTemplate("nuit", [frn], onPage=fond_nuit)])
    E = []
    E += [NextPageTemplate("clair"), PageBreak()]
    # dédicace
    E += [Spacer(1, 40*mm), P("Ce carnet est offert", "titre"), Spacer(1, 6*mm), Ligne(fw, "à"), Spacer(1, 4*mm), Ligne(fw, "par"),
          Spacer(1, 4*mm), Ligne(fw, "le"), Spacer(1, 12*mm),
          P("Pour les nuits où l'on lève la tête et où l'on a envie de savoir ce que l'on regarde.", "note"), PageBreak()]
    # sommaire
    chap = ["Avant de lever les yeux", "Le ciel tourne", "Lire l'éclat d'une étoile", "Couleurs et distances", "Six formes à connaître",
            "Le ciel des quatre saisons", "La Lune", "Les planètes", "Étoiles filantes et autres merveilles", "Petit lexique", "Carnet d'observation"]
    E += [P("Sommaire", "titre")] + [P(f"<font name='Bodoni-It' color='#8b6cf6'>{i+1:>2}</font>&nbsp;&nbsp;&nbsp;{c}", "toc") for i, c in enumerate(chap)]
    E += [Spacer(1, 8*mm), P("Ce carnet se lit dans l'ordre ou au hasard. Les cartes sont calculées à partir d'un vrai catalogue d'étoiles : ce qui est dessiné est vraiment là-haut.", "note"), PageBreak()]

    # 1
    E += [P("Chapitre 1", "chap"), P("Avant de lever les yeux", "titre"),
          P("Pas besoin de télescope pour commencer. Les yeux suffisent, à condition de leur laisser un peu de temps et de leur éviter les lumières."),
          P("Laisse tes yeux s'habituer", "h2"),
          P("Dans le noir, la pupille s'ouvre en quelques secondes, mais la vraie vision de nuit met vingt à trente minutes à s'installer. Un seul coup d'œil à un écran blanc, et tout est à refaire. Si tu dois regarder ton téléphone, baisse la luminosité ou passe en lumière rouge : l'œil y est beaucoup moins sensible."),
          P("Choisis ton coin de ciel", "h2")]
    E += puces(["Éloigne-toi des lampadaires : même un jardin ou un parc sombre change tout.",
                "Regarde loin de la ville : le ciel est plus noir du côté opposé aux lumières.",
                "Évite les soirs de pleine Lune pour les étoiles faibles ; elle est en revanche parfaite pour… observer la Lune.",
                "Un ciel lavé par la pluie ou le vent du nord est souvent plus transparent."])
    E += [P("Le geste qui aide", "h2"),
          P("Pour estimer les distances dans le ciel, tends le bras. Ton petit doigt couvre environ un degré, trois doigts serrés environ cinq degrés, ton poing fermé environ dix degrés, et ta main grande ouverte une vingtaine de degrés. Les livres d'astronomie parlent en degrés : ta main est ta règle."),
          PageBreak()]
    # 2
    E += [P("Chapitre 2", "chap"), P("Le ciel tourne", "titre"),
          P("Les étoiles ne bougent presque pas les unes par rapport aux autres : c'est pour ça que les constellations gardent leur forme depuis des millénaires. En revanche, le ciel entier semble tourner, parce que la Terre tourne sur elle-même."),
          Rotation(fw), Spacer(1, 3*mm),
          P("Le point fixe : la Polaire", "h2"),
          P("Tout le ciel paraît tourner autour d'un point situé au-dessus du pôle Nord de la Terre. Une étoile se trouve presque exactement à cet endroit : la Polaire. Elle indique le nord, et sa hauteur au-dessus de l'horizon est à peu près égale à ta latitude. À Paris, elle est à 49 degrés ; à Marseille, à 43."),
          P("Les étoiles qui ne se couchent jamais", "h2"),
          P("Près de la Polaire, certaines étoiles tournent sans jamais passer sous l'horizon : on les appelle circumpolaires. Depuis la France, la Grande Ourse et Cassiopée en font partie. Les autres se lèvent à l'est et se couchent à l'ouest, comme le Soleil, et chaque soir elles se lèvent environ quatre minutes plus tôt. C'est pour ça que le ciel change avec les saisons."),
          PageBreak()]
    # 3
    E += [P("Chapitre 3", "chap"), P("Lire l'éclat d'une étoile", "titre"),
          P("Les astronomes mesurent l'éclat avec la magnitude. L'échelle est à l'envers : plus le nombre est petit, plus l'astre est brillant. Une étoile de magnitude 1 est environ deux fois et demie plus lumineuse qu'une étoile de magnitude 2. Les plus brillantes ont même une magnitude négative."),
          P("En ville, on voit à peine jusqu'à la magnitude 3 ; dans une campagne bien noire, jusqu'à 6. C'est la différence entre une centaine d'étoiles et plusieurs milliers."),
          P("Les étoiles les plus brillantes vues de France", "h2"), brillantes(),
          P("Valeurs du catalogue utilisé par Lunétoiles. Certaines étoiles, comme Bételgeuse, varient d'éclat au fil des mois.", "leg"),
          PageBreak()]
    # 4
    E += [P("Chapitre 4", "chap"), P("Couleurs et distances", "titre"),
          P("Regarde bien : les étoiles n'ont pas toutes la même couleur. Leur teinte trahit leur température. Les plus chaudes paraissent bleutées, les plus froides tirent vers l'orange et le rouge. Dans Orion, Rigel est bleu-blanc et Bételgeuse franchement orangée : la différence se voit à l'œil nu."),
          P("La lumière voyage", "h2"),
          P("La lumière va très vite, mais pas infiniment vite. Celle de la Lune met un peu plus d'une seconde à nous parvenir, celle du Soleil environ huit minutes et vingt secondes. Pour les étoiles, on parle en années-lumière : la distance que la lumière parcourt en un an."),
          P("Quand tu regardes Sirius, tu vois une lumière partie il y a environ huit ans et demi. Pour Véga, c'est environ vingt-cinq ans. Et la galaxie d'Andromède, l'objet le plus lointain visible à l'œil nu, nous envoie une lumière partie il y a environ deux millions et demi d'années.", "p"),
          P("Regarder le ciel, c'est toujours regarder le passé.", "note"),
          PageBreak()]
    # 5 planches
    E += [P("Chapitre 5", "chap"), P("Six formes à connaître", "titre"),
          P("Inutile d'apprendre les 88 constellations. Six formes suffisent pour se repérer toute l'année : à partir d'elles, on retrouve toutes les autres en suivant les alignements."),
          P("Sur les planches suivantes, la constellation est tracée en doré, ses voisines en plus discret. Les cartes sont dessinées comme tu vois le ciel en levant la tête : l'est est à gauche."),
          P("Commence par la Grande Ourse au nord : elle est visible toute l'année depuis la France.", "note"),
          NextPageTemplate("nuit"), PageBreak()]
    planches = [
        ("UMa", "La Grande Ourse", "La grande casserole de sept étoiles. Toute l'année au nord, haute au printemps. Prolonge le bord opposé au manche, de Merak vers Dubhe, cinq fois : tu trouves la Polaire.", 1.0),
        ("Cas", "Cassiopée", "Un W ou un M selon l'heure, de l'autre côté de la Polaire par rapport à la Grande Ourse. Repère idéal en automne et en hiver.", 1.4),
        ("Ori", "Orion", "La reine de l'hiver : trois étoiles alignées forment sa ceinture. Bételgeuse en haut à gauche, Rigel en bas à droite. Prolonge la ceinture vers le bas à gauche : Sirius.", 1.25),
        ("Lyr", "La Lyre et le triangle d'été", "Véga, très brillante, presque au-dessus de ta tête en été. Avec Déneb (Cygne) et Altaïr (Aigle), elle forme le grand triangle d'été.", 0.62),
        ("Leo", "Le Lion", "Au printemps, au sud. Sa tête dessine un point d'interrogation à l'envers qui se termine par Régulus.", 1.05),
        ("Sco", "Le Scorpion", "En été, très bas au sud depuis la France. Antarès, rouge, marque son cœur ; sa queue frôle l'horizon.", 0.95),
    ]
    sty_t = ParagraphStyle("pt", parent=st["titre"], textColor=ETOILE, fontSize=22, leading=26, spaceAfter=6)
    sty_p = ParagraphStyle("pp", parent=st["p"], textColor=ETOILE)
    for k, (cid, titre, txt, champ) in enumerate(planches):
        aussi = ("Deneb", "Déneb", "Altair", "Altaïr") if cid == "Lyr" else ()
        E += [Paragraph(titre, sty_t), Planche(cid, fw, fw * 1.02, champ, aussi=aussi), Spacer(1, 5*mm), Paragraph(txt, sty_p)]
        if k == len(planches) - 1: E += [NextPageTemplate("clair")]
        E += [PageBreak()]
    # 6 saisons
    E += [P("Chapitre 6", "chap"), P("Le ciel des quatre saisons", "titre"),
          P("Voici le ciel complet au-dessus de Paris, vers 22 heures, au milieu de chaque saison. Tiens la carte au-dessus de ta tête, le N vers le nord : l'est se retrouve alors à gauche, comme dans le vrai ciel. Le centre de la carte, c'est le point juste au-dessus de toi."),
          Spacer(1, 2*mm)]
    saisons = [(datetime.datetime(2027, 1, 15, 21, 0, tzinfo=datetime.timezone.utc), "Mi-janvier, 22 h"),
               (datetime.datetime(2027, 4, 15, 20, 0, tzinfo=datetime.timezone.utc), "Mi-avril, 22 h"),
               (datetime.datetime(2027, 7, 15, 20, 0, tzinfo=datetime.timezone.utc), "Mi-juillet, 22 h"),
               (datetime.datetime(2027, 10, 15, 20, 0, tzinfo=datetime.timezone.utc), "Mi-octobre, 22 h")]
    textes = {
        0: "En hiver, Orion domine le sud, avec Sirius sous lui et le Taureau au-dessus. Les Gémeaux et le Cocher sont hauts.",
        1: "Au printemps, la Grande Ourse passe presque au zénith. Le Lion occupe le sud, la Vierge se lève à l'est.",
        2: "En été, le triangle Véga, Déneb, Altaïr est au-dessus de ta tête. Loin des villes, la Voie lactée le traverse.",
        3: "En automne, le grand carré de Pégase est au sud et Andromède s'y accroche. Cassiopée est haute au nord.",
    }
    for k, (dt, t) in enumerate(saisons):
        E += [KeepTogether([Dome(dt, fw * (0.72 if k == 0 else 0.92), t), Spacer(1, 3*mm), P(textes[k])]), PageBreak()]
    # 7 Lune
    E += [P("Chapitre 7", "chap"), P("La Lune", "titre"),
          P("La Lune ne produit pas de lumière : elle renvoie celle du Soleil. Selon sa position autour de la Terre, nous voyons une part plus ou moins grande de sa face éclairée. Le cycle complet, de nouvelle Lune à nouvelle Lune, dure environ vingt-neuf jours et demi."),
          Phases(fw), Spacer(1, 3*mm),
          P("Toujours la même face", "h2"),
          P("La Lune tourne sur elle-même exactement dans le même temps qu'elle fait le tour de la Terre. Résultat : elle nous montre toujours la même face. Les taches sombres que l'on voit sont d'immenses plaines de lave figée, que les premiers astronomes ont prises pour des mers."),
          P("Le bon moment pour l'observer", "h2"),
          P("Contrairement à ce qu'on pourrait croire, la pleine Lune n'est pas le meilleur moment : la lumière arrive de face et écrase le relief. Autour du premier quartier, la limite entre le jour et la nuit lunaires fait ressortir les cratères, même avec de simples jumelles."),
          P("Elle est à environ 384 000 kilomètres : une distance que la lumière franchit en un peu plus d'une seconde.", "note"),
          PageBreak()]
    # 8 planètes
    E += [P("Chapitre 8", "chap"), P("Les planètes", "titre"),
          P("Cinq planètes se voient facilement à l'œil nu : Mercure, Vénus, Mars, Jupiter et Saturne. Elles se déplacent lentement devant les étoiles, toujours le long d'une même bande du ciel, celle où passent aussi le Soleil et la Lune."),
          P("Planète ou étoile ?", "h2")]
    E += puces(["Une planète scintille peu : sa lumière est plus stable que celle des étoiles, surtout près de l'horizon.",
                "Elle n'apparaît sur aucune carte d'étoiles : elle change de place au fil des semaines.",
                "Vénus et Jupiter sont souvent les points les plus brillants de la nuit, après la Lune."])
    E += [P("Ce que chacune réserve", "h2")]
    E += puces(["<b>Vénus</b>, l'« étoile du berger », brille le soir à l'ouest ou le matin à l'est, jamais au milieu de la nuit.",
                "<b>Mars</b> se reconnaît à sa teinte orangée ; son éclat varie beaucoup d'une année à l'autre.",
                "<b>Jupiter</b> : avec des jumelles bien calées, on devine jusqu'à quatre petits points alignés, ses plus grandes lunes.",
                "<b>Saturne</b> : ses anneaux demandent une petite lunette, mais le spectacle est inoubliable.",
                "<b>Mercure</b> reste toujours près du Soleil : on la cherche juste après son coucher ou juste avant son lever."])
    E += [P("Le viseur Lunétoiles indique chaque soir quelles planètes sont visibles et dans quelle direction regarder.", "note"), PageBreak()]
    # 9 merveilles
    E += [P("Chapitre 9", "chap"), P("Étoiles filantes et autres merveilles", "titre"),
          P("Une étoile filante n'est pas une étoile : c'est un grain de poussière, souvent pas plus gros qu'un grain de sable, qui brûle en entrant dans l'atmosphère à toute vitesse. Certaines nuits, la Terre traverse les poussières laissées par une comète et elles se multiplient."),
          P("Les grands rendez-vous de l'année", "h2")]
    E += puces(["<b>Quadrantides</b>, début janvier : un maximum bref mais souvent intense.",
                "<b>Lyrides</b>, fin avril : modestes, avec parfois de belles surprises.",
                "<b>Perséides</b>, autour du 12 août : les plus célèbres, par des nuits douces.",
                "<b>Orionides</b>, fin octobre : rapides, nées de la comète de Halley.",
                "<b>Léonides</b>, mi-novembre : souvent calmes, avec des sursauts certaines années.",
                "<b>Géminides</b>, autour du 13 décembre : souvent la pluie la plus riche de l'année."])
    E += [P("À voir aussi à l'œil nu", "h2")]
    E += puces(["<b>La Voie lactée</b> : notre propre galaxie vue de l'intérieur, comme une écharpe pâle d'un horizon à l'autre, loin des villes en été.",
                "<b>Les Pléiades</b> : un petit groupe serré d'étoiles bleutées dans le Taureau, en automne et en hiver. On en compte six ou sept à l'œil nu.",
                "<b>La galaxie d'Andromède</b> : une tache floue près de Cassiopée, la plus lointaine chose visible sans instrument.",
                "<b>La Station spatiale</b> : un point brillant qui traverse le ciel en quelques minutes sans clignoter."])
    E += [PageBreak()]
    # 10 lexique
    E += [P("Chapitre 10", "chap"), P("Petit lexique", "titre")]
    lex = [("Année-lumière", "distance parcourue par la lumière en un an, environ 9 500 milliards de kilomètres."),
           ("Astérisme", "dessin facile à reconnaître qui n'est pas une constellation officielle, comme la casserole de la Grande Ourse."),
           ("Circumpolaire", "se dit d'une étoile qui ne se couche jamais, vue depuis un lieu donné."),
           ("Constellation", "zone du ciel délimitée officiellement ; il y en a 88."),
           ("Écliptique", "chemin apparent du Soleil dans le ciel ; les planètes et la Lune restent près de lui."),
           ("Horizon", "ligne où le ciel semble toucher la terre ; hauteur 0 degré."),
           ("Magnitude", "mesure de l'éclat ; plus elle est petite, plus l'astre est brillant."),
           ("Radiant", "point du ciel d'où semblent partir les étoiles filantes d'une même pluie."),
           ("Zénith", "point du ciel juste au-dessus de ta tête ; hauteur 90 degrés.")]
    for mot, d in lex:
        E += [P(f"<font name='Bodoni-It' size='11.5' color='#8b6cf6'>{mot}</font> : {d}")]
    E += [PageBreak()]
    # 11 carnet
    for k in range(2):
        E += [P("Chapitre 11" if k == 0 else "", "chap"), P("Carnet d'observation", "titre")]
        for lab in ["Date et heure", "Lieu", "Météo, Lune", "Ce que j'ai vu", "", "", "Ce que je veux chercher la prochaine fois", "", ""]:
            E += [Ligne(fw, lab), Spacer(1, 3.4*mm)]
        E += [PageBreak()]
    # fin
    E += [Spacer(1, 30*mm), P("Bon ciel !", "titre"),
          P("Ce carnet accompagne Lunétoiles, le viseur qui affiche le nom des étoiles, des constellations et des planètes quand tu pointes ton téléphone vers le ciel. Il est gratuit et s'ouvre directement dans le navigateur."),
          Spacer(1, 10*mm),
          P("Cartes calculées à partir du catalogue d'étoiles de d3-celestial (Olaf Frohn, licence BSD). Polices Bodoni Moda et Atkinson Hyperlegible (licence SIL Open Font). Textes et illustrations : Lunétoiles.", "leg")]
    doc.build(E)

if __name__ == "__main__":
    out = os.path.join(ROOT, "prive", "carnet-des-etoiles.pdf")
    build(out)
    print(out, os.path.getsize(out) // 1024, "Ko")
