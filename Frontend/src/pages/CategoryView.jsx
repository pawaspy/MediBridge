import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaCaretDown } from 'react-icons/fa';
import logo from '../removed-bg-medibridge.png';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import FilterSidebar from '../components/FilterSidebar';
import MedicineGrid from '../components/MedicineGrid';

// Renamed to MainNavbar to avoid conflicts
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
    <nav className="sticky top-0 w-full bg-[#121212]/40 border-b border-gray-800/50 py-6 backdrop-blur-lg z-50">
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
                <a href="#" className="block px-6 py-3 text-center text-[#7B68EE] hover:bg-[#00D37F]/10">Your Profile</a>
                <a href="#" className="block px-6 py-3 text-center text-[#00D37F] hover:bg-[#00D37F]/10">Orders</a>
                <a href="#" className="block px-6 py-3 text-center text-[#00D37F] hover:bg-[#00D37F]/10">Settings</a>
                <hr className="border-[#00D37F]/10 mx-6 my-2" />
                <a href="#" onClick={handleSignOut} className="block px-6 py-3 text-center text-[#00D37F] hover:bg-[#00D37F]/10">Sign Out</a>
              </div>
            </div>
          </div>

          {/* Cart Button */}
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

const CategoryView = () => {
  const { category } = useParams();
  const location = useLocation();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [filters, setFilters] = useState({
    expiryMonths: 'all'
  });
  const [sortBy, setSortBy] = useState('price-asc');
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { username, role } = JSON.parse(userData);
      setUsername(username);
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    if (location.state?.medicines) {
      // Ensure each medicine has a unique id
      const medicinesWithId = location.state.medicines.map((med, idx) => ({
        ...med,
        id: med.id || idx + 1
      }));
      setMedicines(medicinesWithId);
      setFilteredMedicines(medicinesWithId);
    }
  }, [location.state]);

  useEffect(() => {
    let result = [...medicines];

    // Apply filters
    if (filters.expiryMonths !== 'all') {
      result = result.filter(med => med.expiryMonths <= parseInt(filters.expiryMonths));
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'discount-desc':
        result.sort((a, b) => b.discount - a.discount);
        break;
      case 'expiry-asc':
        result.sort((a, b) => a.expiryMonths - b.expiryMonths);
        break;
      default:
        break;
    }

    setFilteredMedicines(result);
  }, [medicines, filters, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('navbarLayout');
    setUsername('');
    await new Promise(resolve => setTimeout(resolve, 100));
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] relative">
      {/* Three.js Background */}
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
          style={{ backdropFilter: 'blur(4px)' }}
        />
      </div>

      <MainNavbar username={username} handleSignOut={handleSignOut} userRole={userRole} navigate={navigate} />

      <div className='relative z-10 w-full flex flex-col gap-4 justify-center'>
        <div className="flex justify-center">
          <h1 className="text-4xl font-bold text-white capitalize">
            {category ? category.replace(/-/g, ' ') : 'Best Sellers'}
          </h1>
        </div>
        <div className='flex justify-center py-4'>
          <MedicineGrid medicines={filteredMedicines} />
        </div>
      </div>
    </div>
  );
};

export default CategoryView;