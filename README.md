# Lunétoiles

Pointe ton téléphone vers le ciel : Lunétoiles affiche le nom des étoiles, constellations et planètes.
Site statique (Cloudflare Pages) + fonctions serveur (`functions/api`) pour le paiement Stripe, la récupération d'achat et le contact. Aucune base de données.

- Générer les pages : `python3 tools/build.py`
- Secrets (Cloudflare Pages > Paramètres > Variables) : `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `TOKEN_SECRET`, `CONTACT_TO`, `MAIL_FROM`, `SITE`
- Données : catalogue d'étoiles d3-celestial (BSD-3), Astronomy Engine (MIT), fuseaux Natural Earth (domaine public).

- Carnet des étoiles (PDF) : `python3 tools/carnet.py` (polices converties dans /tmp/carnet_fonts) ; servi seulement via `/api/livre` après paiement.
