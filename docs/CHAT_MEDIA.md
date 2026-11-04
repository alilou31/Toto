# Messagerie — médias privés et éphémères

## Fonctionnalités

- Messages texte et emojis Unicode.
- Photos JPEG, PNG, WebP et GIF : 10 Mo maximum, conservées tant que le message existe.
- Vidéos MP4, WebM et QuickTime : 25 Mo maximum.
- Audios WebM, Ogg, MP3, MP4 et WAV : 10 Mo maximum.
- Enregistrement vocal via MediaRecorder lorsque le navigateur le permet.
- Pour chaque vidéo/audio, l'expéditeur choisit 1 ou 2 consultations par le destinataire. Après la dernière consultation, l'objet R2 est supprimé et sa clé est retirée du message.
- Les vidéos/audios non consultés expirent après 7 jours ; la suppression est déclenchée lors d'une tentative d'accès expirée. Configurer également une règle de cycle de vie R2 sur le préfixe `ephemeral/` (7 jours) comme filet de sécurité.
- Les photos restent dans le préfixe `photos/`.

## Configuration Cloudflare R2

Le bucket `nakahya-chat-media` doit être privé. Aucun accès public ni URL durable n'est exposé. Le binding `CHAT_MEDIA_BUCKET` est déclaré dans `wrangler.jsonc`.

1. Créer le bucket : `npx wrangler r2 bucket create nakahya-chat-media`.
2. Appliquer dans l'ordre `db/migrations/018_chat_media_attachments.sql`, `db/migrations/019_chat_media_ephemeral_lifecycle.sql`, puis `db/migrations/020_chat_media_quota_reservations.sql` dans Neon.
3. Configurer une règle de cycle de vie R2 qui supprime les objets du préfixe `ephemeral/` après 7 jours. Ne pas appliquer cette règle au préfixe `photos/`.
4. Vérifier le binding sur l'environnement Cloudflare cible. Ne pas utiliser le bucket de production pour les tests.

## Quotas applicatifs

- 100 Mo de médias actifs par expéditeur.
- 250 Mo de médias actifs par conversation.
- 8 Go de médias actifs au total : seuil d'alerte recommandé à 6 Go, refus des nouveaux dépôts à 8 Go.
- Limites par fichier : photo 10 Mo, vidéo 25 Mo, audio 10 Mo.

Les quotas sont réservés atomiquement en base avant l'upload : une ligne de verrou globale sérialise les réservations concurrentes et empêche de dépasser les plafonds par expéditeur, conversation et instance. Chaque réservation expire au bout de 15 minutes pour libérer la capacité après un arrêt brutal. Le tableau de bord Cloudflare reste la source de vérité pour la consommation R2 facturable. Un rapprochement périodique R2/Neon et une alerte à 6 Go restent à mettre en place.

## Sécurité et limites

- Chaque upload et chaque lecture revérifie l'authentification, l'appartenance au match et l'absence de blocage.
- Le compteur de vues est incrémenté atomiquement en base pour les destinataires ; deux requêtes concurrentes ne peuvent pas dépasser le nombre autorisé.
- L'expéditeur peut prévisualiser son propre média sans consommer la lecture du destinataire.
- Les médias ne sont jamais servis directement depuis R2 ; les réponses sont privées et `no-store`.
- MIME et signature binaire sont contrôlés. Les extensions ne sont pas considérées comme une preuve de type.
- Une suppression après lecture empêche les consultations ultérieures depuis l'application, mais ne peut pas empêcher une capture d'écran, une copie externe ou un enregistrement avec un autre appareil.
- Le nettoyage des objets orphelins, la modération des contenus et la politique de suppression de compte restent à valider avant lancement public.
- L'application des migrations et l'existence du bucket ne sont pas réalisées par le code de cette PR.
