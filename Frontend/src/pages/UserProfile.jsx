import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { useNavigate } from 'react-router-dom';
import logo from '../removed-bg-medibridge.png';
import { FaSearch, FaShoppingCart, FaUser, FaCaretDown, FaHeartbeat, FaPrescriptionBottleAlt, FaSignOutAlt } from 'react-icons/fa';

// MainNavbar (copied for consistency)
const MainNavbar = ({ username, handleSignOut, userRole }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 w-full bg-[#121212]/90 border-b border-gray-800/50 py-6 backdrop-blur-lg z-[9999]" style={{background: '#121212'}}>
      <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer">
          <img 
            src={logo}
            alt="MediBridge" 
            className="h-14 w-auto"
          />
        </div>
        {/* Amazon-style Search Bar */}
        <div className="flex-1 flex justify-center max-w-3xl px-4">
          <div className="w-full max-w-[800px]">
            <div className={`relative rounded-lg overflow-hidden transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-[#00D37F]' : ''}`}> 
              <div className="flex">
                <select className="bg-[#2a2a2a]/50 text-white px-3 py-2.5 border-r border-gray-700/50 focus:outline-none cursor-pointer hover:bg-[#00D37F]/20 transition-colors">
                  <option>All</option>
                  <option>Medicines</option>
                  <option>Healthcare</option>
                  <option>Wellness</option>
                </select>
                <input
                  type="text"
                  placeholder="Search medicines and health essentials"
                  className="w-full bg-[#2a2a2a]/50 text-white py-2.5 px-4 focus:outline-none"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <button className="bg-[#2a2a2a]/50 hover:bg-[#00D37F]/20 px-6 flex items-center justify-center transition-colors">
                  <FaSearch className="text-[#00D37F] text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Interactive Profile & Cart Buttons */}
        <div className="flex items-center gap-6 ml-8">
          {/* Profile Button with Dynamic Username */}
          <div className="group relative">
            <button className="flex items-center gap-2 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-[#00D37F]/20 group-hover:text-[#00D37F]">
              <div className="flex flex-col items-center w-full">
                <span className="text-sm text-gray-400 group-hover:text-[#00D37F]/80">
                  Hello, {username || 'Welcome user'}
                </span>
                <div className="flex items-center">
                  <FaUser className="text-xl mr-1" />
                  <span className="text-sm font-medium">Account</span>
                  <FaCaretDown className="ml-1 group-hover:rotate-180 transition-transform duration-200" />
                </div>
              </div>
            </button>
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a]/80 backdrop-blur-md border border-[#00D37F]/20 rounded-xl shadow-xl shadow-[#00D37F]/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-3 space-y-1">
                <a 
                  href="#"
                  className="block px-6 py-3 text-center text-[#7B68EE] no-underline"
                  style={{ textDecoration: 'none' }}
                  onClick={e => { e.preventDefault(); }}
                >
                  Your Profile
                </a>
                <a 
                  href="#" 
                  className="block px-6 py-3 text-center text-[#00D37F] no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  Orders
                </a>
                <a 
                  href="#" 
                  className="block px-6 py-3 text-center text-[#00D37F] no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  Settings
                </a>
                <hr className="border-[#00D37F]/10 mx-6 my-2" />
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleSignOut();
                  }}
                  className="block px-6 py-3 text-center text-[#00D37F] no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  Sign Out
                </a>
              </div>
            </div>
          </div>
          {/* Cart Button - only for patient */}
          {userRole === 'patient' && (
            <button
              className="relative group flex items-center gap-2 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-[#00D37F]/20 hover:text-[#00D37F]"
              onClick={() => navigate('/cart')}
            >
              <div className="relative">
                <FaShoppingCart className="text-2xl" />
                <span className="absolute -top-2 -right-2 bg-[#00D37F] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  {(() => {
                    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                    return cart.reduce((sum, item) => sum + item.quantity, 0);
                  })()}
                </span>
              </div>
              <span className="text-sm font-medium">Cart</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

// Sidebar links configuration
const sidebarLinks = [
  { label: 'Profile', icon: <FaUser />, section: 'profile' },
  { label: 'Medical Info', icon: <FaHeartbeat />, section: 'medical' },
  { label: 'Prescriptions', icon: <FaPrescriptionBottleAlt />, section: 'prescriptions' },
];

// Mock medical data (this would come from the backend in a real app)
const mockPatientData = {
  disease: 'Hypertension',
  bloodGroup: 'A+',
  prescribedMedicines: [
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
    { name: 'Metoprolol', dosage: '25mg', frequency: 'Once daily' },
  ],
};

export default function UserProfile() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  const [patientData, setPatientData] = useState(mockPatientData);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUsername(parsed.username);
      setRole(parsed.role);
    }
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('userData');
    setUsername('');
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] relative overflow-hidden">
      {/* Star Background */}
      <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <Canvas
          camera={{ position: [-2, 2, 4], fov: 70, near: 0.001, far: 1000 }}
        >
          <Background />
        </Canvas>
        <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(4px)' }} />
      </div>
      
      {/* Main Navbar (top) */}
      <MainNavbar username={username} handleSignOut={handleSignOut} userRole={role} />
      
      {/* Content with Sidebar */}
      <div className="relative z-10 flex pt-8">
        {/* Sidebar (left) */}
        <aside className="w-64 min-h-[calc(100vh-80px)] bg-[#121212]/80 border-r border-gray-800/40 flex flex-col py-10 px-6 gap-6 sticky top-24">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#00FFAB] mb-2">User Panel</h2>
            <p className="text-gray-300 text-sm">Welcome, <span className="font-semibold">{username || 'User'}</span></p>
          </div>
          <nav className="flex flex-col gap-2 flex-1">
            {sidebarLinks.map(link => (
              <button
                key={link.section}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors
                  ${activeSection === link.section
                    ? 'bg-[#00FFAB]/20 text-[#00FFAB]'
                    : 'text-gray-200 hover:bg-[#00FFAB]/10 hover:text-[#00FFAB]'}
                `}
                onClick={() => setActiveSection(link.section)}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </nav>
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium text-red-400 hover:bg-red-900/20 transition-colors"
            onClick={handleSignOut}
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </aside>

        {/* Main Content (right) */}
        <main className="flex-1 flex flex-col items-center justify-start py-8 px-8 md:px-24">
          <div className="w-full max-w-3xl bg-[#1a1a1a]/80 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-10 backdrop-blur-md">
            {activeSection === 'profile' && (
              <div>
                <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Profile</h3>
                <div className="flex flex-col gap-4 text-lg text-white">
                  <div><span className="font-semibold text-[#00FFAB]">Username:</span> {username}</div>
                  <div><span className="font-semibold text-[#00FFAB]">Role:</span> {role || 'N/A'}</div>
                </div>
              </div>
            )}
            {activeSection === 'medical' && (
              <div>
                <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Medical Info</h3>
                <div className="flex flex-col gap-4 text-lg text-white">
                  <div><span className="font-semibold text-[#00FFAB]">Disease:</span> {patientData.disease}</div>
                  <div><span className="font-semibold text-[#00FFAB]">Blood Group:</span> {patientData.bloodGroup}</div>
                </div>
              </div>
            )}
            {activeSection === 'prescriptions' && (
              <div>
                <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Prescribed Medicines</h3>
                <ul className="flex flex-col gap-4 text-lg text-white">
                  {patientData.prescribedMedicines.map((med, idx) => (
                    <li key={idx} className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10">
                      <span className="font-semibold text-[#00FFAB]">{med.name}</span> - {med.dosage} &middot; {med.frequency}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 