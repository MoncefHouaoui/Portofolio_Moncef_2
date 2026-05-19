# Portfolio de Moncef - React + petit backend

Projet portfolio créé avec React + Vite + React Router, avec un backend Express pour la connexion et la modification des textes des projets.

## Lancer le projet

```bash
npm install
npm run dev
```

Cette commande lance :

- le frontend React sur Vite, souvent `http://localhost:5173`
- le backend Express sur `http://localhost:3001`

## Identifiants de connexion

```txt
email : moncef@test.fr
mot de passe : moncef
```

Une fois connecté, le bouton du header devient **Se déconnecter**. Sur les pages Projet 1 et Projet 2, un bouton **Modifier** apparaît à côté de chaque catégorie : Description, Technologies utilisées et Ressenti.

## Structure importante

- `index.html` : point d'entrée technique de React, ce n'est pas la page d'accueil.
- `src/pages/Home.jsx` : vraie page d'accueil.
- `src/pages/About.jsx` : page À propos avec la photo et les deux blocs Projet 1 / Projet 2.
- `src/pages/Login.jsx` : page de connexion.
- `src/pages/ProjectPage.jsx` : modèle réutilisé pour les pages Projet 1 et Projet 2, avec édition si connecté.
- `src/components/Header.jsx` : header commun affiché sur toutes les pages.
- `src/AuthContext.jsx` : gestion de la connexion côté React.
- `server/server.js` : backend Express.
- `server/data/projects.json` : textes des projets enregistrés par le backend.
- `src/styles.css` : tout le design.

## Remplacer les images

Remplace simplement les fichiers suivants en gardant les mêmes noms :

- `public/assets/images/photo-moncef.svg`
- `public/assets/images/screen-projet-1.svg`
- `public/assets/images/screen-projet-2.svg`

Tu peux aussi utiliser des fichiers `.jpg` ou `.png`, mais dans ce cas il faudra modifier les chemins dans les composants React.
