import { Schema } from "mongoose";
import { Reward } from "../../../models/reward.interface";

export function rewardSchema(): Schema<Reward> {
  return new Schema<Reward>(
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      condition: {
        type: String,
        required: true,
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
}
