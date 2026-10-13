# Expérience connectée mobile-first

## Principes
- Palette principale unique : vert profond `#075B4B`, vert d'accent `#12816B`, ivoire `#FAF8F2`, blanc, or discret `#C6A76B`, texte `#202824`.
- Barre de navigation fixe en bas de l'écran dans l'espace connecté, avec **Découvrir** comme action centrale.
- Les alertes sont centralisées sur `/notifications` et utilisent les données existantes des API d'affinités et d'invitations Alchimie.
- Les bulles de conseils sont contextuelles, aléatoires, non bloquantes et peuvent être fermées.
- Les endpoints privés restent protégés par l'authentification et ne doivent jamais exposer de données d'un autre utilisateur.

## Limites explicites
- Le compteur d'alertes reflète les affinités entrantes en attente et les invitations Alchimie en attente. Il est actualisé périodiquement.
- Il n'existe pas encore de table de notifications persistantes ni d'accusé de lecture : on ne prétend donc pas fournir une synchronisation multi-appareils des notifications lues.
- Les notifications push natives, le temps réel instantané et les invitations des sessions de jeux par code ne sont pas simulés. Ils nécessitent une couche dédiée ultérieurement.
- Les conseils ne contiennent aucune donnée personnelle et n'interrompent pas les actions de l'utilisateur.
