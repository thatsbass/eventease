# EventEase Frontend

Frontend de la plateforme EventEase, dédiée à la création, la vente et l'exploitation d'événements. L'application fournit une landing page, les parcours d'authentification, la découverte d'événements, la gestion des événements organisateur et les parcours de checkout publics.

## Stack

- Next.js 16 avec App Router et React 19
- TypeScript en mode strict
- Chakra UI et Emotion pour l'interface
- TanStack Query pour les données distantes
- Zustand pour l'état d'authentification persisté côté client
- Zod pour la validation des contrats API

## Prérequis

- Node.js 20 ou plus récent
- npm 10 ou plus récent
- Une API EventEase accessible depuis le navigateur
- PostgreSQL si vous exécutez les commandes Prisma

## Installation

Clonez le dépôt, installez les dépendances, puis créez le fichier d'environnement local.

```bash
npm install
cp .env.example .env.local
```

Mettez ensuite à jour au minimum `NEXT_PUBLIC_API_URL` pour viser votre API. Par défaut, l'application cherche l'API à l'adresse `http://localhost:3000/api`.

## Variables d'environnement

| Variable | Requise | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Oui | URL de base de l'API consommée par le client, par exemple `http://localhost:3000/api`. |
| `NEXT_PUBLIC_FRONT_URL` | Oui | URL publique du frontend, utilisée dans les liens partagés. |
| `NEXT_PUBLIC_API_PATH` | Compatibilité | Chemin API exposé par l'ancien module de configuration. |
| `DICEBEAR_URL` | Non | URL de base du fournisseur d'avatars DiceBear. |

Les variables préfixées par `NEXT_PUBLIC_` sont intégrées au bundle navigateur. Elles ne doivent jamais contenir de secret. Ne versionnez pas `.env.local`.

## Développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance le serveur de développement avec Webpack. |
| `npm run build` | Produit le build de production. |
| `npm run start` | Démarre le build de production. |
| `npm run lint` | Exécute ESLint. |
| `npm run theme:gen` | Génère les types Chakra UI. |

Les scripts Prisma requièrent un fichier `prisma/schema.prisma`. Ce schéma n'est pas présent dans ce dépôt frontend ; ajoutez-le ou exécutez ces commandes depuis le dépôt qui porte le schéma avant de les utiliser.

Vérification TypeScript sans générer de fichiers :

```bash
npx tsc --noEmit
```

## Architecture

```text
src/
├── app/                 Routes et layouts Next.js
├── components/          Composants partagés d'interface
├── config/              Configuration applicative basée sur l'environnement
├── features/            Fonctionnalités métier isolées par domaine
│   ├── auth/            Authentification et état utilisateur
│   ├── checkout/        Parcours de paiement
│   ├── events/          Création, consultation et administration d'événements
│   ├── landing/         Sections de la landing page
│   ├── organizer/       Espace organisateur
│   ├── profile/         Profil public et données associées
│   └── settings/        Paramètres utilisateur
├── lib/                 Clients, providers et utilitaires d'infrastructure
└── styles/              Styles globaux
```

Les routes doivent rester minces : elles composent les éléments de `features`. Les appels HTTP passent par `src/lib/api/client.ts`, qui ajoute le jeton d'accès, tente un renouvellement à l'expiration et valide les réponses avec Zod.

## Authentification et API

Les jetons d'accès et de rafraîchissement sont conservés dans le store Zustand `eventease.auth`, côté navigateur. Toute API configurée dans `NEXT_PUBLIC_API_URL` doit donc autoriser l'origine du frontend via CORS et exposer les endpoints attendus par les fonctionnalités client, notamment le renouvellement via `POST /auth/refresh`.

## Qualité et contribution

Avant toute proposition de changement :

```bash
npx tsc --noEmit
npm run lint
```

Gardez les modifications limitées au domaine concerné, évitez les imports transverses entre fonctionnalités et ne placez pas de secrets dans les variables `NEXT_PUBLIC_*` ni dans le dépôt.

## Licence

Ce projet est distribué sous licence MIT. Consultez [LICENSE](./LICENSE).
