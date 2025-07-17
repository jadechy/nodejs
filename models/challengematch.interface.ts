import { Timestamps } from "./timestamps";
import { User } from "./user.interface";
import { Training } from "./training.interface";
import { Challenge } from "./challenge.interface";

export enum ChallengeMatchStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REFUSED = "REFUSED",
  COMPLETED = "COMPLETED",
}

export interface ChallengeMatch extends Timestamps {
  _id: string;
  challenge: Challenge | string;
  challenger: User | string;
  opponent: User | string;
  challengerTraining?: Training | string;
  opponentTraining?: Training | string;
  status: ChallengeMatchStatus;
  winner?: User | string;
}
