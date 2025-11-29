import { useState } from "react";


 function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Login payload:", formData);
        alert("Login form submitted (integration pending)");
    };


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
            </div>
        </div>
    );
}
export default Login;