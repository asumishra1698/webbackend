import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../../models/auth/authModal";
import { Request, Response, NextFunction } from "express";
import nodemailer from "nodemailer";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, mobile, password, role } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (
      role !== "admin" &&
      role !== "superadmin" &&
      role !== "customer" &&
      role !== "user"
    ) {
      res.status(400).json({
        message:
          "Role must be one of: 'admin', 'superadmin', 'customer', or 'user'",
      });
      return;
    }

    if (role === "superadmin") {
      const superadminCount = await User.countDocuments({ role: "superadmin" });
      if (superadminCount >= 1) {
        res.status(400).json({ message: "Only one superadmin is allowed." });
        return;
      }
    }
    if (role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount >= 2) {
        res.status(400).json({ message: "Only two admins are allowed." });
        return;
      }
    }
    
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        res.status(400).json({ message: "Email already registered" });
        return;
      }
    }
    if (mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        res.status(400).json({ message: "Mobile number already registered" });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      role,
    });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, mobile, password, role } = req.body;    
    if ((!email && !mobile) || !password || !role) {
      res
        .status(400)
        .json({ message: "Email or mobile, password, and role are required" });
      return;
    }
    
    let user;
    if (email && mobile) {
      user = await User.findOne({ email, mobile });
    } else if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ mobile });
    }

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    if (!role || user.role !== role) {
      res.status(403).json({ message: "Role mismatch or not provided" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    res.json({
      message: "Login successful",      
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const requestEmailLoginOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (!role || user.role !== role) {
      res.status(403).json({ message: "Role mismatch or not provided" });
      return;
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Login OTP",
      text: `Your OTP for login is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailLoginOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() },
    });
    if (!user) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const forgotpassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (!role || user.role !== role) {
      res.status(403).json({ message: "Role mismatch or not provided" });
      return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 2 * 60 * 1000;
    await user.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP Code",
      html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 420px; margin: 30px auto; border-radius: 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px #f0f1f2; padding: 32px 24px; background: #fff;">
      <div style="text-align:center;">
        <img src="https://cdn-icons-png.flaticon.com/512/2919/2919600.png" alt="OTP" width="64" style="margin-bottom: 16px;" />
        <h2 style="color: #007bff; margin-bottom: 8px;">Password Reset OTP</h2>
      </div>
      <p style="font-size: 1.1em; color: #333;">Hello <b>${
        user.name || user.email
      }</b>,</p>
      <p style="color: #444;">Use the following OTP to reset your password:</p>
      <div style="font-size: 2.2em; font-weight: bold; letter-spacing: 8px; margin: 24px 0; color: #222; text-align:center;">
        ${otp}
      </div>
      <p style="color: #666;">This OTP is valid for <b>10 minutes</b>. If you did not request a password reset, you can safely ignore this email.</p>
      <div style="margin: 32px 0 0 0; border-top: 1px solid #eee; padding-top: 16px; text-align: center;">
        <span style="font-size: 0.95em; color: #aaa;">&copy; ${new Date().getFullYear()} Your App Name</span>
      </div>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

export const resetpassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() },
    });
    if (!user) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

export const getRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // @ts-ignore
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ role: user.role });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry").lean();
    const usersWithId = users.map((u: any) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      role: u.role,
    }));
    res.json({ users: usersWithId });
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  login,
  requestEmailLoginOtp,
  verifyEmailLoginOtp,
  forgotpassword,
  resetpassword,
  getRole,
  getAllUsers,
};
