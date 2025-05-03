import api from './axiosConfig';

export default api;

// Auth API
export const login = (role, credentials) => {
  return api.post(`/api/login${role}`, credentials);
};

export const register = (role, userData) => {
  return api.post(`/api/${role}s`, userData);
};

// User API
export const getUser = (role, username) => {
  return api.get(`/api/${role}s/${username}`);
};

export const updateUser = (role, userData) => {
  return api.put(`/api/${role}s`, userData);
};

// Patient Profile API
export const getPatientProfile = (username) => {
  return api.get(`/api/patient-profiles/${username}`);
};

export const createPatientProfile = (profileData) => {
  return api.post('/api/patient-profiles', profileData);
};

export const updatePatientProfile = (profileData) => {
  return api.put('/api/patient-profiles', profileData);
};

// Medicine API
export const searchMedicines = (query) => {
  return api.get('/api/medicines/search', { params: { name: query } });
};

export const getSellerMedicines = (username) => {
  return api.get(`/api/sellers/${username}/medicines`);
}; 