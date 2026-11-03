# Refonte visuelle NAKAHYA — recherche approfondie (2026-10-30)

## Source et périmètre
Implémentation fondée sur le rapport utilisateur « Refonte complète de l’identité visuelle de NAKAHYA » (27 979 caractères). Le rapport constate l'incohérence entre palettes, notamment le violet sur la landing, et le contraste instable des noms de profils dans Découvrir. Le dépôt confirme des couches CSS historiques et un système Neo Midnight.

## Décisions appliquées
- **Palette A recommandée** : forêt `#173F35`, champagne `#C8A96B`, ivoire `#F7F3EA`, encre `#17211D`, blanc `#FFFFFF`.
- **Tokens** `--nk-*` pour marque, neutres, sémantique, rayons, ombres, mouvement et espacement, avec ponts vers les variables historiques.
- **Typographie** : Fraunces/Georgia en display ; Inter/system-ui en UI, avec fallbacks existants.
- **Découvrir** : gradient sombre indépendant de la luminosité photo, panneau d'identité semi-opaque, noms blancs, CTA 48 px et styles sans photo.
- **Transversal** : landing, navigation, cockpit, authentification, profils, surfaces, formulaires, mobile, focus et reduced-motion.
- **Tests** : extension Playwright publique, sans compte ni doublon des parcours authentifiés.

## Critères d'acceptation avant fusion
- Vérifier visuellement 390, 768, 1024 et 1440 px, notamment les profils clairs et sans photo.
- Vérifier les contrastes réels sur photos (WCAG 2.2 AA), clavier, navigation et formulaires ; l'overlay seul ne prouve pas la conformité.
- Exécuter lint, build, Playwright, CI et contrôler les screenshots dans le même environnement que CI.
- Ne pas annoncer de conformité WCAG ou de validation production sans preuves.
- Ne pas modifier API, routes, règles métier ni intégrations externes.

## Dette contrôlée
Les styles violets historiques restent dans les anciennes feuilles mais sont neutralisés par la feuille finale. Leur suppression complète exige une revue visuelle de tous les parcours, pour éviter des régressions. Aucun nouveau composant dupliqué n'est introduit.

## Audit transversal des styles (30 octobre)
Audit des couches `globals.css`, `landing-premium.css`, `auth.css`, `profile-ui.css`, `gamified.css` et `product-design-system.css`. Les couleurs violettes/roses codées en dur ont été migrées vers une palette émeraude/champagne, en conservant les classes et la logique métier. Les variables de compatibilité (`--game-purple`, `--brand-plum`) sont maintenues temporairement mais pointent vers les tokens du thème. Le système visuel central reste `research-brand-system.css`.

Les corrections ciblent aussi le menu mobile blanc sur blanc et la superposition du nom et du badge dans Découvrir. L'absence de régression doit être vérifiée sur captures réelles, routes authentifiées, thèmes et appareils. Les anciennes variables mal nommées restent une dette de renommage : ne pas supprimer avant migration des usages.
