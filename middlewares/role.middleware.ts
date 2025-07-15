import {Request, RequestHandler} from "express";
import {UserRole, getUserRoleLevel} from "../models/user.interface";

export function roleMiddleware(role: UserRole): RequestHandler {
    const targetRoleLevel = getUserRoleLevel(role);
    return async (req: Request, res, next) => {
        if(!req.user) {
            res.status(401).end();
            return;
        }
        if(getUserRoleLevel(req.user.role) < targetRoleLevel) {
            res.status(403).end(); // FORBIDDEN
            return;
        }
        next();
    };
}