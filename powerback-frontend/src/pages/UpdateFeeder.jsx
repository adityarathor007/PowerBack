export default function UpdateFeeder() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Update Feeder Status</h2>
      <form className="space-y-4 max-w-md">
        <div>
          <label className="block font-semibold mb-1">Feeder Name</label>
          <input
            type="text"
            placeholder="Enter feeder name"
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Status</label>
          <select className="border p-2 w-full rounded">
            <option>Working</option>
            <option>Outage</option>
            <option>Maintenance</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Expected Restore Time</label>
          <input
            type="datetime-local"
            className="border p-2 w-full rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update
        </button>
      </form>
    </div>
  );
}
