import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserFeeder } from "../api/api";

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [feeder, setFeeder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchFeeder = async () => {
      try {
        const res = await getUserFeeder();
        setFeeder(res.data);
      } catch (err) {
        setMessage("Error loading feeder information.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeeder();
  }, []);

  if (loading)
    return <div className="p-6 text-center text-gray-600">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">
        Welcome, {user?.name} 👋
      </h1>
      <p className="text-gray-600 mb-6">
        Here is the current status of your assigned feeder.
      </p>

      {/* If user is not mapped */}
      {!feeder || feeder.message ? (
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <p className="text-yellow-700 font-semibold">
            You are not mapped to any feeder yet.
          </p>
        </div>
      ) : (
        // Feeder Info Box
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-blue-600 mb-2">
            ⚡ {feeder.name}
          </h2>

          <p className="text-gray-700">
            <strong>Area:</strong> {feeder.area}
          </p>

          <p className="text-gray-700">
            <strong>Status:</strong>{" "}
            <span
              className={`${
                feeder.status === "Working"
                  ? "text-green-600"
                  : feeder.status === "Outage"
                  ? "text-red-600"
                  : "text-orange-500"
              } font-semibold`}
            >
              {feeder.status}
            </span>
          </p>

          {feeder.expected_restore && (
            <p className="text-gray-700">
              <strong>Expected Restore:</strong>{" "}
              {new Date(feeder.expected_restore).toLocaleString()}
            </p>
          )}

          <p className="text-gray-700 mt-4 italic text-sm">
            Data updates every time your assigned staff changes the status.
          </p>
        </div>
      )}
    </div>
  );
}
