import { SessionService, UserService } from "../service/mongoose";
import { Request, Response, Router, json } from "express";
import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { UserRole } from "../models/user.interface";

export class UserController {
  constructor(
    public readonly userService: UserService,
    public readonly sessionService: SessionService
  ) {}

  async createUser(req: Request, res: Response) {
    if (
      !req.body ||
      !req.body.email ||
      !req.body.password ||
      !req.body.lastName ||
      !req.body.firstName ||
      !req.body.role
    ) {
      res.status(400).end();
      return;
    }
    try {
      const user = await this.userService.createUser({
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        lastName: req.body.lastName,
        firstName: req.body.firstName,
        rewards: [],
        badges: [],
      });
      res.status(201).json(user);
    } catch {
      res.status(409).end(); // CONFLICT
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const updateData = req.body;

      const updatedUser = await this.userService.updateUser(userId, updateData);

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      await this.userService.deleteUser(userId);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateUserRole(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const userRole = req.body.role;
      await this.userService.updateRole(userId, userRole);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUserBadges(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const badges = await this.userService.getUserBadges(userId);
      res.status(200).json(badges);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUserRewards(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const badges = await this.userService.getUserRewards(userId);
      res.status(200).json(badges);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getRankingByBadges(req: Request, res: Response) {
    try {
      const ranking = await this.userService.getUserRankingByBadges();
      res.status(200).json(ranking);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getRankingByRewards(req: Request, res: Response) {
    try {
      const ranking = await this.userService.getUserRankingByRewards();
      res.status(200).json(ranking);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  buildRouter(): Router {
    const router = Router();
    router.post(
      "/",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      json(),
      this.createUser.bind(this)
    );

    router.get(
      "/badges/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.CLIENT),
      json(),
      this.getUserBadges.bind(this)
    );

    router.get(
      "/rewards/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.CLIENT),
      json(),
      this.getUserRewards.bind(this)
    );

    router.get(
      "/ranking/badges",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.CLIENT),
      json(),
      this.getRankingByBadges.bind(this)
    );

    router.get(
      "/ranking/rewards",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.CLIENT),
      json(),
      this.getRankingByRewards.bind(this)
    );

    router.put(
      "/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      json(),
      this.updateUser.bind(this)
    );

    router.delete(
      "/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      this.deleteUser.bind(this)
    );

    router.put(
      "/:id/role",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      json(),
      this.updateUserRole.bind(this)
    );

    return router;
  }
}
