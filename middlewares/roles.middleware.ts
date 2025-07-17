import { Request, RequestHandler } from "express";
import { UserRole } from "../models/user.interface";

export const rolesMiddleware = (allowedRoles: UserRole[]): RequestHandler => {
  return (req: Request, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    next();
  };
};
