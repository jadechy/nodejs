import { isValidObjectId, Model, Mongoose, Types } from "mongoose";
import { ChallengeMatch, ChallengeMatchStatus, User } from "../../../models";
import { challengeMatchSchema } from "../schema/challengematch.schema";
import { userSchema } from "../schema/user.schema";

export type CreateChallengeMatch = Omit<ChallengeMatch, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateChallengeMatch = Partial<Omit<ChallengeMatch, '_id' | 'createdAt'>>;

export class ChallengeMatchService{
    readonly challengeMatchModel: Model<ChallengeMatch>;
    readonly userModel: Model<User>;
    
    constructor(public readonly connection: Mongoose) {
        this.challengeMatchModel = connection.model('ChallengeMatch', challengeMatchSchema());
        this.userModel = connection.models.User || connection.model('User', userSchema());
    }

    async createChallengeMatch(challengeMatch: CreateChallengeMatch): Promise<ChallengeMatch> {
        const challengeId = typeof challengeMatch.challenge === 'string' ? new Types.ObjectId(challengeMatch.challenge) : new Types.ObjectId(challengeMatch.challenge._id);
        const challengerId = typeof challengeMatch.challenger === 'string' ? new Types.ObjectId(challengeMatch.challenger) : new Types.ObjectId(challengeMatch.challenger._id);
        const opponentId = typeof challengeMatch.opponent === 'string' ? new Types.ObjectId(challengeMatch.opponent) : new Types.ObjectId(challengeMatch.opponent._id);
    

        if (challengerId.equals(opponentId)) {
            throw new Error("Un utilisateur ne peut pas se défier lui-même.");
        }

        const existing = await this.challengeMatchModel.findOne({
            challenge: challengeId,
            challenger: challengerId,
            opponent: opponentId,
            status: { $in: [ChallengeMatchStatus.PENDING, ChallengeMatchStatus.ACCEPTED] }
        });
        if (existing) {
            throw new Error("Un défi est déjà en cours entre ces deux utilisateurs pour ce challenge.");
        }

        const challengeData: any = {
            ...challengeMatch,
            challenge: challengeId,
            challenger: challengerId,
            opponent: opponentId,
        };

        const created = await this.challengeMatchModel.create(challengeData);

        if (!created) {
            throw new Error("Erreur lors de la création du défi.");
        }

        const populated = await this.challengeMatchModel.findById(created._id)
            .populate('challenge')
            .populate('challenger')
            .populate('opponent');

        if (!populated) {
            throw new Error('ChallengeMatch introuvable après création');
        }

        return populated;
    }

    async findAllMatchRequestsByUser(userId: string): Promise<ChallengeMatch[]> {
        return this.challengeMatchModel.find({ opponent: userId })
            .populate('challenge')
            .populate('challenger')
            .populate('opponent')
            .populate('challengerTraining')
            .populate('opponentTraining')
            .populate('winner');
    }

    async updateGymRequestStatus(matchId: string, status: string): Promise<void> {
        if(!isValidObjectId(matchId)) {
            return;
        }
        await this.challengeMatchModel.updateOne({
            _id: matchId
        }, {
            status: status
        });
    }

    async addTrainingToMatch(matchId: string, userId: string, updateData: UpdateChallengeMatch): Promise<ChallengeMatch> {
        if (!isValidObjectId(matchId) || !isValidObjectId(userId)) {
            throw new Error("ID de match ou d'utilisateur invalide.");
        }

        const match = await this.challengeMatchModel.findById(matchId);

        if (!match) {
            throw new Error("Match introuvable");
        }

        const challengerId = typeof match.challenger === 'string'
            ? new Types.ObjectId(match.challenger)
            : new Types.ObjectId(match.challenger._id);

        const opponentId = typeof match.opponent === 'string'
            ? new Types.ObjectId(match.opponent)
            : new Types.ObjectId(match.opponent._id);
        const userObjectId = new Types.ObjectId(userId);

        if (!updateData.challengerTraining && !updateData.opponentTraining) {
            throw new Error("Aucun training à ajouter.");
        }

        const updateFields: Partial<ChallengeMatch> = {};

        if (userObjectId.equals(challengerId)) {
            if (!updateData.challengerTraining) {
                throw new Error("Training du challenger manquant.");
            }
            updateFields.challengerTraining = updateData.challengerTraining;
        } else if (userObjectId.equals(opponentId)) {
            if (!updateData.opponentTraining) {
                throw new Error("Training de l'opponent manquant.");
            }
            updateFields.opponentTraining = updateData.opponentTraining;
        } else {
            throw new Error("L'utilisateur n'est ni challenger ni opponent.");
        }

        const updatedMatch = await this.challengeMatchModel.findByIdAndUpdate(
            matchId,
            { $set: updateFields },
            { new: true })
                .populate('challenge')
                .populate('challenger')
                .populate('opponent')
                .populate('challengerTraining')
                .populate('opponentTraining');
        
        if (!updatedMatch) {
            throw new Error("Échec lors de la mise à jour du match.");
        }

        return updatedMatch;
    }

