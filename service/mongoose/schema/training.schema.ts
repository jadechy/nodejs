import { Schema, Types } from "mongoose";
import { Training } from "../../../models";

export const trainingSchema = (): Schema<Training> => {
  return new Schema<Training>(
    {
      challenge: { type: Types.ObjectId, ref: "Challenge", required: true },
      realisedBy: { type: Types.ObjectId, ref: "User", required: true },
      nbCalorie: {
        type: Number,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
      performedExercises: [{ type: String }],
      partner: [{ type: Types.ObjectId, ref: "User" }],
    },
    {
      timestamps: true,
      collection: "training",
      versionKey: false,
    }
  );
};
