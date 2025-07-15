import {Mongoose, Model, FilterQuery, isValidObjectId} from "mongoose";
import {Gym} from "../../../models/gym.interface";
import {gymSchema} from "../schema/gym.schema";

export type CreateGym = Omit<Gym, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateGym = Partial<Omit<Gym, '_id' | 'createdAt'>>;

export class GymService{
    readonly gymModel: Model<Gym>;

    constructor(public readonly connection: Mongoose) {
        this.gymModel = connection.model('Gym', gymSchema());
    }

    async findAllGyms(): Promise<Gym[]> {
        return this.gymModel.find();
    }


    async findGymById(id: string): Promise<Gym | null> {
        if (!isValidObjectId(id)) {
            return null;
        }

        return this.gymModel.findById(id);
    }

    async createGym(gym: CreateGym): Promise<Gym> {
        return this.gymModel.create({...gym});
    }

    async updateGym(gymId: string, updateData: UpdateGym): Promise<Gym> {
        if (!isValidObjectId(gymId)) {
            throw new Error("ID gym invalide.");
        }

        if ('_id' in updateData) {
            delete updateData._id;
        }

        const updated = await this.gymModel.findByIdAndUpdate(
            gymId,
            { $set: updateData },
            { new: true }
        );

        if (!updated) {
            throw new Error("Salle non trouvé.");
        }

        return updated;
    }

    async deleteGym(gymId: string): Promise<void> {
        if (!isValidObjectId(gymId)) {
            throw new Error("ID gym invalide.");
        }

        const result = await this.gymModel.findByIdAndDelete(gymId);

        if (!result) {
            throw new Error("Salle non trouvé.");
        }
    }
}