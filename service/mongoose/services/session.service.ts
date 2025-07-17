import { Mongoose, Model, isValidObjectId } from "mongoose";
import { Session } from "../../../models/session.interface";
import { sessionSchema } from "../schema/session.schema";

export type CreateSession = Omit<Session, "_id" | "createdAt" | "updatedAt">;

export class SessionService {
  readonly sessionModel: Model<Session>;

  constructor(public readonly connection: Mongoose) {
    this.sessionModel = connection.model("Session", sessionSchema());
  }

  createSession = async (session: CreateSession): Promise<Session> => {
    return this.sessionModel.create(session);
  };

  findActiveSession = async (sessionId: string): Promise<Session | null> => {
    if (!isValidObjectId(sessionId)) {
      return null;
    }
    const session = this.sessionModel
      .findOne({
        _id: sessionId,
      })
      .populate("user"); // populate permet de charger un objet d'une autre collection a partir de son id
    return session;
  };
}
