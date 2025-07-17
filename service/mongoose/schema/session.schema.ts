import { Schema } from "mongoose";
import { Session } from "../../../models/session.interface";

export const sessionSchema = (): Schema<Session> => {
  return new Schema<Session>(
    {
      expirationDate: {
        type: Date,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    {
      timestamps: true,
      collection: "sessions",
      versionKey: false,
    }
  );
};
