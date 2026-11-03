# Sorties & Invitations — Premium

- Existing `member_availability` (migration 014) remains the availability source. This feature extends it with invitations; no second availability store.
- Migration 015 must be applied to Neon before enabling the feature.
- `GET /api/outings` lists only invitations involving the authenticated user, excluding blocked pairs.
- `POST /api/outings` requires a current Premium entitlement, adult profiles, completed onboarding, a reciprocal match, no block, a future date and no duplicate pending invitation.
- `PATCH /api/outings` allows the recipient to accept/decline, or sender to cancel, pending invitations.
- No payment provider is configured. Premium entitlements are server-side and cannot be self-granted. Do not advertise paid activation as live.
- Do not publish private contact information or infer booking/venue confirmation. Travel invitations are proposals, not booked trips.
- Future: extend availability categories for cinema/walk with migration, show outgoing/incoming badges in global navigation, notify recipients, and add E2E authenticated two-user tests before commercial activation.
- Security: verify CSRF/Origin enforcement, rate limiting, consent, moderation and retention before accepting paid subscriptions.

## Correctif mobile Bons plans — 2026-11-02
- Diagnostic: la page utilisait des classes bons-plans sans feuille de style dédiée importée; styles inline de filtres incompatibles avec la palette claire.
- Ajout d'une feuille CSS isolée, grille responsive, marges, cartes, filtres accessibles et zone basse adaptée à la navigation mobile.
- Extension du test Playwright existant bons-plans-filters.spec.ts (390x844, styles et débordement), sans nouveau test redondant.
- Le contrôle d'unicité des e-mails reste côté serveur (conflit 409 neutre, anti-énumération); aucun endpoint public de disponibilité e-mail n'est créé.
- La validation CI et déploiement est à confirmer après la PR.
