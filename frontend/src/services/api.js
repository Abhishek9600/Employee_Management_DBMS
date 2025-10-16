import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with better configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor - Log all requests
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Enhanced error messages
    if (error.response) {
      // Server responded with error status
      const serverError = error.response.data?.error || error.response.data?.message || 'Server error';
      error.userMessage = serverError;
    } else if (error.request) {
      // Request made but no response received
      error.userMessage = 'No response from server. Please check if the backend is running.';
    } else {
      // Something else happened
      error.userMessage = error.message || 'Unknown error occurred';
    }
    
    return Promise.reject(error);
  }
);

// Test API connection
export const testAPI = async () => {
  try {
    const response = await api.get('/health');
    console.log('API Health Check:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    throw error;
  }
};

// Test Database connection through API
export const testDB = async () => {
  try {
    const response = await api.get('/test-db');
    console.log('Database Connection Test:', response.data);
    return response.data;
  } catch (error) {
    console.error('Database Connection Test Failed:', error);
    throw error;
  }
};

// Employee API functions with enhanced error handling
export const employeeAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/employees');
      return response;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },
  
  create: async (employee) => {
    try {
      const response = await api.post('/employees', employee);
      return response;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },
  
  update: async (id, employee) => {
    try {
      const response = await api.put(`/employees/${id}`, employee);
      return response;
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  }
};

// Department API functions
export const departmentAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/departments');
      return response;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },
};

export default api;