import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { FaUser, FaUserMd, FaStore, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { loginUser } from '../utils/auth';

export default function Login() {
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!role) newErrors.role = 'Please select your role';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        setLoginError('');
        
        // Call login API
        const response = await loginUser(formData.username, formData.password, role);
        console.log('Login successful:', response);
        
        // Redirect to appropriate dashboard based on role
        if (role === 'seller') {
          navigate('/seller-dashboard');
        } else if (role === 'doctor') {
          navigate('/profile');
        } else {
          navigate('/patient-profile');
        }
      } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
          // Handle specific error messages from the server
          setLoginError(error.response.data.error?.message || 'Invalid username or password');
        } else {
          setLoginError('Network error. Please check your connection and try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
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

        <div className="relative z-10 w-full max-w-md">
          <h2 className="text-5xl font-extrabold text-center text-[#00FFB2] tracking-tight font-poppins mb-8">
            Sign In
          </h2>
          
          <p className="text-center text-gray-300 mb-12">
            Access your MediBridge account
          </p>

          {loginError && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 mb-8 rounded-xl">
              {loginError}
            </div>
          )}

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
            {errors.role && <p className="text-red-500 text-sm -mt-6 mb-6">{errors.role}</p>}

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 space-y-6">
              <div>
                <label className="block text-[#00FFB2] mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <FaUser className="text-[#00FFB2]" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/50"
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>
              
              <div>
                <label className="block text-[#00FFB2] mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <FaLock className="text-[#00FFB2]" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/50"
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="flex justify-between items-center mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-[#00FFB2] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#00FFB2]/90 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-gray-300">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-[#00FFB2] hover:underline focus:outline-none"
                  >
                    Register
                  </button>
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}  