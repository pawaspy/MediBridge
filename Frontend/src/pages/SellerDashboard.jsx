import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { useNavigate } from 'react-router-dom';
import logo from '../removed-bg-medibridge.png';
import {
  FaSearch, FaShoppingCart, FaUser, FaCaretDown, FaSignOutAlt,
  FaStore, FaIdCard, FaMapMarkerAlt, FaPlus, FaPills,
  FaEdit, FaTrash, FaFilter, FaSortAmountDown, FaSortAmountUp,
  FaClipboardList, FaBoxOpen, FaChartLine, FaShippingFast, FaCog, FaTachometerAlt
} from 'react-icons/fa';
import MedicineManagement from '../components/MedicineManagement';
import { sellerService } from '../api/apiService';
import { removeUserData, getUserData, getToken } from '../utils/auth';
import axios from 'axios';

// Navbar component with advanced search integration
const Navbar = ({ username, handleSignOut }) => {
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
    <nav className="sticky top-0 w-full bg-[#121212]/90 border-b border-gray-800/50 py-6 backdrop-blur-lg z-[9999]" style={{ background: '#121212' }}>
      <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex-shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
          onClick={() => navigate('/main')}
        >
          <img 
            src={logo}
            alt="MediBridge" 
            className="h-14 w-auto"
          />
        </div>
        {/* Search Bar */}
        <div className="flex-1 flex justify-center max-w-3xl px-4">
          <div className="w-full max-w-[800px]">
            <form onSubmit={handleSearchSubmit}>
              <div className={`relative rounded-lg overflow-hidden transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-[#00FFAB]' : ''}`}> 
                <div className="flex">
                  <select className="bg-[#2a2a2a]/50 text-white px-3 py-2.5 border-r border-gray-700/50 focus:outline-none cursor-pointer hover:bg-[#00FFAB]/20 transition-colors">
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
                    className="bg-[#2a2a2a]/50 hover:bg-[#00FFAB]/20 px-6 flex items-center justify-center transition-colors"
                  >
                    <FaSearch className="text-[#00FFAB] text-xl" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {/* Profile Button */}
        <div className="flex items-center gap-6 ml-8">
          <div className="group relative">
            <button className="flex items-center gap-2 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-[#00D37F]/20 group-hover:text-[#00D37F]">
              <div className="flex flex-col items-center w-full">
                <span className="text-sm text-gray-400 group-hover:text-[#00D37F]/80">
                  Hello, {username || 'Seller'}
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
                  href="/seller-dashboard"
                  className="block px-6 py-3 text-center text-[#00D37F] no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  Dashboard
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
        </div>
      </div>
    </nav>
  );
};

// Sidebar navigation links
const sidebarLinks = [
  { label: 'Dashboard', icon: <FaStore />, section: 'dashboard' },
  { label: 'Products', icon: <FaPills />, section: 'products' },
  { label: 'Store Info', icon: <FaIdCard />, section: 'store' },
  { label: 'Location', icon: <FaMapMarkerAlt />, section: 'location' },
];

// Mock medicine data - would be replaced with real data in production
const initialMedicines = [
  { id: 'MED001', name: 'Paracetamol', price: 150, expiry: '2025-06-30', quantity: 500 },
  { id: 'MED002', name: 'Azithromycin', price: 350, expiry: '2025-02-15', quantity: 200 },
  { id: 'MED003', name: 'Metformin', price: 220, expiry: '2024-09-01', quantity: 350 },
  { id: 'MED004', name: 'Lisinopril', price: 180, expiry: '2026-01-20', quantity: 100 },
  { id: 'MED005', name: 'Amoxicillin', price: 280, expiry: '2024-08-05', quantity: 250 },
];

