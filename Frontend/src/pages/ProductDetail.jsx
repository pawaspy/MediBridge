import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import logo from '../removed-bg-medibridge.png';
import medicinePlaceholder from '../assets/medicine-placeholder.svg';
import { FaSearch, FaShoppingCart, FaUser, FaCaretDown, FaSignOutAlt } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUsername(parsedData.username);
    } else {
      navigate('/login');
    }

    // Load medicine data - check multiple sources
    const storedMedicines = localStorage.getItem('sellerMedicines');
    let foundMedicine = null;
    
    // First try sellerMedicines in localStorage (from seller dashboard)
    if (storedMedicines) {
      const medicines = JSON.parse(storedMedicines);
      foundMedicine = medicines.find(med => med.id.toString() === id.toString());
    }
    
    // If not found, check sample medicines from MainWebsite
    if (!foundMedicine) {
      // Sample medicines data - same as in MainWebsite.jsx
      const sampleMedicines = [
        // Best Sellers
        {
          id: 16,
          name: "Dolo 650",
          description: "Paracetamol for fever and pain relief",
          price: 49,
          originalPrice: 99,
          discount: 50,
          expiryMonths: 6,
          manufacturer: "Micro Labs Ltd",
          category: "Painkiller",
          dosage: "500mg",
          expiryDate: "2025-06-30",
          stock: 150,
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
          manufacturer: "GlaxoSmithKline",
          category: "Painkiller",
          dosage: "500mg",
          expiryDate: "2025-08-15",
          stock: 200,
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
          manufacturer: "Sun Pharmaceutical",
          category: "Gastrointestinal",
          dosage: "40mg",
          expiryDate: "2025-07-20",
          stock: 120,
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
          manufacturer: "Alembic Pharmaceuticals",
          category: "Antibiotic",
          dosage: "500mg",
          expiryDate: "2025-09-10",
          stock: 80,
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
          manufacturer: "USV Limited",
          category: "Supplements",
          dosage: "60000 IU",
          expiryDate: "2026-06-30",
          stock: 100,
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
          expiryMonths: 6,
          manufacturer: "AstraZeneca",
          category: "Cardiovascular",
          dosage: "25mg",
          expiryDate: "2025-06-30",
          stock: 120
        },
        {
          id: 2,
          name: "Amlodipine 5mg",
          description: "Calcium channel blocker",
          price: 199,
          originalPrice: 399,
          discount: 50,
          expiryMonths: 6,
          manufacturer: "Pfizer",
          category: "Cardiovascular",
          dosage: "5mg",
          expiryDate: "2025-06-15",
          stock: 150
        },
        {
          id: 3,
          name: "Atorvastatin 10mg",
          description: "Statin for cholesterol control",
          price: 249,
          originalPrice: 499,
          discount: 50,
          expiryMonths: 6,
          manufacturer: "Ranbaxy",
          category: "Cardiovascular",
          dosage: "10mg",
          expiryDate: "2025-06-20",
          stock: 100
        },
        {
          id: 4,
          name: "Clopidogrel 75mg",
          description: "Blood thinner medication",
          price: 299,
          originalPrice: 599,
          discount: 50,
          expiryMonths: 6,
          manufacturer: "Sanofi",
          category: "Cardiovascular",
          dosage: "75mg",
          expiryDate: "2025-07-10",
          stock: 90
        },
        {
          id: 5,
          name: "Losartan 50mg",
          description: "Angiotensin II receptor blocker",
          price: 179,
          originalPrice: 359,
          discount: 50,
          expiryMonths: 6,
          manufacturer: "Merck",
          category: "Cardiovascular",
          dosage: "50mg",
          expiryDate: "2025-08-05",
          stock: 110
        }
      ];
      
      foundMedicine = sampleMedicines.find(med => med.id.toString() === id.toString());
    }
    
    if (foundMedicine) {
      setMedicine(foundMedicine);
    } else {
      // If no medicine is found, display the not found message
      console.error(`Medicine with ID ${id} not found in any data source`);
    }
    
    setLoading(false);
  }, [id, navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAddToCart = () => {
    if (!medicine) return;

    setIsAddingToCart(true);

    try {
      // Get existing cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if item already exists in cart
      const existingItem = cart.find(item => item.id === medicine.id);
      
      if (existingItem) {
        // Update quantity if already in cart
        existingItem.quantity += quantity;
      } else {
        // Add new item to cart
        cart.push({
          id: medicine.id,
          name: medicine.name,
          price: medicine.price,
          quantity: quantity,
          manufacturer: medicine.manufacturer,
          image: medicine.image || medicinePlaceholder // Use the medicine's image or the placeholder
        });
      }
      
      // Save updated cart
      localStorage.setItem('cart', JSON.stringify(cart));

      // Short delay to show loading animation
      setTimeout(() => {
        setIsAddingToCart(false);
        setAddToCartSuccess(true);
        
        // Short delay to show success message before navigating
        setTimeout(() => {
          // Navigate to cart page
          navigate('/cart');
        }, 800);
      }, 800);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAddingToCart(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
        <div className="text-white text-xl">Medicine not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] relative">
      {/* Star Background */}
      <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <Canvas
          camera={{ position: [-2, 2, 4], fov: 70, near: 0.001, far: 1000 }}
        >
          <Background />
        </Canvas>
        <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(4px)' }} />
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes progressWidth {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Navbar */}
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
                    Hello, {username || 'User'}
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
                    href="/profile"
                    className="block px-6 py-3 text-center text-[#00D37F] no-underline"
                    style={{ textDecoration: 'none' }}
                  >
                    Profile
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
            <button 
              className="relative p-2 text-white hover:text-[#00FFAB] transition-colors"
              onClick={() => navigate('/cart')}
            >
              <FaShoppingCart size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="bg-[#121212]/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm border border-[#00FFAB]/10 hover:border-[#00FFAB]/30 transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Image - Enhanced */}
            <div className="p-8 lg:p-12 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a]/80 to-[#121212]/90">
              <div className="max-w-lg mx-auto flex items-center justify-center h-full">
                <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-3xl p-12 w-full h-[400px] flex items-center justify-center group overflow-hidden shadow-xl hover:shadow-[#00FFAB]/10 hover:shadow-2xl transition-all duration-500">
                  <img 
                    src={medicine.image || medicinePlaceholder} 
                    alt={medicine.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = medicinePlaceholder;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00FFAB]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            </div>

            {/* Product Details - Enhanced */}
            <div className="p-8 lg:p-12 bg-gradient-to-bl from-[#0c0c0c]/90 to-[#121212]/90">
              <div className="space-y-8">
                {/* Award Winner Banner (if needed) */}
                {medicine.featured && (
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-4 py-1.5 rounded-full text-sm inline-block shadow-md">
                    AWARD WINNER
                  </div>
                )}

                {/* Product Name */}
                <h1 className="text-5xl font-bold text-white mt-2 leading-tight">{medicine.name}</h1>

                {/* Category & Dosage */}
                <div className="flex items-center">
                  <span className="bg-[#00FFAB]/10 text-[#00FFAB] px-3 py-1.5 rounded-full text-sm font-medium">
                    {medicine.category}
                  </span>
                  <span className="mx-2 text-gray-500">•</span>
                  <span className="bg-[#00FFAB]/10 text-[#00FFAB] px-3 py-1.5 rounded-full text-sm font-medium">
                    {medicine.dosage}
                  </span>
                </div>

                {/* Clinical Description */}
                <div className="bg-black/20 rounded-xl p-6 border border-[#00FFAB]/10">
                  <p className="text-white text-lg leading-relaxed">
                    {medicine.description}
                  </p>
                </div>

                {/* Ingredients */}
                <div>
                  <button className="text-[#00FFAB] text-lg underline hover:text-[#00FFAB]/80 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#00FFAB] rounded-full inline-block"></span>
                    Ingredients
                  </button>
                </div>

                {/* Award Info (if any) */}
                {medicine.awards && (
                  <p className="text-gray-300 italic">{medicine.awards}</p>
                )}

                {/* Buy Now */}
                <div className="bg-gradient-to-br from-[#121212]/90 to-black/60 rounded-xl p-8 border border-[#00FFAB]/20 shadow-lg hover:shadow-[#00FFAB]/5 transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-xl font-medium text-white">One-time purchase</p>
                    <p className="text-3xl font-bold text-white">₹{medicine.price}</p>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="quantity" className="block text-[#00FFAB] mb-2 font-medium">Quantity</label>
                    <div className="flex">
                      <button 
                        className="bg-[#1a1a1a] text-white px-4 py-2 rounded-l-lg border border-[#00FFAB]/30 hover:bg-[#00FFAB]/20 transition-colors"
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="bg-[#1a1a1a] border-y border-[#00FFAB]/30 py-2 px-3 text-white w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        className="bg-[#1a1a1a] text-white px-4 py-2 rounded-r-lg border border-[#00FFAB]/30 hover:bg-[#00FFAB]/20 transition-colors"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || addToCartSuccess}
                    className={`w-full bg-gradient-to-r ${addToCartSuccess ? 'from-green-500 to-green-600' : 'from-[#FF4081] to-[#FF2D6F] hover:from-[#FF2D6F] hover:to-[#FF4081]'} text-white py-4 rounded-lg font-bold text-xl tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg relative overflow-hidden ${isAddingToCart ? 'cursor-wait' : ''}`}
                  >
                    {isAddingToCart ? (
                      <>
                        <span className="opacity-0">BUY NOW</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 bg-white/80 w-full animate-[progressWidth_0.8s_ease-in-out]"></div>
                      </>
                    ) : addToCartSuccess ? (
                      <>
                        <div className="flex items-center justify-center">
                          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          ADDED TO CART
                        </div>
                      </>
                    ) : (
                      "BUY NOW"
                    )}
                  </button>

                  <p className="text-center text-gray-400 text-sm mt-4 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-[#00FFAB] rounded-full"></span>
                    Free shipping on all orders ₹45+
                  </p>
                </div>

                {/* Additional Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-black/20 p-4 rounded-lg border border-[#00FFAB]/10">
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-[#00FFAB] font-medium">Manufacturer</span>
                    </div>
                    <span className="text-white text-lg">{medicine.manufacturer}</span>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-lg border border-[#00FFAB]/10">
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-[#00FFAB] font-medium">Expiry Date</span>
                    </div>
                    <span className="text-white text-lg">{new Date(medicine.expiryDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-lg border border-[#00FFAB]/10">
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-[#00FFAB] font-medium">ID</span>
                    </div>
                    <span className="text-white text-lg">{medicine.id}</span>
                  </div>

                  <div className="bg-black/20 p-4 rounded-lg border border-[#00FFAB]/10">
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-[#00FFAB] font-medium">Stock</span>
                    </div>
                    <span className={`text-lg ${parseInt(medicine.stock) > 50 ? 'text-green-400' : parseInt(medicine.stock) > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {medicine.stock} units available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 mt-8">
        <div className="flex items-center mb-8">
          <div className="w-1 h-8 bg-[#00FFAB] rounded-full mr-4"></div>
          <h2 className="text-3xl font-bold text-white">Similar Products</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(() => {
            // Find similar medicines (same category as current medicine)
            const sampleMedicines = [
              {
                id: 16,
                name: "Dolo 650",
                description: "Paracetamol for fever and pain relief",
                price: 49,
                originalPrice: 99,
                discount: 50,
                expiryMonths: 6,
                manufacturer: "Micro Labs Ltd",
                category: "Painkiller",
                dosage: "500mg",
                expiryDate: "2025-06-30",
                stock: 150,
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
                manufacturer: "GlaxoSmithKline",
                category: "Painkiller",
                dosage: "500mg",
                expiryDate: "2025-08-15",
                stock: 200,
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
                manufacturer: "Sun Pharmaceutical",
                category: "Gastrointestinal",
                dosage: "40mg",
                expiryDate: "2025-07-20",
                stock: 120,
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
                manufacturer: "Alembic Pharmaceuticals",
                category: "Antibiotic",
                dosage: "500mg",
                expiryDate: "2025-09-10",
                stock: 80,
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
                manufacturer: "USV Limited",
                category: "Supplements",
                dosage: "60000 IU",
                expiryDate: "2026-06-30",
                stock: 100,
                image: "https://www.netmeds.com/images/product-v1/600x600/858559/d_rise_60000iu_vitamin_d3_oral_solution_5ml_0.jpg"
              },
              {
                id: 21,
                name: "Allegra 120mg",
                description: "Fexofenadine for allergies and hay fever",
                price: 189,
                originalPrice: 379,
                discount: 50,
                expiryMonths: 10,
                manufacturer: "Sanofi",
                category: "Antihistamine",
                dosage: "120mg",
                expiryDate: "2025-10-15",
                stock: 95,
                image: "https://www.netmeds.com/images/product-v1/600x600/38071/allegra_120mg_tablet_10s_0.jpg"
              }
            ];
            
            // Add all cardiovascular medicines for more samples
            const cardiovascularMeds = [
              {
                id: 1,
                name: "Metoprolol 25mg",
                description: "Beta blocker for heart conditions",
                price: 149,
                originalPrice: 299,
                discount: 50,
                expiryMonths: 6,
                manufacturer: "AstraZeneca",
                category: "Cardiovascular",
                dosage: "25mg",
                expiryDate: "2025-06-30",
                stock: 120,
                image: "https://www.netmeds.com/images/product-v1/600x600/341113/metolar_25mg_tablet_10s_0.jpg"
              },
              {
                id: 2,
                name: "Amlodipine 5mg",
                description: "Calcium channel blocker",
                price: 199,
                originalPrice: 399,
                discount: 50,
                expiryMonths: 6,
                manufacturer: "Pfizer",
                category: "Cardiovascular",
                dosage: "5mg",
                expiryDate: "2025-06-15",
                stock: 150,
                image: "https://www.netmeds.com/images/product-v1/600x600/896397/amlodipine_5mg_tablet_15_s_0.jpg"
              },
              {
                id: 3,
                name: "Atorvastatin 10mg",
                description: "Statin for cholesterol control",
                price: 249,
                originalPrice: 499,
                discount: 50,
                expiryMonths: 6,
                manufacturer: "Ranbaxy",
                category: "Cardiovascular",
                dosage: "10mg",
                expiryDate: "2025-06-20",
                stock: 100,
                image: "https://www.netmeds.com/images/product-v1/600x600/959500/atorvastatin_10mg_tablet_10_s_0.jpg"
              }
            ];
            
            const allMeds = [...sampleMedicines, ...cardiovascularMeds];
            
            // Find similar medicines (same category, different ID)
            let similarMedicines = allMeds.filter(med => 
              med.category === medicine.category && med.id.toString() !== id.toString()
            );
            
            // If not enough similar medicines, add some other medicines
            if (similarMedicines.length < 4) {
              const otherMeds = allMeds.filter(med => med.id.toString() !== id.toString() && med.category !== medicine.category);
              similarMedicines = [...similarMedicines, ...otherMeds].slice(0, 4);
            }
            
            // Limit to 4 medicines
            similarMedicines = similarMedicines.slice(0, 4);
            
            return similarMedicines.map(similarMedicine => (
              <div 
                key={similarMedicine.id} 
                className="bg-[#121212]/80 rounded-xl p-4 border border-[#00FFAB]/10 hover:border-[#00FFAB]/30 transition-all group cursor-pointer"
                onClick={() => navigate(`/product/${similarMedicine.id}`)}
              >
                <div className="aspect-square rounded-lg bg-[#1a1a1a]/40 mb-4 p-4 flex items-center justify-center">
                  <img 
                    src={similarMedicine.image || medicinePlaceholder} 
                    alt={similarMedicine.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = medicinePlaceholder;
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#00FFAB] transition-colors line-clamp-2">
                      {similarMedicine.name}
                    </h3>
                    <span className="bg-[#00FFAB]/20 text-[#00FFAB] px-2 py-1 rounded-full text-xs">
                      {similarMedicine.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{similarMedicine.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">₹{similarMedicine.price}</span>
                    {similarMedicine.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{similarMedicine.originalPrice}</span>
                    )}
                  </div>
                  <button 
                    className="w-full py-2 bg-[#00FFAB]/20 hover:bg-[#00FFAB]/30 text-[#00FFAB] font-semibold rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${similarMedicine.id}`);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 