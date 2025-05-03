import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { FaUser, FaHeartbeat, FaPrescriptionBottleAlt, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const sidebarLinks = [
  { label: 'Profile', icon: <FaUser />, section: 'profile' },
  { label: 'Medical Info', icon: <FaHeartbeat />, section: 'medical' },
  { label: 'Prescriptions', icon: <FaPrescriptionBottleAlt />, section: 'prescriptions' },
];

const mockPatientData = {
  disease: 'Hypertension',
  bloodGroup: 'A+',
  prescribedMedicines: [
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
    { name: 'Metoprolol', dosage: '25mg', frequency: 'Once daily' },
  ],
};

export default function PatientProfile() {
  const [activeSection, setActiveSection] = useState('profile');
  const [username, setUsername] = useState('');
  const [patientData, setPatientData] = useState(mockPatientData);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const { username } = JSON.parse(userData);
          setUsername(username);
          const response = await api.get(`/api/patients/${username}`);
          setPatientData(response.data);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatientData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('userData');
    navigate('/login');
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
  );
} 