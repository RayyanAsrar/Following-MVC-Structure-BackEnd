import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
function OTPVerification() {
    const [otp, setOtp] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const email = location?.state?.email; // In real app, get from navigation state (React Topic)
    // console.log(email);
    useEffect(() => {
        if(!email){
            // setMessage("Email not found. Please signup again.");
            navigate("/");
        }
    })
    const handleVerifyOTP = async(e) => {
        e.preventDefault();
        if(!otp){
            setMessage("Please enter the OTP.");
            return;
        }
        const URL="http://localhost:3000/api/verify-otp";
        try {
            const response = await axios.post(URL, { email, otp });
            console.log(response.data.message);
            
            setMessage("OTP verified successfully!");
            // Proceed to next step after successful verification
        } catch (error) {
            setMessage("OTP verification failed. Please try again.");
            console.error("Error during OTP verification:", error.message);
        }
        
    };

    const handleResendOTP = () => {
        setIsResending(true);
        setMessage("");
        console.log("Resending OTP to:", email);
        // Add your API call here
        // Don't forget to set setIsResending(false) after API call completes
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-2">Verify OTP</h2>
                <p className="text-gray-600 mb-4 text-sm">
                    Enter the OTP sent to {email}
                </p>
                
                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        className="border p-2 rounded-lg text-center text-xl tracking-widest"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                    />
                    
                    <button 
                        onClick={handleVerifyOTP}
                        className="bg-blue-600 text-white py-2 rounded-lg mt-2"
                    >
                        Verify OTP
                    </button>
                </div>

                <button
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="w-full mt-3 text-blue-600 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isResending ? "Resending..." : "Resend OTP"}
                </button>

                {message && (
                    <p className={`mt-3 text-sm text-center ${
                        message.includes("success") ? "text-green-600" : "text-red-600"
                    }`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default OTPVerification;