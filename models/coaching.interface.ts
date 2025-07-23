import { Exercise } from "./exercise.interface";
import { Gym } from "./gym.interface";
import {Timestamps} from "./timestamps";
import { User } from "./user.interface";

export interface Coaching extends Timestamps {
    _id: string;
    name: String;
    date: Date;
    gym: string | Gym;
    exercises: Exercise[];
    max: number;
    participants: User[];
}