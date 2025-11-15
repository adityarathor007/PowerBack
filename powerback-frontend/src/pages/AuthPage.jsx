import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { loginUser, registerUser, getCurrentUser } from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  // handle login
const handleLogin = async (e) => {
    e.preventDefault();
    // console.log("Login button clicked")

    try {
    const res = await loginUser({ phone, password });
    console.log(res)

    localStorage.setItem("token", res.data.access_token);

    const userRes = await getCurrentUser();

    setUser(userRes.data);

    if (userRes.data.role === "admin") navigate("/admin-dashboard");
    else if (userRes.data.role === "staff") navigate("/staff-dashboard");
    else navigate("/user-dashboard");
  } catch (err) {
    console.log("Login error:", err);
    setMessage("Invalid phone or password");
  }
};


  // handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ name, phone, password, role });
      setMessage("Registration successful! You can now log in.");
      setIsLogin(true);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white w-96 rounded-xl shadow-lg p-6">
        {/* Header Tabs */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-2 font-semibold ${
              isLogin
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-2 font-semibold ${
              !isLogin
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Section */}
        {message && (
          <p
            className={`text-center mb-3 ${
              message.includes("success")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-2 w-full mb-3 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full mb-4 rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        ) : (
          // ✅ REGISTER FORM
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full mb-3 rounded"
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-2 w-full mb-3 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full mb-3 rounded"
              required
            />
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-600">
                Register as
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border p-2 w-full rounded"
              >
                <option value="user">User</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
