import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export const questionCreationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many question creation requests." },
});

export const examCreationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many exam creation requests." },
});
