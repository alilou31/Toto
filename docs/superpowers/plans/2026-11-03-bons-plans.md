# Bons plans et rendez-vous — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compléter /bons-plans avec recommandations éditoriales, préparation des métriques et SEO sans activer de prestataire.

**Architecture:** Conserver cartes, filtres, validation d'affiliation et matching. Ajouter une sélection locale explicite, un compteur quotidien optionnel côté serveur et un layout SEO dédié.

**Tech Stack:** Next.js, React, TypeScript, Neon, Playwright, Node test runner.

**Spec:** ../specs/2026-11-03-bons-plans-design.md

## Global Constraints

- Un commit cohérent sur branche dédiée, PR vers main, aucune fusion.
- Aucun changement des algorithmes de matching ni activation des liens affiliés.
- Aucun nouveau package ou prestataire, pas de profil ou GPS dans les suggestions.
- Métriques désactivées par défaut ; clics ≠ réservations/commissions.

## Review Focus

- Combinaison contexte/budget sans résultat : état vide et réinitialisation.
- Échec réseau des offres : catalogue éditorial toujours accessible.
- Offre révoquée après affichage : mesure refusée côté serveur.
- Requêtes externes ou données supplémentaires : refus avant écriture.
- SEO avec paramètres de filtrage : canonical reste /bons-plans.

### Task 1: Suggestions éditoriales

Files: lib/date-ideas.ts, app/bons-plans/page.tsx, tests/date-ideas.test.cjs, tests/e2e/bons-plans-filters.spec.ts.
Interface: recommendedIdeaIds(context: string): readonly string[], contextes all/first/shared.

- [ ] Écrire tests unitaires des contextes et du repli inconnu, exécuter et observer RED.
- [ ] Implémenter la sélection de cartes existantes et raisons explicites, sélecteur et réinitialisation.
- [ ] Étendre Playwright pour contexte/budget/état vide/remise à zéro et panne réseau.
- [ ] Exécuter la suite unitaire, vérifier GREEN.

### Task 2: Préparation du compteur de clics

Files: lib/affiliate-clicks.ts, app/api/affiliate-clicks/route.ts, app/api/affiliate-offers/route.ts, db/migrations/016_affiliate_click_metrics.sql, tests/affiliate-clicks.test.cjs, tests/e2e/bons-plans-filters.spec.ts.
Interface: validateAffiliateClick(request, env) renvoie un ideaId approuvé ou un statut de refus ; POST incrémente un compteur agrégé uniquement si BON_PLANS_METRICS_ENABLED=true.

- [ ] Tests RED : désactivé, origine externe, payload invalide/trop grand, idée inconnue ou non approuvée.
- [ ] Implémenter validation fermée, migration additive par jour UTC/idée et endpoint sans données privées.
- [ ] Annoncer la mesure dans l'API et l'UI uniquement si activée ; le clic ouvre toujours directement l'offre existante.
- [ ] Tests GREEN et Playwright : aucune émission par défaut, payload minimal si activé, refus API par défaut.

### Task 3: SEO et livraison

Files: app/bons-plans/layout.tsx, tests/e2e/bons-plans-filters.spec.ts, README.md, tests/README.md, FEATURES_INVENTORY.md, BACKLOG.md, docs/BONS_PLANS_AFFILIATION_MVP.md.

- [ ] Ajouter assertions Playwright titre/description/canonical/Open Graph, puis layout dédié.
- [ ] Documenter activation manuelle et limites ; réconcilier les sections historiques sans cocher la production.
- [ ] Vérifier le build Worker du workflow existant deploy-cloudflare.yml sur la PR ; ne pas dupliquer ce contrôle dans ci.yml.
- [ ] Vérifier npm test, lint, builds et Playwright disponibles ; faire exécuter les autres en CI.
- [ ] Revue du diff et checks sur le SHA final ; un commit et une PR sans fusion.
