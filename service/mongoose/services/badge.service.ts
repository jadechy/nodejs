import { Mongoose, Model, isValidObjectId } from "mongoose";
import { Badge } from "../../../models/badge.interface";
import { badgeSchema } from "../schema/badge.schema";

export type CreateBadge = Omit<Badge, "_id" | "createdAt" | "updatedAt">;
export type UpdateBadge = Partial<Omit<Badge, "_id" | "createdAt">>;

export class BadgeService {
  readonly badgeModel: Model<Badge>;

  constructor(public readonly connection: Mongoose) {
    this.badgeModel =
      connection.models.Badge || connection.model("Badge", badgeSchema());
  }

  findAllBadges = async (): Promise<Badge[]> => {
    return this.badgeModel.find();
  };

  findBadgeById = async (id: string): Promise<Badge | null> => {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.badgeModel.findById(id);
  };

  createBadge = async (badge: CreateBadge): Promise<Badge> => {
    return this.badgeModel.create({ ...badge });
  };

  updateBadge = async (
    badgeId: string,
    updateData: UpdateBadge
  ): Promise<Badge> => {
    if (!isValidObjectId(badgeId)) {
      throw new Error("ID badge invalide.");
    }

    if ("_id" in updateData) {
      delete updateData._id;
    }

    const updated = await this.badgeModel.findByIdAndUpdate(
      badgeId,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      throw new Error("Badge non trouvé.");
    }

    return updated;
  };

  deleteBadge = async (badgeId: string): Promise<void> => {
    if (!isValidObjectId(badgeId)) {
      throw new Error("ID badge invalide.");
    }

    const result = await this.badgeModel.findByIdAndDelete(badgeId);

    if (!result) {
      throw new Error("Badge non trouvé.");
    }
  };
}
