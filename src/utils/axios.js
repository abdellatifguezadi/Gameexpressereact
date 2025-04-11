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
        if (error.response) {
            // Gérer les erreurs spécifiques
            switch (error.response.status) {
                case 401:
                    // Rediriger vers la page de connexion si non authentifié
                    window.location.href = '/login';
                    break;
                case 403:
                    // Rediriger vers la page d'accès refusé
                    window.location.href = '/403';
                    break;
                case 404:
                    // Rediriger vers la page 404
                    window.location.href = '/404';
                    break;
                default:
                    console.error('Erreur API:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default instance; 