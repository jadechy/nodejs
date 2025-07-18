import { SessionService, GymService } from "../service/mongoose";
import { Request, Response, Router, json } from "express";
import { requireMinimumRole, authenticateSession } from "../middlewares";
import { UserRole } from "../models/user.interface";
import { GymRequestStatus } from "../models";

export class GymController {
  constructor(
    public readonly gymService: GymService,
    public readonly sessionService: SessionService
  ) {}

  createGym = async (req: Request, res: Response) => {
    if (!req.body) {
      res.status(400).end();
      return;
    }
    try {
      const gym = await this.gymService.createGym({
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
      });
      res.status(201).json(gym);
    } catch {
      res.status(409).end();
    }
  };

  updateGym = async (req: Request, res: Response) => {
    try {
      const gymId = req.params.id;
      const updateData = req.body;

      const updatedGym = await this.gymService.updateGym(gymId, updateData);

      res.status(200).json(updatedGym);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  deleteGym = async (req: Request, res: Response) => {
    try {
      const gymId = req.params.id;
      await this.gymService.deleteGym(gymId);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAllGyms = async (_req: Request, res: Response) => {
    try {
      const gyms = await this.gymService.findAllGyms();
      res.status(200).json(gyms);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getGymById = async (req: Request, res: Response) => {
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
  };

  createGymRequest = async (req: Request, res: Response) => {
    if (!req.body) {
      res.status(400).end();
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }

    try {
      const gym = await this.gymService.createGymRequest({
        requestedBy: req.user,
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
        status: GymRequestStatus.PENDING,
      });
      res.status(201).json(gym);
    } catch {
      res.status(409).end();
    }
  };

  deleteGymRequest = async (req: Request, res: Response) => {
    try {
      const gymId = req.params.id;
      await this.gymService.deleteGymRequest(gymId);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  approveGymRequest = async (req: Request, res: Response) => {
    try {
      const gymId = req.params.id;
      await this.gymService.updateGymRequestStatus(
        gymId,
        GymRequestStatus.APPROVED
      );
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  rejectGymRequest = async (req: Request, res: Response) => {
    try {
      const gymId = req.params.id;
      await this.gymService.updateGymRequestStatus(
        gymId,
        GymRequestStatus.REJECTED
      );
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getMyGymRequests = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const userId = req.user._id;
      const gyms = await this.gymService.findAllGymRequestsByUser(userId);
      res.status(200).json(gyms);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getMyApprovedRequests = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const userId = req.user._id;
      const approvedRequests =
        await this.gymService.findGymRequestsByUserAndStatus(
          userId,
          GymRequestStatus.APPROVED
        );
      res.status(200).json(approvedRequests);
    } catch (err) {
      res.status(500).json({
        message: "Erreur lors de la récupération des demandes approuvées.",
      });
    }
  };

  getMyRejectedRequests = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const userId = req.user._id;
      const rejectedRequests =
        await this.gymService.findGymRequestsByUserAndStatus(
          userId,
          GymRequestStatus.REJECTED
        );
      res.status(200).json(rejectedRequests);
    } catch (err) {
      res.status(500).json({
        message: "Erreur lors de la récupération des demandes rejetées.",
      });
    }
  };

  getAllPendingRequests = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }
    try {
      const pendingRequests = await this.gymService.findGymRequestsByStatus(
        GymRequestStatus.PENDING
      );
      res.status(200).json(pendingRequests);
    } catch (err) {
      res.status(500).json({
        message: "Erreur lors de la récupération des demandes rejetées.",
      });
    }
  };

  buildRouter = (): Router => {
    const router = Router();

    router.post(
      "/request",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.OWNER),
      json(),
      this.createGymRequest.bind(this)
    );

    router.delete(
      "/request/:id",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.OWNER),
      this.deleteGymRequest.bind(this)
    );

    router.get(
      "/request",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.OWNER),
      this.getMyGymRequests.bind(this)
    );

    router.get(
      "/request/approve",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.OWNER),
      this.getMyApprovedRequests.bind(this)
    );

    router.get(
      "/request/reject",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.OWNER),
      this.getMyRejectedRequests.bind(this)
    );

    router.post(
      "/",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      json(),
      this.createGym.bind(this)
    );

    router.put(
      "/:id",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      json(),
      this.updateGym.bind(this)
    );

    router.delete(
      "/:id",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      this.deleteGym.bind(this)
    );

    router.get(
      "/",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      this.getAllGyms.bind(this)
    );

    router.get(
      "/:id",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      this.getGymById.bind(this)
    );

    router.put(
      "/:id/approve",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      json(),
      this.approveGymRequest.bind(this)
    );

    router.put(
      "/:id/reject",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      json(),
      this.rejectGymRequest.bind(this)
    );

    router.get(
      "/request/pending",
      authenticateSession(this.sessionService),
      requireMinimumRole(UserRole.ADMIN),
      this.getAllPendingRequests.bind(this)
    );

    return router;
  };
}
