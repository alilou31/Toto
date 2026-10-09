# Tests NIKAHYA (sans base de données)

Ces tests utilisent le module de test intégré à Node.js : aucune base Supabase, aucun compte et aucune clé secrète ne sont nécessaires.

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

Il s'agit de tests unitaires des règles de validation, pas de tests de navigateur ni de tests de sécurité Supabase/RLS. Les formulaires de l'application restent des interfaces de démonstration tant que l'authentification serveur n'est pas connectée. La vérification d'âge ici est une règle de validation réutilisable, mais ne remplace pas un contrôle côté serveur.
