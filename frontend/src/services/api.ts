import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // Ajuste conforme a URL do backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
