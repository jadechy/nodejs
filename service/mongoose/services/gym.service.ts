import { Mongoose, Model, FilterQuery, isValidObjectId } from "mongoose";
import { Gym, GymStatus, User } from "../../../models";
import { gymSchema } from "../schema/gym.schema";

export type CreateGym = Omit<Gym, "_id" | "createdAt" | "updatedAt">;
export type UpdateGym = Partial<Omit<Gym, "_id" | "createdAt">>;

export class GymService {
  readonly gymModel: Model<Gym>;

  constructor(public readonly connection: Mongoose) {
    this.gymModel = connection.model("Gym", gymSchema());
  }

  async findAllGyms(): Promise<Gym[]> {
    return this.gymModel.find();
  }

  async findGymById(id: string): Promise<Gym | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.gymModel.findById(id);
  }

  async createGym(gymData: CreateGym, createdBy: User): Promise<Gym> {
    const isAdmin = createdBy.role === "ADMIN";

    return this.gymModel.create({
      ...gymData,
      requestedBy: isAdmin ? undefined : createdBy,
      status: isAdmin ? GymStatus.APPROVED : GymStatus.PENDING,
    });
  }

  async updateGym(gymId: string, updateData: UpdateGym): Promise<Gym> {
    if (!isValidObjectId(gymId)) {
      throw new Error("ID gym invalide.");
    }

    if ("_id" in updateData) {
      delete updateData._id;
    }

    const updated = await this.gymModel.findByIdAndUpdate(
      gymId,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      throw new Error("Salle non trouvé.");
    }

    return updated;
  }

  async updateGymStatus(gymId: string, status: string): Promise<void> {
    if (!isValidObjectId(gymId)) {
      return;
    }
    await this.gymModel.updateOne(
      {
        _id: gymId,
      },
      {
        status: status,
      }
    );
  }

  async deleteGym(gymId: string): Promise<void> {
    if (!isValidObjectId(gymId)) {
      throw new Error("ID gym invalide.");
    }

    const result = await this.gymModel.findByIdAndDelete(gymId);

    if (!result) {
      throw new Error("Salle non trouvé.");
    }
  }

  async findAllGymByUser(userId: string): Promise<GymStatus[]> {
    return this.gymModel.find({ requestedBy: userId });
  }

  async findGymByUserAndStatus(
    userId: string,
    status: GymStatus
  ): Promise<GymStatus[]> {
    return this.gymModel.find({
      requestedBy: userId,
      status,
    });
  }

  async findGymByStatus(status: GymStatus): Promise<GymStatus[]> {
    return this.gymModel.find({ status });
  }
}
