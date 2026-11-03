# Expérience connectée mobile-first

## Principes
- Palette principale unique : vert profond `#075B4B`, vert d'accent `#12816B`, ivoire `#FAF8F2`, blanc, or discret `#C6A76B`, texte `#202824`.
- Barre de navigation fixe en bas de l'écran dans l'espace connecté, avec **Découvrir** comme action centrale vers `/decouvrir/immersif` (libellé accessible « Découverte immersive »). La navigation de secours `GameShell` utilise la même destination ; son lien supérieur conserve la grille `/decouvrir`.
- Les alertes sont centralisées sur `/notifications` et utilisent les données existantes des API d'affinités et d'invitations Alchimie.
- Les bulles de conseils sont contextuelles, aléatoires, non bloquantes et peuvent être fermées.
- Les endpoints privés restent protégés par l'authentification et ne doivent jamais exposer de données d'un autre utilisateur.

## Limites explicites
- La découverte immersive est une seconde présentation de `/api/discover`, pas un nouveau moteur de matching. Les contrôles de session, de visibilité, de majorité et de blocage restent côté serveur, inchangés.
- **Passer** change uniquement le profil affiché, sans requête d'intérêt. **Liker** envoie `{ recipientId }` à `/api/interests` ; actions désactivées pendant l'envoi, profil conservé en cas d'échec. Le signalement/blocage reste disponible via la grille et le blocage depuis la fiche complète.
- La fiche complète comporte un retour interne validé vers l'immersion. Le retour navigateur et le lien explicite transportent seulement une position dans l'URL, jamais un profil stocké. Une actualisation de la liste côté serveur peut changer la personne à cette position ; aucun historique durable des profils passés n'est créé.
- Chargement, session absente, panne avec réessai, absence initiale de profils et fin de liste sont distingués. Une photo absente/invalide/indisponible utilise un substitut accessible. Les actions sont accessibles au clavier et respectent la réduction des animations.
- Le compteur d'alertes reflète les affinités entrantes en attente et les invitations Alchimie en attente. Il est actualisé périodiquement.
- Il n'existe pas encore de table de notifications persistantes ni d'accusé de lecture : on ne prétend donc pas fournir une synchronisation multi-appareils des notifications lues.
- Les notifications push natives, le temps réel instantané et les invitations des sessions de jeux par code ne sont pas simulés. Ils nécessitent une couche dédiée ultérieurement.
- Les conseils ne contiennent aucune donnée personnelle et n'interrompent pas les actions de l'utilisateur.

