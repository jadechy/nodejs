import { User } from "./user.interface";
import { Challenge } from "./challenge.interface";
import { Timestamps } from "./timestamps";

export interface Share extends Timestamps {
  _id: string;
  from: User | string;
  to: User | string;
  challenge: Challenge | string; 
}
