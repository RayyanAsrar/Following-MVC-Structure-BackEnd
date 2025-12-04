import axios from "axios";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

function ChangePassword() {
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams()

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");

        // Basic validation
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

  
        console.log("Change password payload:", { 
            newPassword: formData.newPassword 
        });
       
        const token = searchParams.get("token");
    //    console.log(token);
    try {
        const res = await axios.post("http://localhost:3000/api/changepassword", {
            newPassword: formData.newPassword,
            token: token
        });
        console.log("Change password response:", res.data);
    } catch (err) {
        setError(err.response?.data?.message || "Failed to change password");
        console.error("Change password error:", err);
    }
        console.log("Change password response:", res.data);
        // console.log(searchParams);
        

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-2">Change Password</h2>
                <p className="text-gray-600 mb-4 text-sm">
                    Enter your new password
                </p>
                
                <div className="flex flex-col gap-3">
                    <input
                        type="password"
                        placeholder="New Password"
                        className="border p-2 rounded-lg"
                        value={formData.newPassword}
                        onChange={(e) => 
                            setFormData({ ...formData, newPassword: e.target.value })
                        }
                    />
                    
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="border p-2 rounded-lg"
                        value={formData.confirmPassword}
                        onChange={(e) => 
                            setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                    />

                    {error && (
                        <p className="text-red-600 text-sm">
                            {error}
                        </p>
                    )}
                    
                    <button 
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white py-2 rounded-lg mt-2"
                    >
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;