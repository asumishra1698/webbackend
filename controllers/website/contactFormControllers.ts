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

// ...existing code...
export const getAllContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || "";

    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search, "i"); // Case-insensitive search
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { number: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const totalContacts = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      contacts,
      pagination: {
        total: totalContacts,
        page,
        limit,
        pages: Math.ceil(totalContacts / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};