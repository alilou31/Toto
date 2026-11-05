# Retour après souscription — NAKAHYA

La page `/abonnement/succes` est le point de retour visuel prévu pour Stripe Checkout.

## Sécurité et état actuel

- La page indique explicitement que le retour Stripe ne prouve pas le paiement.
- Elle n'accorde aucun droit Premium ou Élite et ne modifie pas Neon.
- L'activation devra être effectuée uniquement par un webhook Stripe Billing authentifié, après vérification de l'événement et de la souscription.
- Les boutons d'abonnement sur `/offres` restent désactivés tant que Checkout, les webhooks Billing et la synchronisation des droits ne sont pas intégrés et testés.
- L'URL devra être configurée comme `success_url=https://nakahya.com/abonnement/succes?session_id={CHECKOUT_SESSION_ID}` lorsque les sessions Checkout seront créées côté serveur. L'URL d'annulation sera `https://nakahya.com/offres`.

## Suite nécessaire avant ouverture des paiements

1. Mapper chaque Price ID Stripe à une seule offre et périodicité (Premium mensuel/annuel, Élite mensuel/annuel).
2. Créer les sessions Checkout exclusivement côté serveur, avec authentification du membre et validation d'un Price ID autorisé.
3. Ajouter et signer le webhook Stripe Billing, traiter les événements de façon idempotente et synchroniser les dates d'état/renouvellement dans Neon.
4. Ajouter les tests de webhook (signature invalide, événement dupliqué, paiement échoué, annulation, renouvellement et changement de plan).
5. Activer les boutons de souscription seulement après validation des tests en mode Stripe test.

La page de retour ne remplace ni le webhook, ni la page de gestion d'abonnement Stripe Customer Portal.
