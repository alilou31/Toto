# Messagerie — médias privés

## Fonctionnalités

La page de conversation existante prend en charge :
- messages texte et emojis Unicode ;
- photos JPEG, PNG, WebP et GIF (20 Mo maximum, GIF 10 Mo) ;
- vidéos MP4, WebM et QuickTime (40 Mo maximum) ;
- fichiers audio WebM, Ogg, MP3, MP4 et WAV (15 Mo maximum) ;
- enregistrement vocal depuis le navigateur lorsque MediaRecorder et le microphone sont disponibles.

Les médias apparaissent dans le fil sous forme d'image, lecteur vidéo ou lecteur audio. L'envoi reste dans la conversation liée au match existant.

## Configuration Cloudflare R2

Le bucket est privé : aucune URL publique ni URL présignée durable n'est créée. Les médias sont servis par l'API après authentification et contrôle d'appartenance au match et de blocage.

1. Créer le bucket : `npx wrangler r2 bucket create nakahya-chat-media`.
2. Le binding `CHAT_MEDIA_BUCKET` est déclaré dans `wrangler.jsonc`. Vérifier que le compte Cloudflare autorise R2 et que le bucket existe avant le déploiement.
3. En environnement local, configurer un bucket de développement R2 ou un binding local équivalent ; ne pas envoyer de fichiers personnels vers un bucket de production pendant les tests.
4. Appliquer une seule fois `db/migrations/018_chat_media_attachments.sql` dans l'éditeur SQL Neon.
5. Déployer ensuite le Worker. Si le binding n'est pas disponible, l'API d'envoi répond 503 et n'enregistre pas de message média.

## Routes

- `POST /api/conversations/:conversationId/attachments` : multipart `file`, authentification obligatoire, autorisation du match, vérification MIME/signature et limite de taille, stockage R2 puis enregistrement du message dans Neon.
- `GET /api/conversations/:conversationId/attachments?messageId=...` : vérifie à nouveau l'appartenance au match et le blocage avant de streamer le fichier privé.
- La route existante `/api/conversations/:conversationId/messages` continue de gérer les messages texte et retourne les métadonnées média nécessaires au rendu.

## Sécurité et limites

- Les contrôles d'accès sont exécutés côté serveur à chaque envoi et chaque lecture média.
- Les fichiers ne sont pas servis directement depuis R2 et ne sont pas mis en cache publiquement.
- Les extensions de nom ne sont pas utilisées comme preuve de type ; le MIME déclaré et la signature binaire sont contrôlés.
- Les limites de taille réduisent les abus, mais ne remplacent pas une politique de modération. La modération automatique/manuelle des photos, vidéos et audios, l'analyse antivirus approfondie, la suppression à la demande et une politique de rétention dédiée restent à concevoir avant ouverture commerciale.
- Le navigateur doit être servi en HTTPS pour autoriser le microphone. L'utilisateur peut refuser l'autorisation ; l'envoi d'un fichier audio préenregistré reste possible.
- Les formats réellement enregistrables dépendent du navigateur et de l'appareil. Le format final est refusé proprement s'il n'est pas dans la liste prise en charge.
- Cette livraison de code ne prouve pas que le bucket existe, que la migration est appliquée, ni que la fonctionnalité est active en production.
