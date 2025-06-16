import axios from "axios";

const API = axios.create({
    // baseURL: "http://192.168.1.73:5000",
    // baseURL: "http://localhost:5000",
    baseURL:"https://wedding-planner-backend-drr8.onrender.com",
    headers: {
        "Content-Type": "application/json"
    }
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;