import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { useNavigate } from 'react-router-dom';
import logo from '../removed-bg-medibridge.png';
import { FaSearch, FaShoppingCart, FaUser, FaCaretDown } from 'react-icons/fa';

// MainNavbar copied from MainWebsite.jsx for consistency
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
                <a href="#" className="block px-6 py-3 text-center text-[#7B68EE] hover:bg-[#00D37F]/10">Your Profile</a>
                <a href="#" className="block px-6 py-3 text-center text-[#00D37F] hover:bg-[#00D37F]/10">Orders</a>
                <a href="#" className="block px-6 py-3 text-center text-[#00D37F] hover:bg-[#00D37F]/10">Settings</a>
                <hr className="border-[#00D37F]/10 mx-6 my-2" />
                <a href="#" onClick={handleSignOut} className="block px-6 py-3 text-center text-[#00D37F] hover:bg-[#00D37F]/10">Sign Out</a>
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

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) setCart(JSON.parse(cartData));
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { username, role } = JSON.parse(userData);
      setUsername(username);
      setUserRole(role);
    }
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleQuantityChange = (id, qty) => {
    const newCart = cart.map(item =>
      item.id === id ? { ...item, quantity: qty } : item
    );
    updateCart(newCart);
  };

  const handleRemove = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    updateCart(newCart);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('userData');
    setUsername('');
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.href = '/';
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* MainNavbar at the very top */}
      <MainNavbar username={username} handleSignOut={handleSignOut} userRole={userRole} />
      <div className="min-h-screen bg-[#101820]/80 relative flex flex-col items-center justify-start py-16 px-2">
        {/* Star Background */}
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
          <Canvas
            camera={{ position: [-2, 2, 4], fov: 70, near: 0.001, far: 1000 }}
          >
            <Background />
          </Canvas>
          <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(8px)' }} />
        </div>
        <div className="relative z-10 w-full flex flex-col items-center justify-center" style={{ marginTop: '10vh' }}>
          <div className="w-full max-w-5xl flex flex-col md:flex-row gap-12 items-start justify-center">
            {/* Cart Items */}
            <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-3xl md:mr-8 ml-0">
              <h2 className="text-3xl font-bold text-[#00FFB2] mb-8 text-center">Shopping Cart</h2>
              <div className="mt-8">
                {cart.length === 0 ? (
                  <div className="text-white text-lg">Your cart is empty.</div>
                ) : (
                  <ul className="divide-y divide-[#00FFB2]/10 space-y-6">
                    {cart.map(item => (
                      <li key={item.id} className="flex flex-col md:flex-row items-center gap-8 py-8">
                        <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-xl bg-white/20" />
                        <div className="flex-1 w-full">
                          <div className="text-xl text-white font-semibold mb-1">{item.name}</div>
                          <div className="text-[#00FFB2] font-bold text-lg mb-2">₹{item.price}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-white">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => handleQuantityChange(item.id, Math.max(1, Number(e.target.value)))}
                              className="w-16 px-2 py-1 rounded bg-[#00FFB2]/10 border border-[#00FFB2]/30 text-white"
                            />
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="ml-4 text-red-400 hover:text-red-600 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-white font-bold text-lg min-w-[80px] text-right">₹{item.price * item.quantity}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* Cart Summary */}
            <div className="w-full md:w-96 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl h-fit sticky top-36 md:top-36 self-center md:self-start mt-8 md:mt-24 ml-auto max-w-sm mx-auto">
              <h3 className="text-2xl font-bold text-[#00FFB2] mb-6 text-center md:text-left">Order Summary</h3>
              <div className="flex justify-between text-white text-lg mb-2">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-white text-lg mb-6">
                <span>Total Price:</span>
                <span className="text-[#00FFB2] font-bold">₹{total}</span>
              </div>
              <button
                className="w-full bg-[#00FFB2] text-black font-semibold py-3 rounded-xl hover:bg-[#00d37f] transition-all duration-200 text-lg shadow-md mt-4"
                disabled={cart.length === 0}
                onClick={() => alert('Proceeding to checkout...')}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 