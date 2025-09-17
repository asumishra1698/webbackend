import { authenticate } from "../middlewares/authMiddleware";

export const allRoles = authenticate(["admin", "super_admin", "customer"]);

export const allAdmin = authenticate(["admin", "super_admin"]);

export const superAdminOnly = authenticate(["super_admin"]);

export const adminOnly = authenticate(["admin"]);

export const customerOnly = authenticate(["customer"]);