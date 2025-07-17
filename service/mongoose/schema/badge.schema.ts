import {Schema} from "mongoose";
import {Badge} from "../../../models/badge.interface";

export function badgeSchema(): Schema<Badge> {
    return new Schema<Badge>({
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        condition: {
            type: Number,
            required: true
        }
    }, {
        timestamps: true, // createdAt + updatedAt
        collection: "badge",
        versionKey: false, // désactive le versionning de model
    });
}