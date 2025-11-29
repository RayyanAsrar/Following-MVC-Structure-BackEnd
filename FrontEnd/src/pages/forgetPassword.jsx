import { useState } from "react";

function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Forgot password payload:", { email });
        // Add your API call here
        // After success: navigate("/otp-verify", { state: { email } })
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-2">Forgot Password</h2>
                <p className="text-gray-600 mb-4 text-sm">
                    Enter your email to receive an OTP
                </p>
                
                <div className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email"
                        className="border p-2 rounded-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <button 
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white py-2 rounded-lg mt-2"
                    >
                        Send OTP
                    </button>
                </div>

                <p className="text-center mt-4 text-sm text-gray-600">
                    Remember your password?{" "}
                    <span className="text-blue-600 cursor-pointer hover:underline">
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;