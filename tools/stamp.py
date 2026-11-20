"""Ajoute ?v=<empreinte> aux fichiers style.css, cloud.js et app.js dans index.html.
À lancer avant chaque publication : python3 tools/stamp.py
Le navigateur est ainsi obligé de recharger un fichier modifié, même s'il l'avait gardé en mémoire."""
import hashlib, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
for name in ("style.css", "cloud.js", "app.js"):
    h = hashlib.sha1((root / name).read_bytes()).hexdigest()[:8]
    pat = re.compile(r'((?:href|src)=")' + re.escape(name) + r'(?:\?v=[0-9a-f]+)?(")')
    html, n = pat.subn(r'\g<1>' + name + "?v=" + h + r'\g<2>', html)
    assert n == 1, (name, n)
(root / "index.html").write_text(html, encoding="utf-8")
print("empreintes mises à jour")
