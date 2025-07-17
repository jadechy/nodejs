import {Schema, Types} from "mongoose";
import {User, UserRole} from "../../../models/user.interface";

export function userSchema(): Schema<User> {
    return new Schema<User>({
        lastName: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: Object.values(UserRole)
        },
        rewards: [{ type: Types.ObjectId, ref: 'Reward' }],
        badges: [{ type: Types.ObjectId, ref: 'Badge' }]
    }, {
        timestamps: true, // createdAt + updatedAt
        collection: "users",
        versionKey: false, // désactive le versionning de model
    });
}