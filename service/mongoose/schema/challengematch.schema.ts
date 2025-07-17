import { Schema, Types } from "mongoose";
import { ChallengeMatch, ChallengeMatchStatus } from "../../../models";

export const challengeMatchSchema = (): Schema<ChallengeMatch> => {
  return new Schema<ChallengeMatch>(
    {
      challenge: { type: Types.ObjectId, ref: "Challenge", required: true },
      challenger: { type: Types.ObjectId, ref: "User", required: true },
      opponent: { type: Types.ObjectId, ref: "User", required: true },
      challengerTraining: {
        type: Types.ObjectId,
        ref: "Training",
        required: false,
      },
      opponentTraining: {
        type: Types.ObjectId,
        ref: "Training",
        required: false,
      },
      status: {
        type: String,
        required: true,
        enum: Object.values(ChallengeMatchStatus),
      },
      winner: { type: Types.ObjectId, ref: "User", required: false },
    },
    {
      timestamps: true,
      collection: "challengeMatch",
      versionKey: false,
    }
  );
};