    async computeMatchWinner(matchId: string): Promise<ChallengeMatch> {
        if (!isValidObjectId(matchId)) {
            throw new Error("ID de match invalide.");
        }

        const match = await this.challengeMatchModel.findById(matchId)
        .populate('challenger')
        .populate('opponent')
        .populate({
            path: 'challenge',
        })
        .populate({
            path: 'challengerTraining',
        })
        .populate({
            path: 'opponentTraining',
        });

        if (!match) throw new Error("Match introuvable.");

        if (!match.challengerTraining || !match.opponentTraining) {
            throw new Error("Les deux trainings doivent être renseignés pour calculer un gagnant.");
        }

        const challengerPoints = this.calculatePoints(match, 'challenger');
        const opponentPoints = this.calculatePoints(match, 'opponent');

        let winner: Types.ObjectId | undefined;
        if (challengerPoints > opponentPoints) {
            winner = typeof match.challenger === 'string'
            ? new Types.ObjectId(match.challenger)
            : new Types.ObjectId(match.challenger._id);
        } else if (opponentPoints > challengerPoints) {
            winner = typeof match.opponent === 'string'
            ? new Types.ObjectId(match.opponent)
            : new Types.ObjectId(match.opponent._id);
        } else {
            const challengerTrainingDate = new Date(
                typeof match.challengerTraining !== 'string'
                    ? match.challengerTraining.createdAt
                    : ''
            );
            const opponentTrainingDate = new Date(
                typeof match.opponentTraining !== 'string'
                    ? match.opponentTraining.createdAt
                    : ''
            );

            winner =
                challengerTrainingDate < opponentTrainingDate
                    ? typeof match.challenger === 'string'
                        ? new Types.ObjectId(match.challenger)
                        : new Types.ObjectId(match.challenger._id)
                    : typeof match.opponent === 'string'
                        ? new Types.ObjectId(match.opponent)
                        : new Types.ObjectId(match.opponent._id);
        }

        match.status = ChallengeMatchStatus.COMPLETED;
        match.winner = winner?.toString(); 

        if (winner && match.challenge && typeof match.challenge !== 'string' && match.challenge.reward) {
            const rewardId = typeof match.challenge.reward === 'string'
                ? new Types.ObjectId(match.challenge.reward)
                : new Types.ObjectId(match.challenge.reward._id);

            const user = await this.userModel.findByIdAndUpdate(
                winner,
                { $addToSet: { rewards: rewardId } },
                { new: true }
            );
        }

        await match.save();

        const matchUpdated = await this.challengeMatchModel.findById(matchId)
            .populate('challenge')
            .populate('challenger')
            .populate('opponent')
            .populate('challengerTraining')
            .populate('opponentTraining')
            .populate('winner');

        if (!matchUpdated) {
            throw new Error("Le match n'existe pas");
        }

        return matchUpdated;
    }

    private calculatePoints(match: ChallengeMatch, role: 'challenger' | 'opponent'): number {
        const training = role === 'challenger' ? match.challengerTraining : match.opponentTraining;
        const otherTraining = role === 'challenger' ? match.opponentTraining : match.challengerTraining;
        const challenge = match.challenge;

        if (!training || typeof training === 'string') return 0;
        if (!otherTraining || typeof otherTraining === 'string') return 0;
        if (!challenge || typeof challenge === 'string') return 0;

        let points = 0;

        // 1. Moins de temps
        const trainingDuration = parseInt(training.duration);
        const otherDuration = parseInt(otherTraining.duration);
        if (!isNaN(trainingDuration) && !isNaN(otherDuration)) {
            if (trainingDuration < otherDuration) points++;
        }

        // 2. Exercices exacts
        const performedSet = new Set(training.performedExercises);
        const challengeSet = new Set(challenge.recommendedExercises);
        const hasAll = [...challengeSet].every(ex => performedSet.has(ex));
        if (hasAll) points++;

        // 3. +1 par exercice en plus
        const extraExercises = [...performedSet].filter(ex => !challengeSet.has(ex));
        points += extraExercises.length;

        // 4. Plus de calories
        if (training.nbCalorie > otherTraining.nbCalorie) points++;

        // 5. Training créé en premier
        if (training.createdAt && otherTraining.createdAt && training.createdAt < otherTraining.createdAt) {
            points++;
        }

        return points;
    }

}