import express from "express";
import { loginController, signupController } from "../controllers/auth.js";
const authRoutes = express.Router();


authRoutes.post("/signup",signupController);

authRoutes.post("/login",loginController);

export default authRoutes;  