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
  const navigate = useNavigate();

  useEffect(() => {
    // Get basic user data
    const basicUserData = localStorage.getItem('userData');
    
    // Get complete registration form data
    const registrationData = localStorage.getItem('registrationFormData');
    
    if (basicUserData) {
      const parsedBasicData = JSON.parse(basicUserData);
      setUsername(parsedBasicData.username);
      setRole(parsedBasicData.role);
      setEmail(parsedBasicData.email);
      
      // If we have detailed registration data, use it
      if (registrationData) {
        const parsedRegData = JSON.parse(registrationData);
        setFullName(parsedRegData.fullName);
        
        // Create a complete user profile by combining data
        const completeUserData = {
          ...parsedRegData,
          // Add any computed fields if necessary
        };
        
        setUserData(completeUserData);
      } else {
        // Fallback to default values if registration data is not available
        setUserData({
          // Patient fallback
          disease: 'Not specified',
          bloodGroup: 'Not specified',
          prescribedMedicines: [],
          
          // Doctor fallback
          specialization: 'Not specified',
          registrationNumber: 'Not specified',
          experience: 'Not specified',
          hospitalName: 'Not specified',
          
          // Seller fallback
          storeName: 'Not specified',
          gstNumber: 'Not specified',
          drugLicenseNumber: 'Not specified',
          storeAddress: 'Not specified',
          sellerType: 'Not specified'
        });
      }
    }
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('navbarLayout');
    await new Promise(resolve => setTimeout(resolve, 100));
    navigate('/', { replace: true });
  };

  // Get the appropriate sidebar links based on user role
  const sidebarLinks = getSidebarLinks(role);

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
          <div className="w-full max-w-3xl bg-[#1a1a1a]/80 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-10 backdrop-blur-md">
            {/* Patient Content */}
            {role === 'patient' && (
              <>
                {activeSection === 'profile' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Patient Profile</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Username:</span> {username}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Full Name:</span> {userData.fullName || fullName}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Email:</span> {email}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Age:</span> {userData.age || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Gender:</span> {userData.gender || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Date of Birth:</span> {userData.dob || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Mobile Number:</span> {userData.mobile || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Address:</span> {userData.address || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Emergency Contact:</span> {userData.emergencyContact || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Relation to Emergency Contact:</span> {userData.emergencyRelation || 'Not specified'}</div>
                    </div>
                  </div>
                )}
                {activeSection === 'medical' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Medical Info</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mb-6">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          // Save the form data to localStorage here
                          const updatedMedicalInfo = {
                            ...userData,
                            disease: e.target.disease.value,
                            bloodGroup: e.target.bloodGroup.value,
                            allergies: e.target.allergies.value,
                            medicalHistory: e.target.medicalHistory.value
                          };
                          
                          setUserData(updatedMedicalInfo);
                          localStorage.setItem('registrationFormData', JSON.stringify(updatedMedicalInfo));
                          alert('Medical information updated successfully!');
                        }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-[#00FFAB] mb-1">Disease</label>
                              <input 
                                type="text" 
                                name="disease" 
                                className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white" 
                                defaultValue={userData.disease || ''} 
                                placeholder="Enter disease"
                              />
                            </div>
                            <div>
                              <label className="block text-[#00FFAB] mb-1">Blood Group</label>
                              <select 
                                name="bloodGroup" 
                                className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white" 
                                defaultValue={userData.bloodGroup || ''}
                              >
                                <option value="">Select blood group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[#00FFAB] mb-1">Allergies</label>
                              <input 
                                type="text" 
                                name="allergies" 
                                className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white" 
                                defaultValue={userData.allergies || ''} 
                                placeholder="Enter allergies"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[#00FFAB] mb-1">Medical History</label>
                              <textarea 
                                name="medicalHistory" 
                                className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white min-h-[80px]" 
                                defaultValue={userData.medicalHistory || userData.familyHistory || ''} 
                                placeholder="Enter medical history"
                              ></textarea>
                            </div>
                          </div>
                          <br/>
                          <button type="submit" className="bg-[#00FFAB] text-[#00FFAB] py-2 px-4 rounded-md hover:bg-[#00D37F] transition-colors font-semibold">
                            Save Medical Information
                          </button>

                        </form>
                      </div>
                      <br/>
                      
                      <div><span className="font-semibold text-[#00FFAB]">Disease:</span> {userData.disease || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Blood Group:</span> {userData.bloodGroup || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Allergies:</span> {userData.allergies || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Medical History:</span> {userData.medicalHistory || userData.familyHistory || 'Not specified'}</div>
                    </div>
                  </div>
                )}
                {activeSection === 'prescriptions' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Prescribed Medicines</h3>
                    
                    {userData.prescribedMedicines && userData.prescribedMedicines.length > 0 ? (
                      <ul className="flex flex-col gap-4 text-lg text-white">
                        {userData.prescribedMedicines.map((med, idx) => (
                          <li key={idx} className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10">
                            <div className="flex flex-col gap-2">
                              <h4 className="text-xl font-semibold text-[#00FFAB]">{med.name}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                                <div className="text-sm text-gray-300">
                                  <span className="font-medium text-white">Dosage:</span> {med.dosage}
                                </div>
                                <div className="text-sm text-gray-300">
                                  <span className="font-medium text-white">Frequency:</span> {med.frequency}
                                </div>
                                <div className="text-sm text-gray-300">
                                  <span className="font-medium text-white">Duration:</span> {med.duration || 'As needed'}
                                </div>
                                <div className="text-sm text-gray-300">
                                  <span className="font-medium text-white">Instructions:</span> {med.instructions || 'Take as directed'}
                                </div>
                                <div className="text-sm text-gray-300">
                                  <span className="font-medium text-white">Prescribed By:</span> {med.prescribedBy || 'Doctor'}
                                </div>
                                <div className="text-sm text-gray-300">
                                  <span className="font-medium text-white">Date:</span> {med.prescriptionDate || 'Not specified'}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-[#121212]/60 rounded-lg p-6 text-center">
                        <p className="text-gray-400">No prescribed medicines found.</p>
                      </div>
                    )}
                    
                    <div className="mt-8">
                      <h4 className="text-xl font-bold text-[#00FFAB] mb-4">Medical Documents</h4>
                      {userData.medicalDocuments && userData.medicalDocuments.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userData.medicalDocuments.map((doc, idx) => (
                            <li key={idx} className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10">
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <p className="font-medium text-white">{doc.name}</p>
                                  <p className="text-sm text-gray-400">Uploaded on: {doc.uploadDate || 'Not specified'}</p>
                                </div>
                                <button className="bg-[#00FFAB]/20 text-[#00FFAB] px-3 py-1 rounded-lg text-sm">
                                  View
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="bg-[#121212]/60 rounded-lg p-6 text-center">
                          <p className="text-gray-400">No medical documents found.</p>
                        </div>
                      )}
                    </div>
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
                      <div><span className="font-semibold text-[#00FFAB]">Username:</span> {username}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Full Name:</span> {userData.fullName || fullName}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Email:</span> {email}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Specialization:</span> {userData.specialization || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Age:</span> {userData.doctorAge || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Gender:</span> {userData.doctorGender || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Mobile Number:</span> {userData.mobile || 'Not specified'}</div>
                    </div>
                  </div>
                )}
                {activeSection === 'qualifications' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Qualifications</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Registration Number:</span> {userData.registrationNumber || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Experience:</span> {userData.experience || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Degrees:</span> {userData.degrees || 'Not specified'}</div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mt-2">
                        <p className="font-semibold text-[#00FFAB] mb-2">Credentials</p>
                        <p className="text-gray-300">
                          {userData.degreeCertificate ? 
                            'Degree certificate uploaded and verified' : 
                            'No degree certificate uploaded'}
                        </p>
                        <p className="text-gray-300">
                          {userData.governmentId ? 
                            'Government ID uploaded and verified' : 
                            'No government ID uploaded'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'practice' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Practice Details</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Hospital/Clinic:</span> {userData.hospitalName || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Hospital Address:</span> {userData.hospitalAddress || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Appointment Fee:</span> ₹{userData.appointmentFee || 'Not specified'}</div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mt-2">
                        <p className="font-semibold text-[#00FFAB] mb-2">Consultation Hours</p>
                        <p className="text-gray-300">Monday - Friday: {userData.weekdayHours || '10:00 AM - 5:00 PM'}</p>
                        <p className="text-gray-300">Saturday: {userData.saturdayHours || '10:00 AM - 1:00 PM'}</p>
                        <p className="text-gray-300">Sunday: {userData.sundayHours || 'Closed'}</p>
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
                      <div><span className="font-semibold text-[#00FFAB]">Username:</span> {username}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Full Name:</span> {userData.fullName || fullName}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Email:</span> {email}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Store Name:</span> {userData.storeName || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Seller Type:</span> {userData.sellerType || 'Not specified'}</div>
                    </div>
                  </div>
                )}
                {activeSection === 'store' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Store Information</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">Store Name:</span> {userData.storeName || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Type:</span> {userData.sellerType || 'Not specified'}</div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mt-2">
                        <p className="font-semibold text-[#00FFAB] mb-2">Store Statistics</p>
                        <p className="text-gray-300">Total Products: {userData.totalProducts || 'Not specified'}</p>
                        <p className="text-gray-300">Active Listings: {userData.activeListings || 'Not specified'}</p>
                        <p className="text-gray-300">Customer Rating: {userData.customerRating || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === 'license' && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">License Details</h3>
                    <div className="flex flex-col gap-4 text-lg text-white">
                      <div><span className="font-semibold text-[#00FFAB]">GST Number:</span> {userData.gstNumber || 'Not specified'}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Drug License Number:</span> {userData.drugLicenseNumber || 'Not specified'}</div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mt-2">
                        <p className="font-semibold text-[#00FFAB] mb-2">Verification Status</p>
                        <p className="text-green-400 font-medium">
                          {userData.licenseVerified ? '✓ Licenses Verified' : '✗ Licenses Not Verified'}
                        </p>
                        <p className="text-gray-300 mt-2">Last verified: {userData.licenseVerifiedDate || 'Not specified'}</p>
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
                        <p className="text-gray-300">{userData.storeAddress || 'Not specified'}</p>
                      </div>
                      <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10 mt-2">
                        <p className="font-semibold text-[#00FFAB] mb-2">Business Hours</p>
                        <p className="text-gray-300">Monday - Saturday: {userData.businessHours || 'Not specified'}</p>
                        <p className="text-gray-300">Sunday: {userData.sundayHours || 'Not specified'}</p>
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