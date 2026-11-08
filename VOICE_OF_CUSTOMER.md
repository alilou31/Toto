# Voice of Customer — NAKAHYA

## Objectif

Centraliser les retours des visiteurs et membres de NAKAHYA, puis consigner des signaux de marché issus de discussions publiques (notamment Reddit) afin d'alimenter les décisions produit et les priorités d'acquisition.

## Périmètre livré dans cette branche

- Page publique `/avis` et lien depuis le pied de page.
- Formulaire utilisable sans compte ; association facultative à un compte si une session existe.
- Thèmes : expérience, découverte, jeux, confiance/sécurité, tarifs et autre.
- Note facultative de 1 à 5 ; commentaire de 10 à 2 000 caractères.
- Consentement spécifique à l'utilisation du retour pour améliorer le produit ; ce consentement n'est pas une inscription marketing.
- Honeypot, limitation de débit par IP via le mécanisme existant, réponses sans cache.
- Tableau de bord `/admin/feedback`, protégé par session et allowlist `FEEDBACK_ADMIN_EMAILS`.
- Mesures simples : volume total, retours sur 7 jours, note moyenne.
- Saisie manuelle d'insights de marché : URL publique, subreddit, thème, sentiment et synthèse originale.
- Pas de scraping Reddit, d'automatisation de publication, de DM ou de collecte de profil utilisateur.

## Pourquoi Reddit n'est pas encore connecté automatiquement

Avant toute collecte automatisée, obtenir et vérifier l'autorisation d'accès et d'usage applicable auprès de Reddit, notamment pour un usage commercial. Tant que cette autorisation n'est pas obtenue, la veille doit être faite manuellement dans le respect des règles de chaque communauté. Le tableau de bord permet de conserver le lien public et une synthèse reformulée, sans recopier inutilement le contenu des membres.

## Mise en service

1. Examiner la migration `db/migrations/023_voice_of_customer.sql`.
2. Après validation, exécuter cette migration manuellement dans Neon. Aucune migration n'est exécutée par le code ou la CI.
3. Ajouter `FEEDBACK_ADMIN_EMAILS` dans l'environnement Cloudflare : liste d'adresses e-mail de comptes NAKAHYA autorisés, séparées par des virgules. Ne pas mettre cette variable dans Git.
4. Déployer uniquement après fusion autorisée et validation de la CI.
5. Vérifier `/avis` et l'API de soumission. Le tableau de bord doit être accessible uniquement à un compte de l'allowlist.
6. Vérifier qu'un retour volontaire est visible dans `/admin/feedback`, puis documenter le test réel dans `PRODUCTION_TEST_LOG.md`.

## Tables

- `public.product_feedback` : retours directs, note facultative, catégorie, compte facultatif, date. Le texte est limité à 2 000 caractères.
- `public.market_insights` : signaux de marché saisis par l'équipe, source, lien, thème, sentiment, synthèse et auteur.

Aucune adresse e-mail, adresse IP ou identité Reddit n'est stockée dans ces tables. L'identifiant IP utilisé pour la limitation de débit est haché par le mécanisme partagé existant.

## Règles de traitement produit

- Regrouper les retours par thème et fréquence ; ne pas traiter une demande isolée comme une preuve de marché.
- Distinguer problème observé, demande explicite, objection, retour positif et opportunité.
- Prioriser selon fréquence, sévérité, impact sur activation/rétention/conversion et effort.
- Ne jamais utiliser un retour Reddit pour contacter son auteur en privé sans demande explicite.
- Ne pas publier de commentaires promotionnels automatiques ni fabriquer de témoignages.
- Respecter les demandes de suppression et la politique de conservation à définir avant lancement à grande échelle.

## Limites connues

- La migration 023 doit être appliquée manuellement avant que les écritures/lectures fonctionnent en production.
- `FEEDBACK_ADMIN_EMAILS` doit être configurée ; sans elle, aucun accès admin n'est accordé.
- Le connecteur Reddit automatique n'est pas inclus et ne doit pas être activé sans autorisation officielle.
- Les métriques sont descriptives ; aucun score IA ni backlog automatique n'est généré dans cette première version.
- Les tests Playwright couvrent les validations anonymes et la protection d'accès ; ils ne remplacent pas un test authentifié en production.
