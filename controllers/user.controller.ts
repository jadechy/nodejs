import {SessionService, UserService} from "../service/mongoose";
import {Request, Response, Router, json} from "express";
import {roleMiddleware, sessionMiddleware} from "../middlewares";
import {UserRole} from "../models/user.interface";

export class UserController {
    constructor(public readonly userService: UserService,
                public readonly sessionService: SessionService) {
    }

    async createUser(req: Request, res: Response) {
        if(!req.body || !req.body.email || !req.body.password
            || !req.body.lastName || !req.body.firstName || !req.body.role) {
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
                badges: []
            });
            res.status(201).json(user);
        } catch {
            res.status(409).end(); // CONFLICT
        }
    }

    async updateUser(req: Request, res: Response){
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
            res.status(204).end()
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async updateUserRole(req: Request, res: Response){
        try {
            const userId = req.params.id;
            const userRole = req.body.role;
            await this.userService.updateRole(userId, userRole);
            res.status(204).end()
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    buildRouter(): Router {
        const router = Router();
        router.post('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.createUser.bind(this));
        
        router.put('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.updateUser.bind(this)
        );

        router.delete('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            this.deleteUser.bind(this)
        );

        router.put('/:id/role',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.ADMIN),
            json(),
            this.updateUserRole.bind(this));

        return router;
    }
}