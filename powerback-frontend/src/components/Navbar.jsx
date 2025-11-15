import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  if (!user) {
    return (
      <nav className="p-4 bg-blue-600 text-white flex justify-between">
        <h1 className="font-bold text-xl">⚡ PowerBack</h1>
        <Link to="/">Login</Link>
      </nav>
    );
  }

  const dashboardPath =
    user.role === "admin"
      ? "/admin-dashboard"
      : user.role === "staff"
      ? "/staff-dashboard"
      : "/user-dashboard";

  return (
    <nav className="p-4 bg-blue-600 text-white flex justify-between">
      <h1 className="font-bold text-xl">⚡ PowerBack</h1>

      <div className="flex items-center space-x-6">
        <Link to={dashboardPath}>Dashboard</Link>
        <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded">
          Logout
        </button>
      </div>
    </nav>
  );
}
