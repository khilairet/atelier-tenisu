import { Router } from "express";
import { PlayerService } from "../../application/player/PlayerService";
import { PlayerStatisticsService } from "../../application/player/PlayerStatisticsService";
import { playerBodySchema, playerFilterQuerySchema, playerIdSchema, playerListQuerySchema } from "./playerSchemas";

export function playerRouter(service: PlayerService, statisticsService: PlayerStatisticsService): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    const { filter, page, limit } = playerListQuerySchema.parse(req.query);
    res.json(await service.listPlayers(filter, { page, limit }));
  });

  router.get("/stats", async (req, res) => {
    res.json(await statisticsService.getStatistics(playerFilterQuerySchema.parse(req.query)));
  });

  router.get("/:id", async (req, res) => {
    res.json(await service.getPlayer(playerIdSchema.parse(req.params.id)));
  });

  router.post("/", async (req, res) => {
    const player = await service.createPlayer(playerBodySchema.parse(req.body));
    res.status(201).location(`${req.baseUrl}/${player.id}`).json(player);
  });

  router.put("/:id", async (req, res) => {
    const id = playerIdSchema.parse(req.params.id);
    res.json(await service.updatePlayer(id, playerBodySchema.parse(req.body)));
  });

  router.delete("/:id", async (req, res) => {
    await service.deletePlayer(playerIdSchema.parse(req.params.id));
    res.status(204).end();
  });

  return router;
}
