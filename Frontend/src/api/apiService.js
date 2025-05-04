import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
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

// Authentication services
export const authService = {
  // Register a new patient
  registerPatient: (data) => {
    return apiClient.post('/patients', data);
  },
  // Register a new doctor
  registerDoctor: (data) => {
    return apiClient.post('/doctors', data);
  },
  // Register a new seller
  registerSeller: (data) => {
    console.log('apiService.registerSeller data:', data);
    return apiClient.post('/sellers', data)
      .catch(error => {
        console.error('Seller registration error:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
        throw error;
      });
  },
  // Login a patient
  loginPatient: (data) => {
    return apiClient.post('/loginpatient', data);
  },
  // Login a doctor
  loginDoctor: (data) => {
    return apiClient.post('/logindoctor', data);
  },
  // Login a seller
  loginSeller: (data) => {
    return apiClient.post('/loginseller', data);
  }
};

// Patient services
export const patientService = {
  // Get patient profile
  getPatient: (username) => {
    return apiClient.get(`/patients/${username}`);
  },
  // Update patient
  updatePatient: (data) => {
    return apiClient.put('/patients', data);
  },
  // Delete patient
  deletePatient: (username) => {
    return apiClient.delete(`/patients/${username}`);
  },
  // Get patient medical profile
  getPatientProfile: (username) => {
    return apiClient.get(`/patient-profiles/${username}`);
  },
  // Create patient medical profile
  createPatientProfile: (data) => {
    return apiClient.post('/patient-profiles', data);
  },
  // Update patient medical profile
  updatePatientProfile: (data) => {
    // Format the data to match the exact structure expected by the backend with pointer-style values
    const requestData = {
      username: data.username,
      disease_allergies: data.disease_allergies || null,
      blood_group: data.blood_group || null,
      prescribed_medicine: data.prescribed_medicine || null
    };
    
    // Log the request for debugging
    console.log('Sending update request:', requestData);
    
    // Use axios instead of fetch for consistency
    return apiClient.put('/patient-profiles', requestData)
      .catch(error => {
        console.error('Error updating patient profile:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
        throw error;
      });
  }
};

// Doctor services
export const doctorService = {
  // Get doctor profile
  getDoctor: (username) => {
    return apiClient.get(`/doctors/${username}`);
  },
  // Update doctor
  updateDoctor: (data) => {
    return apiClient.put('/doctors', data);
  },
  // Delete doctor
  deleteDoctor: (username) => {
    return apiClient.delete(`/doctors/${username}`);
  },
  // Get doctors by specialization
  getDoctorsBySpecialization: (specialization, pageId, pageSize) => {
    return apiClient.get('/doctors/search', {
      params: {
        specialization,
        page_id: pageId,
        page_size: pageSize
      }
    });
  }
};

// Seller services
export const sellerService = {
  // Get seller profile
  getSeller: (username) => {
    return apiClient.get(`/sellers/${username}`);
  },
  // Update seller
  updateSeller: (data) => {
    return apiClient.put('/sellers', data);
  },
  // Delete seller
  deleteSeller: (username) => {
    return apiClient.delete(`/sellers/${username}`);
  },
  // Get sellers by store name
  getSellersByStoreName: (storeName, pageId, pageSize) => {
    return apiClient.get('/sellers/search', {
      params: {
        store_name: storeName,
        page_id: pageId,
        page_size: pageSize
      }
    });
  },
  // Get seller's medicines
  getSellerMedicines: (username) => {
    console.log(`Fetching medicines for seller: ${username}`);
    return apiClient.get(`/sellers/${username}/medicines`)
      .catch(error => {
        console.error('Error fetching seller medicines:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
        throw error;
      });
  },
  // Create new medicine
  createMedicine: (medicineData) => {
    console.log('Creating medicine with data:', medicineData);
    return apiClient.post('/medicines', medicineData)
      .catch(error => {
        console.error('Error creating medicine:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
        throw error;
      });
  },
  // Update existing medicine
  updateMedicine: (medicineData) => {
    console.log('Updating medicine with data:', medicineData);
    return apiClient.put('/medicines', medicineData)
      .catch(error => {
        console.error('Error updating medicine:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
        throw error;
      });
  },
  // Delete medicine
  deleteMedicine: (id) => {
    console.log(`Deleting medicine with ID: ${id}`);
    return apiClient.delete(`/medicines/${id}`)
      .catch(error => {
        console.error('Error deleting medicine:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
        throw error;
      });
  },
  // Get medicine by ID
  getMedicine: (id) => {
    return apiClient.get(`/medicines/${id}`)
      .catch(error => {
        console.error(`Error fetching medicine with ID ${id}:`, error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
        throw error;
      });
  }
};

export default apiClient; 