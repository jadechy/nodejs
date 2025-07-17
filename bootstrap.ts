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

export const initServices = async () => {
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

  return {
    userService,
    gymService,
    exerciseService,
    badgeService,
    rewardService,
    challengeService,
    shareService,
    trainingService,
    challengeMatchService,
    sessionService,
  };
};
