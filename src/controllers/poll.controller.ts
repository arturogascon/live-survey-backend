import type { Request, Response } from "express";
import { ZodError } from "zod";
import Poll from "../models/poll.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { createPollSchema } from "../schemas/pollSchemas.js";
import { isValidObjectId } from "mongoose";

export const createPoll = async (req: AuthRequest, res: Response) => {
  try {
    const payload = createPollSchema.parse(req.body);

    const parsedOptions = payload.options.map((option: string) => ({
      text: option,
    }));

    const poll = await Poll.create({
      question: payload.question,
      options: parsedOptions,
      createdBy: req.userId,
    });
    res.status(201).json(poll);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        message: error.message,
        details: error.issues,
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePoll = async (req: AuthRequest, res: Response) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid poll ID" });
    }

    const payload = createPollSchema.parse(req.body);

    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const isSameAuthor = poll.createdBy.toString() === req.userId;

    if (!isSameAuthor) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can only update your own polls" });
    }

    if (poll?.totalVotes) {
      return res.status(400).json({ message: "Can not update a voted poll" });
    }

    const result = await poll.updateOne({
      question: payload.question,
      options: payload.options.map((option: string) => ({
        text: option,
        votes: 0,
      })),
      votesLog: [],
    });

    if (!result.acknowledged) {
      return res.status(400).json({ message: "Poll not modified" });
    }

    const updatedPoll = await Poll.findById(req.params.id);
    return res.status(200).json(updatedPoll);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPolls = async (req: AuthRequest, res: Response) => {
  try {
    const polls = await Poll.find({ createdBy: req.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPollById = async (req: Request, res: Response) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
