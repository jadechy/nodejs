import { Schema, Types } from "mongoose";
import { Coaching } from "../../../models";

export function coachingSchema(): Schema<Coaching> {
    return new Schema<Coaching>({
        name: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        gym: { type: Types.ObjectId, ref: 'Gym', required: true },
        exercises: [{ type: Types.ObjectId, ref: 'Exercise', required: true }],
        max: {
            type: Number, 
            required: true
        },
        participants: [{ type: Types.ObjectId, ref: 'User' }]
    }, {
        timestamps: true,
        collection: "coaching",
        versionKey: false,
    })
}