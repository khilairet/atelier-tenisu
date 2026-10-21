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

## Déploiement (AWS Lambda + Terraform)

API en ligne : https://k7kfmv4qpymdoqp2ombaicgzva0ssfuh.lambda-url.eu-west-3.on.aws/

Exemples : [`/health`](https://k7kfmv4qpymdoqp2ombaicgzva0ssfuh.lambda-url.eu-west-3.on.aws/health), [`/players?limit=5`](https://k7kfmv4qpymdoqp2ombaicgzva0ssfuh.lambda-url.eu-west-3.on.aws/players?limit=5), [`/players/stats`](https://k7kfmv4qpymdoqp2ombaicgzva0ssfuh.lambda-url.eu-west-3.on.aws/players/stats).

| Ressource       | Valeur                                                    |
| --------------- | --------------------------------------------------------- |
| URL de l'API    | `https://k7kfmv4qpymdoqp2ombaicgzva0ssfuh.lambda-url.eu-west-3.on.aws/` |
| Dépôt ECR       | `919286311848.dkr.ecr.eu-west-3.amazonaws.com/tenisu`     |
| Région          | `eu-west-3` (Paris)                                       |

### Pourquoi serverless ?

- **Coût quasi nul** : on ne paie que les requêtes, rien quand l'API n'est pas utilisée (contre ~10-15 $/mois pour une tâche Fargate permanente ou ~16 $/mois pour un ALB).
- **Simplicité** : pas de serveur, de réseau, de load balancer ni d'API Gateway. Six ressources Terraform suffisent (ECR, rôle IAM, fonction Lambda, Function URL).
- **HTTPS et URL stable** fournis par la Function URL.
- **Scalabilité automatique**, sans configuration.
- **Code inchangé** : l'image Docker embarque le [Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter), qui relaie les requêtes vers Express.

> Limite : les données sont en mémoire, et chaque instance Lambda a son propre état, perdu quand elle est recyclée.
> Les `POST`, `PUT` et `DELETE` ne sont donc pas durables. Pour les conserver, il faudrait un repository DynamoDB.

### Déployer

Prérequis : AWS CLI connecté (`aws login`), Docker et Terraform.

```bash
cd infra
terraform init
terraform apply

Pour mettre à jour : reconstruire et pousser l'image, puis `aws lambda update-function-code --function-name tenisu --image-uri <repo>:latest --region eu-west-3`.

Pour tout supprimer : `terraform destroy`.
