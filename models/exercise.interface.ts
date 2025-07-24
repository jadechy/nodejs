import { Timestamps } from "./timestamps";

export interface Exercise extends Timestamps {
  _id: string;
  name: string;
  description: string;
  targetMuscle: string[];
  difficulty: string;
  equipments: string[];
}
