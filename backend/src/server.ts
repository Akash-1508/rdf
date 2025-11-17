import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./utils/errorHandlers";
import { connectToDatabase } from "./db/db";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

registerRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

const envPort = process.env.PORT ? Number(process.env.PORT) : undefined;
const port = typeof envPort === "number" && !Number.isNaN(envPort) ? envPort : 8080;

async function bootstrap() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on http://localhost:${port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[bootstrap] Failed to start server:", err);
    process.exit(1);
  }
}

void bootstrap();


