import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { FaUser, FaHeartbeat, FaPrescriptionBottleAlt, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import { patientService } from '../api/apiService';
import { removeUserData } from '../utils/auth';
import { ErrorBoundary } from 'react-error-boundary';

// Add CSS for star twinkling
const starAnimationStyle = `
  @keyframes twinkle {
    0% { opacity: 0.3; }
    50% { opacity: 0.8; }
    100% { opacity: 0.3; }
  }
`;

const sidebarLinks = [
  { label: 'Profile', icon: <FaUser />, section: 'profile' },
  { label: 'Medical Info', icon: <FaHeartbeat />, section: 'medical' },
  { label: 'Prescriptions', icon: <FaPrescriptionBottleAlt />, section: 'prescriptions' },
];

export default function PatientProfile() {
  const [activeSection, setActiveSection] = useState('profile');
  const [username, setUsername] = useState('');
  const [patientData, setPatientData] = useState({});
  const [medicalProfile, setMedicalProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch patient data and medical profile
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get user data from localStorage
        const userData = localStorage.getItem('userData');
        const token = localStorage.getItem('token');
        
        if (!userData) {
          setError('User session not found. Please log in again.');
          setTimeout(() => {
            removeUserData();
            navigate('/login');
          }, 2000);
          return;
        }
        
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setTimeout(() => {
            removeUserData();
            navigate('/login');
          }, 2000);
          return;
        }
        
        try {
          const { username } = JSON.parse(userData);
          setUsername(username);
          
          // Fetch patient profile from API with retry mechanism
          let patientResponse;
          try {
            patientResponse = await patientService.getPatient(username);
          } catch (fetchError) {
            console.log('First attempt failed, retrying...');
            // Wait 1 second and retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            patientResponse = await patientService.getPatient(username);
          }
          
          setPatientData(patientResponse.data);
          
          try {
            // Fetch medical profile if it exists
            const medicalResponse = await patientService.getPatientProfile(username);
            setMedicalProfile(medicalResponse.data);
          } catch (medicalError) {
            console.log('Medical profile not found or error:', medicalError);
            // If medical profile doesn't exist yet, that's okay
            setMedicalProfile({});
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          setError('Invalid user data. Please log in again.');
          setTimeout(() => {
            removeUserData();
            navigate('/login');
          }, 2000);
          return;
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
        
        // Handle different error types
        if (err.response) {
          // The request was made and the server responded with a status code outside 2xx
          if (err.response.status === 401) {
            setError('Your session has expired. Please log in again.');
            setTimeout(() => {
              removeUserData();
              navigate('/login');
            }, 2000);
          } else {
            setError(`Failed to load profile data: ${err.response.data?.error?.message || 'Server error'}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          // Something happened in setting up the request
          setError('Failed to load profile data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [navigate]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    setUpdateError('');
    setUpdateSuccess('');
    
    try {
      // Get form values
      const diseaseAllergies = e.target.disease.value || '';
      const bloodGroup = e.target.bloodGroup.value;
      const prescribedMedicine = e.target.medicalHistory.value || '';
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setUpdateError('Authentication required. Please login again.');
        setTimeout(() => {
          removeUserData();
          navigate('/login');
        }, 2000);
        return;
      }
      
      // Check if we need to create or update the medical profile
      if (medicalProfile.username) {
        // Update existing profile - properly format the data according to API expectations
        const response = await patientService.updatePatientProfile({
          username,
          disease_allergies: diseaseAllergies,
          blood_group: bloodGroup,
          prescribed_medicine: prescribedMedicine
        });
        
        setMedicalProfile(response.data);
      } else {
        // Create new profile
        const response = await patientService.createPatientProfile({
          username,
          disease_allergies: diseaseAllergies,
          blood_group: bloodGroup,
          prescribed_medicine: prescribedMedicine
        });
        
        setMedicalProfile(response.data);
      }
      
      setUpdateSuccess('Medical information updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating medical profile:', err);
      
      // Enhanced error handling
      if (err.response) {
        if (err.response.status === 401) {
          setUpdateError('Authentication expired. Please login again.');
          setTimeout(() => {
            removeUserData();
            navigate('/login');
          }, 2000);
        } else if (err.response.status === 500) {
          // Attempt to recover from 500 error by trying to create instead of update
          try {
            if (medicalProfile.username) {
              const response = await patientService.createPatientProfile({
                username,
                disease_allergies: e.target.disease.value || '',
                blood_group: e.target.bloodGroup.value,
                prescribed_medicine: e.target.medicalHistory.value || ''
              });
              
              setMedicalProfile(response.data);
              setUpdateSuccess('Medical information created successfully!');
              setIsEditing(false);
              return;
            }
          } catch (createErr) {
            console.error('Error in recovery attempt:', createErr);
          }
          setUpdateError('Server error occurred. Please try again later.');
        } else {
          setUpdateError(`Failed to update: ${err.response.data?.error || 'Unknown error'}`);
        }
      } else if (err.request) {
        setUpdateError('No response from server. Please check your internet connection.');
      } else {
        setUpdateError('Failed to update medical information. Please try again.');
      }
    }
  };

  const handleSignOut = () => {
    removeUserData();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101820]">
        <div className="text-[#00FFAB] text-2xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#101820] relative">
      {/* Add the style tag for animations */}
      <style dangerouslySetInnerHTML={{ __html: starAnimationStyle }} />
      
      {/* Static Gradient Background instead of WebGL Stars */}
      <div 
        className="fixed inset-0 bg-gradient-to-b from-[#101820] to-[#0a1016] z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 171, 0.15) 0%, rgba(0, 255, 171, 0) 25%), radial-gradient(circle at 80% 20%, rgba(0, 255, 171, 0.1) 0%, rgba(0, 255, 171, 0) 20%)'
        }}
      >
        {/* Static stars */}
        <div className="stars-container">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${Math.random() * 5 + 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="relative z-10 w-64 min-h-screen bg-[#121212]/80 border-r border-gray-800/40 flex flex-col py-10 px-6 gap-6">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#00FFAB] mb-2">Patient Panel</h2>
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

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start py-16 px-8 md:px-24">
        {error && (
          <div className="w-full max-w-3xl mb-8 bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl">
            {error}
          </div>
        )}
        
        <div className="w-full max-w-3xl bg-[#1a1a1a]/80 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-10 backdrop-blur-md mt-8">
          {activeSection === 'profile' && (
            <div>
              <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Profile</h3>
              <div className="flex flex-col gap-4 text-lg text-white">
                <div><span className="font-semibold text-[#00FFAB]">Username:</span> {patientData.username}</div>
                <div><span className="font-semibold text-[#00FFAB]">Full Name:</span> {patientData.full_name}</div>
                <div><span className="font-semibold text-[#00FFAB]">Email:</span> {patientData.email}</div>
                <div><span className="font-semibold text-[#00FFAB]">Mobile Number:</span> {patientData.mobile_number}</div>
                <div><span className="font-semibold text-[#00FFAB]">Gender:</span> {patientData.gender}</div>
                <div><span className="font-semibold text-[#00FFAB]">Age:</span> {patientData.age}</div>
                <div><span className="font-semibold text-[#00FFAB]">Address:</span> {patientData.address}</div>
                <div><span className="font-semibold text-[#00FFAB]">Emergency Contact:</span> {patientData.emergency_contact}</div>
              </div>
            </div>
          )}
          {activeSection === 'medical' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-[#00FFAB]">Medical Info</h3>
                <button 
                  className="bg-[#00FFAB]/20 text-[#00FFAB] px-4 py-2 rounded-lg hover:bg-[#00FFAB]/30 transition-colors"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {updateError && (
                <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 mb-6 rounded-xl">
                  {updateError}
                </div>
              )}
              
              {updateSuccess && (
                <div className="bg-green-500/20 border border-green-500 text-green-100 p-4 mb-6 rounded-xl">
                  {updateSuccess}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSaveChanges} className="bg-[#121212]/60 rounded-lg p-6 border border-[#00FFAB]/10 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[#00FFAB] mb-1">Disease/Allergies</label>
                      <input 
                        type="text" 
                        name="disease" 
                        className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white" 
                        defaultValue={medicalProfile.disease_allergies || ''} 
                        placeholder="Enter disease or allergies"
                      />
                    </div>
                    <div>
                      <label className="block text-[#00FFAB] mb-1">Blood Group</label>
                      <select 
                        name="bloodGroup" 
                        className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                        defaultValue={medicalProfile.blood_group || ''}
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
                    <div className="md:col-span-2">
                      <label className="block text-[#00FFAB] mb-1">Medical History</label>
                      <textarea 
                        name="medicalHistory" 
                        className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white min-h-[80px]" 
                        defaultValue={medicalProfile.prescribed_medicine || ''} 
                        placeholder="Enter medical history"
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      className="bg-transparent border border-[#00FFAB]/50 text-[#00FFAB] py-2 px-4 rounded-md hover:bg-[#00FFAB]/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-[#00FFAB] text-black py-2 px-4 rounded-md hover:bg-[#00D37F] transition-colors font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4 text-lg text-white">
                  <div><span className="font-semibold text-[#00FFAB]">Disease/Allergies:</span> {medicalProfile.disease_allergies || 'Not specified'}</div>
                  <div><span className="font-semibold text-[#00FFAB]">Blood Group:</span> {medicalProfile.blood_group || 'Not specified'}</div>
                  <div><span className="font-semibold text-[#00FFAB]">Medical History:</span> {medicalProfile.prescribed_medicine || 'Not specified'}</div>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="self-start mt-4 bg-[#00FFAB]/20 text-[#00FFAB] py-2 px-4 rounded-md hover:bg-[#00FFAB]/30 transition-colors flex items-center gap-2"
                  >
                    <FiEdit2 size={18} /> Edit Information
                  </button>
                </div>
              )}
            </div>
          )}
          {activeSection === 'prescriptions' && (
            <div>
              <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Prescribed Medicines</h3>
              <div className="flex flex-col gap-4 text-lg text-white">
                {medicalProfile.prescribed_medicine ? (
                  <div className="bg-[#121212]/60 rounded-lg p-4 border border-[#00FFAB]/10">
                    <pre className="font-sans whitespace-pre-wrap">{medicalProfile.prescribed_medicine}</pre>
                  </div>
                ) : (
                  <div className="bg-[#121212]/60 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No prescribed medicines found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 