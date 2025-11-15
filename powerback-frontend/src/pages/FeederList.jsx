import { Link } from "react-router-dom";

const feeders = [
  { id: 1, name: "11KV Indiranagar", status: "Working" },
  { id: 2, name: "11KV JP Nagar", status: "Outage" },
];

export default function FeederList() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Feeders</h2>
      <ul className="space-y-3">
        {feeders.map((f) => (
          <li
            key={f.id}
            className="p-4 bg-white shadow rounded flex justify-between"
          >
            <span>
              {f.name} -{" "}
              <span
                className={
                  f.status === "Outage" ? "text-red-500" : "text-green-600"
                }
              >
                {f.status}
              </span>
            </span>
            <Link to={`/feeders/${f.id}`} className="text-blue-600 underline">
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
