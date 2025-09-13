import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;

    if (decoded.role === "admin" || decoded.role === "super_admin" || decoded.role === "user") {
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};