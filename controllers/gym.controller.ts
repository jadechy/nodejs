import { SessionService, GymService } from "../service/mongoose";
import { Request, Response, Router, json } from "express";
import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { UserRole } from "../models/user.interface";
import { GymStatus } from "../models";

export class GymController {
  constructor(
    public readonly gymService: GymService,
    public readonly sessionService: SessionService
  ) {}

  async createGym(req: Request, res: Response) {
    if (!req.body) {
      res.status(400).end();
      return;
    }
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const gym = await this.gymService.createGym(
        {
          name: req.body.name,
          capacity: req.body.capacity,
          equipments: req.body.equipments,
          installations: req.body.installations,
          activities: req.body.activities,
          openingHours: req.body.openingHours,
          pricing: req.body.pricing,
          address: req.body.address,
          coachCount: req.body.coachCount,
          contact: req.body.contact,
          requestedBy: req.user,
          status: req.body.status,
        },
        req.user
      );
      res.status(201).json(gym);
    } catch {
      res.status(409).end();
    }
  }

  async updateGym(req: Request, res: Response) {
    try {
      const gymId = req.params.id;
      const updateData = req.body;

      const updatedGym = await this.gymService.updateGym(gymId, updateData);

      res.status(200).json(updatedGym);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteGym(req: Request, res: Response) {
    try {
      const gymId = req.params.id;
      await this.gymService.deleteGym(gymId);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAllGyms(req: Request, res: Response) {
    try {
      const gyms = await this.gymService.findAllGyms();
      res.status(200).json(gyms);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getGymById(req: Request, res: Response) {
    try {
      const gymId = req.params.id;
      const gym = await this.gymService.findGymById(gymId);

      if (!gym) {
        res.status(404).json({ message: "Salle de sport non trouvée" });
        return;
      }

      res.status(200).json(gym);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async approveGymRequest(req: Request, res: Response) {
    try {
      const gymId = req.params.id;
      await this.gymService.updateGymStatus(gymId, GymStatus.APPROVED);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async rejectGymRequest(req: Request, res: Response) {
    try {
      const gymId = req.params.id;
      await this.gymService.updateGymStatus(gymId, GymStatus.REJECTED);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getMyGymRequests(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const userId = req.user._id;
      const gyms = await this.gymService.findAllGymByUser(userId);
      res.status(200).json(gyms);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getMyApprovedRequests(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const userId = req.user._id;
      const approvedRequests = await this.gymService.findGymByUserAndStatus(
        userId,
        GymStatus.APPROVED
      );
      res.status(200).json(approvedRequests);
    } catch (err) {
      res.status(500).json({
        message: "Erreur lors de la récupération des demandes approuvées.",
      });
    }
  }

  async getMyRejectedRequests(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const userId = req.user._id;
      const rejectedRequests = await this.gymService.findGymByUserAndStatus(
        userId,
        GymStatus.REJECTED
      );
      res.status(200).json(rejectedRequests);
    } catch (err) {
      res.status(500).json({
        message: "Erreur lors de la récupération des demandes rejetées.",
      });
    }
  }

  async getAllPendingRequests(req: Request, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const pendingRequests = await this.gymService.findGymByStatus(
        GymStatus.PENDING
      );
      res.status(200).json(pendingRequests);
    } catch (err) {
      res.status(500).json({
        message: "Erreur lors de la récupération des demandes rejetées.",
      });
    }
  }

  buildRouter(): Router {
    const router = Router();

    router.get(
      "/request",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.OWNER),
      this.getMyGymRequests.bind(this)
    );

    router.get(
      "/request/approve",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.OWNER),
      this.getMyApprovedRequests.bind(this)
    );

    router.get(
      "/request/reject",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.OWNER),
      this.getMyRejectedRequests.bind(this)
    );

    router.post(
      "/",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.OWNER),
      json(),
      this.createGym.bind(this)
    );

    router.put(
      "/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      json(),
      this.updateGym.bind(this)
    );

    router.delete(
      "/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      this.deleteGym.bind(this)
    );

    router.get(
      "/",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      this.getAllGyms.bind(this)
    );

    router.get(
      "/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      this.getGymById.bind(this)
    );

    router.put(
      "/:id/approve",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      json(),
      this.approveGymRequest.bind(this)
    );

    router.put(
      "/:id/reject",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      json(),
      this.rejectGymRequest.bind(this)
    );

    router.get(
      "/request/pending",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      this.getAllPendingRequests.bind(this)
    );

    return router;
  }
}
