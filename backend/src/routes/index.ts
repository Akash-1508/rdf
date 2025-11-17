import { Express, Router } from "express";
import { router as authRouter } from "./auth";
import { router as animalsRouter } from "./animals";
import { router as milkRouter } from "./milk";
import { router as charaRouter } from "./chara";
import { router as reportsRouter } from "./reports";

export const appRouter = Router();

appRouter.use("/auth", authRouter);
appRouter.use("/animals", animalsRouter);
appRouter.use("/milk", milkRouter);
appRouter.use("/chara", charaRouter);
appRouter.use("/reports", reportsRouter);

export function registerRoutes(app: Express) {
  app.use(appRouter);
}


