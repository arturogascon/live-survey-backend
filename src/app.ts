import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./utils/db.js";
import authRoutes from "./routes/auth.routes.js";
import pollRoutes from "./routes/poll.routes.js";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", true);
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);

export default app;
