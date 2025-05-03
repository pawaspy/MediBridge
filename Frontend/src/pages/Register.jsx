import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { FaUser, FaUserMd, FaStore, FaUpload } from 'react-icons/fa';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainWebsite from './MainWebsite';
import Navbar from '../components/Navbar';
import api from '../api/axiosConfig';

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
    const newErrors = {};

    // Common validations
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.username) newErrors.username = 'Username is required';

    // Role-specific validations
    if (role === 'doctor') {
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
      if (!formData.doctorAge) newErrors.doctorAge = 'Age is required';
      if (!formData.doctorGender) newErrors.doctorGender = 'Gender is required';
      if (!formData.hospitalName) newErrors.hospitalName = 'Hospital name is required';
      if (!formData.experience) newErrors.experience = 'Years of experience is required';
    }

    if (role === 'patient') {
      if (!formData.age) newErrors.age = 'Age is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';
    }

    if (role === 'seller') {
      if (!formData.storeName) newErrors.storeName = 'Store name is required';
      if (!formData.gstNumber) newErrors.gstNumber = 'GST number is required';
      if (!formData.drugLicenseNumber) newErrors.drugLicenseNumber = 'Drug license number is required';
      if (!formData.sellerType) newErrors.sellerType = 'Seller type is required';
      if (!formData.storeAddress) newErrors.storeAddress = 'Store address is required';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (isValid) {
      console.log('Form is valid, preparing to save data');
      
      try {
        // Save user data to localStorage
        const userData = {
          username: formData.username,
          email: formData.email,
          role: role,
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('User data saved to localStorage');
        
        // Save complete registration form data with role
        const completeFormData = {
          ...formData,
          role: role,
        };
        localStorage.setItem('registrationFormData', JSON.stringify(completeFormData));
        console.log('Complete form data saved to localStorage');
        
        // Prepare data for backend API
        let apiData = {};
        
        // Map common fields
        apiData = {
          username: formData.username,
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          mobile_number: countryCode + formData.mobile, // Include country code
          gender: formData.gender || (role === 'doctor' ? formData.doctorGender : ''),
          age: parseInt(formData.age || formData.doctorAge || '0'),
        };
        
        // Add role-specific fields
        if (role === 'doctor') {
          apiData = {
            ...apiData,
            specialization: formData.specialization,
            registration_number: formData.registrationNumber,
            hospital_name: formData.hospitalName,
            years_experience: parseInt(formData.experience || '0'),
          };
        } else if (role === 'patient') {
          apiData = {
            ...apiData,
            address: formData.address,
            emergency_contact: countryCode + formData.emergencyContact,
            gender: formData.gender || 'male', // Ensure gender is always provided
          };
        } else if (role === 'seller') {
          apiData = {
            ...apiData,
            store_name: formData.storeName,
            gst_number: formData.gstNumber,
            drug_license_number: formData.drugLicenseNumber,
            seller_type: formData.sellerType || 'retail', // Provide a default seller type
            store_address: formData.storeAddress,
          };
        }
        
        // Send registration data to backend
        console.log('Sending data to backend:', apiData);
        const endpoint = `/api/${role}s`;
        const response = await api.post(endpoint, apiData);
        console.log('Registration successful:', response.data);
        
        // Redirect with a slight delay to ensure localStorage is updated
        console.log('Attempting to navigate to /main');
        setTimeout(() => {
          navigate('/main');
        }, 100);
      } catch (error) {
        console.error('Error during form submission:', error);
        // Add alert to show error to user
        alert(`Registration failed: ${error.response?.data?.error?.message || error.message}`);
      }
    } else {
      console.log('Form validation failed, errors:', errors);
    }
  };

  const roles = [
    { id: 'patient', label: 'Patient', icon: <FaUser /> },
    { id: 'doctor', label: 'Doctor', icon: <FaUserMd /> },
    { id: 'seller', label: 'Seller', icon: <FaStore /> }
  ];

  return (
    <>
      <Navbar animateLeft />
      <section className="flex flex-col items-center justify-center min-h-screen py-24 px-6 bg-[#101820]/80 relative pt-24">
        {/* Star Background */}
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
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

        <div className="relative z-10 w-full max-w-4xl">
          <h2 className="text-5xl font-extrabold text-center text-[#00FFB2] tracking-tight font-poppins mb-24">
            Join MediBridge
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {roles.map((roleOption) => (
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

            {role && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 space-y-6">
                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#00FFB2] mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                      placeholder="Enter your username"
                    />
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-[#00FFB2] mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-[#00FFB2] mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-[#00FFB2] mb-2">Mobile Number</label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-2 py-2 text-white w-24"
                      >
                        {countryCodes.map((country) => (
                          <option 
                            key={country.code} 
                            value={country.code}
                            className="bg-[#101820] text-black"
                          >
                            {country.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="flex-1 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter your mobile number"
                      />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                  </div>

                  <div>
                    <label className="block text-[#00FFB2] mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                      placeholder="Enter your password"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-[#00FFB2] mb-2">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Doctor Fields */}
                {role === 'doctor' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter your specialization"
                      />
                      {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Registration Number</label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter your registration number"
                      />
                      {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Age</label>
                      <input
                        type="number"
                        name="doctorAge"
                        value={formData.doctorAge}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter your age"
                        min="0"
                      />
                      {errors.doctorAge && <p className="text-red-500 text-sm mt-1">{errors.doctorAge}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Gender</label>
                      <select
                        name="doctorGender"
                        value={formData.doctorGender}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="" className="bg-[#101820] text-black">Select gender</option>
                        <option value="male" className="bg-[#101820] text-black">Male</option>
                        <option value="female" className="bg-[#101820] text-black">Female</option>
                        <option value="other" className="bg-[#101820] text-black">Other</option>
                      </select>
                      {errors.doctorGender && <p className="text-red-500 text-sm mt-1">{errors.doctorGender}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Hospital/Clinic Name</label>
                      <input
                        type="text"
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter hospital/clinic name"
                      />
                      {errors.hospitalName && <p className="text-red-500 text-sm mt-1">{errors.hospitalName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Years of Experience</label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter years of experience"
                        min="0"
                      />
                      {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Degree Certificate</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          name="degreeCertificate"
                          onChange={handleInputChange}
                          className="hidden"
                          id="degreeCertificateInput"
                        />
                        <label
                          htmlFor="degreeCertificateInput"
                          className="flex-1 flex items-center justify-center gap-2 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white cursor-pointer hover:bg-[#00FFB2]/20"
                        >
                          <FaUpload /> 
                          <span>{formData.degreeCertificate ? formData.degreeCertificate.name : "Upload Certificate"}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Patient Fields */}
                {role === 'patient' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter your age"
                        min="0"
                      />
                      {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="" className="bg-[#101820] text-black">Select gender</option>
                        <option value="male" className="bg-[#101820] text-black">Male</option>
                        <option value="female" className="bg-[#101820] text-black">Female</option>
                        <option value="other" className="bg-[#101820] text-black">Other</option>
                      </select>
                      {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-[#00FFB2] mb-2">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        rows="3"
                        placeholder="Enter your address"
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Emergency Contact Number</label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-2 py-2 text-white w-24"
                        >
                          {countryCodes.map((country) => (
                            <option 
                              key={country.code} 
                              value={country.code}
                              className="bg-[#101820] text-black"
                            >
                              {country.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          className="flex-1 bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                          placeholder="Enter emergency contact number"
                        />
                      </div>
                      {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Relation to Emergency Contact</label>
                      <input
                        type="text"
                        name="emergencyRelation"
                        value={formData.emergencyRelation}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="e.g. Parent, Spouse, Sibling"
                      />
                      {errors.emergencyRelation && <p className="text-red-500 text-sm mt-1">{errors.emergencyRelation}</p>}
                    </div>
                  </div>
                )}

                {/* Seller Fields - Keeping them as they were */}
                {role === 'seller' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                    
                    <div>
                      <label className="block text-[#00FFB2] mb-2">Store Name</label>
                      <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter store name"
                      />
                      {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>}
                    </div>

                    <div>
                      <label className="block text-[#00FFB2] mb-2">GST Number</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter GST number"
                      />
                      {errors.gstNumber && <p className="text-red-500 text-sm mt-1">{errors.gstNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-[#00FFB2] mb-2">Drug License Number</label>
                      <input
                        type="text"
                        name="drugLicenseNumber"
                        value={formData.drugLicenseNumber}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter drug license number"
                      />
                      {errors.drugLicenseNumber && <p className="text-red-500 text-sm mt-1">{errors.drugLicenseNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-[#00FFB2] mb-2">Type of Seller</label>
                      <select
                        name="sellerType"
                        value={formData.sellerType}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="" className="bg-[#101820] text-black">Select type</option>
                        <option value="retail" className="bg-[#101820] text-black">Retail Pharmacy</option>
                        <option value="wholesale" className="bg-[#101820] text-black">Wholesale Distributor</option>
                        <option value="hospital" className="bg-[#101820] text-black">Hospital</option>
                        <option value="ngo" className="bg-[#101820] text-black">NGO</option>
                      </select>
                      {errors.sellerType && <p className="text-red-500 text-sm mt-1">{errors.sellerType}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[#00FFB2] mb-2">Store Address</label>
                      <textarea
                        name="storeAddress"
                        value={formData.storeAddress}
                        onChange={handleInputChange}
                        className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        rows="3"
                        placeholder="Enter store address"
                      />
                      {errors.storeAddress && <p className="text-red-500 text-sm mt-1">{errors.storeAddress}</p>}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    className="w-1/2 bg-[#00FFB2] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#00FFB2]/90 transition-colors"
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-1/2 bg-[#00FFB2]/20 text-[#00FFB2] py-3 px-6 rounded-lg font-medium hover:bg-[#00FFB2]/30 transition-colors ml-4"
                  >
                    Already Registered?
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </>
  );
}