import { Link } from "react-router-dom";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user?.phone || "User"} 👋
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/feeders"
          className="p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200"
        >
          View Feeders
        </Link>
        <Link
          to="/feeders/1/update"
          className="p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200"
        >
          Update Outage Status
        </Link>
      </div>
    </div>
  );
}
