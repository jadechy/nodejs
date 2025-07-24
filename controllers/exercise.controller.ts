import { SessionService, ExerciseService } from "../service/mongoose";
import { Request, Response, Router, json } from "express";
import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { UserRole } from "../models/user.interface";

export class ExerciseController {
  constructor(
    public readonly exerciseService: ExerciseService,
    public readonly sessionService: SessionService
  ) {}

  async createExercise(req: Request, res: Response) {
    if (!req.body) {
      res.status(400).end();
      return;
    }
    try {
      const exercise = await this.exerciseService.createExercise({
        name: req.body.name,
        description: req.body.description,
        targetMuscle: req.body.targetMuscle,
        difficulty: req.body.difficulty,
        equipments: req.body.equipments,
      });
      res.status(201).json(exercise);
    } catch {
      res.status(409).end(); // CONFLICT
    }
  }

  async updateExercise(req: Request, res: Response) {
    try {
      const exeId = req.params.id;
      const updateData = req.body;

      const updatedExercise = await this.exerciseService.updateExercise(
        exeId,
        updateData
      );

      res.status(200).json(updatedExercise);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteExercise(req: Request, res: Response) {
    try {
      const exeId = req.params.id;
      await this.exerciseService.deleteExercise(exeId);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAllExercises(req: Request, res: Response) {
    try {
      const exercises = await this.exerciseService.findAllExercises();
      res.status(200).json(exercises);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getExerciseById(req: Request, res: Response) {
    try {
      const exeId = req.params.id;
      const exercise = await this.exerciseService.findExerciseById(exeId);

      if (!exercise) {
        res.status(404).json({ message: "Exercice non trouvée" });
        return;
      }

      res.status(200).json(exercise);
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
      this.createExercise.bind(this)
    );

    router.put(
      "/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      json(),
      this.updateExercise.bind(this)
    );

    router.delete(
      "/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      this.deleteExercise.bind(this)
    );

    router.get(
      "/",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      this.getAllExercises.bind(this)
    );

    router.get(
      "/:id",
      sessionMiddleware(this.sessionService),
      roleMiddleware(UserRole.ADMIN),
      this.getExerciseById.bind(this)
    );

    return router;
  }
}
