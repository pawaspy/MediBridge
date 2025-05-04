import { authService } from '../api/apiService';
import axios from 'axios';

// Store user data in localStorage
export const storeUserData = (userData, token) => {
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('token', token);
  localStorage.setItem('isAuthenticated', 'true');
};

// Get user data from localStorage
export const getUserData = () => {
  const data = localStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
};

// Remove user data from localStorage on logout
export const removeUserData = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('registrationFormData');
  sessionStorage.removeItem('navbarLayout');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Setup axios defaults once token is available
export const setupAxiosDefaults = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Register user based on role
export const registerUser = async (formData, role) => {
  try {
    let response;
    switch (role) {
      case 'patient':
        response = await authService.registerPatient({
          username: formData.username,
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          mobile_number: formData.mobile,
          gender: formData.gender,
          age: parseInt(formData.age),
          address: formData.address,
          emergency_contact: formData.emergencyContact
        });
        break;
      case 'doctor':
        response = await authService.registerDoctor({
          username: formData.username,
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          mobile_number: formData.mobile,
          gender: formData.doctorGender,
          age: parseInt(formData.doctorAge),
          specialization: formData.specialization,
          registration_number: formData.registrationNumber,
          hospital_name: formData.hospitalName,
          years_experience: parseInt(formData.experience)
        });
        break;
      case 'seller':
        // Ensure all field names match exactly what the backend expects
        const sellerData = {
          username: formData.username,
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          mobile_number: formData.mobile,
          store_name: formData.storeName,
          gst_number: formData.gstNumber,
          drug_license_number: formData.drugLicenseNumber,
          seller_type: formData.sellerType.toLowerCase(), // Ensure lowercase to match backend constants
          store_address: formData.storeAddress
        };
        
        // Validate seller type
        const validSellerTypes = ['retail', 'wholesale', 'hospital', 'ngo'];
        if (!validSellerTypes.includes(sellerData.seller_type)) {
          throw new Error(`Invalid seller type: ${sellerData.seller_type}. Valid types are: ${validSellerTypes.join(', ')}`);
        }
        
        // Extra client-side validation
        if (!sellerData.username || !sellerData.full_name || !sellerData.email || 
            !sellerData.password || !sellerData.mobile_number || !sellerData.store_name || 
            !sellerData.gst_number || !sellerData.drug_license_number || 
            !sellerData.seller_type || !sellerData.store_address) {
          throw new Error('All fields are required');
        }
        
        // Log the request data for debugging
        console.log('Sending seller registration data:', sellerData);

        try {
          // Use axios consistently
          response = await axios.post('http://localhost:3000/api/sellers', sellerData, {
            headers: { 'Content-Type': 'application/json' }
          });
          console.log('Successful seller registration response:', response);
        } catch (error) {
          console.error('Axios error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          });
          throw error;
        }
        break;
      default:
        throw new Error('Invalid role');
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('Network error during registration. Please try again later.');
  }
};

// Login user based on role
export const loginUser = async (username, password, role) => {
  try {
    let response;
    const requestData = { username, password };
    console.log(`Login attempt - Role: ${role}, Username: ${username}, Password length: ${password.length}`);
    console.log('Login request data:', requestData);
    
    switch (role) {
      case 'patient':
        response = await authService.loginPatient(requestData);
        // Store user data and token
        if (response.data) {
          const userData = {
            username: response.data.user.username,
            fullName: response.data.user.full_name,
            email: response.data.user.email,
            role: 'patient'
          };
          storeUserData(userData, response.data.access_token);
          setupAxiosDefaults(response.data.access_token);
        }
        break;
      case 'doctor':
        response = await authService.loginDoctor({
          username,
          password
        });
        // Store user data and token
        if (response.data) {
          const userData = {
            username: response.data.doctor.username,
            fullName: response.data.doctor.full_name,
            email: response.data.doctor.email,
            role: 'doctor'
          };
          storeUserData(userData, response.data.access_token);
          setupAxiosDefaults(response.data.access_token);
        }
        break;
      case 'seller':
        response = await authService.loginSeller({
          username,
          password
        });
        // Store user data and token
        if (response.data) {
          const userData = {
            username: response.data.seller.username,
            fullName: response.data.seller.full_name,
            email: response.data.seller.email,
            role: 'seller'
          };
          storeUserData(userData, response.data.access_token);
          setupAxiosDefaults(response.data.access_token);
        }
        break;
      default:
        throw new Error('Invalid role');
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('Network error during login. Please try again later.');
  }
}; 