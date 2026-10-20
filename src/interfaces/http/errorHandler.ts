import { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError, z } from "zod";
import { InvalidPlayerError, PlayerNotFoundError } from "../../domain/player/errors";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} introuvable` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Requête invalide", details: z.flattenError(err) });
    return;
  }
  if (err instanceof PlayerNotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof InvalidPlayerError) {
    res.status(422).json({ error: err.message });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "JSON invalide" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
};
