import { NextFunction, Request, Response } from "express";
import { verifyToken, extractTokenFromHeader, JWTPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }
    
    const decoded = verifyToken(token);
    
    req.user = decoded;
    
    return next();
  } catch (error: any) {
    if (error.message === "Token expired") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error.message === "Invalid token") {
      return res.status(401).json({ error: "Invalid token" });
    }
    return res.status(401).json({ error: "Unauthorized" });
  }
}


