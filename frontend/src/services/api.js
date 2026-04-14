import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { "Content-Type": "application/json" },
});

// =====================
// TOKEN SETUP
// =====================
const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// =====================
// ERROR HANDLING
// =====================
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// =====================
// CARS (WORKING)
// =====================
export const getCars = () => api.get("/cars");
export const getCar = (id) => api.get(`/cars/${id}`);
// =====================
// AUTH (WORKING)
// =====================
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);

// =====================
// BOOKINGS (WORKING)
// =====================
export const createBooking = (data) => api.post("/bookings", data);