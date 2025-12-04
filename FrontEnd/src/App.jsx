import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/signup"
import  Login  from "./pages/login";
import OTPVerification from "./pages/otpverificationpage";
import ChangePassword from "./pages/changepassword";
import ForgotPassword from "./pages/forgetPassword";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp-verify-pg" element={<OTPVerification />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forget-password" element={<ForgotPassword/>}/>
      </Routes>
    </BrowserRouter>
  );
}