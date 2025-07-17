import dotenv from "dotenv";
import express from "express";
import {
  openConnection,
  SessionService,
  UserService,
  GymService,
  ExerciseService,
  BadgeService,
  RewardService,
  ChallengeService,
  ShareService,
  TrainingService,
  ChallengeMatchService,
} from "./service/mongoose";
import { UserRole } from "./models/user.interface";
import {
  AuthController,
  UserController,
  GymController,
  ExerciseController,
  BadgeController,
  RewardController,
  ChallengeController,
  ShareController,
  TrainingController,
  ChallengeMatchController,
} from "./controllers";

dotenv.config();

const startAPI = async () => {
  const connection = await openConnection();
  const userService = new UserService(connection);
  const gymService = new GymService(connection);
  const exerciseService = new ExerciseService(connection);
  const badgeService = new BadgeService(connection);
  const rewardService = new RewardService(connection);
  const challengeService = new ChallengeService(connection);
  const shareService = new ShareService(connection);
  const trainingService = new TrainingService(connection, userService);
  const challengeMatchService = new ChallengeMatchService(connection);
  const sessionService = new SessionService(connection);
  await bootstrapAPI(userService);
  const app = express();
  const authController = new AuthController(userService, sessionService);
  app.use("/auth", authController.buildRouter());
  const userController = new UserController(userService, sessionService);
  app.use("/user", userController.buildRouter());
  const gymController = new GymController(gymService, sessionService);
  app.use("/gym", gymController.buildRouter());
  const exerciseController = new ExerciseController(
    exerciseService,
    sessionService
  );
  app.use("/exercise", exerciseController.buildRouter());
  const badgeController = new BadgeController(badgeService, sessionService);
  app.use("/badge", badgeController.buildRouter());
  const rewardController = new RewardController(rewardService, sessionService);
  app.use("/reward", rewardController.buildRouter());
  const challengeController = new ChallengeController(
    challengeService,
    sessionService
  );
  app.use("/challenge", challengeController.buildRouter());
  const shareController = new ShareController(shareService, sessionService);
  app.use("/share", shareController.buildRouter());
  const trainingController = new TrainingController(
    trainingService,
    sessionService
  );
  app.use("/training", trainingController.buildRouter());
  const challengeMatchController = new ChallengeMatchController(
    challengeMatchService,
    sessionService
  );
  app.use("/match", challengeMatchController.buildRouter());
  app.listen(process.env.PORT, () =>
    console.log(`API listening on port ${process.env.PORT}...`)
  );
};

const bootstrapAPI = async (userService: UserService) => {
  if (typeof process.env.GYM_ROOT_EMAIL === "undefined") {
    throw new Error("GYM_ROOT_EMAIL is not defined");
  }
  if (typeof process.env.GYM_ROOT_PASSWORD === "undefined") {
    throw new Error("GYM_ROOT_PASSWORD is not defined");
  }
  const rootUser = await userService.findUser(process.env.GYM_ROOT_EMAIL);
  if (!rootUser) {
    // first launch API
    await userService.createUser({
      firstName: "root",
      lastName: "root",
      password: process.env.GYM_ROOT_PASSWORD,
      email: process.env.GYM_ROOT_EMAIL,
      role: UserRole.ADMIN,
      rewards: [],
      badges: [],
    });
  }
};

startAPI().catch(console.error);
