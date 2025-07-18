import { SessionService, RewardService } from "../service/mongoose";
import { Request, Response, Router, json } from "express";
import { requireMinimumRole, authenticateSession } from "../middlewares";
import { UserRole } from "../models/user.interface";

export class RewardController {
  constructor(
    public readonly rewardService: RewardService,
    public readonly sessionService: SessionService
  ) {}

  createReward = async (req: Request, res: Response) => {
    if (!req.body) {
      res.status(400).end();
      return;
    }
    try {
      const reward = await this.rewardService.createReward({
        name: req.body.name,
        description: req.body.description,
        condition: req.body.condition,
        type: req.body.type,
      });
      res.status(201).json(reward);
    } catch {
      res.status(409).end();
    }
  };

  updateReward = async (req: Request, res: Response) => {
    try {
      const rewardId = req.params.id;
      const updateData = req.body;

      const updatedGym = await this.rewardService.updateReward(
        rewardId,
        updateData
      );

      res.status(200).json(updatedGym);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  deleteReward = async (req: Request, res: Response) => {
    try {
      const rewardId = req.params.id;
      await this.rewardService.deleteReward(rewardId);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAllRewards = async (_req: Request, res: Response) => {
    try {
      const rewards = await this.rewardService.findAllRewards();
      res.status(200).json(rewards);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getRewardById = async (req: Request, res: Response) => {
    try {
      const rewardId = req.params.id;
      const reward = await this.rewardService.findRewardById(rewardId);

      if (!reward) {
        res.status(404).json({ message: "Récompense non trouvée" });
        return;
      }

      res.status(200).json(reward);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  buildRouter = (): Router => {
    const router = Router();

    router.post(
      "/",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      json(),
      this.createReward.bind(this)
    );

    router.put(
      "/:id",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      json(),
      this.updateReward.bind(this)
    );

    router.delete(
      "/:id",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      this.deleteReward.bind(this)
    );

    router.get(
      "/",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      this.getAllRewards.bind(this)
    );

    router.get(
      "/:id",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      this.getRewardById.bind(this)
    );

    return router;
  };
}
