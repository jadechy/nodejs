import dotenv from "dotenv";
import { UserRole } from "./models/user.interface";
import { initServices } from "./bootstrap";
import { createApp } from "./app";
import { UserService } from "./service/mongoose";

dotenv.config();

const bootstrapAPI = async (userService: UserService) => {
  if (typeof process.env.GYM_ROOT_EMAIL === "undefined") {
    throw new Error("GYM_ROOT_EMAIL is not defined");
  }
  if (typeof process.env.GYM_ROOT_PASSWORD === "undefined") {
    throw new Error("GYM_ROOT_PASSWORD is not defined");
  }
  const rootUser = await userService.findUser(process.env.GYM_ROOT_EMAIL);
  if (!rootUser) {
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
const start = async () => {
  const services = await initServices();
  await bootstrapAPI(services.userService);
  const app = createApp(services);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}...`);
  });
};
start().catch(console.error);
