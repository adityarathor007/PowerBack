import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAllFeeders, addNewFeeder, deleteFeeder, getAllStaff, assignStaffToFeeder } from "../api/api";
import { Trash2, UserPlus } from "lucide-react";


export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  const [feeders, setFeeders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Feeder Form State
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("Working");
  const [message, setMessage] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFeeder, setSelectedFeeder] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  // Fetch all feeders
  useEffect(() => {
    const fetchFeeders = async () => {
      try {
        const res = await getAllFeeders();
        setFeeders(res.data);
      } catch (err) {
        // console.log("Error fetching feeders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeders();
  }, []);

  // Add new feeder submit
  const handleAddFeeder = async (e) => {
    e.preventDefault();

    try {
      const res = await addNewFeeder({
        name,
        area,
        status,
        expected_restore: null,
      });

      setMessage("Feeder added successfully!");

      // refresh list
      setFeeders([...feeders, { name, area, status }]);

      // reset
      setName("");
      setArea("");
      setStatus("Working");
      setShowForm(false);

    } catch (err) {
      console.log("Error adding feeder:", err);
      setMessage("Failed to add feeder.");
    }
  };

  if (loading) return <div className="p-6">Loading feeders...</div>;

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this feeder?")) return;

    try {
        await deleteFeeder({ feeder_id: id });

        // Remove from frontend list instantly
        setFeeders(feeders.filter((f) => f.id !== id));

        setMessage("Feeder deleted successfully.");
        setTimeout(() => setMessage(""), 2000);
    } catch (err) {
        console.log("Delete error:", err);
        setMessage("Failed to delete feeder.");
    }
 };

    const openAssignModal = async (feeder) => {
        setSelectedFeeder(feeder);
        setShowAssignModal(true);

        // load staff list
        try {
            const res = await getAllStaff();
            // console.log("Fetched Staff Data: ",res)
            setStaffList(res.data);
        } catch (err) {
            console.log("Error fetching staff", err);
        }
    };

    const handleAssignStaff = async (e) => {
        e.preventDefault();

        try {
            await assignStaffToFeeder({
            feeder_id: selectedFeeder.id,
            staff_id: selectedStaff
            });

            setMessage("Staff assigned successfully!");

            // update feeder list in UI
            const updated = feeders.map((f) =>
            f.id === selectedFeeder.id
                ? { ...f, staff: staffList.find(s => s.id == selectedStaff) }
                : f
            );

            setFeeders(updated);

            setShowAssignModal(false);
        } catch (err) {
            console.log("Assign error:", err);
            setMessage("Failed to assign staff.");
        }
    };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">
        Welcome, {user?.name} (Admin)
      </h1>

      <p className="text-gray-600 mb-6">
        Manage all feeders and assign staff.
      </p>

      {/* Success Message */}
      {message && (
        <p className="text-green-600 font-semibold mb-4">{message}</p>
      )}


      {/* Feeder List Table */}
      <h2 className="text-2xl font-bold mt-6 mb-3">All Feeders</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-200">
            <tr>
              {/* <th className="border p-2">ID</th> */}
              <th className="border p-2">Name</th>
              <th className="border p-2">Area</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Staff Assigned</th>
              <th className="border p-2">Assign Staff</th>
              <th className="border p-2">Remove Feeder</th>
            </tr>
          </thead>
          <tbody>
            {feeders.map((f) => (
              <tr key={f.id} className="text-center">
                {/* <td className="border p-2">{f.id}</td> */}
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
                {/* Assigned staff */}
                <td className="border p-2">
                    {f.staff
                    ? f.staff.name
                    : <span className="text-gray-500 italic">Not assigned</span>}
                </td>

                {/* Assign Icon */}
                <td className="border p-2">
                    <button
                    onClick={() => openAssignModal(f)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Assign staff"
                    >
                    <UserPlus size={20} />
                    </button>
                </td>
                <td className="border p-2">
                    <button
                    onClick={() => handleDelete(f.id)}
                    className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================== ADD NEW FEEDER BUTTON ================== */}
      <div className="flex justify-center mt-6">
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        ➕ Add New Feeder
      </button>
    </div>

    {/* ===================== ADD FEEDER MODAL ===================== */}
    {showForm && (
      <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative">
          <button
            className="absolute top-2 right-2 text-red-500 text-xl"
            onClick={() => setShowForm(false)}
          >
            ✖
          </button>

          <h2 className="text-xl font-bold mb-3">Add New Feeder</h2>

          <form onSubmit={handleAddFeeder}>
            <input
              type="text"
              placeholder="Feeder Name"
              className="border p-2 w-full mb-3 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Area"
              className="border p-2 w-full mb-3 rounded"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />

            <label className="font-semibold">Status</label>
            <select
              className="border p-2 w-full mb-4 rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Working">Working</option>
              <option value="Outage">Outage</option>
              <option value="Maintenance">Maintenance</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
            >
              Add Feeder
            </button>
          </form>
        </div>
      </div>
    )}

    {/* ===================== ASSIGN STAFF MODAL ===================== */}
    {showAssignModal && (
      <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative">
          <button
            className="absolute top-2 right-2 text-red-500 text-xl"
            onClick={() => setShowAssignModal(false)}
          >
            ✖
          </button>

          <h2 className="text-xl font-bold mb-3">
            Assign Staff to: {selectedFeeder.name}
          </h2>

          <form onSubmit={handleAssignStaff}>
            <label className="font-semibold">Select Staff</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="border p-2 w-full rounded mb-4"
              required
            >
              <option value="">Choose Staff</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.phone})
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
            >
              Assign Staff
            </button>
          </form>
        </div>
      </div>
    )}
    </div>
  );
}
