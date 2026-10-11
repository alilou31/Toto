# Tests NIKAHYA (sans base de données)

Ces tests utilisent le module de test intégré à Node.js : aucune base de données, aucun compte et aucune clé secrète ne sont nécessaires.

## Lancer les tests

Avec Node.js 18 ou plus récent, depuis la racine du dépôt :

```bash
npm test
```

Les tests couvrent :
- normalisation et format des e-mails ;
- âge minimum de 18 ans, anniversaire exact, dates impossibles et dates futures ;
- validation d'un formulaire d'inscription complet ;
- refus d'une inscription invalide ;
- acceptation explicite des conditions.

## Limites

Il s'agit de tests unitaires de règles de validation, pas de tests d'intégration de l'API, de la session ou de la base Neon. L'application possède désormais des routes serveur d'authentification et de profil, mais celles-ci doivent encore être testées avec une base de test et des comptes jetables. Les tests unitaires ne remplacent pas une revue de sécurité ni une validation du contrôle d'âge côté serveur.
