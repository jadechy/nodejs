import { Schema } from "mongoose";
import { Gym } from "../../../models/gym.interface";

export const gymSchema = (): Schema<Gym> => {
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
    },
    {
      timestamps: true,
      collection: "gym",
      versionKey: false,
    }
  );
};
