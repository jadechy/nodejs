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
        let gymId: Types.ObjectId | undefined;

        if (challenge.gym) {
            if (typeof challenge.gym === 'string') {
            gymId = new Types.ObjectId(challenge.gym);
            } else if (typeof challenge.gym === 'object' && '_id' in challenge.gym) {
            gymId = new Types.ObjectId(challenge.gym._id);
            }
        }
        const challengeData: any = {
            ...challenge,
            gym: gymId,
        };

        if (challenge.isCollaborative === true) {
            challengeData.collaborator = [];
        }
        
        const created = await this.challengeModel.create(challengeData);

        const populated = await this.challengeModel.findById(created._id)
            .populate('gym');

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

        if (updateData.isCollaborative === true && existingChallenge.collaborator === undefined) {
            updateData.collaborator = [];
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

}