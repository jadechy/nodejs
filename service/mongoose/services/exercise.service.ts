import { Mongoose, Model, FilterQuery, isValidObjectId } from "mongoose";
import { Exercise } from "../../../models";
import { exerciseSchema } from "../schema/exercise.schema";

export type CreateExercise = Omit<Exercise, "_id" | "createdAt" | "updatedAt">;
export type UpdateExercise = Partial<Omit<Exercise, "_id" | "createdAt">>;

export class ExerciseService {
  readonly exerciseModel: Model<Exercise>;

  constructor(public readonly connection: Mongoose) {
    this.exerciseModel = connection.model("Exercise", exerciseSchema());
  }

  async findAllExercises(): Promise<Exercise[]> {
    return this.exerciseModel.find();
  }

  async findExerciseById(id: string): Promise<Exercise | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.exerciseModel.findById(id);
  }

  async createExercise(exercise: CreateExercise): Promise<Exercise> {
    return this.exerciseModel.create({ ...exercise });
  }

  async updateExercise(
    exeId: string,
    updateData: UpdateExercise
  ): Promise<Exercise> {
    if (!isValidObjectId(exeId)) {
      throw new Error("ID exercice invalide.");
    }

    if ("_id" in updateData) {
      delete updateData._id;
    }

    const updated = await this.exerciseModel.findByIdAndUpdate(
      exeId,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      throw new Error("Exercice non trouvé.");
    }

    return updated;
  }

  async deleteExercise(exeId: string): Promise<void> {
    if (!isValidObjectId(exeId)) {
      throw new Error("ID exercise invalide.");
    }

    const result = await this.exerciseModel.findByIdAndDelete(exeId);

    if (!result) {
      throw new Error("Exercice non trouvé.");
    }
  }
}
