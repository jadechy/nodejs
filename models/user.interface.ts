import { Badge } from "./badge.interface";
import { Reward } from "./reward.interface";
import { Timestamps } from "./timestamps";

export enum UserRole {
  ADMIN = "ADMIN",
  OWNER = "OWNER",
  COACH = "COACH",
  CLIENT = "CLIENT",
}

export function getUserRoleLevel(role: UserRole): number {
  switch (role) {
    case UserRole.ADMIN:
      return 999;
    case UserRole.OWNER:
      return 2;
    case UserRole.COACH:
      return 1;
    default:
      return 0;
  }
}

export interface User extends Timestamps {
  _id: string;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  role: UserRole;
  rewards: Reward[];
  badges: Badge[];
}
