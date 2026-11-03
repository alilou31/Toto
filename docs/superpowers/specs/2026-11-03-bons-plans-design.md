# Bons plans et rendez-vous — conception validée

Validation du périmètre : « Ok go », après l'audit du 2026-11-03.

Objectif : enrichir le parcours existant /bons-plans et éviter les doublons.
Conserver les six cartes et les filtres, ajouter un contexte volontaire de
rendez-vous avec raisons éditoriales, sans données de profil ni persistance.
Ne changer aucun algorithme de matching.

Préparer un compteur quotidien par idée de clic sortant, désactivé par défaut.
Aucun cookie, profil, e-mail, IP ou URL affiliée stocké dans cette table.
Les clics ne prouvent ni unicité, ni réservation, ni commission. Réutiliser les
offres approuvées existantes et vérifier à nouveau leur validité à la mesure.
L'activation des métriques et de l'affiliation reste une opération manuelle.

Ajouter les métadonnées serveur de /bons-plans, canonical stable et Open Graph,
sans route concurrente ni prix, disponibilité ou partenariat inventé.

Approche retenue : évolution éditoriale locale et instrumentation optionnelle,
car elle réutilise Next.js, Neon et l'affiliation sans contrat externe nouveau.
Alternative reportée : recommandations par fournisseur, réservation intégrée
et attribution Awin, qui nécessitent configuration et validation externes.

Livraison : tests unitaires et Playwright (mobile et chemins négatifs), lint,
build Next.js/Worker, documentation réconciliée, un commit sur branche et PR.
La CI doit être contrôlée sur le nouveau SHA ; ne pas déduire la production
d'un build vert. Aucun déploiement ni application de migration dans cette passe.
