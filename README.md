# Tenisu API

API REST (TypeScript + Express) de gestion des joueurs de tennis.

## Démarrage

```bash
npm install
npm run dev      # serveur en watch sur http://localhost:3000
npm test         # tests d'intégration (vitest + supertest)
npm run build && npm start
```

## Routes

| Méthode | Route          | Description                                   |
|---------|----------------|-----------------------------------------------|
| GET     | `/players`     | Liste des joueurs, du meilleur au moins bon   |
| GET     | `/players/:id` | Détail d'un joueur                            |
| POST    | `/players`     | Ajout d'un joueur (201 + header `Location`)   |
| PUT     | `/players/:id` | Modification complète d'un joueur             |
| DELETE  | `/players/:id` | Suppression d'un joueur (204)                 |

Le classement trie par rang croissant (1 = meilleur), puis par points décroissants en cas d'égalité.

Codes d'erreur : `400` requête invalide, `404` joueur introuvable, `422` règle métier violée.

## Architecture

```
src/
├── domain/            # Métier pur, sans dépendance à Express
│   └── player/        # Entité Player, invariants, port PlayerRepository, erreurs
├── application/       # Cas d'usage (PlayerService)
├── infrastructure/    # Implémentations techniques (repository en mémoire, données)
└── interfaces/http/   # Routes Express, validation Zod, gestion des erreurs
```

Les données sont chargées depuis `src/infrastructure/data/headtohead.json` au démarrage et gardées en mémoire :
les modifications sont perdues au redémarrage. Pour persister, il suffit d'écrire une autre
implémentation de `PlayerRepository` et de la passer à `createApp()`.
