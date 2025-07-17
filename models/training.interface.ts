import {Timestamps} from "./timestamps";
import { Challenge } from "./challenge.interface";
import { User } from "./user.interface";

export interface Training extends Timestamps{
    _id: string;
    challenge: Challenge | string;
    realisedBy: User | string;
    nbCalorie: number;
    duration: string;
    performedExercises: string[];
    partner?: User[];
}