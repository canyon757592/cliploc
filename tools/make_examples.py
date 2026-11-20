#!/usr/bin/env python3
"""Fabrique les vidéos d'exemple avec le vrai moteur de montage de Cliploc.

Usage : python3 tools/make_examples.py <dossier_photos> [dossier_sortie]
  <dossier_photos> contient un sous-dossier par logement (ex. villa/, studio/) avec ses photos JPEG.
  Un fichier <sous-dossier>/meta.json peut préciser : {"title","seconds","quality","fmt","motion","grade"}.
Sortie : examples/<nom>.mp4, examples/<nom>.jpg (affiche) et examples/manifest.json.
Prérequis : pip install playwright pillow ; le site servi sur http://localhost:8766 (python3 -m http.server 8766).
"""
import sys, os, json, base64, io, glob
from PIL import Image
from playwright.sync_api import sync_playwright

SRC = sys.argv[1]; OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "..", "examples")
os.makedirs(OUT, exist_ok=True)
DEF = {"seconds": 30, "quality": "fhd", "fmt": "v", "motion": "drone", "grade": "natural"}
LABEL = {"hd": "HD", "fhd": "FULL HD", "4k": "4K"}

def small_jpeg(path, side=1800):
    im = Image.open(path).convert("RGB"); im.thumbnail((side, side))
    b = io.BytesIO(); im.save(b, "JPEG", quality=88); return base64.b64encode(b.getvalue()).decode()

def poster(path, out):
    im = Image.open(path).convert("RGB"); w, h = im.size; tw = int(h * 9 / 16)
    if tw <= w: im = im.crop(((w - tw) // 2, 0, (w + tw) // 2, h))
    else: th = int(w * 16 / 9); im = im.crop((0, (h - th) // 2, w, (h + th) // 2))
    im = im.resize((540, 960)); im.save(out, "JPEG", quality=82)

manifest = {"hero": [], "videos": []}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto("http://localhost:8766/index.html")
    for d in sorted(x for x in glob.glob(os.path.join(SRC, "*")) if os.path.isdir(x)):
        name = os.path.basename(d); photos = sorted(glob.glob(os.path.join(d, "*.jpg")) + glob.glob(os.path.join(d, "*.jpeg")))
        if len(photos) < 3: print("ignoré (moins de 3 photos):", name); continue
        meta = dict(DEF); mp = os.path.join(d, "meta.json")
        if os.path.exists(mp): meta.update(json.load(open(mp, encoding="utf-8")))
        imgs = [small_jpeg(f) for f in photos[:30]]
        res = pg.evaluate("""async([imgs,m])=>{
          const M=await import('./render.js');
          const files=imgs.map(d=>{const bin=atob(d),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new File([u],'a.jpg',{type:'image/jpeg'})});
          const r=await M.renderVideo({photos:files,seconds:m.seconds,quality:m.quality,fmt:m.fmt,motion:m.motion,grade:m.grade,onProgress(){}});
          const blob=r.blob||r;const buf=new Uint8Array(await blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=32768)s+=String.fromCharCode.apply(null,buf.subarray(i,i+32768));return btoa(s)}""", [imgs, meta])
        open(os.path.join(OUT, name + ".mp4"), "wb").write(base64.b64decode(res)); poster(photos[0], os.path.join(OUT, name + ".jpg"))
        manifest["videos"].append({"title": meta.get("title", name.replace("_", " ").capitalize()), "meta": f'{meta["seconds"]} S · {LABEL[meta["quality"]]}', "src": f"examples/{name}.mp4", "poster": f"examples/{name}.jpg"})
        print("ok", name, os.path.getsize(os.path.join(OUT, name + ".mp4")) // 1024, "Ko")
    b.close()
# photos de l'accueil : une photo par logement, recadrée en vertical
for v in manifest["videos"][:6]:
    manifest["hero"].append(v["poster"])
json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("manifeste écrit:", len(manifest["videos"]), "vidéos")
