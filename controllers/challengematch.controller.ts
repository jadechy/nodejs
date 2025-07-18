import { ChallengeMatchService, SessionService } from "../service/mongoose";
import { requireMinimumRole, authenticateSession } from "../middlewares";
import { Request, Response, Router, json } from "express";
import { ChallengeMatchStatus, UserRole } from "../models";

export class ChallengeMatchController {
  constructor(
    public readonly challengeMatchService: ChallengeMatchService,
    public readonly sessionService: SessionService
  ) {}

  createChallengeMatch = async (req: Request, res: Response) => {
    if (!req.body) {
      res.status(400).end();
      return;
    }
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const challengeMatch =
        await this.challengeMatchService.createChallengeMatch({
          challenge: req.body.challenge,
          challenger: req.user,
          opponent: req.body.opponent,
          status: ChallengeMatchStatus.PENDING,
        });
      res.status(201).json(challengeMatch);
    } catch (error) {
      res.status(409).end();
    }
  };

  getMyMatchRequests = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const userId = req.user._id;
      const gyms = await this.challengeMatchService.findAllMatchRequestsByUser(
        userId
      );
      res.status(200).json(gyms);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  acceptMatchRequest = async (req: Request, res: Response) => {
    try {
      const matchId = req.params.id;
      await this.challengeMatchService.updateGymRequestStatus(
        matchId,
        ChallengeMatchStatus.ACCEPTED
      );
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  refuseMatchRequest = async (req: Request, res: Response) => {
    try {
      const matchId = req.params.id;
      await this.challengeMatchService.updateGymRequestStatus(
        matchId,
        ChallengeMatchStatus.REFUSED
      );
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  addTrainingToMatch = async (req: Request, res: Response) => {
    if (!req.body) {
      res.status(400).end();
      return;
    }
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const matchId = req.params.id;
      const userId = req.user._id;
      const updateData = req.body;
      await this.challengeMatchService.addTrainingToMatch(
        matchId,
        userId,
        updateData
      );
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  computeMatchWinner = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    const matchId = req.params.id;
    if (!matchId) {
      res.status(400).json({ error: "Paramètre ID manquant." });
      return;
    }
    try {
      const match = await this.challengeMatchService.computeMatchWinner(
        matchId
      );
      res.status(200).json(match);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  buildRouter = (): Router => {
    const router = Router();

    router.post(
      "/",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.CLIENT),
      json(),
      this.createChallengeMatch.bind(this)
    );

    router.get(
      "/request",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.CLIENT),
      this.getMyMatchRequests.bind(this)
    );

    router.put(
      "/:id/accept",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.CLIENT),
      json(),
      this.acceptMatchRequest.bind(this)
    );

    router.put(
      "/:id/refuse",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.CLIENT),
      json(),
      this.refuseMatchRequest.bind(this)
    );

    router.put(
      "/:id/training",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.CLIENT),
      json(),
      this.addTrainingToMatch.bind(this)
    );

    router.put(
      "/:id/winner",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.CLIENT),
      json(),
      this.computeMatchWinner.bind(this)
    );

    return router;
  };
}
