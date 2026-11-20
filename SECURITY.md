# Sécurité de Cliploc

## En place
- **Politique de sécurité du contenu (CSP) stricte** (`_headers`) : aucun script inline ni externe, `script-src 'self'`, pas d'objets, pas d'iframes, `frame-ancestors 'none'`, `base-uri 'none'`, `form-action 'self'`. Tout le JavaScript est dans `app.js` et `render.js`, les clics passent par une liste blanche d'actions (`data-v`).
- Autres en-têtes : HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (caméra, micro, géolocalisation, paiement désactivés), COOP/CORP.
- **Aucune ressource tierce** : la police est hébergée sur le site, le muxer MP4 est copié dans `vendor/`.
- **Entrées validées** : lien Airbnb (hôte strict, identifiant nettoyé), photos (types JPEG/PNG/WebP/HEIC, 25 Mo maximum, 30 maximum), état du navigateur nettoyé au chargement, tout texte affiché est échappé.
- **Base Supabase** : RLS activée sur toutes les tables, aucune écriture directe depuis l'API publique, crédits et formules modifiables uniquement par des fonctions serveur (`start_job`, `finish_job`, `grant_credits`, `fail_job`), paiements et remboursements non rejouables (index unique), options réservées (4K, Drone, Cinéma, couleurs) vérifiées côté serveur, limite de 6 vidéos par heure et par utilisateur, interrupteur d'urgence (`kill_switch`).
- **Mesure d'audience anonyme** : seule l'étape atteinte part vers Supabase, avec un identifiant aléatoire de visite. Désactivée en local et si le navigateur envoie « Ne pas suivre ». La clé `sb_publishable_…` présente dans `app.js` est publique par conception ; elle ne donne accès qu'à la fonction `log_funnel_event`. Les chiffres sont dans une vue `admin.funnel_7d`, non exposée par l'API.
- Aucun secret dans le dépôt ni dans l'historique Git.

## À faire avant l'ouverture au public
- Brancher Supabase Auth (aujourd'hui la connexion est une maquette).
- Edge Functions `create-checkout` et `stripe-webhook` (vérification de la signature Stripe), les clés Stripe uniquement dans les secrets Supabase.
- Déplacer le PDF de la formation dans un stockage privé, avec lien signé après paiement vérifié (il est aujourd'hui public).
- Supabase Auth : activer la protection contre les mots de passe compromis, longueur minimale 10, confirmation de l'email, captcha (Cloudflare Turnstile).
- Passer le dépôt GitHub en privé, activer la détection de secrets.
- Mentions légales, CGV, politique de confidentialité, retirer `noindex`.
