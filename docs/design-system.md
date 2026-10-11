# NIKAHYA — Design system UX/UI

## Direction produit
NIKAHYA aide les adultes à faire connaissance par des jeux et des conversations, sans pression ni promesse de compatibilité magique. L'interface doit rester chaleureuse, claire, inclusive et rassurante.

## Tokens visuels
- Violet principal: `#6D28D9`
- Violet secondaire: `#8B5CF6`
- Rose d'accent: `#EC4899`
- Menthe / réussite: `#10B981`
- Fond clair: `#FAF9FD`
- Fond nuit: `#0F172A`
- Texte principal: `#1E293B`
- Texte secondaire: `#64748B`
- Alerte: `#F59E0B`
- Succès: `#059669`

Les styles existants de `app/globals.css` et `app/gamified.css` sont progressivement harmonisés autour de ces tokens. Éviter d'introduire de nouvelles couleurs sans raison fonctionnelle.

## Typographie
- Interface : sans-serif lisible, avec une hiérarchie nette entre titres, paragraphes, labels et métadonnées.
- Titres : grands mais responsives; ne pas utiliser uniquement la couleur pour signaler une information.
- Texte d'aide et mentions légales : conserver un contraste lisible, y compris sur mobile.

## Composants et interaction
- Boutons primaires : action principale unique, contraste élevé, état désactivé et état de chargement visibles.
- Champs : labels persistants, validation compréhensible, focus clavier évident.
- Cartes : rayon généreux, bordure discrète, ombre légère; toute carte interactive doit être un lien ou un bouton accessible.
- Navigation mobile : menu explicite, `aria-expanded`, fermeture après navigation et zones tactiles confortables.
- Feedback : messages d'erreur annoncés via `role="alert"` ou `role="status"`; ne pas effacer silencieusement les erreurs.
- Mouvement : respecter `prefers-reduced-motion`.

## Principes de sécurité émotionnelle
- Pas de compte à rebours artificiel, de pression à répondre ou de formulation culpabilisante.
- L'utilisateur contrôle la visibilité de son profil et les informations partagées.
- Ne jamais présenter un score d'affinité comme une vérité scientifique ni garantir la réussite d'une relation.
- Indiquer clairement les fonctions qui sont encore des démonstrations ou qui ne sont pas encore actives.

## Responsive et accessibilité
- Priorité mobile, mise en page fluide et sans défilement horizontal à 320 px.
- Tous les contrôles utilisables au clavier avec focus visible.
- Contrastes conformes autant que possible au niveau WCAG AA.
- Les illustrations décoratives portent `aria-hidden="true"`; les illustrations informatives ont un texte alternatif.

## Architecture
- Conserver Next.js App Router, React et TypeScript, ainsi que les routes API existantes et le backend Cloudflare Workers.
- Une refonte visuelle ne doit pas modifier le contrat des API d'authentification ou de profil.
- Garder les tests automatisés manuels pendant la phase de refonte, puis les réactiver avant fusion finale et déploiement de production.
