import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express's Request type to include our custom "userId" field.
// Without this, TypeScript would error: "Property 'userId' does not exist on type 'Request'"
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}