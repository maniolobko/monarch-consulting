# Monarch Consulting — Site officiel

Site vitrine de **MONARCH CONSULTING IO LTD** — cabinet de conseil international
(stratégie, intelligence artificielle, transformation digitale, développement d'affaires).

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil |
| `mentions-legales.html` | Mentions légales & confidentialité |
| `styles.css` | Feuille de style |
| `script.js` | Interactions & visuels |
| `contact.php` | Traitement du formulaire (PHP) |
| `favicon.svg` | Icône du site |
| `og-image.png` | Image de partage (réseaux sociaux) |
| `robots.txt` / `sitemap.xml` | Référencement |
| `.htaccess` | HTTPS, redirection www, cache, sécurité |

## Déploiement

Site statique + un script PHP. Déployé automatiquement via **IONOS Deploy Now**
(aucune étape de build). Voir `GUIDE-DEPLOY-NOW.md`.

- **Aucune commande de build** n'est nécessaire.
- **Dossier de publication** : racine du dépôt (`.`).
- À chaque `push` sur la branche principale, le site est redéployé.
