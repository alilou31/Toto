# Messagerie — médias privés et éphémères

## Fonctionnalités présentes dans le code

- Messages texte et emojis Unicode.
- Photos JPEG, PNG, WebP et GIF : 10 Mo maximum, conservées tant que le message existe.
- Vidéos MP4, WebM et QuickTime : 25 Mo maximum.
- Audios WebM, Ogg, MP3, MP4 et WAV : 10 Mo maximum.
- Enregistrement vocal via MediaRecorder lorsque le navigateur le permet.
- Pour chaque vidéo/audio, l'expéditeur choisit 1 ou 2 consultations par le destinataire. Après la dernière consultation, l'objet est supprimé et sa clé est retirée du message.
- Les vidéos/audios non consultés expirent après 7 jours.
- Quotas applicatifs prévus : 100 Mo par expéditeur, 250 Mo par conversation, 8 Go globaux.

## État de déploiement — 2026-11-04

Le déploiement Cloudflare doit pouvoir s'effectuer sans R2. Le binding `CHAT_MEDIA_BUCKET` est donc volontairement absent de `wrangler.jsonc` tant que le bucket n'est pas provisionné.

**Conséquence temporaire :** les messages texte et emojis restent indépendants du stockage média. Les routes d'envoi et de lecture des pièces jointes répondent HTTP 503 avec un message explicite tant que le binding n'est pas disponible. Les fonctions photo/vidéo/audio sont présentes dans le code mais ne sont pas activées en production.

## Réactivation ultérieure de R2

Quand le stockage média sera prêt :

1. Créer le bucket privé : `npx wrangler r2 bucket create nakahya-chat-media`.
2. Ajouter le binding `CHAT_MEDIA_BUCKET` vers `nakahya-chat-media` dans `wrangler.jsonc`.
3. Appliquer dans l'ordre `db/migrations/018_chat_media_attachments.sql`, `db/migrations/019_chat_media_ephemeral_lifecycle.sql`, puis `db/migrations/020_chat_media_quota_reservations.sql` dans Neon (vérifier l'état réel avant toute réexécution).
4. Configurer une règle de cycle de vie R2 qui supprime les objets du préfixe `ephemeral/` après 7 jours. Ne pas appliquer cette règle au préfixe `photos/`.
5. Vérifier le binding sur l'environnement Cloudflare cible, puis tester avec deux comptes dédiés et vérifier la suppression physique. Ne pas utiliser le bucket de production pour les tests.

## Sécurité, quotas et limites

- Chaque upload et chaque lecture revérifie l'authentification, l'appartenance au match et l'absence de blocage.
- Le compteur de vues est incrémenté atomiquement en base pour les destinataires.
- L'expéditeur peut prévisualiser son propre média sans consommer la lecture du destinataire.
- Les médias ne sont jamais servis depuis une URL publique ; les réponses sont privées et `no-store`.
- MIME et signature binaire sont contrôlés.
- Une suppression après lecture empêche les consultations ultérieures depuis l'application, mais ne peut pas empêcher une capture d'écran, une copie externe ou un enregistrement avec un autre appareil.
- Le rapprochement périodique R2/Neon, l'alerte à 6 Go, la modération et la politique de suppression de compte restent à valider avant activation publique.
- La présence des migrations dans le dépôt ne prouve pas leur application effective dans Neon.
