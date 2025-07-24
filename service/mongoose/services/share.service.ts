import { isValidObjectId, Model, Mongoose, Types } from "mongoose";
import { Share } from "../../../models";
import { shareSchema } from "../schema/share.schema";

export type CreateShare = Omit<Share, "_id" | "createdAt" | "updatedAt">;

export class ShareService {
  readonly shareModel: Model<Share>;

  constructor(public readonly connection: Mongoose) {
    this.shareModel = connection.model("Share", shareSchema());
  }

  async createShare(share: CreateShare): Promise<Share> {
    const { from, to, challenge } = share;

    const fromId =
      typeof from === "string"
        ? new Types.ObjectId(from)
        : new Types.ObjectId(from._id);
    const toId =
      typeof to === "string"
        ? new Types.ObjectId(to)
        : new Types.ObjectId(to._id);
    const challengeId =
      typeof challenge === "string"
        ? new Types.ObjectId(challenge)
        : new Types.ObjectId(challenge._id);

    const existingShare = await this.shareModel.findOne({
      from: fromId,
      to: toId,
      challenge: challengeId,
    });
    if (existingShare) {
      throw new Error("Ce défi a déjà été partagé à cet utilisateur.");
    }

    const shareData: any = {
      from: fromId,
      to: toId,
      challenge: challengeId,
    };

    const created = await this.shareModel.create(shareData);

    const populated = await this.shareModel
      .findById(created._id)
      .populate("from")
      .populate("to")
      .populate("challenge");

    if (!populated) {
      throw new Error("Share not found after creation");
    }

    return populated;
  }

  async getAllMyShare(userId: string): Promise<Share[]> {
    return this.shareModel
      .find({ to: userId })
      .populate("from")
      .populate("challenge");
  }
}
