import { Schema } from "mongoose";
import { Exercise } from "../../../models/exercise.interface";

export const exerciseSchema = (): Schema<Exercise> => {
  return new Schema<Exercise>({
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    targetMuscle: [{ type: String, minlength: 2, maxlength: 50 }],
    // TODO : Add enum
    difficulty: {
      type: String,
      required: true,
    },
    equipments: [{ type: String, minlength: 2, maxlength: 50 }],
  });
};
