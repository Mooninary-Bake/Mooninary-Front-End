import axios from 'axios';
import { setupMockApi } from './mock-api';

// Create an Axios instance configured for the Spring Boot backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // You can also add credentials, timeouts, etc. here
  // withCredentials: true,
});

// Optional: Add request/response interceptors for token handling or global error handling
api.interceptors.request.use(
  (config) => {
    // Modify config before request is sent (e.g., adding Auth headers)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors here
    return Promise.reject(error);
  }
);

// Initialize mock API for development if true backend isn't ready
// Change this condition later when the real Spring Boot backend is connected.
if (import.meta.env.MODE === 'development') {
  setupMockApi(api);
}

export default api;
