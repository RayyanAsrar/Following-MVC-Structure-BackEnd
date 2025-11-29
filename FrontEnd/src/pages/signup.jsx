import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobileNumber: "",
        password: "",
    });


    const handleSubmit = async(e) => {
        e.preventDefault();
        console.log("Signup payload:", formData);
        try {
           await axios.post("http://localhost:3000/api/signup", formData)
              navigate("/otp-verify-pg",{state:{email:formData.email}});

        } catch (error) {
            console.error("Error during signup:", error.message);
        }
        // alert("Signup form submitted (integration pending)");
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4">Signup</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Name"
                        className="border p-2 rounded-lg"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="border p-2 rounded-lg"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Mobile Number"
                        className="border p-2 rounded-lg"
                        value={formData.mobileNumber}
                        onChange={(e) =>
                            setFormData({ ...formData, mobileNumber: e.target.value })
                        }
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border p-2 rounded-lg"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                    />
                    <button className="bg-blue-600 text-white py-2 rounded-lg mt-2">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}
export default Signup;