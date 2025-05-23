import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { useNavigate } from 'react-router-dom';
import logo from '../removed-bg-medibridge.png';
import { 
  FaSearch, FaShoppingCart, FaUser, FaCaretDown, FaHeartbeat, 
  FaPrescriptionBottleAlt, FaSignOutAlt, FaHospital, FaIdCard, 
  FaCertificate, FaStore, FaFileInvoiceDollar, FaBox, FaMapMarkerAlt, 
  FaInfoCircle
} from 'react-icons/fa';
import { doctorService, sellerService, patientService } from '../api/apiService';
import { removeUserData } from '../utils/auth';

// MainNavbar (copied for consistency)
const MainNavbar = ({ username, handleSignOut, userRole }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 w-full bg-[#121212]/90 border-b border-gray-800/50 py-6 backdrop-blur-lg z-[9999]" style={{background: '#121212'}}>
      <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer" onClick={() => navigate('/main')}>
          <img 
            src={logo}
            alt="MediBridge" 
            className="h-14 w-auto"
          />
        </div>
        {/* Amazon-style Search Bar */}
        <div className="flex-1 flex justify-center max-w-3xl px-4">
          <div className="w-full max-w-[800px]">
            <form onSubmit={handleSearchSubmit}>
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  <button 
                    type="submit"
                    className="bg-[#2a2a2a]/50 hover:bg-[#00D37F]/20 px-6 flex items-center justify-center transition-colors"
                  >
                    <FaSearch className="text-[#00D37F] text-xl" />
                  </button>
                </div>
              </div>
            </form>
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
                  className="block px-6 py-3 text-center text-[#00D37F] no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  Orders
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

// Sidebar links configuration based on role
const getSidebarLinks = (role) => {
  switch (role) {
    case 'doctor':
      return [
        { label: 'Profile', icon: <FaUser />, section: 'profile' },
        { label: 'Qualifications', icon: <FaCertificate />, section: 'qualifications' },
        { label: 'Practice Details', icon: <FaHospital />, section: 'practice' }
      ];
    case 'seller':
      return [
        { label: 'Profile', icon: <FaUser />, section: 'profile' },
        { label: 'Store Info', icon: <FaStore />, section: 'store' },
        { label: 'License Details', icon: <FaIdCard />, section: 'license' },
        { label: 'Location', icon: <FaMapMarkerAlt />, section: 'location' }
      ];
    case 'patient':
    default:
      return [
        { label: 'Profile', icon: <FaUser />, section: 'profile' },
        { label: 'Medical Info', icon: <FaHeartbeat />, section: 'medical' },
        { label: 'Prescriptions', icon: <FaPrescriptionBottleAlt />, section: 'prescriptions' }
      ];
  }
};

export default function UserProfile() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  const [userData, setUserData] = useState({});
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get basic user data from localStorage
        const storedUserData = localStorage.getItem('userData');
        
        if (!storedUserData) {
          navigate('/login');
          return;
        }
        
        const parsedData = JSON.parse(storedUserData);
        setUsername(parsedData.username);
        setRole(parsedData.role);
        setEmail(parsedData.email);
        
        // Fetch detailed user profile based on role
        let profileData;
        
        switch (parsedData.role) {
          case 'doctor':
            const doctorResponse = await doctorService.getDoctor(parsedData.username);
            profileData = doctorResponse.data;
            break;
          case 'seller':
            const sellerResponse = await sellerService.getSeller(parsedData.username);
            profileData = sellerResponse.data;
            break;
          case 'patient':
            const patientResponse = await patientService.getPatient(parsedData.username);
            profileData = patientResponse.data;
            
            try {
              // Also get medical profile if it exists
              const medicalResponse = await patientService.getPatientProfile(parsedData.username);
              profileData = { ...profileData, medicalProfile: medicalResponse.data };
            } catch (medicalError) {
              console.log('Medical profile not found');
            }
            break;
          default:
            throw new Error('Unknown role');
        }
        
        setUserData(profileData);
        setFullName(profileData.full_name);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleSignOut = async () => {
    removeUserData();
    await new Promise(resolve => setTimeout(resolve, 100));
    navigate('/', { replace: true });
  };

  // Get the appropriate sidebar links based on user role
  const sidebarLinks = getSidebarLinks(role);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101820]">
        <div className="text-[#00FFAB] text-2xl">Loading profile...</div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-bold text-[#00FFAB] mb-2">
              {role === 'doctor' ? 'Doctor Panel' : 
               role === 'seller' ? 'Seller Panel' : 'Patient Panel'}
            </h2>
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
            
            {/* Seller Dashboard Button - only for sellers */}
            {role === 'seller' && (
              <button
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium text-[#00D37F] hover:bg-[#00D37F]/10 transition-colors mt-4"
                onClick={() => navigate('/seller-dashboard')}
              >
                <FaStore /> Go to Dashboard
              </button>
            )}
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
          {error && (
            <div className="w-full max-w-3xl mb-8 bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl">
              {error}
            </div>
          )}
          
          <div className="w-full max-w-3xl bg-[#1a1a1a]/80 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-10 backdrop-blur-md">
            {/* Patient Content */}
            {role === 'patient' && (
              <>
                {activeSection === 'profile' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Patient Profile</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Username:</span> {userData.username}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Full Name:</span> {userData.full_name}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Email:</span> {userData.email}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Age:</span> {userData.age}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Gender:</span> {userData.gender}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Mobile Number:</span> {userData.mobile_number}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Address:</span> {userData.address}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Emergency Contact:</span> {userData.emergency_contact}</div>
                    </div>
                  </div>
                )}
                {activeSection === 'medical' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Medical Info</h3>
                    {userData.medicalProfile ? (
                      <div className="flex flex-col gap-4 text-lg text-white">
                        <div><span className="font-semibold text-[#00FFAB]">Disease/Allergies:</span> {userData.medicalProfile.disease_allergies || 'Not specified'}</div>
                        <div><span className="font-semibold text-[#00FFAB]">Blood Group:</span> {userData.medicalProfile.blood_group || 'Not specified'}</div>
                        <div><span className="font-semibold text-[#00FFAB]">Medical History:</span> {userData.medicalProfile.prescribed_medicine || 'Not specified'}</div>
                      </div>
                    ) : (
                      <div className="bg-[#121212]/60 rounded-lg p-6 text-center">
                        <p className="text-gray-400">No medical profile found. Please create one from the Patient Profile page.</p>
                        <button
                          onClick={() => navigate('/patient-profile')}
                          className="mt-4 bg-[#00FFAB]/20 text-[#00FFAB] px-4 py-2 rounded-lg hover:bg-[#00FFAB]/30 transition-colors"
                        >
                          Go to Patient Profile
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeSection === 'prescriptions' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Prescribed Medicines</h3>
                    
                    {userData.medicalProfile?.prescribed_medicine ? (
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10">
                        <pre className="font-sans whitespace-pre-wrap">{userData.medicalProfile.prescribed_medicine}</pre>
                      </div>
                    ) : (
                      <div className="bg-[#121212]/60 rounded-lg p-6 text-center">
                        <p className="text-gray-400">No prescribed medicines found.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Doctor Content */}
            {role === 'doctor' && (
              <>
                {activeSection === 'profile' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Doctor Profile</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Username:</span> {userData.username}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Full Name:</span> {userData.full_name}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Email:</span> {userData.email}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Specialization:</span> {userData.specialization}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Age:</span> {userData.age}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Gender:</span> {userData.gender}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Mobile Number:</span> {userData.mobile_number}</div>
                    </div>
                  </div>
                )}
                {activeSection === 'qualifications' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Qualifications</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Registration Number:</span> {userData.registration_number}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Experience:</span> {userData.years_experience} years</div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mt-2">
                        <p className="font-semibold text-[#00FFAB] mb-2">Credentials</p>
                        <p className="text-gray-300">
                          This doctor's credentials have been verified by MediBridge.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'practice' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Practice Details</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Hospital/Clinic:</span> {userData.hospital_name || 'Not specified'}</div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mt-2">
                        <p className="font-semibold text-[#00FFAB] mb-2">Consultation Hours</p>
                        <p className="text-gray-300">Monday - Friday: 10:00 AM - 5:00 PM</p>
                        <p className="text-gray-300">Saturday: 10:00 AM - 1:00 PM</p>
                        <p className="text-gray-300">Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Seller Content */}
            {role === 'seller' && (
              <>
                {activeSection === 'profile' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Seller Profile</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Username:</span> {userData.username}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Full Name:</span> {userData.full_name}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Email:</span> {userData.email}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Store Name:</span> {userData.store_name}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Seller Type:</span> {userData.seller_type}</div>
                    </div>
                  </div>
                )}
                {activeSection === 'store' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Store Information</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Store Name:</span> {userData.store_name}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Type:</span> {userData.seller_type}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Mobile Number:</span> {userData.mobile_number}</div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mt-2">
                        <p className="font-semibold text-[#00FFAB] mb-2">Store Verification</p>
                        <p className="text-green-400 font-medium">✓ Verified Seller</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'license' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">License Details</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">GST Number:</span> {userData.gst_number}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Drug License Number:</span> {userData.drug_license_number}</div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mt-2">
                        <p className="font-semibold text-[#00FFAB] mb-2">Verification Status</p>
                        <p className="text-green-400 font-medium">✓ Licenses Verified</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'location' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Store Location</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Address:</span></div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10">
                        <p className="text-gray-300">{userData.store_address}</p>
                      </div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mt-2">
                        <p className="font-semibold text-[#00FFAB] mb-2">Business Hours</p>
                        <p className="text-gray-300">Monday - Saturday: 9:00 AM - 9:00 PM</p>
                        <p className="text-gray-300">Sunday: 10:00 AM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 