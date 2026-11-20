# Cliploc

Site de création de vidéos d'annonces. Une seule page `index.html`, sans étape de build.
Hébergé sur Cloudflare Pages. Base de données : Supabase (projet `cliploc`).

Le site est ouvert à Google (`robots.txt` autorise tout et indique le plan du site). Seule l'adresse de test `cliploc.pages.dev` reste en `noindex`, via `_headers`.

## Publier une modification
Avant chaque `git push`, lancer `python3 tools/stamp.py` : il met à jour les empreintes `?v=…` de `style.css`, `cloud.js` et `app.js` dans `index.html`, pour que les navigateurs rechargent toujours la dernière version.
