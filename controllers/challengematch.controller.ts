import { ChallengeMatchService, SessionService } from "../service/mongoose";
import { roleMiddleware, sessionMiddleware } from "../middlewares";
import {Request, Response, Router, json} from "express";
import { ChallengeMatchStatus, UserRole } from "../models";

export class ChallengeMatchController{
    constructor(public readonly challengeMatchService: ChallengeMatchService,
                public readonly sessionService: SessionService) {}
    
    async createChallengeMatch(req: Request, res: Response){
        if(!req.body) {
            res.status(400).end();
            return;
        }
        if (!req.user) {
            res.status(401).json({ error: "Utilisateur non authentifié" });
            return;
        }
        try {
            const challengeMatch = await this.challengeMatchService.createChallengeMatch({
                challenge: req.body.challenge,
                challenger: req.user,
                opponent: req.body.opponent,
                status: ChallengeMatchStatus.PENDING
            });
            res.status(201).json(challengeMatch);
        } catch(error) {
            res.status(409).end();
        }
    }

    async getMyMatchRequests(req: Request, res: Response) {
        if (!req.user) {
            res.status(401).json({ error: "Utilisateur non authentifié" });
            return;
        }
        try {
            const userId = req.user._id;
            const gyms = await this.challengeMatchService.findAllMatchRequestsByUser(userId);
            res.status(200).json(gyms);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async acceptMatchRequest(req: Request, res: Response){
        try {
            const matchId = req.params.id;
            await this.challengeMatchService.updateGymRequestStatus(matchId, ChallengeMatchStatus.ACCEPTED);
            res.status(204).end()
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
    
    async refuseMatchRequest(req: Request, res: Response){
        try {
            const matchId = req.params.id;
            await this.challengeMatchService.updateGymRequestStatus(matchId, ChallengeMatchStatus.REFUSED);
            res.status(204).end()
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async addTrainingToMatch(req: Request, res: Response){
        if(!req.body) {
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
            await this.challengeMatchService.addTrainingToMatch(matchId, userId, updateData);
            res.status(204).end()
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async computeMatchWinner(req: Request, res: Response){
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
            const match = await this.challengeMatchService.computeMatchWinner(matchId);
            res.status(200).json(match);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.post('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.createChallengeMatch.bind(this)
        );

        router.get('/request',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            this.getMyMatchRequests.bind(this)
        );

        router.put('/:id/accept',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.acceptMatchRequest.bind(this)
        );

        router.put('/:id/refuse',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.refuseMatchRequest.bind(this)
        );

        router.put('/:id/training',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.addTrainingToMatch.bind(this)
        );

        router.put('/:id/winner',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.computeMatchWinner.bind(this)
        );

        return router;
    }
}