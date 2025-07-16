import { isValidObjectId, Model, Mongoose, Types } from "mongoose";
import { Challenge } from "../../../models";
import { challengeSchema } from "../schema/challenge.schema";

export type CreateChallenge = Omit<Challenge, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateChallenge = Partial<Omit<Challenge, '_id' | 'createdAt'>>;

export class ChallengeService{
    readonly challengeModel: Model<Challenge>;

    constructor(public readonly connection: Mongoose) {
        this.challengeModel = connection.model('Challenge', challengeSchema());
    }

    async createChallenge(challenge: CreateChallenge): Promise<Challenge> {
        const gymId = challenge.gym ? typeof challenge.gym === 'string' ? new Types.ObjectId(challenge.gym) : new Types.ObjectId(challenge.gym._id) : undefined ;
        const rewardId = challenge.reward ? typeof challenge.reward === 'string' ? new Types.ObjectId(challenge.reward) : new Types.ObjectId(challenge.reward._id) : undefined;

        const challengeData: any = {
            ...challenge,
            gym: gymId,
            reward: rewardId,
        };

        if (challenge.isCollaborative === true) {
            challengeData.collaborator = [];
        }
        
        const created = await this.challengeModel.create(challengeData);

        const populated = await this.challengeModel.findById(created._id)
            .populate('gym')
            .populate('reward');

        if (!populated) {
            throw new Error('Challenge not found after creation');
        }

        return populated;
    }

    async updateChallenge(challengeId: string, updateData: UpdateChallenge, userId: string): Promise<Challenge> {
        if (!isValidObjectId(challengeId)) {
            throw new Error("ID challenge invalide.");
        }

        const existingChallenge = await this.challengeModel.findById(challengeId);
        if (!existingChallenge) {
            throw new Error("Défi non trouvé.");
        }

        if ('_id' in updateData) {
            delete updateData._id;
        }

        if (existingChallenge.createdBy.toString() !== userId.toString()) {
            throw new Error("Accès refusé : vous n'êtes pas le créateur de ce défi.");
        }

        const updateOps: any = { $set: updateData };
        if (updateData.isCollaborative === false) {
            updateOps.$unset = {
                collaborator: "",
                nbCollaborator: ""
            };
        }
    
        const updated = await this.challengeModel.findByIdAndUpdate(
            challengeId,
            updateOps,
            { new: true }
        );
    
        if (!updated) {
            throw new Error("Échec de la mise à jour.");
        }
    
        return updated;
    }

    async deleteChallenge(challengeId: string, userId: string): Promise<void> {
        if (!isValidObjectId(challengeId)) {
            throw new Error("ID gym invalide.");
        }

        const challenge = await this.challengeModel.findById(challengeId);
        if (!challenge) {
            throw new Error("Défi non trouvé.");
        }

        if (challenge.createdBy.toString() !== userId.toString()) {
            throw new Error("Accès refusé : vous n'êtes pas le créateur de ce défi.");
        }
    
        const result = await this.challengeModel.findByIdAndDelete(challengeId);
    
        if (!result) {
            throw new Error("Échec de la suppression.");
        }
    }

    async findAllChallengesByUser(userId: string): Promise<Challenge[]> {
        return this.challengeModel.find({ createdBy: userId });
    }

    async findAllChallengesByGym(gymId: string): Promise<Challenge[]> {
        return this.challengeModel.find({ gym: gymId });
    }

    async findAllChallenges(filters?: {
        difficulty?: string;
        exercise?: string;
    }): Promise<Challenge[]> {
        const query: any = {};

        if (filters?.difficulty) {
            query.difficulty = filters.difficulty;
        }

        if (filters?.exercise) {
            query.recommendedExercises = { $in: [filters.exercise] };
        }

        return this.challengeModel
            .find(query)
            .populate('createdBy')
            .populate('gym');
    }

}