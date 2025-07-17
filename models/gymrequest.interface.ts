import { Timestamps } from "./timestamps";
import { User } from "./user.interface";

export enum GymRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface GymRequest extends Timestamps {
  _id: string;
  requestedBy: User;
  name: string;
  capacity: number;
  equipments: string[];
  installations: string[];
  activities: string[];
  openingHours: {
    start: string;
    end: string;
  };
  pricing: number;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  coachCount: number;
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  status: GymRequestStatus;
}
