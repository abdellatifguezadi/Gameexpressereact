import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add a request interceptor to include the token on every request
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle common errors
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle Unauthorized errors (token expired, etc.)
        if (error.response && error.response.status === 401) {
            // You can redirect to login or refresh token here
            console.error('Unauthorized: Token may be invalid or expired');
            // Optional: Clear token and user data
            // localStorage.removeItem('token');
            // localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default instance; 