import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { FaUser, FaUserMd, FaStore, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/auth';

export default function Login() {
  const [role, setRole] = useState('patient');
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
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] relative overflow-hidden">
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
        <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(8px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-black/70 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-[#00FFAB]/10">
          <h2 className="text-4xl font-bold text-center text-[#00FFAB] mb-3">
            Sign In
          </h2>
          
          <p className="text-center text-gray-300 mb-8">
            Access your MediBridge account
          </p>

          <div className="flex justify-center mb-8">
            <div className="flex gap-3">
              {roles.map((roleOption) => (
                <button
                  key={roleOption.id}
                  type="button"
                  onClick={() => setRole(roleOption.id)}
                  className={`flex flex-col items-center justify-center h-20 w-20 rounded-lg transition-all duration-300 
                    ${role === roleOption.id 
                      ? 'bg-[#00FFAB] text-[#121212]' 
                      : 'bg-[#121212] text-[#00FFAB] hover:bg-[#121212]/70'}`}
                >
                  <div className="text-2xl mb-2">{roleOption.icon}</div>
                  <span className="font-medium text-sm">{roleOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          {loginError && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 mb-6 rounded-lg">
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-[#00FFAB] font-medium mb-2">
                Username
              </label>
              <div className="relative rounded-lg overflow-hidden">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FaUser className="text-[#00FFAB]" />
                </div>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-[#121212] border border-[#00FFAB]/20 rounded-lg px-12 py-3 text-white placeholder-gray-500"
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[#00FFAB] font-medium mb-2">
                Password
              </label>
              <div className="relative rounded-lg overflow-hidden">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FaLock className="text-[#00FFAB]" />
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-[#121212] border border-[#00FFAB]/20 rounded-lg px-12 py-3 text-white placeholder-gray-500"
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[#00FFAB] text-black py-3 px-6 rounded-lg font-bold text-lg shadow-lg 
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#00FFAB]/90 transition-colors'}`}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-[#00FFAB] hover:underline focus:outline-none font-medium"
                >
                  Register
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}  