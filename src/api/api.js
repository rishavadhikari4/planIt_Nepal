import axios from "axios";

const API = axios.create({
    baseURL: "http://192.168.1.73:5000",
    // headers: {
    //     "Content-Type": "application/json"
    // }
});

// API.interceptors.request.use((req) => {
//     const token = sessionStorage.getItem("token");
//     if (token) {
//         req.headers.Authorization = `Bearer ${token}`;
//     }
//     return req;
// });

export default API;