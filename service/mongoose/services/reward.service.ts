import { Mongoose, Model, isValidObjectId } from "mongoose";
import { Reward } from "../../../models/reward.interface";
import { rewardSchema } from "../schema/reward.schema";

export type CreateReward = Omit<Reward, "_id" | "createdAt" | "updatedAt">;
export type UpdateReward = Partial<Omit<Reward, "_id" | "createdAt">>;

export class RewardService {
  readonly rewardModel: Model<Reward>;

  constructor(public readonly connection: Mongoose) {
    this.rewardModel = connection.model("Reward", rewardSchema());
  }

  async findAllRewards(): Promise<Reward[]> {
    return this.rewardModel.find();
  }

  async findRewardById(id: string): Promise<Reward | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.rewardModel.findById(id);
  }

  async createReward(reward: CreateReward): Promise<Reward> {
    return this.rewardModel.create({ ...reward });
  }

  async updateReward(
    rewardId: string,
    updateData: UpdateReward
  ): Promise<Reward> {
    if (!isValidObjectId(rewardId)) {
      throw new Error("ID reward invalide.");
    }

    if ("_id" in updateData) {
      delete updateData._id;
    }

    const updated = await this.rewardModel.findByIdAndUpdate(
      rewardId,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      throw new Error("Récompense non trouvé.");
    }

    return updated;
  }

  async deleteReward(rewardId: string): Promise<void> {
    if (!isValidObjectId(rewardId)) {
      throw new Error("ID reward invalide.");
    }

    const result = await this.rewardModel.findByIdAndDelete(rewardId);

    if (!result) {
      throw new Error("Récompense non trouvé.");
    }
  }
}
