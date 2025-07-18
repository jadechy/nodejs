import { Schema } from "mongoose";
import { Reward } from "../../../models/reward.interface";

export const rewardSchema = (): Schema<Reward> => {
  return new Schema<Reward>(
    {
      name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,
      },
      description: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 500,
      },
      condition: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 200,
      },
      type: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
      collection: "reward",
      versionKey: false,
    }
  );
};
