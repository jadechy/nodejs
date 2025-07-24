import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { rolesMiddleware } from "../middlewares/roles.middleware";
import { UserRole } from "../models";
import { ChallengeService, SessionService } from "../service/mongoose";
import { Request, Response, Router, json } from "express";

export class ChallengeController {
  constructor(
    public readonly challengeService: ChallengeService,
    public readonly sessionService: SessionService
  ) {}

  async createChallengeOwner(req: Request, res: Response) {
    if (!req.body) {
      res.status(400).end();
      return;
    }
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const challenge = await this.challengeService.createChallenge({
        title: req.body.title,
        description: req.body.description,
        goals: req.body.goals,
        recommendedExercises: req.body.recommendedExercises,
        duration: req.body.duration,
        difficulty: req.body.difficulty,
        createdBy: req.user,
        gym: req.body.gym?._id || req.body.gym,
        isCollaborative: req.body.isCollaborative,
        nbCollaborator: req.body.nbCollaborator,
        reward: req.body.reward?._id || req.body.reward,
      });
      res.status(201).json(challenge);
    } catch (error) {
      res.status(409).end();
    }
  }

  async createChallengeClient(req: Request, res: Response) {
    if (!req.body) {
      res.status(400).end();
      return;
    }
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const challenge = await this.challengeService.createChallenge({
        title: req.body.title,
        description: req.body.description,
        goals: req.body.goals,
        recommendedExercises: req.body.recommendedExercises,
        duration: req.body.duration,
        difficulty: req.body.difficulty,
        createdBy: req.user,
        isCollaborative: req.body.isCollaborative,
        nbCollaborator: req.body.nbCollaborator,
        reward: req.body.reward?._id || req.body.reward,
      });
      res.status(201).json(challenge);
    } catch {
      res.status(409).end();
    }
  }

  async updateChallenge(req: Request, res: Response) {
    if (!req.body) {
      res.status(400).end();
      return;
    }
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const challengeId = req.params.id;
      const updateData = req.body;
      const userId = req.user._id;

      const updatedChallenge = await this.challengeService.updateChallenge(
        challengeId,
        updateData,
        userId
      );

      res.status(200).json(updatedChallenge);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteChallenge(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const challengeId = req.params.id;
      const userId = req.user._id;
      await this.challengeService.deleteChallenge(challengeId, userId);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getMyChallenges(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const userId = req.user._id;
      const challenges = await this.challengeService.findAllChallengesByUser(
        userId
      );
      res.status(200).json(challenges);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getMyChallengesByGym(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const gymId = req.params.id;
      const challenges = await this.challengeService.findAllChallengesByGym(
        gymId
      );
      res.status(200).json(challenges);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async exploreChallenge(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }

    const { difficulty, exercise, duration } = req.query;

    try {
      const filters = {
        difficulty: difficulty as string | undefined,
        exercise: exercise as string | undefined,
      };

      const challenges = await this.challengeService.findAllChallenges(filters);
      res.status(200).json(challenges);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.get(
      "/",
      sessionMiddleware(this.sessionService),
      rolesMiddleware([UserRole.OWNER, UserRole.CLIENT]),
      this.getMyChallenges.bind(this)
    );

    router.get(
      "/explore",
      sessionMiddleware(this.sessionService),
      rolesMiddleware([UserRole.OWNER, UserRole.CLIENT]),
      this.exploreChallenge.bind(this)
    );

    router.post(
      "/owner",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.OWNER),
      json(),
      this.createChallengeOwner.bind(this)
    );

    router.get(
      "/owner/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.OWNER),
      this.getMyChallengesByGym.bind(this)
    );

    router.post(
      "/client",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.CLIENT),
      json(),
      this.createChallengeClient.bind(this)
    );

    router.put(
      "/:id",
      sessionMiddleware(this.sessionService),
      rolesMiddleware([UserRole.OWNER, UserRole.CLIENT]),
      json(),
      this.updateChallenge.bind(this)
    );

    router.delete(
      "/:id",
      sessionMiddleware(this.sessionService),
      rolesMiddleware([UserRole.OWNER, UserRole.CLIENT]),
      this.deleteChallenge.bind(this)
    );

    return router;
  }
}
