import { Request, Response, NextFunction } from "express";
import Contact from "../../models/website/contactFormModal";

// Create new contact form entry
export const submitContactForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, number, email, message } = req.body;
    if (!name || !number || !email || !message) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const contact = new Contact({ name, number, email, message });
    await contact.save();
    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get all contact form entries
export const getAllContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    next(err);
  }
};