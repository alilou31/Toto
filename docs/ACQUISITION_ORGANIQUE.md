# Acquisition organique NAKAHYA — budget 0 €

Ce document décrit les actions gratuites qui complètent le SEO technique déjà présent. Il ne certifie ni l'indexation Google ni l'activation de services externes.

## Ce qui existe déjà (ne pas dupliquer)

- Origine canonique centralisée dans `lib/site-origin.ts` : `https://nakahya.com`.
- Métadonnées globales, Open Graph et Twitter Cards dans `app/layout.tsx`.
- Données structurées Organization, WebSite et FAQ sur la landing page.
- `app/robots.ts`, `app/sitemap.ts`, exclusion des routes privées et des brouillons juridiques.
- Tests de canonical, partage social, sitemap et robots dans `tests/e2e/site-domain.spec.ts`.
- Newsletter publique existante avec double opt-in ; ne pas créer un deuxième formulaire.

## Nouvelles pages éditoriales

- `/conseils` : hub éditorial.
- `/conseils/rencontre-serieuse-ou-commencer`
- `/conseils/questions-pour-faire-connaissance`
- `/conseils/valeurs-compatibilite-couple`

Les pages sont publiques, en français, avec canonical, Open Graph et données structurées Article. Elles sont ajoutées au sitemap et aux liens de navigation. Les conseils sont généraux et ne promettent pas de résultat amoureux. Enrichir les articles à partir de questions réelles des utilisateurs ; éviter les pages locales artificielles, les répétitions et le bourrage de mots-clés.

## Mise en service manuelle Google

1. Ouvrir Google Search Console avec un compte Google du propriétaire.
2. Ajouter une propriété de type Domaine : `nakahya.com`.
3. Publier le TXT DNS exact fourni par Google dans Cloudflare DNS, sans le modifier.
4. Cliquer sur Vérifier dans Search Console. La CI ne peut pas faire cette validation à la place du propriétaire.
5. Soumettre `https://nakahya.com/sitemap.xml`.
6. Inspecter l'URL de la landing, du hub et de chacun des trois articles ; demander l'indexation si nécessaire.
7. Après 2 à 4 semaines, relever impressions, clics, CTR et requêtes. L'indexation et le classement ne sont jamais garantis.

## Mesure de trafic — phase ultérieure

L'activation d'un nouvel outil de mesure d'audience n'est pas incluse dans ce lot. Le site conserve son mécanisme de consentement analytics existant ; toute nouvelle mesure devra être intégrée à ce mécanisme, documentée dans la politique de confidentialité et validée avant activation.

## Plan de publication gratuit sur 4 semaines

- Chaque semaine : 5 à 7 vidéos verticales courtes, 2 publications sociales et 1 partage de conseil éditorial.
- Réutiliser le même tournage sur TikTok, Instagram Reels, Facebook Reels et YouTube Shorts, en respectant les règles de chaque plateforme.
- Thèmes : sortir du swipe superficiel ; questions pour faire connaissance ; parler de ses valeurs ; démonstration réelle des jeux ; sécurité et respect des limites.
- Participer utilement aux communautés qui autorisent la promotion ; ne pas envoyer de messages non sollicités, ne pas spammer et ne pas acheter de clics/abonnés.
- Chaque publication renvoie vers une page pertinente de `nakahya.com`. Utiliser des paramètres UTM distincts par réseau et campagne, sans y placer d'identifiant personnel : `?utm_source=tiktok&utm_medium=organic_social&utm_campaign=conseils_rencontre`.

## Indicateurs à relever chaque semaine

- Search Console : impressions, clics, CTR, position moyenne, pages indexées, requêtes.
- Cloudflare Web Analytics si activé : visites, pages populaires, référents, pays et appareils selon les rapports disponibles.
- Produit : inscriptions confirmées dans les données applicatives disponibles. Ne pas déduire les inscriptions des seuls clics.
- Calcul manuel : taux d'inscription = inscriptions attribuables / visiteurs de la même période. Les sources et périodes doivent être cohérentes.

## Limites et prochaines étapes

- Le propriétaire doit vérifier Search Console et effectuer les opérations DNS/Cloudflare nécessitant son accès.
- Le beacon Cloudflare est facultatif et ne remplace pas un suivi de conversion. Un suivi plus précis nécessiterait une conception distincte de consentement, de minimisation et de conservation des données.
- Les pages conseils sont une base initiale : publier régulièrement des réponses originales et réellement utiles, pas du contenu automatisé en masse.
- Les pages légales du produit sont encore signalées comme brouillons dans le dépôt ; leur revue humaine reste indispensable avant l'ouverture publique.
