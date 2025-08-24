import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

API.interceptors.request.use((req) => {
    let accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
        accessToken = localStorage.getItem("accessToken");
    }
    if (accessToken) {
        req.headers.Authorization = `Bearer ${accessToken}`;
    }
    return req;
});

const getNewAccessToken = async () => {
    try {
        const { data } = await API.post("/api/auth/refresh-token");
        if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            return data.accessToken;
        }
        return null;
    } catch (error) {
        return null;
    }
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response &&
            error.response.status === 401 &&
            error.response.data.message === "accessToken expired" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            const newAccessToken = await getNewAccessToken();
            if (newAccessToken) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

export default API;