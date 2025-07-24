import { Schema, Types } from "mongoose";
import { Gym, GymStatus } from "../../../models/gym.interface";

export function gymSchema(): Schema<Gym> {
  return new Schema<Gym>(
    {
      name: {
        type: String,
        required: true,
      },
      capacity: {
        type: Number,
        required: true,
      },
      equipments: [{ type: String }],
      installations: [{ type: String }],
      activities: [{ type: String }],
      openingHours: {
        start: { type: String, required: true },
        end: { type: String, required: true },
      },
      pricing: {
        type: Number,
        required: true,
      },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
      },
      coachCount: { type: Number },
      contact: {
        phone: { type: String },
        email: { type: String },
        website: { type: String },
      },
      requestedBy: { type: Types.ObjectId, ref: "User", required: false },
      status: {
        type: String,
        required: true,
        enum: Object.values(GymStatus),
      },
    },
    {
      timestamps: true,
      collection: "gym",
      versionKey: false,
    }
  );
}
