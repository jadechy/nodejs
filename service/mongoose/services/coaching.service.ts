import { isValidObjectId, Model, Mongoose, Types } from "mongoose";
import { Coaching } from "../../../models";
import { coachingSchema } from "../schema/coaching.schema";

export type CreateCoaching = Omit<Coaching, "_id" | "createdAt" | "updatedAt">;
export type UpdateCoaching = Partial<Omit<Coaching, "_id" | "createdAt">>;

export class CoachingService {
  readonly coachingModel: Model<Coaching>;

  constructor(public readonly connection: Mongoose) {
    this.coachingModel =
      connection.models.Coaching ||
      connection.model("Coaching", coachingSchema());
  }

  async findAllCoachingSessions(): Promise<Coaching[]> {
    return this.coachingModel.find();
  }

  async findCoachingSessionById(id: string): Promise<Coaching | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.coachingModel.findById(id);
  }

  async findAvailableCoachings(): Promise<Coaching[]> {
    return this.coachingModel
      .find({
        $expr: { $lt: [{ $size: "$participants" }, "$max"] },
      })
      .exec();
  }

  async createCoaching(coaching: CreateCoaching): Promise<Coaching> {
    return this.coachingModel.create({ ...coaching });
  }

  async updateCoaching(
    coachingId: string,
    updateData: UpdateCoaching
  ): Promise<Coaching> {
    if (!isValidObjectId(coachingId)) {
      throw new Error("ID coaching invalide.");
    }

    if ("_id" in updateData) {
      delete updateData._id;
    }

    const updated = await this.coachingModel.findByIdAndUpdate(
      coachingId,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      throw new Error("Séance d'entrainement non trouvé.");
    }

    return updated;
  }

  async deleteCaoching(coachingId: string): Promise<void> {
    if (!isValidObjectId(coachingId)) {
      throw new Error("ID coaching invalide.");
    }

    const result = await this.coachingModel.findByIdAndDelete(coachingId);

    if (!result) {
      throw new Error("Séance d'entrainement non trouvé.");
    }
  }

  async joinCoaching(coachingId: string, userId: string): Promise<Coaching> {
    if (!isValidObjectId(coachingId) || !isValidObjectId(userId)) {
      throw new Error("ID invalide.");
    }

    const coaching = await this.coachingModel.findById(coachingId);
    if (!coaching) {
      throw new Error("Coaching introuvable.");
    }

    const participantIds = coaching.participants.map((p) =>
      typeof p === "string" ? p : (p as any)._id.toString()
    );

    if (participantIds.includes(userId)) {
      throw new Error("Utilisateur déjà inscrit à ce coaching.");
    }

    if (coaching.participants.length >= coaching.max) {
      throw new Error("Ce coaching est complet.");
    }

    const updatedCoaching = await this.coachingModel
      .findByIdAndUpdate(
        coachingId,
        { $addToSet: { participants: userId } },
        { new: true }
      )
      .populate("participants");

    if (!updatedCoaching) {
      throw new Error("Coaching introuvable après mise à jour.");
    }

    return updatedCoaching;
  }

  async getCoachingsForUser(userId: string): Promise<Coaching[]> {
    return this.coachingModel
      .find({ participants: userId })
      .populate("gym")
      .populate("exercises")
      .populate("participants")
      .exec();
  }
}
