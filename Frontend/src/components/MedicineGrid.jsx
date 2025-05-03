import React, { useState, useEffect } from 'react';
import MedicineSearch from './MedicineSearch';

const MedicineCard = ({ medicine, isBestSeller = false }) => {
  const {
    id,
    name,
    description,
    price,
    originalPrice,
    discount,
    expiryMonths,
    image,
    bestSeller
  } = medicine;

  let expiryColor = '';
  if (expiryMonths <= 3) {
    expiryColor = 'text-red-500';
  } else if (expiryMonths <= 6) {
    expiryColor = 'text-yellow-500';
  } else {
    expiryColor = 'text-green-500';
  }

  const cardClasses = isBestSeller ?
    "bg-[#1a1a1a]/80 backdrop-blur-md border border-[#00D37F]/50 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-[#00D37F]/20 transition-all duration-300 flex flex-col h-full" :
    "bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-800/40 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-[#00D37F]/10 transition-all duration-300 flex flex-col h-full";

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
    <div className={cardClasses}>
      <div className="relative p-4 flex items-center justify-center bg-[#121212] h-60">
        {/* Expiry Badge */}
        <div className={`absolute top-3 right-3 ${expiryColor} text-xs font-bold px-2 py-1 rounded bg-[#0c0c0c]/80`}>
          {expiryMonths}M
        </div>

        {/* Best Seller Badge */}
        {bestSeller && (
          <div className="absolute top-3 left-3 bg-[#00D37F] text-black text-xs font-bold px-2 py-1 rounded">
            BEST SELLER
          </div>
        )}

        <img
          src={image}
          alt={name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold text-white mb-1">{name}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{description}</p>

        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-white">₹{price}</span>
          {originalPrice && (
            <>
              <span className="text-gray-500 line-through ml-2">₹{originalPrice}</span>
              <span className="text-[#00D37F] ml-2">{discount}% off</span>
            </>
          )}
        </div>

        <button
          className="mt-4 w-full py-2 px-4 bg-[#00FFAB] text-black font-medium rounded-lg hover:bg-[#00D37F] transition-colors"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

const MedicineGrid = ({ medicines }) => {
  const [filteredMedicines, setFilteredMedicines] = useState(medicines || []);
  const [filters, setFilters] = useState({
    expiry: 'all',
    priceRange: 'all',
    onlyBestSellers: false
  });

  const handleSearchResults = (results) => {
    setFilteredMedicines(results);
  };

  useEffect(() => {
    if (!medicines) return;

    let filtered = [...medicines];

    // Filter by expiry
    if (filters.expiry === 'soon') {
      filtered = filtered.filter(med => med.expiryMonths <= 3);
    } else if (filters.expiry === 'medium') {
      filtered = filtered.filter(med => med.expiryMonths > 3 && med.expiryMonths <= 6);
    } else if (filters.expiry === 'long') {
      filtered = filtered.filter(med => med.expiryMonths > 6);
    }

    // Filter by price range
    if (filters.priceRange === 'low') {
      filtered = filtered.filter(med => med.price < 100);
    } else if (filters.priceRange === 'medium') {
      filtered = filtered.filter(med => med.price >= 100 && med.price <= 500);
    } else if (filters.priceRange === 'high') {
      filtered = filtered.filter(med => med.price > 500);
    }

    // Filter best sellers
    if (filters.onlyBestSellers) {
      filtered = filtered.filter(med => med.bestSeller);
    }

    setFilteredMedicines(filtered);
  }, [medicines, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  if (!medicines || medicines.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-xl text-gray-400">No medicines found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <MedicineSearch onSearchResults={handleSearchResults} />

      <div className='bg-[#1a1a1a]/60 rounded-lg  flex gap-4 justify-start'>
        {/* Expiry Filter */}
        <div className="flex flex-col">
          <label className="text-gray-300 text-sm mb-1">Expiry Time</label>
          <select
            className="bg-[#121212] text-white border border-gray-700 rounded-md px-3 py-2"
            value={filters.expiry}
            onChange={(e) => handleFilterChange('expiry', e.target.value)}
          >
            <option value="all">All</option>
            <option value="soon">Soon (≤ 3 months)</option>
            <option value="medium">Medium (4-6 months)</option>
            <option value="long">Long (6 months)</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="flex flex-col">
          <label className="text-gray-300 text-sm mb-1">Price Range</label>
          <select
            className="bg-[#121212] text-white border border-gray-700 rounded-md px-3 py-2"
            value={filters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
          >
            <option value="all">All Prices</option>
            <option value="low">Under ₹100</option>
            <option value="medium">₹100 - ₹500</option>
            <option value="high">Above ₹500</option>
          </select>
        </div>

        {/* Best Seller Filter */}
        <div className="flex items-end">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-[#00D37F]"
              checked={filters.onlyBestSellers}
              onChange={(e) => handleFilterChange('onlyBestSellers', e.target.checked)}
            />
            <span className="ml-2 text-white">Best Sellers Only</span>
          </label>
        </div>
      </div>

      {filteredMedicines.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xl text-gray-400">No medicines match your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedicines.map((medicine, index) => {
            const isBestSeller = medicine.bestSeller === true;
            return (
              <MedicineCard key={index} medicine={medicine} isBestSeller={isBestSeller} />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicineGrid;