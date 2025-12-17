import { rateLimit } from "express-rate-limit";

export const voteLimiter = rateLimit({
  windowMs: 5000,
  max: 3,
  message: "Too many attempts, slow down",
});
