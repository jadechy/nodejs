import { roleMiddleware, sessionMiddleware } from "../middlewares";
import { UserRole } from "../models";
import { ChallengeService, SessionService } from "../service/mongoose";
import {Request, Response, Router, json} from "express";

export class ChallengeController{
    constructor(public readonly challengeService: ChallengeService,
                public readonly sessionService: SessionService) {}
    
    async createChallengeOwner(req: Request, res: Response) {
        if(!req.body) {
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
                createdBy: req.user,
                gym: req.body.gym?._id || req.body.gym,
                isCollaborative: req.body.isCollaborative,
                nbCollaborator: req.body.nbCollaborator
            });
            res.status(201).json(challenge);
        } catch {
            res.status(409).end(); // CONFLICT
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
                createdBy: req.user,
                isCollaborative: req.body.isCollaborative,
                nbCollaborator: req.body.nbCollaborator
            });
            res.status(201).json(challenge);
        } catch {
            res.status(409).end();
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.post('/owner',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.OWNER),
            json(),
            this.createChallengeOwner.bind(this)
        );

        router.post('/client',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.createChallengeClient.bind(this)
        );

        return router;
    }
}