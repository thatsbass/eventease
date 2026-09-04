# EventEase

EventEase est une plateforme de gestion et de billetterie d'evenements. Elle permet aux organisateurs de publier leurs evenements et de gerer leurs billets, tandis que les participants peuvent decouvrir des evenements et acheter leurs places en ligne.

## Architecture

Le projet est organise en deux applications independantes :

```text
.
├── client/   Application web Next.js
└── api/      API NestJS et worker de traitement asynchrone
```

| Application | Stack principale | Port local |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Chakra UI | `3000` |
| Backend | NestJS 11, TypeScript, Prisma, PostgreSQL | `3001` |
| Documentation API | Swagger | `http://localhost:3001/docs` |

La documentation detaillee de chaque application est disponible dans [client/README.md](client/README.md) et [api/README.md](api/README.md).

## Fonctionnalites

- decouverte et partage d'evenements ;
- authentification et gestion des profils ;
- creation et administration d'evenements ;
- configuration des types de billets et des quotas ;
- checkout et paiement Stripe ;
- generation et envoi des billets par email ;
- gestion des images et des profils organisateurs.

## Prerequis

- Node.js 20+ ;
- npm 10+ ;
- PostgreSQL et Redis pour executer l'ensemble de la plateforme ;
- comptes Stripe, SMTP et Cloudinary pour les integrations concernees.

## Demarrage local

Installez les dependances dans chaque application :

```bash
cd api
npm install
cp .env.example .env
npx prisma generate

cd ../client
npm install
touch .env.local
```

Configurez les variables d'environnement dans `api/.env` et `client/.env.local`, puis lancez les processus dans des terminaux distincts. Les variables frontend sont documentees dans [client/README.md](client/README.md).

```bash
# API
cd api
npm run dev

# Worker d'emails
cd api
npm run build
npm run start:worker

# Frontend
cd client
npm run dev
```

Acces locaux :

- application web : `http://localhost:3000` ;
- API : `http://localhost:3001/api` ;
- Swagger : `http://localhost:3001/docs`.

Le frontend doit pointer vers l'API avec `NEXT_PUBLIC_API_URL=http://localhost:3001/api`.

## Validation

Chaque application se valide depuis son propre dossier :

```bash
# Frontend
cd client
npm run lint
npm run build

# Backend
cd api
npm run lint
npm test
npm run test:e2e
npm run build
```

## Organisation du code

- les routes et layouts d'interface sont dans `client/src/app` ;
- les domaines fonctionnels frontend sont dans `client/src/features` ;
- les modules métier backend sont dans `api/src` ;
- le schema Prisma et les migrations sont dans `api/prisma`.

Les changements doivent rester limites au domaine concerne. Les secrets ne doivent jamais etre commites ni exposes dans les variables `NEXT_PUBLIC_*`.

## Production

Construisez et deployez le frontend et l'API comme deux applications distinctes. L'API et le worker doivent etre demarres dans des processus separes. Reportez-vous aux README de [client](client/README.md) et de [api](api/README.md) pour les variables d'environnement et les commandes propres a chaque application.
