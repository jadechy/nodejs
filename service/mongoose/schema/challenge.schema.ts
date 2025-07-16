import {Schema, Types} from "mongoose";
import { Challenge } from "../../../models";

export function challengeSchema(): Schema<Challenge> {
    return new Schema<Challenge>({
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        goals: [{ type: String }],
        recommendedExercises: [{ type: String }],
        duration: {
            type: String,
            required: true
        },
        createdBy: { type: Types.ObjectId, ref: 'User', required: true },
        gym: { type: Types.ObjectId, ref: 'Gym', required: false},
        isCollaborative: {
            type: Boolean,
            required: true
        },
        nbCollaborator: {type: Number, required: false},
        collaborator: {
            type: [{ type: Types.ObjectId, ref: 'User' }], 
            required: false,
            default: undefined
        }
    }, {
        timestamps: true, // createdAt + updatedAt
        collection: "challenge",
        versionKey: false, // désactive le versionning de model
    });
}