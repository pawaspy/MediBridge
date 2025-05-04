import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { FaUser, FaUserMd, FaStore, FaUpload } from 'react-icons/fa';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainWebsite from './MainWebsite';
import Navbar from '../components/Navbar';
import { registerUser } from '../utils/auth';
import axios from 'axios';

// Add country codes data
const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  { code: '+65', country: 'Singapore' },
  { code: '+971', country: 'UAE' },
  // Add more country codes as needed
];

export default function Register() {
  const [role, setRole] = useState('');
  const [countryCode, setCountryCode] = useState('+91'); // Default to India
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    // Doctor fields
    specialization: '',
    registrationNumber: '',
    degreeCertificate: null,
    governmentId: null,
    experience: '',
    hospitalName: '',
    doctorAge: '',
    doctorGender: '',
    // Seller fields
    storeName: '',
    gstNumber: '',
    drugLicenseNumber: '',
    gstCertificate: null,
    drugLicenseCopy: null,
    storeAddress: '',
    sellerType: '',
    // Patient fields
    age: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyRelation: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const navigate = useNavigate();

  // Debug log when component mounts
  useEffect(() => {
    console.log('Register component mounted');
    console.log('Navigate function available:', !!navigate);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    // Common validation
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    else if (!isValidMobile(formData.mobile)) newErrors.mobile = 'Mobile number must be 10 digits';

    // Validation based on role
    if (role === 'patient') {
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.age) newErrors.age = 'Age is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';
      else if (!isValidMobile(formData.emergencyContact)) newErrors.emergencyContact = 'Emergency contact must be 10 digits';
    } else if (role === 'doctor') {
      if (!formData.doctorGender) newErrors.doctorGender = 'Gender is required';
      if (!formData.doctorAge) newErrors.doctorAge = 'Age is required';
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
      if (!formData.hospitalName) newErrors.hospitalName = 'Hospital name is required';
      if (!formData.experience) newErrors.experience = 'Years of experience is required';
    } else if (role === 'seller') {
      if (!formData.storeName) newErrors.storeName = 'Store name is required';
      if (!formData.gstNumber) newErrors.gstNumber = 'GST number is required';
      else if (formData.gstNumber.length < 5) newErrors.gstNumber = 'GST number seems too short';
      
      if (!formData.drugLicenseNumber) newErrors.drugLicenseNumber = 'Drug license number is required';
      else if (formData.drugLicenseNumber.length < 5) newErrors.drugLicenseNumber = 'Drug license number seems too short';
      
      if (!formData.sellerType) newErrors.sellerType = 'Seller type is required';
      const validSellerTypes = ['retail', 'wholesale', 'hospital', 'ngo'];
      if (formData.sellerType && !validSellerTypes.includes(formData.sellerType)) {
        newErrors.sellerType = `Invalid seller type. Must be one of: ${validSellerTypes.join(', ')}`;
      }
      
      if (!formData.storeAddress) newErrors.storeAddress = 'Store address is required';
      else if (formData.storeAddress.length < 10) newErrors.storeAddress = 'Please provide a complete address';
    }

    setErrors(newErrors);
    
    // Log validation results for debugging
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      isValid = false;
    }
    
    return isValid;
  };

  // Helper validation functions
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidMobile = (mobile) => {
    return /^\d{10}$/.test(mobile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (isValid) {
      console.log('Form is valid, sending data to backend');
      
      try {
        setIsSubmitting(true);
        setSubmissionError('');
        
        // Extra validation for seller type
        if (role === 'seller') {
          const validSellerTypes = ['retail', 'wholesale', 'hospital', 'ngo'];
          if (!validSellerTypes.includes(formData.sellerType)) {
            console.error('Invalid seller type:', formData.sellerType);
            setSubmissionError(`Invalid seller type: ${formData.sellerType}. Must be one of: ${validSellerTypes.join(', ')}`);
            setIsSubmitting(false);
            return;
          }
          
          // Log the data being sent for seller registration
          console.log('Seller registration data:', {
            username: formData.username,
            full_name: formData.fullName,
            email: formData.email,
            password: '******', // Hide password in logs
            mobile_number: formData.mobile,
            store_name: formData.storeName,
            gst_number: formData.gstNumber,
            drug_license_number: formData.drugLicenseNumber,
            seller_type: formData.sellerType,
            store_address: formData.storeAddress
          });
        }
        
        // Register with backend
        const response = await registerUser(formData, role);
        console.log('Registration successful:', response);
        
        // Save user data to localStorage
        const userData = {
          username: formData.username,
          email: formData.email,
          role: role,
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Save complete registration form data with role
        const completeFormData = {
          ...formData,
          role: role,
        };
        localStorage.setItem('registrationFormData', JSON.stringify(completeFormData));
        
        // Redirect to main page
          navigate('/main');
      } catch (error) {
        console.error('Registration error:', error);
        
        // Handle different error types
        if (error.response) {
          // Server responded with an error status
          if (error.response.status === 500) {
            // For 500 errors, provide more detailed debugging information
            console.error('Server 500 Error Details:', error.response);
            
            if (role === 'seller') {
              setSubmissionError(`Server error during seller registration. Please check that your seller information is valid, especially the seller type.`);
            } else {
              setSubmissionError('Server error: The system is currently unavailable. This could be due to maintenance or high traffic. Please try again later.');
            }
          } else if (error.response.status === 409) {
            setSubmissionError('Username or email already exists. Please choose different credentials.');
          } else if (error.response.status === 400) {
            setSubmissionError(error.response.data.error?.message || 'Invalid data provided. Please check your information and try again.');
          } else {
            setSubmissionError(error.response.data.error?.message || 'Registration failed. Please try again.');
          }
        } else if (error.request) {
          // Request was made but no response received
          setSubmissionError('Unable to reach the server. Please check your internet connection and try again.');
        } else {
          // Error setting up the request
          setSubmissionError(`An error occurred during registration: ${error.message || 'Unknown error'}`);
        }
        
        // Log helpful debugging information to console
        if (process.env.NODE_ENV !== 'production') {
          console.log('Detailed error information:');
          console.log('Error message:', error.message);
          console.log('Error name:', error.name);
          if (error.response) {
            console.log('Status code:', error.response.status);
            console.log('Response data:', error.response.data);
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('Form validation failed, errors:', errors);
    }
  };

  // Render form based on role
  const renderRoleForm = () => {
    if (role === 'patient') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Enter your age"
            />
            {errors.age && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.age}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.gender}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full h-24 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Enter your address"
            />
            {errors.address && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.address}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Emergency Contact</label>
            <div className="flex">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-20 h-11 sm:h-12 bg-[#00FFB2]/10 border-r-0 border border-[#00FFB2]/20 rounded-l-lg px-2 text-white text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              >
                {countryCodes.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.code}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-r-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
                placeholder="Emergency contact number"
              />
            </div>
            {errors.emergencyContact && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.emergencyContact}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Relation to Emergency Contact</label>
            <input
              type="text"
              name="emergencyRelation"
              value={formData.emergencyRelation}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Parent, Sibling, Spouse, etc."
            />
          </div>
        </div>
      );
    }
    
    if (role === 'doctor') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Age</label>
            <input
              type="number"
              name="doctorAge"
              value={formData.doctorAge}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Enter your age"
            />
            {errors.doctorAge && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.doctorAge}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Gender</label>
            <select
              name="doctorGender"
              value={formData.doctorGender}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.doctorGender && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.doctorGender}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Your medical specialization"
            />
            {errors.specialization && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.specialization}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Years of Experience</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Years of practice"
            />
            {errors.experience && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.experience}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Hospital/Clinic Name</label>
            <input
              type="text"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Your workplace"
            />
            {errors.hospitalName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.hospitalName}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Registration Number</label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Medical registration number"
            />
            {errors.registrationNumber && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.registrationNumber}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Degree Certificate</label>
            <label className="flex items-center justify-center w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-dashed border-[#00FFB2]/40 rounded-lg px-4 py-2 text-white cursor-pointer hover:bg-[#00FFB2]/20 transition-colors">
              <FaUpload className="mr-2" />
              <span className="text-sm sm:text-base">{formData.degreeCertificate ? formData.degreeCertificate.name : "Upload certificate"}</span>
              <input
                type="file"
                name="degreeCertificate"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Government ID</label>
            <label className="flex items-center justify-center w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-dashed border-[#00FFB2]/40 rounded-lg px-4 py-2 text-white cursor-pointer hover:bg-[#00FFB2]/20 transition-colors">
              <FaUpload className="mr-2" />
              <span className="text-sm sm:text-base">{formData.governmentId ? formData.governmentId.name : "Upload ID"}</span>
              <input
                type="file"
                name="governmentId"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      );
    }
    
    if (role === 'seller') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Store Name</label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Your pharmacy or store name"
            />
            {errors.storeName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.storeName}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Seller Type</label>
            <select
              name="sellerType"
              value={formData.sellerType}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
            >
              <option value="">Select type</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="hospital">Hospital</option>
              <option value="ngo">NGO</option>
            </select>
            {errors.sellerType && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.sellerType}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">GST Number</label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Your GST identification number"
            />
            {errors.gstNumber && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.gstNumber}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Drug License Number</label>
            <input
              type="text"
              name="drugLicenseNumber"
              value={formData.drugLicenseNumber}
              onChange={handleInputChange}
              className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Your drug license number"
            />
            {errors.drugLicenseNumber && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.drugLicenseNumber}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Store Address</label>
            <textarea
              name="storeAddress"
              value={formData.storeAddress}
              onChange={handleInputChange}
              className="w-full h-24 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
              placeholder="Your store's complete address"
            />
            {errors.storeAddress && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.storeAddress}</p>}
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">GST Certificate</label>
            <label className="flex items-center justify-center w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-dashed border-[#00FFB2]/40 rounded-lg px-4 py-2 text-white cursor-pointer hover:bg-[#00FFB2]/20 transition-colors">
              <FaUpload className="mr-2" />
              <span className="text-sm sm:text-base">{formData.gstCertificate ? formData.gstCertificate.name : "Upload GST certificate"}</span>
              <input
                type="file"
                name="gstCertificate"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </div>
          
          <div>
            <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Drug License Copy</label>
            <label className="flex items-center justify-center w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-dashed border-[#00FFB2]/40 rounded-lg px-4 py-2 text-white cursor-pointer hover:bg-[#00FFB2]/20 transition-colors">
              <FaUpload className="mr-2" />
              <span className="text-sm sm:text-base">{formData.drugLicenseCopy ? formData.drugLicenseCopy.name : "Upload license copy"}</span>
              <input
                type="file"
                name="drugLicenseCopy"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      <Navbar animateLeft />
      <section className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 bg-[#101820]/80 relative py-20">
        {/* Star Background */}
        <div className="fixed inset-0 z-0">
          <Canvas
            camera={{
              position: [-2, 2, 4],
              fov: 70,
              near: 0.001,
              far: 1000
            }}
          >
            <Background />
          </Canvas>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backdropFilter: 'blur(8px)' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-[#00FFB2] tracking-tight font-poppins mb-4 sm:mb-6">
            Create Account
          </h2>

          <p className="text-center text-gray-300 mb-6 sm:mb-8">
            Join MediBridge and experience healthcare services online
          </p>

          {submissionError && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 sm:p-4 mb-6 rounded-xl text-sm">
              {submissionError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { id: 'patient', label: 'Patient', icon: <FaUser /> },
                { id: 'doctor', label: 'Doctor', icon: <FaUserMd /> },
                { id: 'seller', label: 'Seller', icon: <FaStore /> }
              ].map((roleOption) => (
                <button
                  key={roleOption.id}
                  type="button"
                  onClick={() => setRole(roleOption.id)}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300
                    ${role === roleOption.id
                      ? 'bg-[#00FFB2] text-white'
                      : 'bg-[#00FFB2]/20 text-[#00FFB2] hover:bg-[#00FFB2]/30'}`}
                >
                  <div className="text-2xl mb-2">{roleOption.icon}</div>
                  <span className="font-medium">{roleOption.label}</span>
                </button>
              ))}
            </div>
            {errors.role && <p className="text-red-500 text-sm -mt-6 mb-2">{errors.role}</p>}

            {role && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6">
                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
                      placeholder="Your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
                      placeholder="Choose a username"
                    />
                    {errors.username && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
                      placeholder="Your email address"
                    />
                    {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Mobile Number</label>
                    <div className="flex">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-20 h-11 sm:h-12 bg-[#00FFB2]/10 border-r-0 border border-[#00FFB2]/20 rounded-l-lg px-2 text-white text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
                      >
                        {countryCodes.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-r-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
                        placeholder="Your mobile number"
                      />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.mobile}</p>}
                  </div>

                  <div>
                    <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
                      placeholder="Choose a password"
                    />
                    {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-[#00FFB2] text-sm sm:text-base mb-1.5 font-medium">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full h-11 sm:h-12 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[#00FFB2]"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                {/* Role-specific Fields */}
                {role && (
                  <div className="pt-2 sm:pt-4 border-t border-[#00FFB2]/20">
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#00FFB2] mb-4 sm:mb-6">
                      {role === 'patient' ? 'Patient Information' : 
                       role === 'doctor' ? 'Doctor Information' : 
                       'Seller Information'}
                    </h3>
                    {renderRoleForm()}
                  </div>
                )}

                <div className="pt-2 sm:pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-[#00FFB2] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#00FFB2]/90 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-300">
                    Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                      className="text-[#00FFB2] hover:underline focus:outline-none"
                  >
                      Sign In
                  </button>
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </>
  );
}