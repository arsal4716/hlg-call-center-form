import axios from 'axios';

// Force HTTP protocol - get the current origin
const getBaseURL = () => {
  // In production, use the same origin but ensure it's HTTP
  if (import.meta.env.PROD) {
    const origin = window.location.origin;
    // Ensure we're using HTTP
    const httpOrigin = origin.replace('https://', 'http://');
    return `${httpOrigin}/api`;
  }
  // In development, use the proxy
  return '/api';
};

const API_BASE_URL = getBaseURL();

console.log('📍 API Base URL:', API_BASE_URL);
console.log('📍 Current Origin:', window.location.origin);
console.log('📍 Environment:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Force HTTP if we're on HTTP
    if (config.url?.startsWith('http://') || config.baseURL?.startsWith('http://')) {
      console.log('✅ Using HTTP connection');
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Response from ${response.config.url}:`, response.data);
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    console.error('❌ API Error:', message);
    console.error('Error Details:', error.response?.data);
    return Promise.reject(error);
  }
);

// Lead API calls
export const leadAPI = {
  createLead: (leadData) => {
    console.log('📝 Creating Lead:', leadData);
    return api.post('/leads', leadData);
  },
  
  getLeads: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.vendor_code) queryParams.append('vendor_code', params.vendor_code);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    console.log('🔍 Fetching leads with params:', Object.fromEntries(queryParams));
    return api.get(`/leads?${queryParams.toString()}`);
  },
};

export default api;