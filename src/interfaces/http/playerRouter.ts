import { Router } from "express";
import { PlayerService } from "../../application/player/PlayerService";
import { playerBodySchema, playerIdSchema } from "./playerSchemas";

export function playerRouter(service: PlayerService): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    res.json(await service.listPlayers());
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
