import {Timestamps} from "./timestamps";
import { User } from "./user.interface";
import { Gym } from "./gym.interface";

export interface Challenge extends Timestamps {
  _id: string;
  title: string;
  description: string;
  goals: string[];
  recommendedExercises: string[];
  duration: string;
  createdBy: User;
  gym?: string | Gym;
  isCollaborative: boolean;
  nbCollaborator?: number;
  collaborator?: User[];
}