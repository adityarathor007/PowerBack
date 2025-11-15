import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export API
export default API;

// APIs

/* ---------------- Auth APIs ---------------- */
export const getCurrentUser = () => API.get("/users/me");
export const loginUser = (data) => API.post("/users/login", data);
export const registerUser = (data) => API.post("/users/register", data);

/* ---------------- Feeder APIs ---------------- */
export const getUserFeeder = () => API.get("/feeders");
export const getAllFeeders = () => API.get("/feeders");
export const addNewFeeder = (data) => API.post("/feeders", data);
export const deleteFeeder = (data) => API.delete("/feeders/delete", { data });


/* ---------------- Staff Assignment ---------------- */
export const getAllStaff = () => API.get("/users/staff");
export const assignStaffToFeeder = (data) => API.patch("/feeders/assign", data);


/* ---------------- Status Update (Staff) ---------------- */
export const updateFeederStatus = (data) =>
  API.patch("/feeders/update-status", data);
