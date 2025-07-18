import { Schema, Types } from "mongoose";
import { User, UserRole } from "../../../models/user.interface";

export const userSchema = (): Schema<User> => {
  return new Schema<User>(
    {
      lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
      },
      firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
        minlength: 6,
      },
      // TODO : add birthday
      role: {
        type: String,
        required: true,
        enum: Object.values(UserRole),
      },
      rewards: [{ type: Types.ObjectId, ref: "Reward" }],
      badges: [{ type: Types.ObjectId, ref: "Badge" }],
    },
    {
      timestamps: true,
      collection: "users",
      versionKey: false,
    }
  );
};
