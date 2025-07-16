import { SessionService, ShareService } from "../service/mongoose";
import {Request, Response, Router, json} from "express";
import {roleMiddleware, sessionMiddleware} from "../middlewares";
import { UserRole } from "../models";

export class ShareController{
    constructor(public readonly shareService: ShareService,
                public readonly sessionService: SessionService) {}

    async createShare(req: Request, res: Response) {
        if(!req.body) {
            res.status(400).end();
            return;
        }
        if (!req.user) {
            res.status(401).json({ error: "Utilisateur non authentifié" });
            return;
        }
        try {
            const share = await this.shareService.createShare({
                from: req.user._id,
                to: req.body.to,
                challenge: req.body.challenge
            });
            res.status(201).json(share);
        } catch {
            res.status(409).end(); // CONFLICT
        }
    }

    async getAllMyShare(req: Request, res: Response){
        if (!req.user) {
            res.status(401).json({ error: "Utilisateur non authentifié" });
            return;
        }
        try {
            const userId = req.user._id;
            const shares = await this.shareService.getAllMyShare(userId);
            res.status(201).json(shares);
        } catch {
            res.status(409).end(); // CONFLICT
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.post('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            this.createShare.bind(this)
        );

        router.get('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.getAllMyShare.bind(this)
        );

        return router;
    }
}