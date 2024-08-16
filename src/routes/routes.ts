import { Express } from "express";

import logsRoutes from "./logs/logs";

export default (app: Express) => {
  app.use("/logs", logsRoutes);
};
