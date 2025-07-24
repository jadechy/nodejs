import { Model, Mongoose, Types } from "mongoose";
import { Challenge, Training, User } from "../../../models";
import { trainingSchema } from "../schema/training.schema";
import { challengeSchema } from "../schema/challenge.schema";
import { userSchema } from "../schema/user.schema";
import { UserService } from "./user.service";

export type CreateTraining = Omit<Training, "_id" | "createdAt" | "updatedAt">;

export class TrainingService {
  readonly trainingModel: Model<Training>;
  readonly challengeModel: Model<Challenge>;
  readonly userModel: Model<User>;

  constructor(
    public readonly connection: Mongoose,
    public readonly userService: UserService
  ) {
    this.trainingModel =
      connection.models.Training ||
      connection.model("Training", trainingSchema());
    this.challengeModel =
      connection.models.Challenge ||
      connection.model("Challenge", challengeSchema());
    this.userModel =
      connection.models.User || connection.model("User", userSchema());
  }

  async createTraining(training: CreateTraining): Promise<Training> {
    const challengeId =
      typeof training.challenge === "string"
        ? new Types.ObjectId(training.challenge)
        : new Types.ObjectId(training.challenge._id);
    const userId =
      typeof training.realisedBy === "string"
        ? new Types.ObjectId(training.realisedBy)
        : new Types.ObjectId(training.realisedBy._id);

    const challenge = await this.challengeModel.findById(challengeId);
    if (!challenge) {
      throw new Error("Challenge introuvable");
    }

    let partnerIds: Types.ObjectId[] = [];
    if (training.partner && Array.isArray(training.partner)) {
      partnerIds = training.partner.map((p: any) =>
        typeof p === "string"
          ? new Types.ObjectId(p)
          : new Types.ObjectId(p._id)
      );

      if (
        challenge.nbCollaborator !== undefined &&
        partnerIds.length > challenge.nbCollaborator
      ) {
        throw new Error(
          `Nombre maximum de partenaires dépassé : ${challenge.nbCollaborator}`
        );
      }
    }

    const trainingData: any = {
      ...training,
      challenge: challengeId,
      realisedBy: userId,
      partner: partnerIds,
    };

    const created = await this.trainingModel.create(trainingData);

    const isValidDuration =
      parseInt(training.duration) <= parseInt(challenge.duration);
    const allExercisesPresent = challenge.recommendedExercises.every((ex) =>
      training.performedExercises.includes(ex)
    );

    if (isValidDuration && allExercisesPresent && challenge.reward) {
      const rewardId =
        typeof challenge.reward === "string"
          ? new Types.ObjectId(challenge.reward)
          : new Types.ObjectId(challenge.reward._id);

      await this.userModel.findByIdAndUpdate(userId, {
        $push: { rewards: rewardId },
      });

      for (const partnerId of partnerIds) {
        await this.userModel.findByIdAndUpdate(partnerId, {
          $addToSet: { rewards: rewardId },
        });
      }

      await this.userService.checkAndAssignBadges(userId);

      for (const partnerId of partnerIds) {
        await this.userService.checkAndAssignBadges(partnerId);
      }
    }

    const populated = await this.trainingModel
      .findById(created._id)
      .populate("challenge")
      .populate("realisedBy")
      .populate("partner");

    if (!populated) {
      throw new Error("Training not found after creation");
    }

    return populated;
  }
}
