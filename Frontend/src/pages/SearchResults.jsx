import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaCaretDown, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import logo from '../removed-bg-medibridge.png';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';

// MainNavbar component with search functionality
const MainNavbar = ({ username, handleSignOut, userRole, onSearch }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
        {/* Profile & Cart Buttons */}
        <div className="flex items-center gap-6 ml-8">
          {/* Profile Button */}
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
                  onClick={e => { 
                    e.preventDefault(); 
                    navigate('/profile'); 
                  }}
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

// MedicineCard Component
const MedicineCard = ({ id, name, description, price, originalPrice, discount, expiryMonths, image }) => {
  const navigate = useNavigate();
  
  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price,
        image,
        quantity: 1
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  };
  
  const handleViewDetails = () => {
    // Push to the product detail page
    navigate(`/product/${id}`);
  };
  
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#00D37F]/10 hover:border-[#00D37F]/30 transition-all group w-[250px]">
      <div 
        className="aspect-square rounded-lg bg-white/5 mb-4 p-4 flex items-center justify-center cursor-pointer"
        onClick={handleViewDetails}
      >
        <img src={image || "https://via.placeholder.com/200"} alt={name} className="max-h-full object-contain" />
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 
            className="text-lg font-semibold text-white cursor-pointer hover:text-[#00FFAB] transition-colors"
            onClick={handleViewDetails}
          >
            {name}
          </h3>
          <span className="bg-[#00D37F]/20 text-[#00D37F] px-2 py-1 rounded-full text-sm">{expiryMonths}M</span>
        </div>
        <p className="text-gray-400 text-sm">{description}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">₹{price}</span>
          <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
          <span className="text-[#00D37F] text-sm font-semibold">{discount}% off</span>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex-1 py-2 bg-[#00FFAB] hover:bg-[#00D37F] text-black font-semibold rounded-lg transition-colors" 
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
          <button
            className="flex-1 py-2 bg-[#181818] hover:bg-[#252525] text-white border border-[#00FFAB]/30 font-semibold rounded-lg transition-colors"
            onClick={handleViewDetails}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

// MedicineGrid Component
const MedicineGrid = ({ medicines }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
      {medicines.length > 0 ? (
        medicines.map((medicine) => (
          <MedicineCard key={medicine.id} {...medicine} />
        ))
      ) : (
        <div className="col-span-full text-center py-20">
          <h3 className="text-2xl font-semibold text-white mb-4">No medicines found</h3>
          <p className="text-gray-400">Try a different search term or browse our categories</p>
        </div>
      )}
    </div>
  );
};

// Main SearchResults Component
const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sortBy, setSortBy] = useState('price-asc');

  // All medicines data (from MainWebsite)
  const allMedicines = [
    // Best Sellers
    {
      id: 16,
      name: "Dolo 650",
      description: "Paracetamol for fever and pain relief",
      price: 49,
      originalPrice: 99,
      discount: 50,
      expiryMonths: 6,
      image: "https://www.netmeds.com/images/product-v1/600x600/341494/dolo_650mg_tablet_15_s_0.jpg"
    },
    {
      id: 17,
      name: "Crocin Advance",
      description: "Fast-acting pain reliever",
      price: 79,
      originalPrice: 159,
      discount: 50,
      expiryMonths: 8,
      image: "https://www.netmeds.com/images/product-v1/600x600/412820/crocin_advance_tablet_20_s_0.jpg"
    },
    {
      id: 18,
      name: "Pantocid",
      description: "Acid reflux and ulcer treatment",
      price: 129,
      originalPrice: 259,
      discount: 50,
      expiryMonths: 7,
      image: "https://www.netmeds.com/images/product-v1/600x600/313786/pantocid_40mg_tablet_15_s_0.jpg"
    },
    {
      id: 19,
      name: "Azithral 500",
      description: "Antibiotic for bacterial infections",
      price: 199,
      originalPrice: 399,
      discount: 50,
      expiryMonths: 9,
      image: "https://www.netmeds.com/images/product-v1/600x600/341440/azithral_500mg_tablet_5_s_0.jpg"
    },
    {
      id: 20,
      name: "D-Rise",
      description: "Vitamin D3 supplement",
      price: 299,
      originalPrice: 599,
      discount: 50,
      expiryMonths: 12,
      image: "https://www.netmeds.com/images/product-v1/600x600/858559/d_rise_60000iu_vitamin_d3_oral_solution_5ml_0.jpg"
    },
    // Heart Medicines
    {
      id: 1,
      name: "Metoprolol 25mg",
      description: "Beta blocker for heart conditions",
      price: 149,
      originalPrice: 299,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 2,
      name: "Amlodipine 5mg",
      description: "Calcium channel blocker",
      price: 199,
      originalPrice: 399,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 3,
      name: "Atorvastatin 10mg",
      description: "Statin for cholesterol control",
      price: 249,
      originalPrice: 499,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 4,
      name: "Clopidogrel 75mg",
      description: "Blood thinner medication",
      price: 299,
      originalPrice: 599,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 5,
      name: "Losartan 50mg",
      description: "Angiotensin II receptor blocker",
      price: 179,
      originalPrice: 359,
      discount: 50,
      expiryMonths: 6
    },
    // Diabetes Medicines
    {
      id: 6,
      name: "Metformin 500mg",
      description: "Oral diabetes medicine",
      price: 129,
      originalPrice: 259,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 7,
      name: "Glimepiride 2mg",
      description: "Sulfonylurea for type 2 diabetes",
      price: 159,
      originalPrice: 319,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 8,
      name: "Sitagliptin 100mg",
      description: "DPP-4 inhibitor",
      price: 349,
      originalPrice: 699,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 9,
      name: "Empagliflozin 10mg",
      description: "SGLT2 inhibitor",
      price: 399,
      originalPrice: 799,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 10,
      name: "Pioglitazone 15mg",
      description: "Thiazolidinedione",
      price: 279,
      originalPrice: 559,
      discount: 50,
      expiryMonths: 6
    },
    // Respiratory Medicines
    {
      id: 11,
      name: "Salbutamol 100mcg",
      description: "Short-acting beta agonist inhaler",
      price: 189,
      originalPrice: 379,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 12,
      name: "Budesonide 200mcg",
      description: "Inhaled corticosteroid",
      price: 299,
      originalPrice: 599,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 13,
      name: "Montelukast 10mg",
      description: "Leukotriene receptor antagonist",
      price: 249,
      originalPrice: 499,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 14,
      name: "Theophylline 400mg",
      description: "Methylxanthine bronchodilator",
      price: 199,
      originalPrice: 399,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 15,
      name: "Ipratropium 20mcg",
      description: "Anticholinergic inhaler",
      price: 229,
      originalPrice: 459,
      discount: 50,
      expiryMonths: 6
    }
  ];

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUsername(parsedData.username);
      setUserRole(parsedData.role);
    }

    // Check for search parameter in URL
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = (query) => {
    // Filter medicines based on search term
    const results = allMedicines.filter(med => 
      med.name.toLowerCase().includes(query.toLowerCase()) || 
      med.description.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    performSearch(query);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    
    let sortedResults = [...searchResults];
    switch (newSortBy) {
      case 'price-asc':
        sortedResults.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedResults.sort((a, b) => b.price - a.price);
        break;
      case 'discount-desc':
        sortedResults.sort((a, b) => b.discount - a.discount);
        break;
      case 'expiry-asc':
        sortedResults.sort((a, b) => a.expiryMonths - b.expiryMonths);
        break;
      default:
        break;
    }
    setSearchResults(sortedResults);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('navbarLayout');
    setUsername('');
    await new Promise(resolve => setTimeout(resolve, 100));
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] relative overflow-hidden">
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
          style={{ backdropFilter: 'blur(4px)' }}
        />
      </div>

      <MainNavbar 
        username={username} 
        handleSignOut={handleSignOut} 
        userRole={userRole} 
        onSearch={handleSearch}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Search Results: "{searchTerm}"
          </h1>
          <p className="text-gray-400">
            Found {searchResults.length} medicines
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="flex justify-end mb-6">
          <div className="bg-[#1a1a1a]/80 rounded-lg px-4 py-2 flex items-center gap-4">
            <span className="text-gray-300">Sort by:</span>
            <button
              className={`px-3 py-1 rounded flex items-center gap-1 ${sortBy === 'price-asc' ? 'bg-[#00D37F]/20 text-[#00D37F]' : 'text-white'}`}
              onClick={() => handleSortChange('price-asc')}
            >
              Price <FaSortAmountUp size={12} />
            </button>
            <button
              className={`px-3 py-1 rounded flex items-center gap-1 ${sortBy === 'price-desc' ? 'bg-[#00D37F]/20 text-[#00D37F]' : 'text-white'}`}
              onClick={() => handleSortChange('price-desc')}
            >
              Price <FaSortAmountDown size={12} />
            </button>
            <button
              className={`px-3 py-1 rounded flex items-center gap-1 ${sortBy === 'discount-desc' ? 'bg-[#00D37F]/20 text-[#00D37F]' : 'text-white'}`}
              onClick={() => handleSortChange('discount-desc')}
            >
              Discount
            </button>
            <button
              className={`px-3 py-1 rounded flex items-center gap-1 ${sortBy === 'expiry-asc' ? 'bg-[#00D37F]/20 text-[#00D37F]' : 'text-white'}`}
              onClick={() => handleSortChange('expiry-asc')}
            >
              Expiry
            </button>
          </div>
        </div>

        {/* Medicine Grid */}
        <MedicineGrid medicines={searchResults} />
      </div>
    </div>
  );
};

export default SearchResults; 