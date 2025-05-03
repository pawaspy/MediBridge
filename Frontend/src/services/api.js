import axios from 'axios';

const API_URL = 'http://localhost:3000/api';  // Updated to match your backend URL

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header to requests if token exists
api.interceptors.request.use(
  (config) => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData?.accessToken) {
      config.headers.Authorization = `Bearer ${userData.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to token expiration
    if (error.response && error.response.status === 401 && 
        error.response.data && 
        error.response.data.error === 'token has expired') {
      
      // Clear user data and redirect to login
      localStorage.removeItem('userData');
      
      // Redirect to login page - we need to use window.location here
      // since we don't have access to useNavigate outside of components
      window.location.href = '/login?expired=true';
    }
    
    return Promise.reject(error);
  }
);

// Check if token is expired
export const isTokenExpired = () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  if (!userData.accessToken || !userData.access_token_expires_at) {
    return true;
  }
  
  const expiryTime = new Date(userData.access_token_expires_at).getTime();
  const currentTime = new Date().getTime();
  
  return currentTime >= expiryTime;
};

// Authentication APIs
export const registerPatient = async (patientData) => {
  try {
    const response = await api.post('/patients', patientData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error?.message || 'Failed to register patient';
  }
};

export const registerDoctor = async (doctorData) => {
  try {
    const response = await api.post('/doctors', doctorData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error?.message || 'Failed to register doctor';
  }
};

export const registerSeller = async (sellerData) => {
  try {
    const response = await api.post('/sellers', sellerData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error?.message || 'Failed to register seller';
  }
};

export const loginPatient = async (credentials) => {
  try {
    const response = await api.post('/loginpatient', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error?.message || 'Failed to login';
  }
};

export const loginDoctor = async (credentials) => {
  try {
    const response = await api.post('/logindoctor', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error?.message || 'Failed to login';
  }
};

export const loginSeller = async (credentials) => {
  try {
    const response = await api.post('/loginseller', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error?.message || 'Failed to login';
  }
};

// Cart APIs
export const getCartItems = async () => {
  try {
    const response = await api.get('/cart', { timeout: 8000 });
    return response.data;
  } catch (error) {
    console.error('Cart API error:', error);
    if (error.code === 'ECONNABORTED') {
      throw 'Request timed out. Please try again.';
    }
    throw error.response?.data?.error?.message || 'Failed to get cart items';
  }
};

export const addToCart = async (medicineId, quantity) => {
  try {
    const response = await api.post('/cart', {
      medicine_id: medicineId,
      quantity: quantity
    }, { timeout: 8000 });
    return response.data;
  } catch (error) {
    console.error('Cart API error:', error);
    if (error.code === 'ECONNABORTED') {
      throw 'Request timed out. Please try again.';
    }
    throw error.response?.data?.error?.message || 'Failed to add item to cart';
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await api.put(`/cart/${cartItemId}`, {
      quantity: quantity,
      incremental: false
    }, { timeout: 8000 });
    return response.data;
  } catch (error) {
    console.error('Cart API error:', error);
    if (error.code === 'ECONNABORTED') {
      throw 'Request timed out. Please try again.';
    }
    throw error.response?.data?.error?.message || 'Failed to update cart item';
  }
};

export const removeCartItem = async (cartItemId) => {
  try {
    const response = await api.delete(`/cart/${cartItemId}`, { timeout: 8000 });
    return response.data;
  } catch (error) {
    console.error('Cart API error:', error);
    if (error.code === 'ECONNABORTED') {
      throw 'Request timed out. Please try again.';
    }
    throw error.response?.data?.error?.message || 'Failed to remove cart item';
  }
};

export const incrementCartItem = async (cartItemId) => {
  try {
    const response = await api.patch(`/cart/${cartItemId}/increment`, {}, { timeout: 8000 });
    return response.data;
  } catch (error) {
    console.error('Cart API error:', error);
    if (error.code === 'ECONNABORTED') {
      throw 'Request timed out. Please try again.';
    }
    throw error.response?.data?.error?.message || 'Failed to increment cart item';
  }
};

export const decrementCartItem = async (cartItemId) => {
  try {
    const response = await api.patch(`/cart/${cartItemId}/decrement`, {}, { timeout: 8000 });
    return response.data;
  } catch (error) {
    console.error('Cart API error:', error);
    if (error.code === 'ECONNABORTED') {
      throw 'Request timed out. Please try again.';
    }
    throw error.response?.data?.error?.message || 'Failed to decrement cart item';
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete('/cart', { timeout: 8000 });
    return response.data;
  } catch (error) {
    console.error('Cart API error:', error);
    if (error.code === 'ECONNABORTED') {
      throw 'Request timed out. Please try again.';
    }
    throw error.response?.data?.error?.message || 'Failed to clear cart';
  }
};

export const getCartCount = async () => {
  try {
    const response = await api.get('/cart/count', { timeout: 8000 });
    return response.data;
  } catch (error) {
    console.error('Cart API error:', error);
    if (error.code === 'ECONNABORTED') {
      throw 'Request timed out. Please try again.';
    }
    throw error.response?.data?.error?.message || 'Failed to get cart count';
  }
};

export default api; 