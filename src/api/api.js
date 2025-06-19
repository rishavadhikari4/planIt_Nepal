import axios from "axios";

const API = axios.create({
    // baseURL: "http://192.168.1.73:5000",
    // baseURL: "http://localhost:5000",
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

API.interceptors.request.use((req) => {
    let token = sessionStorage.getItem("token");

    if(!token){
        token = localStorage.getItem("token");
    }
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;