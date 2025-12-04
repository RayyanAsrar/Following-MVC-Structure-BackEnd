import { UserModel } from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from 'uuid';
import OTPModel from "../models/otp.js";

dotenv.config();

export const signupController = async (req, res) => {
  try {
    const { name, email, mobileNumber, password } = req.body;

    if (!name || !email || !mobileNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, mobile number, and password",
        data: null
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please login instead.",
        data: null
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const body = {
      ...req.body,
      password: hashPassword
    };

    await UserModel.create(body);

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
        html: `<!doctype html>
                <html>
                <head>
                <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Verify your email</title>
  <style>
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
              <p style="margin:0 0 12px;font-size:16px;line-height:1.4;">Hi ${name},</p>

              <p style="margin:0 0 18px;font-size:15px;line-height:1.5;color:#374151;">Thanks for creating an account. Copy the below OTP to verify your email address and activate your account.</p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 28px;">
                <tr>
                  <td align="center">
                    <button style="display:inline-block;padding:12px 22px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">${otp}</button>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #e6e9ee;margin:20px 0;">

              <p style="margin:0;font-size:13px;color:#9ca3af;">If you didn't create an account with us, you can ignore this email.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 24px;background:#fafafa;font-family:Arial,sans-serif;color:#6b7280;font-size:12px;text-align:center;">
              <div>Need help? Reply to this email or visit our support page.</div>
              <div style="margin-top:6px;color:#9ca3af;">© ${new Date().getFullYear()} Your Company</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
              </html>`
      });

      const otpObj = {
        otp: otp,
        email: email
      };
      await OTPModel.create(otpObj);

      return res.status(201).json({
        success: true,
        message: "Account created successfully. Please check your email for the verification code.",
        data: { name, email }
      });

    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Account created but we couldn't send the verification email. Please request a new OTP.",
        data: { name, email }
      });
    }

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during signup. Please try again later.",
      data: null
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password to login",
        data: null
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address. Please sign up first.",
        data: null
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again or reset your password.",
        data: null
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const userData = { 
      email: user.email, 
      name: user.name, 
      mobileNumber: user.mobileNumber, 
      _id: user._id 
    };

    return res.status(200).json({
      success: true,
      message: "Login successful. Welcome back!",
      data: userData,
      token: token
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login. Please try again later.",
      data: null
    });
  }
};

export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and OTP for verification",
        data: null
      });
    }

    const otpRecord = await OTPModel.findOne({ email, isUsed: false }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "No valid OTP found for this email. Please request a new one.",
        data: null
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "The OTP you entered is incorrect. Please check and try again.",
        data: null
      });
    }

    await OTPModel.findByIdAndUpdate(otpRecord._id, { isUsed: true });
    await UserModel.findOneAndUpdate({ email }, { isVerified: true });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Your account is now active!",
      data: null
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during OTP verification. Please try again later.",
      data: null
    });
  }
};

export const resetOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address to resend OTP",
        data: null
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
        data: null
      });
    }

    const otp = uuidv4().slice(0, 6);

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
      subject: "Your New Verification Code",
      html: `<!doctype html>
                <html>
                <head>
                <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Verify your email</title>
  <style>
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
              <p style="margin:0 0 12px;font-size:16px;line-height:1.4;">Hi ${user.name},</p>

              <p style="margin:0 0 18px;font-size:15px;line-height:1.5;color:#374151;">Here's your new verification code. Copy the OTP below to verify your email address.</p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 28px;">
                <tr>
                  <td align="center">
                    <button style="display:inline-block;padding:12px 22px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">${otp}</button>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #e6e9ee;margin:20px 0;">

              <p style="margin:0;font-size:13px;color:#9ca3af;">If you didn't request this code, you can ignore this email.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 24px;background:#fafafa;font-family:Arial,sans-serif;color:#6b7280;font-size:12px;text-align:center;">
              <div>Need help? Reply to this email or visit our support page.</div>
              <div style="margin-top:6px;color:#9ca3af;">© ${new Date().getFullYear()} Your Company</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
              </html>`
    });

    const otpObj = {
      otp: otp,
      email: email
    };
    await OTPModel.create(otpObj);

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email",
      data: null
    });

  } catch (error) {
    console.error("Reset OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send new verification code. Please try again later.",
      data: null
    });
  }
};

export const forgetPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address to reset password",
        data: null
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
        data: null
      });
    }

    const token = jwt.sign(
      { _id: user._id, email: email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "5m" }
    );

    const resetLink = `http://localhost:5173/change-password?token=${token}`;

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
      subject: "Password Reset Request",
      html: `<p>You requested to reset your password. Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 5 minutes.</p>
             <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>`
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email. Please check your inbox.",
      data: null
    });

  } catch (error) {
    console.error("Forget password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email. Please try again later.",
      data: null
    });
  }
};

export const changePasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both reset token and new password",
        data: null
      });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new password reset link.",
        data: null
      });
    }

    if (!decodedToken.email || !decodedToken._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token data. Please request a new password reset link.",
        data: null
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(decodedToken._id, { password: hashPassword });

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password.",
      data: null
    });

  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again later.",
      data: null
    });
  }
};