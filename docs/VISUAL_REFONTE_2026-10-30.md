# Refonte visuelle NAKAHYA — 2026-10-30

## Portée
Consolidation de l'identité existante sans modification de routes, API, règles métier ou algorithmes. Le dépôt avait simultanément une base vert/ivoire, une landing prune/violet, des styles d'authentification violets et un système Neo Midnight sombre. La feuille `app/brand-refonte.css` est chargée en dernier afin de corriger les écarts sans dupliquer les composants.

## Tokens
- Vert profond : `#17594D` ; vert secondaire : `#357B69`.
- Fond ivoire : `#FAF8F3` ; surfaces blanches : `#FFFFFF`.
- Texte principal : `#192C26` ; secondaire : `#475D53`.
- Accent chaleureux : `#A76C4C` ; bordure : `#DFE5DD`.
- Focus clavier : `#146C54`.

## Parcours concernés
Accueil, histoire de marque, CTA, navigation, cockpit, cartes, découverte, profils, authentification, formulaires, mobile et réduction des animations. Les cartes Découvrir ont un voile sombre renforcé pour garantir la lisibilité des noms sur photo.

## Critères de vérification
1. Desktop 1440px et mobile 390px : aucun débordement horizontal, navigation et CTA utilisables.
2. Découvrir avec et sans photo : nom, ville, bio et actions visibles et lisibles.
3. Contraste WCAG 2.2 AA à mesurer sur les états réels, notamment images et hover.
4. Navigation clavier et focus visible ; préférence reduced-motion respectée.
5. Régression Playwright : tests existants `tests/e2e/home-navigation.spec.ts`, `tests/e2e/security-and-mobile-navigation.spec.ts` et `tests/e2e/discovery-dashboard-pricing.spec.ts`.
6. Exécuter lint, build, tests et CI sur le SHA de la PR avant toute fusion.

## Limites
Il s'agit d'une refonte CSS transversale, non d'une réécriture des composants. Les anciens styles restent présents et doivent être rationalisés ultérieurement après validation visuelle. Aucun résultat de test ni conformité WCAG n'est présumé sans exécution et preuve.
