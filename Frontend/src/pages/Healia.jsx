import React, { useState, useEffect, useRef } from 'react';
import logo from '../removed-bg-medibridge.png';
import { FaSearch, FaUser, FaCaretDown, FaShoppingCart, FaRobot, FaPaperPlane } from 'react-icons/fa';
import { Canvas } from '@react-three/fiber';
import { Background } from '../components/Background';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

// MainNavbar from MainWebsite
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
                <a href="#" className="block px-6 py-3 text-center text-[#7B68EE] hover:bg-[#00D37F]/10">Your Profile</a>
                <a href="#" className="block px-6 py-3 text-center text-[#00D37F] hover:bg-[#00D37F]/10">Orders</a>
                <a href="#" className="block px-6 py-3 text-center text-[#00D37F] hover:bg-[#00D37F]/10">Settings</a>
                <hr className="border-[#00D37F]/10 mx-6 my-2" />
                <a href="#" className="block px-6 py-3 text-center text-[#00D37F] hover:bg-[#00D37F]/10">Sign Out</a>
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

const Healia = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const API_BASE_URL = "http://localhost:3000";

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { username, role } = JSON.parse(userData);
      setUsername(username);
      setUserRole(role);
    }

    // Initialize Socket.IO connection
    socketRef.current = io(API_BASE_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to MediBridge AI server');
    });

    socketRef.current.on('bot_response', (data) => {
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'bot', text: data.message }
      ]);
      setLoading(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setLoading(false);
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // Try using Socket.IO first (realtime communication)
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('chat_message', { message: userMessage });
      } else {
        // Fallback to REST API if socket is not available
        const response = await axios.post(`${API_BASE_URL}/api/chat`, {
          message: userMessage
        });
        
        setMessages(prev => [...prev, { type: 'bot', text: response.data.response }]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'I apologize, but I encountered an error while processing your request. Please try again.' 
      }]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] relative overflow-hidden">
      {/* Star/3D Background */}
      <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <Canvas
          camera={{ position: [-2, 2, 4], fov: 70, near: 0.001, far: 1000 }}
        >
          <Background />
        </Canvas>
        <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(4px)' }} />
      </div>
      {/* MainNavbar at the top */}
      <MainNavbar username={username} userRole={userRole} />
      {/* ChatGPT-like chat UI */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] pt-16 pb-24">
        <div className="w-[90vw] md:w-[70vw] max-w-4xl min-h-[60vh] bg-[#181c1f]/90 rounded-3xl shadow-2xl border border-[#00D37F]/10 p-0 flex flex-col overflow-hidden mt-8">
          {/* Chat area */}
          <div className="flex-1 px-6 py-8 flex flex-col gap-6 overflow-y-auto">
            {/* Messages */}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-gray-400 py-12">
                <FaRobot className="text-5xl mb-4 text-[#00D37F]" />
                <div className="text-xl">Hi, I'm <span className="text-[#00D37F] font-bold">Healia AI</span>.<br/>How can I help you today?</div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}>
                  {msg.type === 'user' ? (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#00D37F] text-black px-5 py-3 rounded-2xl rounded-br-sm max-w-[80%] text-lg shadow-md break-words">
                          {msg.text}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#00D37F] flex items-center justify-center text-black text-2xl font-bold shadow-md">
                          <FaUser />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#23272b] flex items-center justify-center text-[#00D37F] text-2xl shadow-md">
                        <FaRobot />
                      </div>
                      <div className="bg-[#23272b] text-[#00D37F] px-5 py-3 rounded-2xl rounded-bl-sm max-w-[80%] text-lg shadow-md break-words">
                        {msg.text}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Loading bubble */}
            {loading && (
              <div className="flex justify-start items-start gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#23272b] flex items-center justify-center text-[#00D37F] text-2xl shadow-md">
                    <FaRobot />
                  </div>
                  <div className="bg-[#23272b] text-[#00D37F] px-5 py-3 rounded-2xl rounded-bl-sm max-w-[80%] text-lg shadow-md flex items-center gap-2 animate-pulse">
                    Healia is typing...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <form onSubmit={handleSend} className="flex items-center gap-4 border-t border-[#00D37F]/10 bg-[#181c1f] px-6 py-5">
            <input
              type="text"
              className="flex-1 bg-transparent text-white text-lg px-4 py-3 rounded-2xl focus:outline-none placeholder-gray-400"
              placeholder="Type to describe your symptoms"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#00D37F] hover:bg-[#00d37f]/90 text-black px-6 py-3 rounded-2xl font-bold text-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-60"
              disabled={loading || !input.trim()}
            >
              <FaPaperPlane className="text-xl" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Healia; 