//i have added comments to the code using co pilot for better understanding********

// Models and helpers
import { UserModel } from "../models/userSchema.js"; // User mongoose model
import bcrypt from "bcryptjs"; // for hashing passwords
import jwt from "jsonwebtoken"; // for issuing auth tokens
import dotenv from "dotenv"; // load environment variables
import nodemailer from "nodemailer"; // to send emails (OTP / verification)
import { v4 as uuidv4 } from 'uuid'; // used to create random OTPs in some places
import OTPModel from "../models/otp.js"; // separate OTP model to store OTP records

// Load .env into process.env
dotenv.config();

/*
  signupController
  - Handles user registration
  - Validates input, hashes password, stores user and sends an OTP email
  - Stores an OTP record in `OTPModel` so verification can be validated later
*/
export const signupController = async (req, res) => {
  try {
    // Extract expected fields from request body
    const { name, email, mobileNumber, password } = req.body;

    // Basic validation: ensure required fields are present
    if (!name || !email || !mobileNumber || !password) {
      // Return JSON response early when validation fails
      return res.json({
        message: "All fields are required",
        status: "failed",
        data: null
      });
    }

    // Check if a user already exists with the same email
    // This prevents duplicate registrations for the same email
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.json({
        message: "User already exists with this email",
        status: "failed",
        data: null
      });
    }

    // Hash the plain-text password before saving it to the database
    // bcrypt.hash(password, saltRounds) returns a promise
    const hashPassword = await bcrypt.hash(password, 10);

    // Build the user body that will be saved to DB
    // We replace the plain password with the hashed version
    const body = {
      ...req.body,
      password: hashPassword
    };

    // Create the user document in MongoDB
    await UserModel.create(body);

    // Respond early that the user was created successfully
    // Note: we still attempt to send the OTP email after this response
    res.json({
      message: "User signed up successfully",
      status: "success",
      data: req.body
    });

    // --- Generate OTP and send welcome/verification email ---
    // We create a short OTP using uuidv4 and slice it to 6 chars.
    // In production you may prefer a numeric OTP or a securely-generated token.
    const otp = uuidv4().slice(0, 6);

    try {
      // Create a transporter object using SMTP (Gmail in this example)
      // Make sure environment variables EMAIL and APP_PASS are configured
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

      // Send an HTML email that shows the OTP to the user
      // We include a plain-text fallback in the HTML template for readability
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Welcome to Our Platform!",
        // HTML email body. Keep templates simple for best deliverability.
        html: `<!doctype html>
                <html>
                <head>
                <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Verify your email</title>
  <style>
    /* Minimal inline-friendly styles used below where needed. */
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
                    <!-- Display OTP clearly inside a styled block so email clients render it -->
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

      // Persist OTP into separate OTP collection so verification can be validated later
      // Storing OTPs allows us to mark them as used and check expiry if desired
      const otpObj = {
        otp: otp,
        email: email
      };
      await OTPModel.create(otpObj);

    } catch (error) {
      // If sending the email fails, the user was already created. We return success
      // because account creation succeeded, but note the mail failure for debugging.
      res.json({
        message: "User signed up but failed to send welcome email",
        status: "success",
        data: null
      });
    }

  } catch (error) {
    // Top-level error handling for signupController
    res.json({
      message: error.message || "Error in signup controller",
      status: "failed",
      data: null
    });
  }
};

/*
  loginController
  - Authenticates a user by verifying email and password
  - Returns a signed JWT token on success
*/
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.json({
        message: "Email and password are required",
        status: "failed",
        data: null
      });
    }

    // Find the user by email
    const user = await UserModel.findOne({ email });

    // If user doesn't exist, return an error
    if (!user) {
      return res.json({
        message: "User not found",
        status: "failed",
        data: null
      });
    }

    // Build a body to send back (omit sensitive fields like password)
    const bodytosend = { email: user.email, name: user.name, mobileNumber: user.mobileNumber, _id: user._id };

    // Compare provided password with hashed password stored in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({
        message: "Invalid password",
        status: "failed",
        data: null
      });
    }

    // Sign a JWT token for authenticated sessions
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Respond with the token and user info
    res.json({
      message: "User logged in successfully",
      status: "success",
      data: bodytosend,
      token: token
    });
  } catch (error) {
    // Generic error handler for login
    res.json({
      message: error.message || "something went wrong in login controller",
      status: "failed",
      data: null
    });
  }
};

/*
  verifyOTPController
  - Verifies an OTP that was previously stored in the OTP collection
  - Marks the OTP as used and sets the user's `isVerified` to true
*/
export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.json({
        message: "Email and OTP are required",
        status: "failed",
        data: null
      });
    }

    // Find the most recent unused OTP for this email.
    // Sorting by createdAt descending ensures we check the latest OTP first.
    // (Note: OTPModel should have timestamps enabled to use createdAt.)
    const isExist = await OTPModel.findOne({ email, isUsed: false }).sort({ createdAt: -1 });
    console.log(isExist);

    // If no OTP record exists, it's invalid
    if (!isExist) {
      return res.json({
        message: "Invalid OTP",
        status: "failed",
        data: null
      });
    }
    if (isExist.otp !== otp) {
      return res.json({
        message: "Invalid OTP",
        status: "failed",
        data: null
      });
    }
    
    // If an OTP record exists, mark it as used
    // and update the corresponding user as verified
    await OTPModel.findByIdAndUpdate(isExist._id, { isUsed: true });
    await UserModel.findOneAndUpdate({ email }, { isVerified: true });

    // Successful verification response
    res.json({
      message: "OTP verified successfully",
      status: "success",
    });

  } catch (error) {
    // Error handling for OTP verification
    res.json({
      message: error.message || "Error in signup controller",
      status: "failed",
      data: null
    });
  }
};

/*
  resetOTPController
  - Generates a fresh OTP for an existing user and emails it
  - Useful when user requests to resend a verification code
*/
export const resetOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email presence
    if (!email) {
      return res.json({
        message: "Email and OTP are required",
        status: "failed",
        data: null
      });
    }

    // Ensure the user exists before sending an OTP
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({
        message: "User not found",
        status: "failed",
        data: null
      });
    }

    // Create a short OTP and send it via email
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
      subject: "Welcome to Our Platform!",
      html: `<!doctype html>
                <html>
                <head>
                <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Verify your email</title>
  <style>
    /* Minimal inline-friendly styles used below where needed. */
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

    // Save OTP record so user can verify it later
    const otpObj = {
      otp: otp,
      email: email
    };
    await OTPModel.create(otpObj);

    // Respond that the reset OTP was sent
    res.json({
      message: "Reset OTP sent successfully",
      status: "success",
    });
  } catch (error) {
    // Error handling for reset OTP
    res.json({
      message: error.message || "Error in signup controller",
      status: "failed",
      data: null
    });
  }
};