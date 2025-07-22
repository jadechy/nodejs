import {Mongoose, Model, FilterQuery, isValidObjectId, Types} from "mongoose";
import {User, UserRole} from "../../../models/user.interface";
import {userSchema} from "../schema/user.schema";
import {sha256} from "../../../utils/security.utils";
import { trainingSchema } from "../schema/training.schema";
import { Badge, Training } from "../../../models";
import { badgeSchema } from "../schema/badge.schema";

// omit permet d'enlever des clés d'un type pour en créer un nouveau
export type CreateUser = Omit<User, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdateUser = Partial<Omit<User, '_id' | 'createdAt'>>;

export class UserService {

    readonly userModel: Model<User>;
    readonly trainingModel: Model<Training>;
    readonly badgeModel: Model<Badge>;

    constructor(public readonly connection: Mongoose) {
        this.userModel = connection.model('User', userSchema());
        this.trainingModel = connection.models.Training || connection.model('Training', trainingSchema());
        this.badgeModel = connection.models.Badge || connection.model('Badge', badgeSchema());
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

    async checkAndAssignBadges(userId: Types.ObjectId) {
        const user = await this.userModel.findById(userId).populate('badges');
        if(!user){
            throw new Error('Utilisateur introuvable');
        }
        
        const trainings = await this.trainingModel.find({ realisedBy: userId });

        const completedChallengeIds = new Set();

        for (const training of trainings) {
            const challengeId = typeof training.challenge === 'string'
            ? training.challenge
            : training.challenge._id.toString();
            completedChallengeIds.add(challengeId);
        }

        const completedCount = completedChallengeIds.size;

        const allBadges = await this.badgeModel.find();

        for (const badge of allBadges) {
            const hasBadge = user.badges.some(
            (b: any) => b._id.toString() === badge._id.toString()
            );
            if (hasBadge) continue;

            if (completedCount >= badge.condition) {
                await this.userModel.findByIdAndUpdate(userId, {
                    $addToSet: { badges: badge._id }
                });
            }
        }
    }

    async getUserBadges(userId: string) {
        const user = await this.userModel.findById(userId).populate('badges').exec();
        if (!user) throw new Error('Utilisateur non trouvé');
        return user.badges;
    }

    async getUserRewards(userId: string) {
        const user = await this.userModel.findById(userId).populate('rewards').exec();
        if (!user) throw new Error('Utilisateur non trouvé');
        return user.rewards;
    }

}