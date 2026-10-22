# Design system NAKAHYA — Neo Midnight

Statut : proposition implémentée sur la branche `feat/neo-midnight-design-system`, en attente de CI et revue. Ce document décrit la source de vérité visuelle, pas une preuve de déploiement en production.

## Direction

- Mode sombre immersif, chaleureux et accessible.
- Aucun violet/lilas/plum dans la palette de marque.
- Lime électrique pour les CTA et sélections ; menthe pour les réussites et affinités ; corail en accent émotionnel rare.
- Glassmorphism limité au chrome sticky/overlays ; surfaces opaques ailleurs pour préserver lisibilité et performances.
- La rencontre reste le cœur du produit ; les jeux aident à faire connaissance.

## Palette

| Token | HEX | Rôle |
|---|---|---|
| `--background` | `#0B0F17` | fond principal |
| `--background-elevated` | `#111827` | zones élevées |
| `--surface` | `#151D2B` | panneaux |
| `--surface-card` | `#1C2636` | cartes |
| `--surface-hover` | `#263246` | survol/élément actif |
| `--border-subtle` | `#344156` | bordure |
| `--border-strong` | `#4A5870` | bordure renforcée |
| `--text-primary` | `#F5F7FA` | texte principal |
| `--text-secondary` | `#B8C2D2` | texte secondaire |
| `--text-muted` | `#A0ACC0` | métadonnées |
| `--brand-primary` | `#D7FF72` | CTA, focus, sélection |
| `--brand-secondary` | `#65E6D0` | succès, affinité, progression |
| `--brand-warm` | `#FF9B86` | accent humain |
| `--danger` | `#FF7C87` | erreur/destructif |
| `--warning` | `#FFD479` | avertissement |

## Typographie et forme

- Sans-serif : Manrope, puis Geist et Arial comme fallback. Ne pas charger une nouvelle police distante uniquement pour les composants.
- Titres : 30–36 px pour une page, 48–64 px pour la landing desktop et 38–44 px sur mobile.
- Texte : 15–16 px ; métadonnées 12–14 px.
- Rayon : 8, 12, 18 et 24 px ; capsules uniquement pour les contrôles de type pill.
- Espacement sur base de 4 px.
- Mouvement : 140–280 ms ; privilégier transform/opacity et respecter `prefers-reduced-motion`.

## Composants

- CTA primaire lime + texte nuit ; secondaires sombres et bordés.
- Cartes en surface opaque, bordure fine, ombre discrète.
- Champs sombres avec labels persistants, focus visible et erreurs explicites.
- Chips/filtres avec sélection lime.
- Navigation mobile compacte ; le bouton central ouvre la découverte immersive et le lien Découvrir du tableau de bord garde la grille existante.
- Profil : photo dominante, informations publiques autorisées, affinités communes et états de vérification réels.
- Discussions : bulles différenciées par surface et contraste, pas par couleur seule.
- Jeux : une question à la fois, progression menthe et feedback instantané mais léger.

## Application

1. Landing : promesse de rencontre, CTA lime, photo immersive, sections et SEO conservés.
2. Inscription : formulaires, progression, consentements et authentification inchangés fonctionnellement.
3. Espace connecté : bento modéré, activité, profil, affinités, disponibilité et classements.
4. Découverte : photo grand format, résumé, J'aime/Passer ; la grille classique reste accessible.
5. Profils : photos, valeurs, projets, intérêts et jeux partagés selon les règles de visibilité.
6. Discussions : liste, conversation, invitations aux défis et états de lecture/erreur.
7. Jeux : catalogue, parties, résultats et défis coopératifs existants.

## Performance et accessibilité

- Pas de dépendance externe nouvelle pour le style.
- Éviter les filtres blur sur chaque carte ; blur uniquement sur les zones flottantes.
- Images responsives, chargement différé hors écran.
- Focus clavier visible, contraste à vérifier sur les combinaisons réelles, état pas uniquement transmis par la couleur.
- Respecter `prefers-reduced-motion`, viewport mobile et safe areas.
- Le CSS de ce design system est centralisé dans `app/product-design-system.css`, importé depuis `app/layout.tsx`.

## Contraintes de livraison

Cette refonte est strictement visuelle. Ne pas modifier les routes, API, règles d'authentification, schéma Neon, migrations ou logique métier dans le cadre du thème. Valider avec lint, tests unitaires, Playwright, build Cloudflare et contrôle des parcours existants. Une CI verte ne prouve pas le déploiement en production ; consigner séparément les preuves dans `PRODUCTION_TEST_LOG.md`.
