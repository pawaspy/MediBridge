import React from 'react';

const FilterSidebar = ({ filters, sortBy, handleFilterChange, handleSortChange }) => {
  return (
    <div className="bg-[#121212]/80 backdrop-blur-md p-6 rounded-lg border border-gray-800/40 h-auto w-full">
      <h2 className="text-2xl font-bold text-white mb-6">Filters</h2>
      
      {/* Expiry Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-200 mb-3">Expiry (Months)</h3>
        <select 
          value={filters.expiryMonths} 
          onChange={(e) => handleFilterChange('expiryMonths', e.target.value)}
          className="w-full bg-[#1a1a1a] border border-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D37F]/50"
        >
          <option value="all">All</option>
          <option value="3">3 Months or less</option>
          <option value="6">6 Months or less</option>
          <option value="12">12 Months or less</option>
        </select>
      </div>
      
      {/* Sort By Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-200 mb-3">Sort By</h3>
        <select 
          value={sortBy} 
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D37F]/50"
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="discount-desc">Discount: High to Low</option>
          <option value="expiry-asc">Expiry: Soonest First</option>
        </select>
      </div>
      
      {/* We could add more filters here in the future */}
      <div className="pt-4 border-t border-gray-700/40">
        <button 
          className="w-full bg-[#00D37F]/20 hover:bg-[#00D37F]/30 text-[#00D37F] font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;