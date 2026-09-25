import axios from "axios";

const services = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        "Content-Type": 'application/json'
    },
});

services.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default services