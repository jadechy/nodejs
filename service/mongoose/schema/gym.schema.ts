import { Schema } from "mongoose";
import { Gym } from "../../../models/gym.interface";

export const gymSchema = (): Schema<Gym> => {
  return new Schema<Gym>(
    {
      name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100,
      },
      capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 10000,
      },
      equipments: [{ type: String, maxlength: 100 }],
      installations: [{ type: String, maxlength: 100 }],
      activities: [{ type: String, maxlength: 100 }],
      openingHours: {
        start: { type: String, required: true },
        end: { type: String, required: true },
      },
      pricing: {
        type: Number,
        required: true,
        min: 0,
        max: 10000,
      },
      address: {
        street: { type: String, required: true, minlength: 2, maxlength: 100 },
        city: { type: String, required: true, minlength: 2, maxlength: 50 },
        postalCode: { type: String, required: true, match: /^\d{4,10}$/ },
        country: { type: String, required: true, minlength: 2, maxlength: 50 },
      },
      coachCount: { type: Number, min: 0, max: 500 },
      contact: {
        phone: { type: String, match: /^\+?[0-9\s\-().]{7,20}$/ },
        email: { type: String, match: /^\S+@\S+\.\S+$/ },
        website: { type: String, match: /^https?:\/\/.+$/ },
      },
    },
    {
      timestamps: true,
      collection: "gym",
      versionKey: false,
    }
  );
};
