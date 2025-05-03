import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { FaSearch, FaShoppingCart, FaUser, FaCaretDown, FaChevronLeft, FaChevronRight, FaRobot, FaMedkit, FaHandHoldingHeart, FaUserMd } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../removed-bg-medibridge.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

// Rename Navbar to MainNavbar
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
          {/* Healia AI Button */}
          <button 
            onClick={() => navigate('/healia')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D37F] text-white font-medium hover:bg-[#00D37F]/80 transition-colors"
          >
            <FaRobot className="text-xl" />
            <span>Healia AI</span>
          </button>
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

// Carousel Component
const carouselItems = [
  {
    title: "Meet Helia - Your AI Health Assistant",
    description: "Get instant medical guidance and symptom analysis from our advanced AI companion.",
    bgColor: "from-emerald-600/30 via-teal-600/20 to-emerald-600/10",
    buttonText: "Chat Now",
    icon: <FaRobot className="text-6xl mb-6 text-[#00D37F]" />
  },
  {
    title: "Huge Savings on Near-Expiry Medicines",
    description: "Access quality medications at up to 90% off through our verified sellers.",
    bgColor: "from-orange-600/30 via-red-600/20 to-orange-600/10",
    buttonText: "Shop Now",
    icon: <FaMedkit className="text-6xl mb-6 text-[#00D37F]" />
  },
  {
    title: "Support Healthcare Access",
    description: "Sellers can donate medicines to NGOs who distribute them at minimal logistics cost.",
    bgColor: "from-blue-600/30 via-indigo-600/20 to-blue-600/10",
    buttonText: "Learn More",
    icon: <FaHandHoldingHeart className="text-6xl mb-6 text-[#00D37F]" />
  },
  {
    title: "Verified Sellers Network",
    description: "Trust our certified pharmacy network for authentic medications nationwide.",
    bgColor: "from-purple-600/30 via-pink-600/20 to-purple-600/10",
    buttonText: "Join Network",
    icon: <FaUserMd className="text-6xl mb-6 text-[#00D37F]" />
  }
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      const nextSlide = (currentSlide + 1) % carouselItems.length;
      slideChange(nextSlide);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const slideChange = (newSlide) => {
    let dir = 1;
    if (newSlide < currentSlide) {
      dir = (currentSlide === carouselItems.length - 1 && newSlide === 0) ? 1 : -1;
    } else if (newSlide > currentSlide) {
      dir = (currentSlide === 0 && newSlide === carouselItems.length - 1) ? -1 : 1;
    }
    
    setDirection(dir);
    setCurrentSlide(newSlide);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="relative z-10 w-full">
      <div className="w-full relative overflow-hidden min-h-[500px] flex items-center">
        {/* Dynamic Gradient Background based on current slide */}
        <div className={`absolute inset-0 bg-gradient-to-r ${carouselItems[currentSlide].bgColor} backdrop-blur-lg transition-colors duration-1000`} />
        
        {/* Medical Green Accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00D37F]/20 to-transparent opacity-75 blur-2xl" />

        {/* Content Container - CENTERED */}
        <div className="w-full px-4 py-20 overflow-hidden flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div 
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="flex flex-col items-center justify-center text-center relative z-10 w-full max-w-5xl mx-auto"
            >
              {/* Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center w-full"
              >
                {carouselItems[currentSlide].icon}
              </motion.div>

              <motion.h2 
                className="text-5xl font-bold mb-6 text-white tracking-wide text-center w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {carouselItems[currentSlide].title}
              </motion.h2>
              
              <motion.p 
                className="text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed text-center w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {carouselItems[currentSlide].description}
              </motion.p>
              
              <motion.button 
                className="px-10 py-4 bg-[#0c0c0c] text-white border border-[#00D37F] rounded-lg hover:bg-[#00D37F] transition-all duration-300 text-xl relative group overflow-hidden flex items-center justify-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (carouselItems[currentSlide].buttonText === 'Chat Now') {
                    navigate('/healia');
                  }
                }}
              >
                <span className="relative z-10">{carouselItems[currentSlide].buttonText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00D37F] to-[#00D37F]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enhanced Glow Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-[#00D37F]/5 via-transparent to-transparent blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#00D37F]/5 via-transparent to-transparent blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#00D37F]/10 to-transparent blur-2xl" />
        </div>
      </div>

      {/* Carousel Navigation - CENTERED with additional controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
        <div className="flex gap-3 items-center">
          <motion.button
            onClick={() => {
              const prevSlide = currentSlide === 0 ? carouselItems.length - 1 : currentSlide - 1;
              slideChange(prevSlide);
            }}
            className="flex items-center justify-center bg-black/30 hover:bg-[#00D37F]/50 w-8 h-8 rounded-full text-white mr-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronLeft className="text-sm" />
          </motion.button>
          
          {carouselItems.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => slideChange(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-[#00D37F] w-6' : 'bg-gray-500 w-2'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
          
          <motion.button
            onClick={() => {
              const nextSlide = (currentSlide + 1) % carouselItems.length;
              slideChange(nextSlide);
            }}
            className="flex items-center justify-center bg-black/30 hover:bg-[#00D37F]/50 w-8 h-8 rounded-full text-white ml-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronRight className="text-sm" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// MedicineCard Component
const MedicineCard = ({ id, name, description, price, originalPrice, discount, expiryMonths, image }) => {
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
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#00D37F]/10 hover:border-[#00D37F]/30 transition-all group w-[200px]">
      <div className="aspect-square rounded-lg bg-white/5 mb-4 p-4 flex items-center justify-center">
        <img src={image || "https://via.placeholder.com/200"} alt={name} className="max-h-full object-contain" />
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <span className="bg-[#00D37F]/20 text-[#00D37F] px-2 py-1 rounded-full text-sm">{expiryMonths}M</span>
        </div>
        <p className="text-gray-400 text-sm">{description}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">₹{price}</span>
          <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
          <span className="text-[#00D37F] text-sm font-semibold">{discount}% off</span>
        </div>
        <button className="w-full py-2 bg-[#00FFAB] hover:bg-[#00D37F] text-[#00D37F] font-semibold rounded-lg transition-colors" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// MedicineSection Component
const MedicineSection = ({ title, medicines }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    // Generate more medicines based on the template if it's the Best Sellers section
    if (title === "Best Sellers") {
      const templateMedicines = medicines;
      const extendedMedicines = Array(40).fill(null).map((_, index) => {
        const template = templateMedicines[index % templateMedicines.length];
        return {
          ...template,
          id: index + 1,
          name: `${template.name} ${Math.floor(index / templateMedicines.length) + 1}`,
          price: Math.floor(Math.random() * (template.price * 1.5 - template.price * 0.5) + template.price * 0.5),
          originalPrice: Math.floor(Math.random() * (template.originalPrice * 1.5 - template.originalPrice * 0.5) + template.originalPrice * 0.5),
          discount: Math.floor(Math.random() * 70) + 10,
          expiryMonths: Math.floor(Math.random() * 11) + 1,
        };
      });
      const newTitle = title.toLowerCase().split(" ").join("-");
      navigate(`/category/${newTitle}`, { 
        state: { medicines: extendedMedicines } 
      });
    } else {
      // For other categories, just pass the existing medicines
      const categorySlug = title.toLowerCase().replace(/\s+/g, '-');
      navigate(`/category/${categorySlug}`, { state: { medicines } });
    }
  };

  return (
    <section className="space-y-6 text-center">
      <div className="flex items-start justify-center gap-4 py-3">
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <button 
          onClick={handleViewAll}
          className="text-[#00D37F] hover:text-[#00D37F]/80 font-semibold transition-colors"
        >
          View All
        </button>
      </div>
      <div className="flex justify-end">
        <div className="flex gap-6 max-w-[1500px] overflow-x-auto pb-4">
          {medicines.map((medicine, index) => (
            <MedicineCard key={medicine.id || index} {...medicine} id={medicine.id || index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => (
  <footer className="w-full bg-[#101820]/80 backdrop-blur-md border-t border-[#00D37F]/10 py-8 mt-24 text-center text-white">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-6">
      <div className="flex flex-wrap gap-6 justify-center md:justify-start text-lg">
        <a href="/" className="hover:text-[#00D37F] transition-colors">Home</a>
        <a href="/about" className="hover:text-[#00D37F] transition-colors">About</a>
        <a href="/services" className="hover:text-[#00D37F] transition-colors">Services</a>
        <a href="/cart" className="hover:text-[#00D37F] transition-colors">Cart</a>
        <a href="/healia" className="hover:text-[#00D37F] transition-colors">Healia AI</a>
        <a href="mailto:contact@medibridge.com" className="hover:text-[#00D37F] transition-colors">Contact</a>
      </div>
      <div className="text-gray-400 text-sm md:text-base">© MediBridge 2025</div>
    </div>
  </footer>
);

// Main Component
const MainWebsite = () => {
  console.log('MainWebsite rendered');
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUsername(parsedData.username);
      setUserRole(parsedData.role);
      // No redirection based on role - all users should stay on the main page
    }
  }, [navigate]);

  const handleSignOut = async () => {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('navbarLayout');
    setUsername('');
    setUserRole('');
    await new Promise(resolve => setTimeout(resolve, 100));
    navigate('/', { replace: true });
  };

  const heartMedicines = [
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
    }
  ];

  const diabetesMedicines = [
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
    }
  ];

  const respiratoryMedicines = [
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

  const bestSellers = [
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
    }
  ];

  const newArrivals = [
    {
      id: 21,
      name: "Rivaroxaban 20mg",
      description: "Anticoagulant medication",
      price: 449,
      originalPrice: 899,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 22,
      name: "Dapagliflozin 10mg",
      description: "SGLT2 inhibitor",
      price: 399,
      originalPrice: 799,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 23,
      name: "Tofacitinib 5mg",
      description: "JAK inhibitor",
      price: 599,
      originalPrice: 1199,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 24,
      name: "Apremilast 30mg",
      description: "PDE4 inhibitor",
      price: 499,
      originalPrice: 999,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 25,
      name: "Upadacitinib 15mg",
      description: "JAK inhibitor",
      price: 549,
      originalPrice: 1099,
      discount: 50,
      expiryMonths: 6
    }
  ];

  const popularCategories = [
    {
      id: 26,
      name: "Vitamin C 1000mg",
      description: "Immune system support",
      price: 199,
      originalPrice: 399,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 27,
      name: "Omega-3 1000mg",
      description: "Essential fatty acids",
      price: 299,
      originalPrice: 599,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 28,
      name: "Probiotics 10B CFU",
      description: "Gut health support",
      price: 249,
      originalPrice: 499,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 29,
      name: "Magnesium 400mg",
      description: "Mineral supplement",
      price: 179,
      originalPrice: 359,
      discount: 50,
      expiryMonths: 6
    },
    {
      id: 30,
      name: "Zinc 50mg",
      description: "Immune support mineral",
      price: 149,
      originalPrice: 299,
      discount: 50,
      expiryMonths: 6
    }
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] relative overflow-hidden flex flex-col">
      {/* Three.js Background with reduced blur */}
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

      <MainNavbar username={username} handleSignOut={handleSignOut} userRole={userRole} />

      <Carousel />

      {/* Medicine Categories Sections with increased opacity */}
      <div className="max-w-7xl mx-auto px-4 py-24 space-y-24 relative z-10">
        <br></br>
        <div className="mt-16">
          <MedicineSection title="Best Sellers" medicines={bestSellers} />
        </div>
        <br></br>
        <div>
          <MedicineSection title="New Arrivals" medicines={newArrivals} />
        </div>
        <br></br>
        <div>
          <MedicineSection title="Heart Disease Medicines" medicines={heartMedicines} />
        </div>
        <br></br>
        <div>
          <MedicineSection title="Diabetes Medicines" medicines={diabetesMedicines} />
        </div>
        <br></br>
        <div>
          <MedicineSection title="Respiratory Medicines" medicines={respiratoryMedicines} />
        </div>
        <br></br>
        <div>
          <MedicineSection title="Popular Categories" medicines={popularCategories} />
        </div>
        <br></br>
      </div>
      <Footer />
    </div>
  );
};

export default MainWebsite;