import { Schema, Types } from "mongoose";
import { GymRequest, GymRequestStatus } from "../../../models";

export const gymRequestSchema = (): Schema<GymRequest> => {
  return new Schema<GymRequest>(
    {
      requestedBy: { type: Types.ObjectId, ref: "User", required: true },
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
        // TODO : Datetime
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
      coachCount: { type: Number, min: 0, max: 1000 },
      contact: {
        phone: { type: String, match: /^\+?[0-9\s\-().]{7,20}$/ },
        email: { type: String, match: /^\S+@\S+\.\S+$/ },
        website: { type: String, match: /^https?:\/\/.+$/ },
      },
      status: {
        type: String,
        required: true,
        enum: Object.values(GymRequestStatus),
      },
    },
    {
      timestamps: true, // createdAt + updatedAt
      collection: "gymrequest",
      versionKey: false, // désactive le versionning de model
    }
  );
};
