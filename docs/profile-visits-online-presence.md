# Présence en ligne et visites de profil

## Fonctionnement

- Le navigateur connecté envoie un heartbeat toutes les 45 secondes tant que l'onglet est visible.
- Un membre est affiché « en ligne » si son dernier heartbeat date de moins de deux minutes. L'heure exacte de dernière activité n'est pas exposée.
- L'ouverture d'une fiche de profil visible enregistre une visite. Une ligne est conservée par couple visiteur/profil et son horodatage est actualisé à chaque nouvelle consultation.
- La page « Visites de profil » affiche jusqu'à 50 visiteurs récents. Les profils masqués/non visibles et les membres bloqués dans un sens ou l'autre ne sont pas révélés dans cette liste.
- Les visites de son propre profil ne sont pas comptabilisées.

## Migration Neon obligatoire

Exécuter le contenu de `db/migrations/009_profile_visits_and_presence.sql` dans l'éditeur SQL Neon après les migrations précédentes.

La découverte et les fiches profil gardent un mode dégradé hors présence si la colonne `last_seen_at` n'est pas encore disponible. Les heartbeats ne bloquent pas la navigation. La page de visites nécessite la table `profile_visits` et affichera une erreur explicite tant que la migration n'aura pas été appliquée.

## Limites

La présence est une estimation avec un délai maximal d'environ deux minutes, pas une garantie de disponibilité en temps réel. Il n'y a pas de WebSocket ni de notification push. L'historique liste les visiteurs uniques et leur dernière visite, pas un compteur de chaque rafraîchissement de page.
