# NAKAHYA — application mobile

## Objectif

Préparer Android et iOS depuis le dépôt existant, sans agence ni prestataire. Le site Next.js, le Worker Cloudflare et Neon restent le backend commun.

## État de cette première phase

- Capacitor 7 ajouté au projet.
- Identifiant mobile : `com.nakahya.app`.
- Nom affiché : `NAKAHYA`.
- L'application native charge actuellement `https://nakahya.com` en HTTPS.
- Deux workflows manuels/PR sont disponibles :
  - `NAKAHYA Mobile — Android build` : génère un APK debug.
  - `NAKAHYA Mobile — iOS simulator build` : compile une application pour simulateur iOS sans signature.
- Les projets natifs sont générés pendant les workflows et ne sont pas encore versionnés.

## Limite importante — publication sur les stores

Cette première phase est un conteneur natif connecté au site. Elle permet de vérifier la chaîne de compilation, mais **ne constitue pas une application prête à publier**. Apple peut refuser une application qui se limite à encapsuler un site web ou n'apporte pas suffisamment de fonctionnalités natives. Il faudra enrichir l'expérience mobile (navigation native, gestion du cycle de vie, partage, appareil photo/sélecteur de photos, notifications push réellement intégrées, liens profonds et gestion hors connexion adaptée) puis tester sur de vrais appareils.

Le build iOS actuel cible le simulateur et n'est ni signé ni téléchargeable sur un iPhone. Pour TestFlight/App Store, il faudra un compte Apple Developer actif, un certificat de distribution, un profil de provisioning et la configuration App Store Connect. Une compilation iOS de distribution exige une signature Apple.

Le workflow Android actuel produit un APK debug non destiné à Google Play. La publication Google Play nécessite un compte Play Console, un Android App Bundle (.aab) signé et une configuration de signature/Play App Signing. Les exigences d'accès aux tests peuvent varier selon le type de compte développeur.

## Lancement depuis GitHub

1. Ouvrir l'onglet **Actions** du dépôt.
2. Choisir le workflow Android ou iOS.
3. Cliquer sur **Run workflow** sur la branche `feature/mobile-app`.
4. Télécharger l'artefact une fois le workflow terminé.

## Sécurité

- Aucun secret de production n'est requis pour ces builds.
- Ne jamais committer une clé de signature Android, un certificat Apple, un profil de provisioning ou un secret.
- Ne pas activer de permissions caméra/microphone/localisation tant que les fonctions correspondantes ne sont pas implémentées et justifiées.
- Vérifier les politiques Google Play et App Store avant toute soumission, notamment contenu généré par les utilisateurs, signalement, blocage, modération, suppression de compte, âge et confidentialité.

## Prochaines étapes

1. Laisser les workflows générer les projets et valider la compilation.
2. Tester l'APK sur plusieurs appareils Android.
3. Concevoir les fonctionnalités natives et l'expérience mobile au-delà de la simple WebView.
4. Préparer les ressources de marque, politique de confidentialité, fiches stores et comptes de revue.
5. Ajouter les secrets de signature et les workflows de distribution seulement lorsque les comptes développeur sont disponibles.
