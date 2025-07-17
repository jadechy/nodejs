import express from "express";
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

export const createApp = (services: any) => {
  const app = express();

  app.use(
    "/auth",
    new AuthController(
      services.userService,
      services.sessionService
    ).buildRouter()
  );
  app.use(
    "/user",
    new UserController(
      services.userService,
      services.sessionService
    ).buildRouter()
  );
  app.use(
    "/gym",
    new GymController(
      services.gymService,
      services.sessionService
    ).buildRouter()
  );
  app.use(
    "/exercise",
    new ExerciseController(
      services.exerciseService,
      services.sessionService
    ).buildRouter()
  );
  app.use(
    "/badge",
    new BadgeController(
      services.badgeService,
      services.sessionService
    ).buildRouter()
  );
  app.use(
    "/reward",
    new RewardController(
      services.rewardService,
      services.sessionService
    ).buildRouter()
  );
  app.use(
    "/challenge",
    new ChallengeController(
      services.challengeService,
      services.sessionService
    ).buildRouter()
  );
  app.use(
    "/share",
    new ShareController(
      services.shareService,
      services.sessionService
    ).buildRouter()
  );
  app.use(
    "/training",
    new TrainingController(
      services.trainingService,
      services.sessionService
    ).buildRouter()
  );
  app.use(
    "/match",
    new ChallengeMatchController(
      services.challengeMatchService,
      services.sessionService
    ).buildRouter()
  );

  return app;
};
