# GitHub Copilot instructions — NAKAHYA

## Mission
Contribute to **NAKAHYA**, a serious-dating application. Preserve user safety, consent, privacy and the existing architecture. Do not confuse this repository with BitGold or another project.

## Read before writing
1. Read `FEATURES_INVENTORY.md` and `BACKLOG.md` and inspect existing routes, components, tests, database migrations and open pull requests to prevent duplicates.
2. Consult `docs/DESIGN_SYSTEM_NEO_MIDNIGHT.md` before changing UI. Respect established design tokens, responsive layouts and accessibility.
3. Read the relevant feature documentation, especially `docs/PRODUCT_STRATEGY_DATING_AND_OUTINGS.md` for dating/outing/affiliate work.
4. Distinguish existing code, proposed changes, successful CI and verified production deployment. Never claim the latter without evidence.

## Engineering
- Stack: Next.js App Router, React, TypeScript, Cloudflare Workers, Neon PostgreSQL and Playwright. Prefer existing patterns and dependencies.
- Keep changes narrowly scoped to the assigned issue; do not reimplement existing functionality.
- Prefer one coherent branch and one commit per requested lot; open a pull request for review. Never push to or merge into `main` without explicit authorization.
- Add or update Playwright regression coverage for changed user journeys, including mobile where relevant. Update outdated assertions when copy changes.
- Run, or request CI validation for, `npm run lint`, `npm test`, `npm run build` and relevant Playwright suites. Report failures honestly and fix them before proposing merge.
- Update feature inventory and relevant Markdown documentation for meaningful functional changes; avoid duplicate status sections when an existing section can be updated.
- Do not change authentication, authorization, payment or personal-data handling without explicit task scope and security review.

## Safety and product boundaries
- Dating, consent and respectful interactions take precedence over engagement tricks.
- Do not expose private messages, profiles, precise locations, access tokens or personal identifiers to third parties.
- Never invent partner agreements, prices, discounts, availability or confirmed reservations. Mark editorial suggestions and future sponsored links accurately.
- Never activate an external provider, payment, booking flow or marketing tracker without approval and verified requirements.
- Respect existing locale architecture; avoid hard-coded user-facing strings when the relevant UI uses translations.

## Pull request checklist
- Summarize changed files, why the change is needed and any existing functionality reused.
- Link the related issue or requirement; list tests actually executed and their results.
- Identify migrations, secrets, external dependencies, privacy implications and rollout risks.
- Do not claim CI is green or production deployed unless checked for the exact head SHA.
