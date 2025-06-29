import axios from "axios";

const API = axios.create({
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