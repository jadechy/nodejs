import { Schema, Types } from "mongoose";
import { Share } from "../../../models";

export function shareSchema(): Schema<Share> {
  return new Schema<Share>(
    {
      from: { type: Types.ObjectId, ref: "User", required: true },
      to: { type: Types.ObjectId, ref: "User", required: true },
      challenge: { type: Types.ObjectId, ref: "Challenge", required: true }
    }, {
        timestamps: true, // createdAt + updatedAt
        collection: "share",
        versionKey: false, // désactive le versionning de model
    }
  );
}
