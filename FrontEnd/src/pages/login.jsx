import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

 function Login() {
     const navigate = useNavigate();
     const [formData, setFormData] = useState({ email: "", password: "" });


    const handleSubmit = async(e) => {
        e.preventDefault();
        // console.log("Login payload:", formData);
        try {
            const res = await axios.post("http://localhost:3000/api/login", formData)

        } catch (error) {
            console.error("Error during login:", error.message);
        }
        
    };
    const handleForgetPassword = () => {
        // axios.post("http://localhost:3000/api/forgetpassword", {email:formData.email})
        navigate("/forget-password");
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4">Login</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email"
                        className="border p-2 rounded-lg"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        Login
                    </button>
                </form>

                <div className="flex justify-between items-center mt-3 text-sm">
                    <button
                        type="button"
                        onClick={handleForgetPassword}
                        className="text-blue-600 hover:underline"
                    >
                        Forgot password?
                    </button>

                    <div>
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-blue-600 hover:underline"
                        >
                            Create an account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Login;