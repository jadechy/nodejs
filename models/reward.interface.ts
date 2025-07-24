import { Timestamps } from "./timestamps";

export interface Reward extends Timestamps {
  _id: string;
  name: string;
  description: string;
  condition: string;
  type: string;
}
