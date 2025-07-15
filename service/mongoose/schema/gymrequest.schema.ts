import {Schema, Types } from "mongoose";
import {GymRequest, GymRequestStatus} from "../../../models";

export function gymRequestSchema(): Schema<GymRequest> {
    return new Schema<GymRequest>({
        requestedBy: { type: Types.ObjectId, ref: 'User', required: true },
        name: {
            type: String,
            required: true
        },
        capacity: {
            type: Number,
            required: true
        },
        equipments: [{ type: String }],
        installations: [{ type: String }],
        activities: [{ type: String }],
        openingHours: {
            start: { type: String, required: true },
            end: { type: String, required: true }
        },
        pricing: {
            type: Number,
            required: true
        },
        address:{
            street: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        coachCount:{type: Number},
        contact: {
            phone: { type: String},
            email: { type: String},
            website: { type: String},
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(GymRequestStatus)
        },
    }, {
        timestamps: true, // createdAt + updatedAt
        collection: "gymrequest",
        versionKey: false, // désactive le versionning de model
    });
}