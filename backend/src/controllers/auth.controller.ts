import { Request, Response } from "express";
import crypto from "crypto";
import { addUser, UserRoles } from "../models";
import { validateSignup, validateLogin, formatValidationErrors } from "../utils/validators";

export const login = (req: Request, res: Response) => {
  const validation = validateLogin(req.body);
  if (!validation.success) {
    return res.status(400).json(formatValidationErrors(validation.errors!));
  }
  
  return res.json({ 
    token: "dummy-token", 
    user: { id: "u_1", name: "Demo", email: validation.data!.email } 
  });
};

export const signup = async (req: Request, res: Response) => {
  // Validate request data using helper
  const validation = validateSignup(req.body);
  if (!validation.success) {
    return res.status(400).json(formatValidationErrors(validation.errors!));
  }
  
  const validatedData = validation.data!;

  // Hash password (salt + scrypt)
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(validatedData.password, salt, 64).toString("hex");
  const passwordHash = `${salt}:${hash}`;

  try {
    // Use provided role or default to CONSUMER (2)
    const userRole = validatedData.role !== undefined ? validatedData.role : UserRoles.CONSUMER;
    
    const created = await addUser({
      name: validatedData.name,
      email: validatedData.email || "",
      mobile: validatedData.mobile.trim(),
      gender: validatedData.gender,
      address: validatedData.address?.trim(),
      otp: validatedData.otp,
      otpVerified: validatedData.otp ? false : undefined,
      role: userRole,
      passwordHash,
      isActive: true
    });

    // eslint-disable-next-line no-console
    console.log(`[auth] New user created: _id=${created._id} email=${created.email}`);

    const { passwordHash: _ph, ...safe } = created;
    return res.status(201).json(safe);
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "Unable to create user";
    const status = /already in use/i.test(msg) ? 409 : 400;
    return res.status(status).json({ error: msg });
  }
};


