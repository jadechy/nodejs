import { Model, Mongoose, Types } from "mongoose";
import { Training } from "../../../models";
import { trainingSchema } from "../schema/training.schema";

export type CreateTraining = Omit<Training, '_id' | 'createdAt' | 'updatedAt'>;

export class TrainingService{
    readonly trainingModel: Model<Training>;
    
    constructor(public readonly connection: Mongoose) {
        this.trainingModel = connection.model('Training', trainingSchema());
    }

    async createTraining(training: CreateTraining): Promise<Training> {
        const challengeId = typeof training.challenge === 'string' ? new Types.ObjectId(training.challenge) : new Types.ObjectId(training.challenge._id);
        const userId = typeof training.realisedBy === 'string' ? new Types.ObjectId(training.realisedBy) : new Types.ObjectId(training.realisedBy._id);

        const trainingData: any = {
            ...training,
            challenge: challengeId,
            realisedBy: userId
        };

        const created = await this.trainingModel.create(trainingData);

        const populated = await this.trainingModel.findById(created._id)
            .populate('challenge')
            .populate('realisedBy');
        
        if (!populated) {
            throw new Error('Training not found after creation');
        }
        
        return populated;
    }
}