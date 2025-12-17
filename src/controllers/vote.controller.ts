import { io } from "../server.js";
import Poll from "../models/poll.model.js";
import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";

export const votePoll = async (req: Request, res: Response) => {
  try {
    const { id: pollId, optionId } = req.params;

    if (!isValidObjectId(pollId)) {
      return res.status(400).json({ message: "Invalid poll ID" });
    }

    const poll = await Poll.findById(pollId);

    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (!poll.isActive)
      return res.status(400).json({ messsage: "Poll is closed" });

    const cookieName = `voted_poll_${pollId}`;
    const cookieReceived = req.cookies?.[cookieName];

    const cookieFound = poll.votesLog?.some(
      (log) => log.cookieId === cookieReceived
    );

    if (cookieReceived || cookieFound) {
      return res.status(403).json({ message: "Aleady voted (cookie)" });
    }

    const option = poll.options.id(optionId || "");

    if (!option) return res.status(404).json({ message: "Option not found" });

    option.votes++;
    poll.totalVotes++;

    poll.votesLog = poll.votesLog || [];

    const cookieId = crypto.randomUUID();

    poll.votesLog.push({
      cookieId,
      created: new Date(),
    });

    await poll.save();

    const oneWeekInMilliseconds = 1000 * 60 * 60 * 24 * 7;

    res.cookie(cookieName, cookieId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: oneWeekInMilliseconds,
    });

    io.emit("pollUpdated", poll);

    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
