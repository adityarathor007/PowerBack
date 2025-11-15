import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserFeeder } from "../api/api";
import { updateFeederStatus } from "../api/api";
import { Edit } from "lucide-react";

export default function StaffDashboard() {
  const { user } = useContext(AuthContext);

  const [feeders, setFeeders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Update modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedFeeder, setSelectedFeeder] = useState(null);
  const [status, setStatus] = useState("Working");
  const [remarks, setRemarks] = useState("");
  const [expectedRestore, setExpectedRestore] = useState("");

  const [message, setMessage] = useState("");

  // Fetch assigned feeders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUserFeeder(); // same API for staff
        setFeeders(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (feeder) => {
    setSelectedFeeder(feeder);
    setStatus(feeder.status);
    setRemarks("");
    setExpectedRestore(feeder.expected_restore || "");
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateFeederStatus({
        feeder_id: selectedFeeder.id,
        status,
        remarks,
        expected_restore: expectedRestore || null
      });

      // Update UI instantly
      const updated = feeders.map((f) =>
        f.id === selectedFeeder.id
          ? { ...f, status, expected_restore: expectedRestore }
          : f
      );
      setFeeders(updated);

      setMessage("Status updated successfully!");
      setShowModal(false);
    } catch (err) {
      console.log(err);
      setMessage("Failed to update feeder status.");
    }
  };

  if (loading) return <div className="p-6">Loading assigned feeders...</div>;

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-2 text-blue-700">
        Welcome, {user?.name} (Staff)
      </h1>
      <p className="text-gray-600 mb-6">
        Update the status of feeders assigned to you.
      </p>

      {message && (
        <p className="text-green-600 font-semibold mb-4">{message}</p>
      )}

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Area</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Expected Restore</th>
              <th className="border p-2">Update</th>
            </tr>
          </thead>
          <tbody>
            {feeders.map((f) => (
              <tr key={f.id} className="text-center hover:bg-gray-50">
                <td className="border p-2">{f.name}</td>
                <td className="border p-2">{f.area}</td>

                <td
                  className={`border p-2 font-semibold ${
                    f.status === "Working"
                      ? "text-green-600"
                      : f.status === "Outage"
                      ? "text-red-600"
                      : "text-orange-500"
                  }`}
                >
                  {f.status}
                </td>

                <td className="border p-2">
                  {f.expected_restore
                    ? new Date(f.expected_restore).toLocaleString()
                    : "—"}
                </td>

                <td className="border p-2">
                  <button
                    onClick={() => openModal(f)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= UPDATE STATUS MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative">

            <button
              className="absolute top-2 right-2 text-red-500 text-xl"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>

            <h2 className="text-xl font-bold mb-4">
              Update: {selectedFeeder.name}
            </h2>

            <form onSubmit={handleUpdate}>
              <label className="font-semibold">Status</label>
              <select
                className="border p-2 w-full mb-3 rounded"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Working">Working</option>
                <option value="Outage">Outage</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <label className="font-semibold">Remarks (optional)</label>
              <input
                type="text"
                className="border p-2 w-full mb-3 rounded"
                placeholder="Reason or notes"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <label className="font-semibold">Expected Restore (optional)</label>
              <input
                type="datetime-local"
                className="border p-2 w-full mb-4 rounded"
                value={expectedRestore || ""}
                onChange={(e) => setExpectedRestore(e.target.value)}
              />

              <button
                type="submit"
                className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
              >
                Update Status
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