export default function SellerDashboard() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userData, setUserData] = useState({});
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [formVisible, setFormVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savingMedicine, setSavingMedicine] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentMedicine, setCurrentMedicine] = useState({
    id: '',
    name: '',
    price: 0,
    expiry: '',
    quantity: 0,
    description: '',
    discount: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        
        // Get user data from auth utils
        const userDataFromStorage = getUserData();
        
        if (!userDataFromStorage) {
          navigate('/login');
          return;
        }
        
        // Check if user is a seller
        if (userDataFromStorage.role !== 'seller') {
          navigate('/profile');
          return;
        }
        
        setUsername(userDataFromStorage.username);
        setEmail(userDataFromStorage.email);
        setFullName(userDataFromStorage.fullName);
        
        // Fetch seller profile data from API
        const sellerResponse = await sellerService.getSeller(userDataFromStorage.username);
        setUserData(sellerResponse.data);
        
        // Fetch seller medicines from API
        try {
          const medicinesResponse = await sellerService.getSellerMedicines(userDataFromStorage.username);
          
          if (medicinesResponse.data && medicinesResponse.data.length > 0) {
            // Transform API data to match our frontend format if necessary
            const formattedMedicines = medicinesResponse.data.map(med => ({
              id: med.id,
              name: med.name,
              price: med.price,
              expiry: med.expiry_date,
              quantity: med.quantity,
              description: med.description,
              discount: med.discount
            }));
            setMedicines(formattedMedicines);
          } else {
            // Fall back to empty array if API returns empty
            setMedicines([]);
          }
        } catch (medicineError) {
          console.error('Error fetching medicines:', medicineError);
          // Fall back to empty array if API fails
          setMedicines([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching seller data:', err);
        setError('Failed to load seller data. Please try again later.');
        setLoading(false);
        
        // Fall back to local storage data if API fails
        const basicUserData = localStorage.getItem('userData');
        if (basicUserData) {
          const parsedBasicData = JSON.parse(basicUserData);
          setUsername(parsedBasicData.username);
          setEmail(parsedBasicData.email);
          setFullName(parsedBasicData.fullName);
        }
        
        // Set empty medicines array if API fails
        setMedicines([]);
      }
    };
    
    fetchSellerData();
  }, [navigate]);

  const handleSignOut = async () => {
    removeUserData();
    navigate('/', { replace: true });
  };

  // Medicine CRUD operations
  const addMedicine = async () => {
    try {
      // Form validation
      if (!currentMedicine.name) {
        alert('Medicine name is required');
        return;
      }
      
      // Force set auth token before making request
      const token = getToken();
      if (!token) {
        alert('Your session has expired. Please login again.');
        navigate('/login');
        return;
      }
      
      // Ensure token is set for this request
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (!currentMedicine.price || currentMedicine.price <= 0) {
        alert('Price must be greater than 0');
        return;
      }
      
      if (!currentMedicine.expiry) {
        alert('Expiry date is required');
        return;
      }
      
      if (!currentMedicine.quantity || currentMedicine.quantity < 0) {
        alert('Quantity must be a positive number');
        return;
      }
      
      // Validate expiry date is in the future
      const expiryDate = new Date(currentMedicine.expiry);
      const today = new Date();
      if (expiryDate <= today) {
        alert('Expiry date must be in the future');
        return;
      }
      
      setSavingMedicine(true);
      setError(null);
      
      const userData = getUserData();
      
      if (!userData) {
        navigate('/login');
        return;
      }
      
      // Prepare data for API
      const medicineData = {
        name: currentMedicine.name,
        description: currentMedicine.description || "No description provided",
        expiry_date: currentMedicine.expiry,
        quantity: parseInt(currentMedicine.quantity),
        price: Number(currentMedicine.price).toFixed(2),
        discount: parseInt(currentMedicine.discount) || 0,
        seller: userData.username
      };
      
      if (editMode && currentMedicine.id) {
        // Update existing medicine
        await sellerService.updateMedicine({
          ...medicineData,
          id: currentMedicine.id
        });
        
        // Update local state
        setMedicines(medicines.map(med =>
          med.id === currentMedicine.id ? {...currentMedicine} : med
        ));
      } else {
        // Create new medicine
        const response = await sellerService.createMedicine(medicineData);
        
        // Update local state with the response from API
        const newMedicine = {
          id: response.data.id,
          name: response.data.name,
          price: response.data.price,
          expiry: response.data.expiry_date,
          quantity: response.data.quantity,
          description: response.data.description,
          discount: response.data.discount
        };
        
        setMedicines([...medicines, newMedicine]);
      }
      
      // Reset form
      setCurrentMedicine({ id: '', name: '', price: 0, expiry: '', quantity: 0, description: '', discount: 0 });
      setFormVisible(false);
      setEditMode(false);
      setSavingMedicine(false);
    } catch (err) {
      console.error('Error adding/updating medicine:', err);
      setError('Failed to save medicine. Please try again.');
      setSavingMedicine(false);
      
      // Add detailed error logging
      if (err.response) {
        console.error('Server error details:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        if (err.response.data && err.response.data.error) {
          const errorMsg = err.response.data.error.message || err.response.data.error;
          alert(`Error: ${errorMsg}`);
        } else {
          alert('Server error. Please check console for details.');
        }
      } else {
        alert('Failed to save medicine. Please try again.');
      }
    }
  };

  const deleteMedicine = async (id) => {
    try {
      setDeletingId(id);
      setError(null);
      
      // Call API to delete medicine
      await sellerService.deleteMedicine(id);
      
      // Update local state
      const updatedMedicines = medicines.filter(med => med.id !== id);
      setMedicines(updatedMedicines);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting medicine:', err);
      setError('Failed to delete medicine. Please try again.');
      setDeletingId(null);
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Error: ${err.response.data.error}`);
      } else {
        alert('Failed to delete medicine. Please try again.');
      }
    }
  };

  const editMedicine = (medicine) => {
    setCurrentMedicine(medicine);
    setEditMode(true);
    setFormVisible(true);
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedMedicines = React.useMemo(() => {
    let sortableMedicines = [...medicines];
    if (sortConfig.key) {
      sortableMedicines.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableMedicines;
  }, [medicines, sortConfig]);

  // Calculate dashboard statistics
  const totalProducts = medicines.length;
  const totalInventory = medicines.reduce((sum, med) => sum + med.quantity, 0);
  const lowStockItems = medicines.filter(med => med.quantity < 100).length;
  const expiringItems = medicines.filter(med => {
    const expiryDate = new Date(med.expiry);
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    return expiryDate < twoMonthsFromNow;
  }).length;

  // Dashboard sections configuration
  const dashboardSections = [
    { 
      id: 'dashboard', 
      label: 'Dashboard Overview', 
      icon: <FaTachometerAlt /> 
    },
    { 
      id: 'medicines', 
      label: 'Medicine Management', 
      icon: <FaBoxOpen /> 
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: <FaClipboardList /> 
    },
    { 
      id: 'sales', 
      label: 'Sales Analytics', 
      icon: <FaChartLine /> 
    },
    { 
      id: 'shipping', 
      label: 'Shipping', 
      icon: <FaShippingFast /> 
    },
    { 
      id: 'settings', 
      label: 'Store Settings', 
      icon: <FaCog /> 
    }
  ];

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

      {/* Main Navbar */}
      <Navbar username={username} handleSignOut={handleSignOut} />

      {/* Content with Sidebar */}
      <div className="relative z-10 flex pt-8">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-80px)] bg-[#121212]/80 border-r border-gray-800/40 flex flex-col py-10 px-6 gap-6 sticky top-24">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#00FFAB] mb-2">Seller Dashboard</h2>
            <p className="text-gray-300 text-sm">Welcome, <span className="font-semibold">{username || 'Seller'}</span></p>
          </div>
          <nav className="flex flex-col gap-2 flex-1">
            {dashboardSections.map((section) => (
              <button
                key={section.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors
                  ${activeSection === section.id
                    ? 'bg-[#00FFAB]/20 text-[#00FFAB]'
                    : 'text-gray-200 hover:bg-[#00FFAB]/10 hover:text-[#00FFAB]'}
                `}
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon}
                {section.label}
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
        <main className="flex-1 flex flex-col items-center justify-start py-8 px-8 md:px-12">

          {/* Dashboard Overview */}
          {activeSection === 'dashboard' && (
            <div className="w-full">
              <h3 className="text-3xl font-bold text-[#00FFAB] mb-8">Dashboard Overview</h3>
              <br />

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-8 backdrop-blur-md hover:shadow-[#00FFAB]/20 hover:shadow-lg transition-all">
                  <h4 className="text-[#00FFAB] text-xl font-semibold mb-3">Total Products</h4>
                  <p className="text-white text-4xl font-bold">{totalProducts}</p>
                </div>

                <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-8 backdrop-blur-md hover:shadow-[#00FFAB]/20 hover:shadow-lg transition-all">
                  <h4 className="text-[#00FFAB] text-xl font-semibold mb-3">Total Inventory</h4>
                  <p className="text-white text-4xl font-bold">{totalInventory} Units</p>
                </div>

                <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-8 backdrop-blur-md hover:shadow-[#00FFAB]/20 hover:shadow-lg transition-all">
                  <h4 className="text-[#00FFAB] text-xl font-semibold mb-3">Low Stock Items</h4>
                  <p className="text-white text-4xl font-bold">{lowStockItems}</p>
                </div>

                <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-8 backdrop-blur-md hover:shadow-[#00FFAB]/20 hover:shadow-lg transition-all">
                  <h4 className="text-[#00FFAB] text-xl font-semibold mb-3">Expiring Soon</h4>
                  <p className="text-white text-4xl font-bold">{expiringItems}</p>
                </div>
              </div>
              <br/>

              {/* Seller Info */}
              <div className="bg-[#1a1a1a]/80 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-8 backdrop-blur-md hover:shadow-[#00FFAB]/20 hover:shadow-lg transition-all mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-2xl font-bold text-[#00FFAB]">Seller Information</h4>
                  <button
                    className="bg-[#00FFAB]/10 text-[#00FFAB] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#00FFAB]/20 transition-colors"
                    onClick={() => setActiveSection('store')}
                  >
                    View Store Details
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                  <div className="bg-[#121212]/80 rounded-xl p-5 border border-[#00FFAB]/10">
                    <h5 className="text-lg text-[#00FFAB] font-semibold mb-3">Store Details</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Store Name:</span>
                        <span className="font-medium">{userData.storeName || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Seller Type:</span>
                        <span className="font-medium">{userData.sellerType || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#121212]/80 rounded-xl p-5 border border-[#00FFAB]/10">
                    <h5 className="text-lg text-[#00FFAB] font-semibold mb-3">License Details</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">GST Number:</span>
                        <span className="font-medium">{userData.gstNumber || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Drug License:</span>
                        <span className="font-medium">{userData.drugLicenseNumber || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <br/>

              {/* Recently Added Products */}
              <div className="bg-[#1a1a1a]/80 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-8 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-2xl font-bold text-[#00FFAB]">Recently Added Products</h4>
                  <button
                    className="bg-[#00FFAB]/10 text-[#00FFAB] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#00FFAB]/20 transition-colors"
                    onClick={() => setActiveSection('products')}
                  >
                    View All Products
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-white border-collapse">
                    <thead>
                      <tr className="border-b border-[#00FFAB]/20">
                        <th className="text-left py-4 px-4 text-[#00FFAB]">Name</th>
                        <th className="text-left py-4 px-4 text-[#00FFAB]">ID</th>
                        <th className="text-right py-4 px-4 text-[#00FFAB]">Price (₹)</th>
                        <th className="text-right py-4 px-4 text-[#00FFAB]">Discount</th>
                        <th className="text-right py-4 px-4 text-[#00FFAB]">Expiry</th>
                        <th className="text-center py-4 px-4 text-[#00FFAB]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.slice(0, 5).map(med => (
                        <tr key={med.id} className="border-b border-gray-800/30 hover:bg-[#00FFAB]/5 transition-colors">
                          <td className="py-4 px-4 font-medium">{med.name}</td>
                          <td className="py-4 px-4 text-gray-300">{med.id}</td>
                          <td className="py-4 px-4 text-right font-bold">₹{med.price}</td>
                          <td className="py-4 px-4 text-right">{med.discount || 0}%</td>
                          <td className="py-4 px-4 text-right">{new Date(med.expiry).toLocaleDateString()}</td>
                          <td className="py-4 px-4 flex justify-center">
                            <button
                              className="bg-[#00FFAB]/20 text-[#00FFAB] hover:bg-[#00FFAB]/30 transition-colors p-2 rounded-lg flex items-center gap-1 border border-[#00FFAB]/30"
                              onClick={() => {
                                setActiveSection('products');
                                editMedicine(med);
                              }}
                            >
                              <FaEdit size={14} /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Products Management */}
          <br></br>
          {activeSection === 'products' && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-[#00FFAB]">Manage Medicines</h3>
                <button
                  className="bg-[#00FFAB]/20 text-[#00FFAB] px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#00FFAB]/30 transition-colors font-bold text-lg shadow-md border border-[#00FFAB]/30"
                  onClick={() => {
                    setCurrentMedicine({ id: '', name: '', price: 0, expiry: '', quantity: 0, description: '', discount: 0 });
                    setEditMode(false);
                    setFormVisible(true);
                  }}
                >

                  <FaPlus size={18} /> Add Medicine
                </button>
              </div>
              <br></br>

              {/* Show error message if present */}
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Add/Edit Medicine Form */}
              {formVisible && (
                <div className="bg-[#1a1a1a]/90 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-8 backdrop-blur-md mb-8">
                  <h4 className="text-2xl font-bold text-[#00FFAB] mb-4">
                    {editMode ? 'Edit Medicine' : 'Add New Medicine'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[#00FFAB] mb-2">Medicine Name</label>
                      <input
                        type="text"
                        value={currentMedicine.name}
                        onChange={(e) => setCurrentMedicine({ ...currentMedicine, name: e.target.value })}
                        className="w-full bg-[#00FFAB]/10 border border-[#00FFAB]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter medicine name"
                      />
                    </div>

                    <div>
                      <label className="block text-[#00FFAB] mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={currentMedicine.price}
                        onChange={(e) => setCurrentMedicine({ ...currentMedicine, price: Number(e.target.value) })}
                        className="w-full bg-[#00FFAB]/10 border border-[#00FFAB]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter price"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-[#00FFAB] mb-2">Expiry Date</label>
                      <input
                        type="date"
                        value={currentMedicine.expiry}
                        onChange={(e) => setCurrentMedicine({ ...currentMedicine, expiry: e.target.value })}
                        className="w-full bg-[#00FFAB]/10 border border-[#00FFAB]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[#00FFAB] mb-2">Quantity</label>
                      <input
                        type="number"
                        value={currentMedicine.quantity}
                        onChange={(e) => setCurrentMedicine({ ...currentMedicine, quantity: Number(e.target.value) })}
                        className="w-full bg-[#00FFAB]/10 border border-[#00FFAB]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter quantity"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-[#00FFAB] mb-2">Description</label>
                      <textarea
                        value={currentMedicine.description}
                        onChange={(e) => setCurrentMedicine({ ...currentMedicine, description: e.target.value })}
                        className="w-full bg-[#00FFAB]/10 border border-[#00FFAB]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter medicine description"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-[#00FFAB] mb-2">Discount (%)</label>
                      <input
                        type="number"
                        value={currentMedicine.discount}
                        onChange={(e) => setCurrentMedicine({ ...currentMedicine, discount: Number(e.target.value) })}
                        className="w-full bg-[#00FFAB]/10 border border-[#00FFAB]/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        placeholder="Enter discount percentage"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <br/>

                  <div className="flex gap-3 mt-6">
                    <button
                      className={`bg-[#00FFAB]/20 text-[#00FFAB] px-6 py-3 rounded-lg hover:bg-[#00FFAB]/30 transition-colors font-bold text-lg shadow-md flex items-center gap-2 border border-[#00FFAB]/30 ${savingMedicine ? 'opacity-70 cursor-not-allowed' : ''}`}
                      onClick={addMedicine}
                      disabled={savingMedicine}
                    >
                      {savingMedicine ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-[#00FFAB]/80 border-r-2 border-l-2 border-b-2 border-b-transparent"></span>
                          {editMode ? 'Saving...' : 'Adding...'}
                        </>
                      ) : (
                        editMode ? <><FaEdit size={18} /> Save Changes</> : <><FaPlus size={18} /> Add Medicine</>
                      )}
                    </button>
                    <button
                      className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg hover:bg-[#1a1a1a]/90 transition-colors border border-gray-700 font-bold text-lg shadow-md"
                      onClick={() => {
                        setFormVisible(false);
                        setEditMode(false);
                      }}
                      disabled={savingMedicine}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Medicines Table */}
              <div className="bg-[#1a1a1a]/80 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-8 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-2xl font-bold text-[#00FFAB]">Medicine Inventory</h4>
                  <div className="flex gap-2">
                    <button
                      className="bg-[#00FFAB]/10 text-[#00FFAB] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#00FFAB]/20 transition-colors"
                      onClick={() => handleSort('price')}
                    >
                      <FaFilter size={14} /> Price
                      {sortConfig.key === 'price' && (
                        sortConfig.direction === 'ascending' ?
                          <FaSortAmountUp size={14} /> :
                          <FaSortAmountDown size={14} />
                      )}
                    </button>
                    <button
                      className="bg-[#00FFAB]/10 text-[#00FFAB] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#00FFAB]/20 transition-colors"
                      onClick={() => handleSort('expiry')}
                    >
                      <FaFilter size={14} /> Expiry
                      {sortConfig.key === 'expiry' && (
                        sortConfig.direction === 'ascending' ?
                          <FaSortAmountUp size={14} /> :
                          <FaSortAmountDown size={14} />
                      )}
                    </button>
                    <button
                      className="bg-[#00FFAB]/10 text-[#00FFAB] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#00FFAB]/20 transition-colors"
                      onClick={() => handleSort('quantity')}
                    >
                      <FaFilter size={14} /> Quantity
                      {sortConfig.key === 'quantity' && (
                        sortConfig.direction === 'ascending' ?
                          <FaSortAmountUp size={14} /> :
                          <FaSortAmountDown size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FFAB] border-r-2 border-b-2 border-b-transparent"></div>
                    </div>
                  ) : medicines.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <p className="text-lg">No medicines added yet.</p>
                      <button
                        className="mt-4 bg-[#00FFAB]/20 text-[#00FFAB] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#00FFAB]/30 transition-colors mx-auto"
                        onClick={() => {
                          setCurrentMedicine({ id: '', name: '', price: 0, expiry: '', quantity: 0, description: '', discount: 0 });
                          setEditMode(false);
                          setFormVisible(true);
                        }}
                      >
                        <FaPlus size={14} /> Add your first medicine
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-white border-collapse">
                      <thead>
                        <tr className="border-b border-[#00FFAB]/20">
                          <th className="text-left py-4 px-4 text-[#00FFAB]">Name</th>
                          <th className="text-left py-4 px-4 text-[#00FFAB]">ID</th>
                          <th className="text-left py-4 px-4 text-[#00FFAB]">Description</th>
                          <th className="text-right py-4 px-4 text-[#00FFAB]">Price (₹)</th>
                          <th className="text-right py-4 px-4 text-[#00FFAB]">Discount</th>
                          <th className="text-right py-4 px-4 text-[#00FFAB]">Expiry</th>
                          <th className="text-right py-4 px-4 text-[#00FFAB]">Quantity</th>
                          <th className="text-center py-4 px-4 text-[#00FFAB]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedMedicines.map(med => (
                          <tr key={med.id} className="border-b border-gray-800/30 hover:bg-[#00FFAB]/5 transition-colors">
                            <td className="py-4 px-4 font-medium">{med.name}</td>
                            <td className="py-4 px-4 text-gray-300">{med.id}</td>
                            <td className="py-4 px-4 text-gray-300">{med.description ? (med.description.length > 30 ? med.description.substring(0, 30) + '...' : med.description) : 'No description'}</td>
                            <td className="py-4 px-4 text-right font-bold">₹{med.price}</td>
                            <td className="py-4 px-4 text-right">{med.discount || 0}%</td>
                            <td className="py-4 px-4 text-right">{new Date(med.expiry).toLocaleDateString()}</td>
                            <td className="py-4 px-4 text-right">{med.quantity}</td>
                            <td className="py-4 px-4 flex justify-center gap-3">
                              <button
                                className="bg-[#00FFAB]/20 text-[#00FFAB] hover:bg-[#00FFAB]/30 transition-colors p-2 rounded-lg flex items-center gap-1 border border-[#00FFAB]/30"
                                onClick={() => editMedicine(med)}
                                disabled={deletingId === med.id}
                              >
                                <FaEdit size={16} /> Edit
                              </button>
                              <button
                                className={`bg-red-500 text-white hover:bg-red-600 transition-colors p-2 rounded-lg flex items-center gap-1 ${deletingId === med.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                                onClick={() => deleteMedicine(med.id)}
                                disabled={deletingId === med.id}
                              >
                                {deletingId === med.id ? (
                                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-r-2 border-l-2 border-b-2 border-b-transparent"></span>
                                ) : (
                                  <FaTrash size={16} />
                                )}
                                {deletingId === med.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Store Info */}
          {activeSection === 'store' && (
            <div className="w-full">
              <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Store Information</h3>
              <div className="bg-[#1a1a1a]/80 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-8 backdrop-blur-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-bold text-[#00FFAB] mb-2">Basic Information</h4>
                      <div className="space-y-2">
                        <div><span className="font-semibold text-[#00FFAB]">Store Name:</span> {userData.storeName || 'Not specified'}</div>
                        <div><span className="font-semibold text-[#00FFAB]">Seller Type:</span> {userData.sellerType || 'Not specified'}</div>
                        <div><span className="font-semibold text-[#00FFAB]">Owner:</span> {fullName || username}</div>
                        <div><span className="font-semibold text-[#00FFAB]">Email:</span> {email}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-[#00FFAB] mb-2">License Information</h4>
                      <div className="space-y-2">
                        <div><span className="font-semibold text-[#00FFAB]">GST Number:</span> {userData.gstNumber || 'Not specified'}</div>
                        <div><span className="font-semibold text-[#00FFAB]">Drug License Number:</span> {userData.drugLicenseNumber || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-[#00FFAB] mb-2">Store Statistics</h4>
                    <div className="space-y-2">
                      <div><span className="font-semibold text-[#00FFAB]">Total Products:</span> {totalProducts}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Total Inventory:</span> {totalInventory} Units</div>
                      <div><span className="font-semibold text-[#00FFAB]">Account Created:</span> {new Date().toLocaleDateString()}</div>
                      <div><span className="font-semibold text-[#00FFAB]">Verification Status:</span> <span className="text-green-400">Verified</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          {activeSection === 'location' && (
            <div className="w-full">
              <h3 className="text-3xl font-bold text-[#00FFAB] mb-6">Store Location</h3>
              <div className="bg-[#1a1a1a]/80 rounded-3xl shadow-lg border border-[#00FFAB]/10 p-8 backdrop-blur-md">
                <div className="text-white">
                  <h4 className="text-xl font-bold text-[#00FFAB] mb-4">Address</h4>
                  <div className="bg-[#101010] rounded-lg p-4 border border-[#00FFAB]/10 mb-6">
                    <p className="text-gray-300">{userData.storeAddress || 'No address provided'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xl font-bold text-[#00FFAB] mb-2">Business Hours</h4>
                      <div className="bg-[#101010] rounded-lg p-4 border border-[#00FFAB]/10">
                        <div className="space-y-2">
                          <p className="flex justify-between"><span>Monday - Friday:</span> <span>9:00 AM - 9:00 PM</span></p>
                          <p className="flex justify-between"><span>Saturday:</span> <span>10:00 AM - 8:00 PM</span></p>
                          <p className="flex justify-between"><span>Sunday:</span> <span>10:00 AM - 5:00 PM</span></p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-[#00FFAB] mb-2">Contact Information</h4>
                      <div className="bg-[#101010] rounded-lg p-4 border border-[#00FFAB]/10">
                        <div className="space-y-2">
                          <p><span className="font-semibold text-[#00FFAB]">Phone:</span> {userData.mobile || 'Not specified'}</p>
                          <p><span className="font-semibold text-[#00FFAB]">Email:</span> {email}</p>
                          <p><span className="font-semibold text-[#00FFAB]">Website:</span> medibridge.com/store/{userData.storeName?.toLowerCase().replace(/\s+/g, '-') || 'not-specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medicine Management */}
          {activeSection === 'medicines' && (
            <MedicineManagement />
          )}

          {/* Orders Section (Placeholder) */}
          {activeSection === 'orders' && (
            <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-6 backdrop-blur-md">
              <h2 className="text-3xl font-bold text-[#00FFAB] mb-6">Orders Management</h2>
              <p className="text-white mb-4">This section is under development. Coming soon!</p>
            </div>
          )}

          {/* Sales Section (Placeholder) */}
          {activeSection === 'sales' && (
            <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-6 backdrop-blur-md">
              <h2 className="text-3xl font-bold text-[#00FFAB] mb-6">Sales Analytics</h2>
              <p className="text-white mb-4">This section is under development. Coming soon!</p>
            </div>
          )}

          {/* Shipping Section (Placeholder) */}
          {activeSection === 'shipping' && (
            <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-6 backdrop-blur-md">
              <h2 className="text-3xl font-bold text-[#00FFAB] mb-6">Shipping Management</h2>
              <p className="text-white mb-4">This section is under development. Coming soon!</p>
            </div>
          )}

          {/* Settings Section (Placeholder) */}
          {activeSection === 'settings' && (
            <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-6 backdrop-blur-md">
              <h2 className="text-3xl font-bold text-[#00FFAB] mb-6">Store Settings</h2>
              <p className="text-white mb-4">This section is under development. Coming soon!</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
} 