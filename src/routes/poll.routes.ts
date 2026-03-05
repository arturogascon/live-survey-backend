import { Router } from "express";
import {
  createPoll,
  deletePoll,
  getPollById,
  getPolls,
  updatePoll,
} from "../controllers/poll.controller.js";
import { votePoll } from "../controllers/vote.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { voteLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post("/", authMiddleware, createPoll);

router.get("/", authMiddleware, getPolls);

router.get("/:id", getPollById);

router.patch("/:id", authMiddleware, updatePoll);

router.delete("/:id", authMiddleware, deletePoll);

router.post("/:id/vote/:optionId", voteLimiter, votePoll);

export default router;
