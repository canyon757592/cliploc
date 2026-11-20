# Cliploc

Site de création de vidéos d'annonces. Une seule page `index.html`, sans étape de build.
Hébergé sur Cloudflare Pages. Base de données : Supabase (projet `cliploc`).

`robots.txt` et la balise `noindex` bloquent Google tant que le site n'est pas ouvert au public.

## Publier une modification
Avant chaque `git push`, lancer `python3 tools/stamp.py` : il met à jour les empreintes `?v=…` de `style.css`, `cloud.js` et `app.js` dans `index.html`, pour que les navigateurs rechargent toujours la dernière version.
