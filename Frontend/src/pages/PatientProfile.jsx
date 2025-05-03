import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { FaUser, FaHeartbeat, FaPrescriptionBottleAlt, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';

const sidebarLinks = [
  { label: 'Profile', icon: <FaUser />, section: 'profile' },
  { label: 'Medical Info', icon: <FaHeartbeat />, section: 'medical' },
  { label: 'Prescriptions', icon: <FaPrescriptionBottleAlt />, section: 'prescriptions' },
];

const mockPatientData = {
  disease: 'Hypertension',
  bloodGroup: 'A+',
  allergies: '',
  medicalHistory: '',
  prescribedMedicines: [
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
    { name: 'Metoprolol', dosage: '25mg', frequency: 'Once daily' },
  ],
};

export default function PatientProfile() {
  const [activeSection, setActiveSection] = useState('profile');
  const [username, setUsername] = useState('');
  const [patientData, setPatientData] = useState(mockPatientData);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const registrationData = localStorage.getItem('registrationFormData');
    
    if (userData) {
      const { username } = JSON.parse(userData);
      setUsername(username);
      
      // Use complete user data if available
      if (registrationData) {
        const fullData = JSON.parse(registrationData);
        setPatientData({
          ...mockPatientData,
          disease: fullData.disease || mockPatientData.disease,
          bloodGroup: fullData.bloodGroup || mockPatientData.bloodGroup,
          allergies: fullData.allergies || '',
          medicalHistory: fullData.medicalHistory || '',
          prescribedMedicines: fullData.prescribedMedicines || mockPatientData.prescribedMedicines
        });
      }
    }
  }, []);

  const handleSaveChanges = (e) => {
    e.preventDefault();
    
    const updatedData = {
      ...patientData,
      disease: e.target.disease.value,
      bloodGroup: e.target.bloodGroup.value,
      allergies: e.target.allergies.value,
      medicalHistory: e.target.medicalHistory.value
    };
    
    setPatientData(updatedData);
    
    // Save to local storage
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const updatedUserData = {
      ...userData,
      disease: updatedData.disease,
      bloodGroup: updatedData.bloodGroup,
      allergies: updatedData.allergies,
      medicalHistory: updatedData.medicalHistory
    };
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    
    setIsEditing(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('navbarLayout');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-[#101820] relative">
      {/* Star Background */}
      <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <Canvas
          camera={{
            position: [-2, 2, 4],
            fov: 70,
            near: 0.001,
            far: 1000,
          }}
        >
          <Background />
        </Canvas>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backdropFilter: 'blur(8px)' }}
        />
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
        <div className="w-full max-w-3xl bg-[#1a1a1a]/80 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-10 backdrop-blur-md mt-8">
          {activeSection === 'profile' && (
            <div>
              <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Profile</h3>
              <div className="flex flex-col gap-4 text-lg text-white">
                <div><span className="font-semibold text-[#00FFAB]">Username:</span> {username}</div>
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

              {isEditing ? (
                <form onSubmit={handleSaveChanges} className="bg-[#121212]/60 rounded-lg p-6 border border-[#00FFAB]/10 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[#00FFAB] mb-1">Disease/Condition</label>
                      <input 
                        type="text" 
                        name="disease" 
                        className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white" 
                        defaultValue={patientData.disease || ''} 
                        placeholder="Enter disease or condition"
                      />
                    </div>
                    <div>
                      <label className="block text-[#00FFAB] mb-1">Blood Group</label>
                      <input 
                        type="text" 
                        name="bloodGroup" 
                        className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white" 
                        defaultValue={patientData.bloodGroup || ''} 
                        placeholder="Enter blood group"
                      />
                    </div>
                    <div>
                      <label className="block text-[#00FFAB] mb-1">Allergies</label>
                      <input 
                        type="text" 
                        name="allergies" 
                        className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white" 
                        defaultValue={patientData.allergies || ''} 
                        placeholder="Enter allergies"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[#00FFAB] mb-1">Medical History</label>
                      <textarea 
                        name="medicalHistory" 
                        className="w-full bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white min-h-[80px]" 
                        defaultValue={patientData.medicalHistory || patientData.familyHistory || ''} 
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
                  <div><span className="font-semibold text-[#00FFAB]">Disease/Condition:</span> {patientData.disease || 'Not specified'}</div>
                  <div><span className="font-semibold text-[#00FFAB]">Blood Group:</span> {patientData.bloodGroup || 'Not specified'}</div>
                  <div><span className="font-semibold text-[#00FFAB]">Allergies:</span> {patientData.allergies || 'Not specified'}</div>
                  <div><span className="font-semibold text-[#00FFAB]">Medical History:</span> {patientData.medicalHistory || patientData.familyHistory || 'Not specified'}</div>
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
  );
} 