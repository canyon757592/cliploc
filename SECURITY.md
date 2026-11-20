# Sécurité de Cliploc

## En place
- **Politique de sécurité du contenu (CSP) stricte** (`_headers`) : aucun script inline ni externe, `script-src 'self'`, pas d'objets, pas d'iframes, `frame-ancestors 'none'`, `base-uri 'none'`, `form-action 'self'`. Tout le JavaScript est dans `app.js`, `cloud.js` et `render.js`, les clics passent par une liste blanche d'actions (`data-v`).
- Autres en-têtes : HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (caméra, micro, géolocalisation, paiement désactivés), COOP/CORP.
- **Aucune ressource tierce** : la police est hébergée sur le site, le muxer MP4 est copié dans `vendor/`.
- **Entrées validées** : lien Airbnb (hôte strict, identifiant nettoyé), photos (types JPEG/PNG/WebP/HEIC, 25 Mo maximum, 30 maximum), état du navigateur nettoyé au chargement, tout texte affiché est échappé.
- **Base Supabase** : RLS activée sur toutes les tables, aucune écriture directe depuis l'API publique, crédits et formules modifiables uniquement par des fonctions serveur (`start_job`, `finish_job`, `grant_credits`, `fail_job`), paiements et remboursements non rejouables (index unique), options réservées (4K, Drone, Cinéma, couleurs) vérifiées côté serveur, limite de 6 vidéos par heure et par utilisateur, interrupteur d'urgence (`kill_switch`).
- **Mesure d'audience anonyme** : seule l'étape atteinte part vers Supabase, avec un identifiant aléatoire de visite. Désactivée en local et si le navigateur envoie « Ne pas suivre ». La clé `sb_publishable_…` présente dans `app.js` est publique par conception ; elle ne donne accès qu'à la fonction `log_funnel_event`. Les chiffres sont dans une vue `admin.funnel_7d`, non exposée par l'API.
- **Comptes réels** (Supabase Auth, `cloud.js`) : le navigateur ne garde que la session ; crédits, formule et historique sont lus côté serveur et ne peuvent pas être modifiés depuis le navigateur. Une session falsifiée est refusée par Supabase et effacée.
- **Animation IA** : la clé fal.ai n'existe que dans les secrets des Edge Functions (`ai-animate`, `ai-result`). Les plans sont débités à l'avance, un plan en échec est remboursé (`refund_failed_clips`), l'option se coupe seule si fal refuse la clé ou le solde (`ai_enabled` à faux), plafond de 30 plans par jour, et les vidéos IA ne passent que par notre domaine.
- **Paiements Stripe (abonnements mensuels)** : le prix est calculé côté serveur (`create-checkout`), jamais par le navigateur. Crédits et formules ne sont accordés que par `stripe-webhook`, qui vérifie la signature Stripe et ne rejoue jamais un paiement (index unique). Les fonctions `create-checkout` et `customer-portal` n'utilisent que le jeton de l'utilisateur (aucune clé administrateur). Les clés Stripe n'existent que dans les secrets Supabase. Les codes promo de test sont désactivés.
- **Formation (PDF) privée** : le fichier est dans un espace de stockage privé (`ebook`). Une règle d'accès en base ne le laisse lire qu'aux comptes dont `profiles.ebook` est vrai, et ce champ n'est modifiable que par le serveur. Le navigateur le télécharge avec le jeton du compte. Un visiteur ou un compte sans achat n'y a pas accès.
- Aucun secret dans le dépôt ni dans l'historique Git.

## À faire avant l'ouverture au public
- Supabase Auth : renseigner l'URL du site (Site URL et Redirect URLs = l'adresse du site) pour que le lien de confirmation par email revienne au bon endroit, et brancher un SMTP à soi (Resend ou autre) : l'envoi intégré est limité à quelques emails par heure.
- Supprimer dans le tableau de bord Supabase les fonctions neutralisées `diag-tmp` et `ebook-seed` (elles répondent 410, il ne reste que le ménage).
- Supabase Auth : activer la protection contre les mots de passe compromis, longueur minimale 10, confirmation de l'email, captcha (Cloudflare Turnstile).
- Passer le dépôt GitHub en privé, activer la détection de secrets.
- Mentions légales, CGV, politique de confidentialité, retirer `noindex`.
