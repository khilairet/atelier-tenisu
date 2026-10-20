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

| Méthode | Route            | Description                                             |
| ------- | ---------------- | ------------------------------------------------------- |
| GET     | `/players`       | Liste paginée des joueurs, du meilleur au moins bon     |
| GET     | `/players/stats` | Statistiques (meilleur pays, IMC moyen, taille médiane) |
| GET     | `/players/:id`   | Détail d'un joueur                                      |
| POST    | `/players`       | Ajout d'un joueur (201)                                 |
| PUT     | `/players/:id`   | Modification complète d'un joueur                       |
| DELETE  | `/players/:id`   | Suppression d'un joueur (204)                           |

La liste et les statistiques acceptent les filtres optionnels et combinables `country` (code ISO à 3 lettres) et `sex` (`M` ou `F`),
insensibles à la casse : `GET /players?country=USA&sex=F`.

`GET /players` est paginé via `page` (défaut 1) et `limit` (défaut 20, max 100) : `GET /players?page=2&limit=10`.
La réponse a la forme `{ "data": [...], "pagination": { "page", "limit", "total", "totalPages" } }`.

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
les modifications sont perdues au redémarrage.
