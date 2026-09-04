# EventEase API

API backend d'EventEase pour la gestion d'evenements, la billetterie et les paiements. Le service est construit avec NestJS, TypeScript, Prisma et PostgreSQL.

## Perimetre

- authentification JWT et gestion des profils utilisateur/organisateur ;
- creation, publication et administration d'evenements ;
- types de billets, commandes et generation de billets PDF ;
- paiement via Stripe et traitement des webhooks ;
- stockage d'images via Cloudinary ;
- envoi asynchrone des billets par email avec BullMQ et Redis.

## Prerequis

- Node.js 20+ et npm 10+ ;
- PostgreSQL ;
- Redis pour le worker d'emails ;
- comptes Stripe, SMTP et Cloudinary selon les fonctionnalites activees.

## Installation

Depuis ce dossier :

```bash
npm install
cp .env.example .env
npx prisma generate
```

Renseignez ensuite les variables d'environnement avant de lancer l'API.

## Configuration

| Variable | Requise | Role |
| --- | --- | --- |
| `DATABASE_URL` | Oui | URL de connexion PostgreSQL. |
| `JWT_SECRET` | Oui | Secret de signature des access tokens. |
| `JWT_REFRESH_SECRET` | Oui | Secret de signature des refresh tokens. |
| `JWT_ACCESS_EXPIRES_IN` | Non | Duree de validite de l'access token, `7d` par defaut. |
| `JWT_REFRESH_EXPIRES_IN` | Non | Duree du refresh token, `30d` par defaut. |
| `PORT` | Non | Port HTTP, `3001` par defaut. |
| `REDIS_URL` | Worker | Connexion Redis pour la file d'emails. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Email | Configuration SMTP. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Paiement | Configuration Stripe. |
| `STRIPE_CHECKOUT_SUCCESS_URL`, `STRIPE_CHECKOUT_CANCEL_URL` | Paiement | URLs de retour du checkout. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Uploads | Configuration Cloudinary. |
| `TICKET_EMAIL_WORKER_CONCURRENCY` | Worker | Concurrence du worker, `5` par defaut. |

Ne versionnez jamais `.env` et n'utilisez pas de secrets de production dans un environnement local.

## Developpement

```bash
npm run dev
```

L'API est disponible sur `http://localhost:3001/api`. La specification Swagger est disponible sur `http://localhost:3001/docs`.

Le worker doit etre lance dans un second processus :

```bash
npm run start:worker
```

## Base de donnees

```bash
npx prisma generate       # Genere le client Prisma
npm run db:migrate        # Cree une migration et l'applique en developpement
npm run db:push           # Synchronise le schema sans migration
npm run db:seed           # Execute le seed configure
```

Le schema et les migrations sont dans `prisma/`. Utilisez les migrations en production plutot que `db:push`.

## Verification et build

```bash
npm run lint
npm test
npm run test:e2e
npm run build
npm run start:prod
```

## Architecture

```text
src/
├── auth/       Authentification JWT
├── events/     Evenements et types de billets
├── checkout/   Commandes et sessions Stripe Checkout
├── payment/    Confirmation des paiements et webhooks
├── tickets/    Generation et envoi des billets
├── profile/    Profils et uploads
├── database/   Acces Prisma/PostgreSQL
├── queue/      File BullMQ et jobs asynchrones
└── mail/       Abstraction et transport email
```

Toutes les routes HTTP sont prefixees par `/api`. Les routes protegees utilisent `Authorization: Bearer <access_token>`.

## Production

Construisez l'application avec `npm run build`, puis demarrez l'API et le worker comme deux processus distincts. Configurez les secrets, Stripe webhooks, PostgreSQL et Redis dans l'environnement d'execution.
