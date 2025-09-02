import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/auth/authModal";

const loggerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let userName: string | undefined = undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded: any = jwt.decode(token);
      if (decoded?.name) {
        userName = decoded.name;
      } else if (decoded?.id) {
        const user = await User.findById(decoded.id).select("name");
        userName = user?.name || decoded.id;
      } else if (decoded?.email) {
        userName = decoded.email;
      }
    } catch (err) {
      userName = "Invalid token";
    }
  }

  const oldJson = res.json;
  res.json = function (data) {
    console.log("API CALL:", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      user: userName,
    });
    // console.log("API RESPONSE:", data);
    return oldJson.call(this, data);
  };
  next();
};

export default loggerMiddleware;