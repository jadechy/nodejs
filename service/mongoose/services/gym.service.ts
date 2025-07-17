import { Mongoose, Model, FilterQuery, isValidObjectId } from "mongoose";
import { Gym, GymRequest, GymRequestStatus, User } from "../../../models";
import { gymSchema } from "../schema/gym.schema";
import { gymRequestSchema } from "../schema/gymrequest.schema";

export type CreateGym = Omit<Gym, "_id" | "createdAt" | "updatedAt">;
export type UpdateGym = Partial<Omit<Gym, "_id" | "createdAt">>;

export type CreateGymRequest = Omit<
  GymRequest,
  "_id" | "createdAt" | "updatedAt"
>;
export type UpdateGymRequest = Partial<Omit<GymRequest, "_id" | "createdAt">>;

export class GymService {
  readonly gymModel: Model<Gym>;
  readonly gymRequestModel: Model<GymRequest>;

  constructor(public readonly connection: Mongoose) {
    this.gymModel = connection.model("Gym", gymSchema());
    this.gymRequestModel = connection.model("GymRequest", gymRequestSchema());
  }

  findAllGyms = async (): Promise<Gym[]> => {
    return this.gymModel.find();
  };

  findGymById = async (id: string): Promise<Gym | null> => {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.gymModel.findById(id);
  };

  createGym = async (gym: CreateGym): Promise<Gym> => {
    return this.gymModel.create({ ...gym });
  };

  createGymRequest = async (gymRequest: CreateGymRequest) => {
    return this.gymRequestModel.create({ ...gymRequest });
  };

  updateGym = async (gymId: string, updateData: UpdateGym): Promise<Gym> => {
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
  };

  updateGymRequestStatus = async (
    gymId: string,
    status: string
  ): Promise<void> => {
    if (!isValidObjectId(gymId)) {
      return;
    }
    await this.gymRequestModel.updateOne(
      {
        _id: gymId,
      },
      {
        status: status,
      }
    );
  };

  deleteGym = async (gymId: string): Promise<void> => {
    if (!isValidObjectId(gymId)) {
      throw new Error("ID gym invalide.");
    }

    const result = await this.gymModel.findByIdAndDelete(gymId);

    if (!result) {
      throw new Error("Salle non trouvé.");
    }
  };

  deleteGymRequest = async (gymId: string): Promise<void> => {
    if (!isValidObjectId(gymId)) {
      throw new Error("ID gym invalide.");
    }

    const result = await this.gymRequestModel.findByIdAndDelete(gymId);

    if (!result) {
      throw new Error("Salle non trouvé.");
    }
  };

  findAllGymRequestsByUser = async (userId: string): Promise<GymRequest[]> => {
    return this.gymRequestModel.find({ requestedBy: userId });
  };

  findGymRequestsByUserAndStatus = async (
    userId: string,
    status: GymRequestStatus
  ): Promise<GymRequest[]> => {
    return this.gymRequestModel.find({
      requestedBy: userId,
      status,
    });
  };

  findGymRequestsByStatus = async (
    status: GymRequestStatus
  ): Promise<GymRequest[]> => {
    return this.gymRequestModel.find({ status });
  };
}
