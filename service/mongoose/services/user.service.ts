import {Mongoose, Model, FilterQuery, isValidObjectId} from "mongoose";
import {User, UserRole} from "../../../models/user.interface";
import {userSchema} from "../schema/user.schema";
import {sha256} from "../../../utils/security.utils";

// omit permet d'enlever des clés d'un type pour en créer un nouveau
export type CreateUser = Omit<User, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdateUser = Partial<Omit<User, '_id' | 'createdAt'>>;

export class UserService {

    readonly userModel: Model<User>;

    constructor(public readonly connection: Mongoose) {
        this.userModel = connection.model('User', userSchema());
    }

    async findUser(email: string, password?: string): Promise<User | null> {
        const filter: FilterQuery<User> = {email: email};
        if(password) {
            filter.password = sha256(password);
        }
        return this.userModel.findOne(filter);
    }

    async createUser(user: CreateUser): Promise<User> {
        return this.userModel.create({
                ...user, 
                password: sha256(user.password),
                rewards: user.rewards ?? [],
                badges: user.badges ?? []
            });
    }

    async updateUser(userId: string, updateData: UpdateUser): Promise<User> {
        if (!isValidObjectId(userId)) {
            throw new Error("ID utilisateur invalide.");
        }

        if ('_id' in updateData) {
            delete updateData._id;
        }

        if (updateData.password) {
            updateData.password = sha256(updateData.password);
        }

        const updated = await this.userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );

        if (!updated) {
            throw new Error("Utilisateur non trouvé.");
        }

        return updated;
    }

    async deleteUser(userId: string): Promise<void> {
        if (!isValidObjectId(userId)) {
            throw new Error("ID utilisateur invalide.");
        }

        const result = await this.userModel.findByIdAndDelete(userId);

        if (!result) {
            throw new Error("Utilisateur non trouvé.");
        }
    }

    async updateRole(userId: string, role: UserRole): Promise<void> {
        if(!isValidObjectId(userId)) {
            return;
        }
        await this.userModel.updateOne({
            _id: userId
        }, {
            role: role
        });
    }

}