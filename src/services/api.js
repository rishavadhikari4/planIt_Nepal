import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

API.interceptors.request.use((req) => {
    let accessToken = sessionStorage.getItem("accessToken");

    if(!accessToken){
        accessToken = localStorage.getItem("accessToken");
    }
    if (accessToken) {
        req.headers.Authorization = `Bearer ${accessToken}`;
    }
    return req;
});

export default API;