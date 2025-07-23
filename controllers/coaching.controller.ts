import { CoachingService, SessionService } from "../service/mongoose";
import {Request, Response, Router, json} from "express";
import {roleMiddleware, sessionMiddleware} from "../middlewares";
import {UserRole} from "../models/user.interface";

export class CoachingController{
    constructor(public readonly coachingService: CoachingService,
                public readonly sessionService: SessionService) {}
    
    async createCoaching(req: Request, res: Response) {
        if(!req.body) {
            res.status(400).end();
            return;
        }
        try {
            const coaching = await this.coachingService.createCoaching({
                name: req.body.name,
                date: req.body.date,
                gym: req.body.gym,
                exercises: req.body.exercises,
                max: req.body.max,
                participants: req.body.participants
            });
            res.status(201).json(coaching);
        } catch {
            res.status(409).end();
        }
    }

    async updateCoaching(req: Request, res: Response){
        try {
            const coachingId = req.params.id;
            const updateData = req.body;

            const updatedCoaching = await this.coachingService.updateCoaching(coachingId, updateData);

            res.status(200).json(updatedCoaching);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async deleteCoaching(req: Request, res: Response) {
        try {
            const coachingId = req.params.id;
            await this.coachingService.deleteCaoching(coachingId);
            res.status(204).end()
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async getAllCoachingSessions(req: Request, res: Response) {
        try {
            const coaching = await this.coachingService.findAllCoachingSessions();
            res.status(200).json(coaching);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getCoachingSessionById(req: Request, res: Response) {
        try {
            const coachingId = req.params.id;
            const coaching = await this.coachingService.findCoachingSessionById(coachingId);

            if (!coaching) {
                res.status(404).json({ message: "Séance d'entrainement non trouvée" });
                return;
            }

            res.status(200).json(coaching);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getAllAvailableCoachingSessions(req: Request, res: Response) {
        try {
            const coaching = await this.coachingService.findAvailableCoachings();
            res.status(200).json(coaching);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async joinCoaching(req: Request, res: Response){
        if (!req.user) {
            res.status(401).json({ error: "Utilisateur non authentifié" });
            return;
        }
        try {
            const coachingId = req.params.id;
            const userId = req.user._id;
            const coaching = await this.coachingService.joinCoaching(coachingId, userId);
            res.status(200).json(coaching);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getMyCoachings(req: Request, res: Response) {
        if (!req.user) {
            res.status(401).json({ error: "Utilisateur non authentifié" });
            return;
        }
        try {
            const userId = req.user._id;

            const coachings = await this.coachingService.getCoachingsForUser(userId);
            res.status(200).json(coachings);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }


    buildRouter(): Router {
        const router = Router();

        router.post('/:id/join',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.joinCoaching.bind(this)
        );

        router.get('/mine',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.getMyCoachings.bind(this)
        );

        router.post('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.COACH),
            json(),
            this.createCoaching.bind(this)
        );
        
        router.put('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.COACH),
            json(),
            this.updateCoaching.bind(this)
        );

        router.delete('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.COACH),
            this.deleteCoaching.bind(this)
        );

        router.get('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.COACH),
            this.getAllCoachingSessions.bind(this)
        );

        router.get('/available',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.COACH),
            this.getAllAvailableCoachingSessions.bind(this)
        );

        router.get('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.COACH),
            this.getCoachingSessionById.bind(this)
        );

        return router;
    }
}