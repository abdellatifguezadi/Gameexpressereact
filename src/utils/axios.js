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
        // Check if the response contains an authentication error message despite a 200 status
        if (response.data && (
            response.data.message === "Please login" || 
            response.data.message === "Unauthenticated" ||
            response.data.message === "Token has expired"
        )) {
            // Redirect to login page or force refresh token
            console.error('Authentication error:', response.data.message);
            
            // For security, clear token on authentication errors
            localStorage.removeItem('token');
            
            // Return a rejected promise to trigger the catch block
            return Promise.reject({
                response: {
                    status: 401,
                    data: { message: response.data.message }
                }
            });
        }
        return response;
    },
    (error) => {
        // Handle Unauthorized errors (token expired, etc.)
        if (error.response && (error.response.status === 401 || error.response.status === 419)) {
            console.error('Unauthorized: Token may be invalid or expired');
            
            // Clear token and user data on authentication errors
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page
            // We don't want to actually redirect from within an interceptor as that would 
            // be abrupt. Instead, let the components handle the redirect with proper UX.
            if (window.location.pathname !== '/login') {
                // Store the current URL to redirect back after login
                localStorage.setItem('redirectAfterLogin', window.location.pathname);
            }
        }
        return Promise.reject(error);
    }
);

export default instance; 