# Portfolio de Moncef — Fullstack React + Express

Projet complet avec frontend React/Vite, backend Express, connexion administrateur, carrousel d’images, ajout/suppression de projets et configuration prête pour Vercel.

## Identifiants

```txt
email : moncef@test.fr
mot de passe : moncef
```

## Lancer en local

Depuis le dossier principal :

```bash
npm install
npm run install:all
npm run dev
```

Puis ouvre :

```txt
http://localhost:5173
```

Le frontend tourne sur `http://localhost:5173` et le backend sur `http://localhost:3001`. En local, Vite redirige automatiquement `/api` et `/uploads` vers le backend grâce au proxy dans `frontend/vite.config.js`.

## Déploiement Vercel

Les fichiers nécessaires sont déjà ajoutés :

- `vercel.json` à la racine ;
- `api/index.js` pour exposer le backend Express à Vercel ;
- `backend/server.js` exporte maintenant l’application Express et ne lance `app.listen()` qu’en local ;
- les appels API du frontend restent relatifs avec `/api/...`, donc il ne faut pas utiliser `localhost` en production.

### Réglages Vercel conseillés

Si Vercel te demande les réglages manuellement :

```txt
Framework Preset : Vite
Build Command : npm run build
Output Directory : frontend/dist
Install Command : npm install && npm install --prefix frontend
```

Tu peux ensuite importer ce dépôt GitHub dans Vercel :

```txt
https://github.com/MoncefHouaoui/Portofolio_Moncef.git
```

## Envoyer sur GitHub

Depuis le dossier principal :

```bash
git init
git add .
git commit -m "Deploy-ready portfolio Moncef"
git branch -M main
git remote add origin https://github.com/MoncefHouaoui/Portofolio_Moncef.git
git push -u origin main
```

## Note importante sur Vercel et les uploads

Le projet est configuré pour fonctionner sur Vercel, mais Vercel n’est pas un stockage permanent pour les fichiers uploadés depuis l’interface. Les images ajoutées depuis l’administration peuvent être temporaires côté serveur.

Pour un portfolio réellement durable en production, il faudra brancher plus tard un stockage externe comme Cloudinary, Supabase Storage ou Firebase Storage. Les images déjà présentes dans `frontend/public/assets/images` restent bien disponibles après déploiement.

## Page “Me contacter”

La page `Me contacter` est disponible depuis le header. Elle envoie les messages vers :

```txt
houaouimoncef@outlook.fr
```

Pour que l’envoi d’e-mail fonctionne réellement en local ou sur Vercel, configure ces variables d’environnement côté backend / Vercel :

```txt
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ton-adresse-expediteur@outlook.fr
SMTP_PASS=ton-mot-de-passe-application
SMTP_FROM=ton-adresse-expediteur@outlook.fr
```

Sur Vercel : `Settings` → `Environment Variables` → ajoute les variables ci-dessus → `Redeploy`.
