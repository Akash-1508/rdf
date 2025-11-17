import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";

export const router = Router();

router.post("/login", login);
router.post("/signup", signup);


