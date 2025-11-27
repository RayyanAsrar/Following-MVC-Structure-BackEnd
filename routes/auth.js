import express from "express";
import { loginController, resetOTPController, signupController, verifyOTPController } from "../controllers/auth.js";
const authRoutes = express.Router();


authRoutes.post("/signup",signupController);
authRoutes.post("/login",loginController);
authRoutes.post("/verify-otp",verifyOTPController);
authRoutes.post("/reset-otp",resetOTPController);

export default authRoutes;  