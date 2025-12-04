import express from "express";
import { changePasswordController, forgetPasswordController, loginController, resetOTPController, signupController, verifyOTPController } from "../controllers/auth.js";
const authRoutes = express.Router();


authRoutes.post("/signup",signupController);
authRoutes.post("/login",loginController);
authRoutes.post("/verify-otp",verifyOTPController);
authRoutes.post("/resend-otp",resetOTPController);
authRoutes.post("/forgetpassword",forgetPasswordController);
authRoutes.post("/changepassword",changePasswordController);

export default authRoutes;  