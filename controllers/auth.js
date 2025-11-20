import { UserModel } from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
export const signupController = async (req, res) => {
     
     
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
       const otp = uuidv4().slice(0, 6);
        
        try {
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
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: email,
                subject: "Welcome to Our Platform!",
                // text: `Hello ${email},\n\nThank you for signing up on our platform. We're excited to have you on board!\n\nBest regards,\nThe Team`,
                html: `
                <!doctype html>
                <html>
                <head>
                <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Verify your email</title>
  <style>
    /* Minimal inline-friendly styles used below inline where needed.
       Keep CSS here for preview; inline styles are used in production email. */
    body { margin: 0; padding: 0; background: #f4f6f8; }
    .container { width: 100%; max-width: 600px; margin: 0 auto; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:24px;text-align:center;background:linear-gradient(90deg,#4f46e5,#06b6d4);color:#ffffff;font-family:Arial,sans-serif;">
              <h1 style="margin:0;font-size:22px;font-weight:700;">Confirm your email</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 24px 12px;font-family:Arial,sans-serif;color:#111827;">
              <p style="margin:0 0 12px;font-size:16px;line-height:1.4;">
                Hi ${name},
              </p>

              <p style="margin:0 0 18px;font-size:15px;line-height:1.5;color:#374151;">
                Thanks for creating an account. Copy the  below OTP to verify your email address and activate your account.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 28px;">
                <tr>
                  <td align="center">
                    <button style="display:inline-block;padding:12px 22px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
                      ${otp}
                    </button>
                  </td>
                </tr>
              </table>


              <hr style="border:none;border-top:1px solid #e6e9ee;margin:20px 0;">

              <p style="margin:0;font-size:13px;color:#9ca3af;">
                If you didn't create an account with us, you can ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 24px;background:#fafafa;font-family:Arial,sans-serif;color:#6b7280;font-size:12px;text-align:center;">
              <div>Need help? Reply to this email or visit <a href="{{supportUrl}}" style="color:#0366d6;text-decoration:underline;">Support</a>.</div>
              <div style="margin-top:6px;color:#9ca3af;">© {{year}} Your Company</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
                `
            });
        } catch (error) {
            res.json({
                message: "User signed up but failed to send welcome email",
                status: "success",
                data: null
            });
        }


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
        const bodytosend = { email: user.email, name: user.name, mobileNumber: user.mobileNumber, _id: user._id }
        if (!user) {
            return res.json({
                message: "User not found",
                status: "failed",
                data: null
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
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