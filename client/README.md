# EventEase Frontend

Application web EventEase pour decouvrir des evenements, gerer une activite d'organisateur et acheter des billets. Le client repose sur Next.js, React et TypeScript.

## Stack

- Next.js 16 avec App Router et React 19 ;
- TypeScript ;
- Chakra UI et Emotion ;
- TanStack Query pour les donnees distantes ;
- Zustand pour l'etat d'authentification ;
- Zod pour la validation des reponses ;
- Lucide React, Recharts et React Day Picker pour les composants d'interface.

## Prerequis

- Node.js 20+ ;
- npm 10+ ;
- une API EventEase accessible depuis le navigateur.

## Installation

Depuis ce dossier :

```bash
npm install
cp .env.example .env.local
```

Configurez ensuite l'URL de l'API avant de lancer l'application. Les variables `NEXT_PUBLIC_*` sont exposees dans le bundle navigateur et ne doivent jamais contenir de secrets.

## Configuration

| Variable | Requise | Role |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Oui | URL de base de l'API consommee par le client. |
| `NEXT_PUBLIC_FRONT_URL` | Oui | URL publique du frontend utilisee pour les liens partages. |
| `DICEBEAR_URL` | Non | URL du fournisseur d'avatars. |

Exemple local : `NEXT_PUBLIC_API_URL=http://localhost:3001/api`.

Ne versionnez pas `.env.local`.

## Developpement

```bash
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance Next.js en mode developpement avec Webpack. |
| `npm run build` | Genere le build de production. |
| `npm run start` | Demarre le build de production. |
| `npm run lint` | Execute ESLint. |
| `npm run theme:gen` | Genere les types Chakra UI depuis le theme. |

## Fonctionnalites

- landing page et decouverte d'evenements ;
- inscription, connexion, renouvellement de session et profil ;
- creation et administration d'evenements organisateur ;
- gestion des types de billets et des visuels ;
- checkout public et suivi de commande ;
- tableaux de bord organisateur, reglages et partage d'evenements.

## Architecture

```text
src/
├── app/          Routes, layouts et pages Next.js
├── components/   Composants partages d'interface
├── config/       Configuration publique de l'application
├── features/     Fonctionnalites organisees par domaine
│   ├── auth/     Authentification
│   ├── checkout/ Paiement et commande
│   ├── events/   Evenements et espace organisateur
│   ├── landing/  Landing page
│   ├── profile/  Profil utilisateur
│   └── settings/ Reglages
├── hooks/        Hooks React reutilisables
├── lib/          Client API, providers et query client
├── styles/       Styles globaux
└── types/        Types partages
```

Les routes restent minces et composent les fonctionnalites de `src/features`. Les appels HTTP passent par le client API, qui gere l'authentification, le renouvellement de session et la validation des reponses.

## Qualite

Avant d'ouvrir une pull request :

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Conservez les changements dans le domaine fonctionnel concerne et n'introduisez aucun secret dans les variables publiques.
