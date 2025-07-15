import {SessionService, BadgeService} from "../service/mongoose";
import {Request, Response, Router, json} from "express";
import {roleMiddleware, sessionMiddleware} from "../middlewares";
import {UserRole} from "../models/user.interface";

export class BadgeController{
    constructor(public readonly badgeService: BadgeService,
                public readonly sessionService: SessionService) {}
    
    async createBadge(req: Request, res: Response) {
        if(!req.body) {
            res.status(400).end();
            return;
        }
        try {
            const badge = await this.badgeService.createBadge({
                name: req.body.name,
                description: req.body.description,
                condition: req.body.condition
            });
            res.status(201).json(badge);
        } catch {
            res.status(409).end(); // CONFLICT
        }
    }

    async updateBadge(req: Request, res: Response){
        try {
            const badgeId = req.params.id;
            const updateData = req.body;

            const updatedBadge = await this.badgeService.updateBadge(badgeId, updateData);

            res.status(200).json(updatedBadge);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async deleteBadge(req: Request, res: Response) {
        try {
            const badgeId = req.params.id;
            await this.badgeService.deleteBadge(badgeId);
            res.status(204).end()
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async getAllBadges(req: Request, res: Response) {
        try {
            const badges = await this.badgeService.findAllBadges();
            res.status(200).json(badges);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getBadgeById(req: Request, res: Response) {
        try {
            const badgeId = req.params.id;
            const badge = await this.badgeService.findBadgeById(badgeId);

            if (!badge) {
                res.status(404).json({ message: "Badge non trouvée" });
                return;
            }

            res.status(200).json(badge);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.post('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.createBadge.bind(this)
        );
        
        router.put('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.updateBadge.bind(this)
        );

        router.delete('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.deleteBadge.bind(this)
        );

        router.get('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.getAllBadges.bind(this)
        );

        router.get('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.getBadgeById.bind(this)
        );

        return router;
    }
}