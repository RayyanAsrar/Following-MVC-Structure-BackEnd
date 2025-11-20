import { UserModel } from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();    
export const signupController = async(req, res) => {
    try {
        const { name, email, mobileNumber, password } = req.body;
        if (!name || !email || !mobileNumber || !password) {
            return res.json({
                message: "All fields are required",
                status: "failed",
                data: null
            });
            
            
        }
//get user and check if user already exists
const existingUser = await UserModel.findOne({ email });
if (existingUser) {
    return res.json({
        message: "User already exists with this email",
        status: "failed",
        data: null
    });
 }

    const hashPassword = await bcrypt.hash(password, 10);
    // console.log(hashPassword);
    const body = {
        ...req.body,
        password: hashPassword
    };
    
    

        await UserModel.create(body);
        res.json({
            message: "User signed up successfully",
            status: "success",
            data: req.body
        });
//SEND WELCOME EMAIL
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASS,
  },
});


    } catch (error) {
        res.json({
            message: error.message || "Error in signup controller",
            status: "failed",
            data: null
        });
    }
}

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({
                message: "Email and password are required",
                status: "failed",
                data: null
            });
        }
        const user = await UserModel.findOne({ email });
        const bodytosend=   { email: user.email, name: user.name, mobileNumber: user.mobileNumber, _id: user._id }
        if (!user) {
            return res.json({
                message: "User not found",
                status: "failed",
                data: null
            });
        }   
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if (!isPasswordValid) {
            return res.json({
                message: "Invalid password",
                status: "failed",
                data: null
            });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({
            message: "User logged in successfully",
            status: "success",
            data: bodytosend,
            token: token
        });
    } catch (error) {
        res.json({
            message: error.message || "something went wrong in login controller",
            status: "failed",
            data: null
        });
    }
}