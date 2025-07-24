import { Schema } from "mongoose";
import { Exercise } from "../../../models/exercise.interface";

export function exerciseSchema(): Schema<Exercise> {
  return new Schema<Exercise>(
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      targetMuscle: [{ type: String }],
      difficulty: {
        type: String,
        required: true,
      },
      equipments: [{ type: String }],
    },
    {
      timestamps: true,
      collection: "exercise",
      versionKey: false,
    }
  );
}
