import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/users/auth', credentials),
};

// User APIs
export const userAPI = {
  getAllUsers: () => api.get('/users/getAllUsers'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updatePassword: (id, data) => api.put(`/users/${id}/password`, data),
  getPendingUnlocks: () => api.get('/users/pendingUnlocks'),
  approveUnlock: (data) => api.post('/users/approveUnlock', data),
  claimDailyProfits: () => api.post('/users/claimDailyProfits'),
};

// Transaction APIs
export const transactionAPI = {
  getAllTransactions: () => api.get('/transactions/getAllTransactions'),
  updateTransactionStatus: (id, status) => 
    api.put(`/transactions/updateTransactionStatus/${id}`, { status }),
};

// Gateway APIs
export const gatewayAPI = {
  getAllGateways: () => api.get('/gateways/getAllGateways'),
  createGateway: (formData) => api.post('/gateways/gateway', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteGateway: (id) => api.delete(`/gateways/gateway/${id}`),
};

// ROI APIs
export const roiAPI = {
  getRoi: () => api.get('/roi'),
  setRoi: (data) => api.post('/roi', data),
};

// ApexCoin Rate APIs
export const apexCoinRateAPI = {
  getCurrentRate: () => api.get('/apexcoinRate/currentRate'),
  setRate: (data) => api.post('/apexcoinRate/setRate', data),
  getAllRates: () => api.get('/apexcoinRate/allRates'),
};

export default api;
