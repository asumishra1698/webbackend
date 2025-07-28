import { Request, Response, NextFunction } from "express";
import Contact from "../../models/contact/contactFormModal";
import nodemailer from "nodemailer";

export const submitContactForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, number, email, message, city } = req.body;
    if (!name || !number || !email || !message) {
      res
        .status(400)
        .json({ message: "Name, number, email, and message are required" });
      return;
    }

    const contact = new Contact({ name, number, email, message, city });
    await contact.save();
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Thank You for Contacting Us!",
        html: `
          <p>Hi ${name},</p>
          <p>Thank you for reaching out. We have received your message and will get back to you shortly.</p>
          <p>Best Regards,<br/>Gonardweb</p>
        `,
      };

      const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: "New Contact Form Submission",
        html: `
          <h3>New Contact Form Submission Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Number:</strong> ${number}</li>
            ${city ? `<li><strong>City:</strong> ${city}</li>` : ""}
            <li><strong>Message:</strong> ${message}</li>
          </ul>
        `,
      };

      await transporter.sendMail(userMailOptions);
      await transporter.sendMail(adminMailOptions);
    } catch (emailError) {
      console.error("Error sending contact form email:", emailError);
    }

    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getAllContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    console.log("Search Term:", search);

    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
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
