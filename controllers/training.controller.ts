import { SessionService, TrainingService } from "../service/mongoose";
import { Request, Response, Router, json } from "express";
import { requireMinimumRole, authenticateSession } from "../middlewares";
import { UserRole } from "../models";

export class TrainingController {
  constructor(
    public readonly trainingService: TrainingService,
    public readonly sessionService: SessionService
  ) {}

  createTraining = async (req: Request, res: Response) => {
    if (!req.body) {
      res.status(400).end();
      return;
    }
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const training = await this.trainingService.createTraining({
        challenge: req.body.challenge,
        realisedBy: req.user,
        nbCalorie: req.body.nbCalorie,
        duration: req.body.duration,
        performedExercises: req.body.performedExercises,
        partner: req.body.partner,
      });
      res.status(201).json(training);
    } catch {
      res.status(409).end();
    }
  };

  buildRouter = (): Router => {
    const router = Router();

    router.post(
      "/",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.CLIENT),
      json(),
      this.createTraining.bind(this)
    );

    return router;
  };
}
