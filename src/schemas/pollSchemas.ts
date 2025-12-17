import { z } from "zod";

export const createPollSchema = z.object({
  question: z
    .string()
    .min(5, "The question is too short")
    .max(200, "The question is too large"),
  options: z
    .array(z.string())
    .min(2, "You must add at least two options")
    .max(10, "Max 10 options"),
});
