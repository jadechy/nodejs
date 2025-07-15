import {Mongoose, Model, FilterQuery, isValidObjectId} from "mongoose";
import {Gym, GymRequest, User} from "../../../models";
import {gymSchema} from "../schema/gym.schema";
import {gymRequestSchema} from "../schema/gymrequest.schema";

export type CreateGym = Omit<Gym, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateGym = Partial<Omit<Gym, '_id' | 'createdAt'>>;

export type CreateGymRequest = Omit<GymRequest, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateGymRequest = Partial<Omit<GymRequest, '_id' | 'createdAt'>>;

export class GymService{
    readonly gymModel: Model<Gym>;
    readonly gymRequestModel: Model<GymRequest>;

    constructor(public readonly connection: Mongoose) {
        this.gymModel = connection.model('Gym', gymSchema());
        this.gymRequestModel = connection.model('GymRequest', gymRequestSchema());
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

    async createGymRequest(gymRequest: CreateGymRequest) {
        return this.gymRequestModel.create({...gymRequest});
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

    async updateGymRequestStatus(gymId: string, status: string): Promise<void> {
        if(!isValidObjectId(gymId)) {
            return;
        }
        await this.gymRequestModel.updateOne({
            _id: gymId
        }, {
            status: status
        });
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

    async deleteGymRequest(gymId: string): Promise<void> {
        if (!isValidObjectId(gymId)) {
            throw new Error("ID gym invalide.");
        }

        const result = await this.gymRequestModel.findByIdAndDelete(gymId);

        if (!result) {
            throw new Error("Salle non trouvé.");
        }
    }
}