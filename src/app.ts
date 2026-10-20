import express, { Express } from "express";
import { PlayerService } from "./application/player/PlayerService";
import { PlayerStatisticsService } from "./application/player/PlayerStatisticsService";
import { PlayerRepository } from "./domain/player/PlayerRepository";
import { InMemoryPlayerRepository } from "./infrastructure/persistence/InMemoryPlayerRepository";
import { errorHandler, notFoundHandler } from "./interfaces/http/errorHandler";
import { playerRouter } from "./interfaces/http/playerRouter";

export function createApp(repository: PlayerRepository = InMemoryPlayerRepository.fromSeed()): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/players", playerRouter(new PlayerService(repository), new PlayerStatisticsService(repository)));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
