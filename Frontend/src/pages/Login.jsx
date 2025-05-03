import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
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
    if (!formData.email) newErrors.email = 'Email or username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Store the entered value as username in localStorage
      const userData = {
        username: formData.email,
        // Optionally, you can set a default role or leave it blank
        role: '',
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      navigate('/main');
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen py-24 px-6 bg-[#101820]/80 relative">
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

      <div className="relative z-10 w-full max-w-2xl min-h-[700px] flex flex-col justify-center">
        <h2 className="text-5xl font-extrabold text-center text-[#00FFB2] tracking-tight font-poppins mb-20">
          Welcome Back
        </h2>
        <br></br>

        <form onSubmit={handleSubmit} className="space-y-100">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-20 space-y-6 shadow-2xl">

            {/* Email Field */}
            <div className="flex flex-col ">
              <label className="text-[#00FFB2] text-lg font-medium">Email or Username</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/30 rounded-xl px-6 py-3 text-white placeholder-white/50 text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-[#00FFB2]"
                placeholder="Enter your email or username"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="flex flex-col space-y-2">
              <label className="text-[#00FFB2] text-lg font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-[#00FFB2]/10 border border-[#00FFB2]/30 rounded-xl px-6 py-3 text-white placeholder-white/50 text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-[#00FFB2]"
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
            <br></br>
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-[#000000] hover:underline font-large text-[#00FFB2]  py-4 px-6 rounded-xl transition-all duration-200 text-lg shadow-md"
              >
                Login
              </button>
            </div>
          </div>
          <br></br>
          {/* Register Section */}
          <div className="text-center">
            <p className="text-white/70 text-lg">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-[#00FFB2] hover:underline font-medium"
              >
                Register here
              </button>
            </p>
          </div>
        </form>

      </div>
    </section>
  );
}  