import {Timestamps} from "./timestamps";
import { User } from "./user.interface";
import { Gym } from "./gym.interface";
import { Reward } from "./reward.interface";

export enum ChallengeDifficulty {
    BEGINNER = 'Débutant',
    INTERMEDIATE = 'Intermédiaire',
    ADVANCE = 'Avancé'
}
export interface Challenge extends Timestamps {
  _id: string;
  title: string;
  description: string;
  goals: string[];
  recommendedExercises: string[];
  duration: string;
  difficulty: ChallengeDifficulty;
  createdBy: User;
  gym?: string | Gym;
  isCollaborative: boolean;
  nbCollaborator?: number;
  reward?: Reward | string
}