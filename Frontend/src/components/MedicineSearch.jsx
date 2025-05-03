import React, { useState } from 'react';
import axios from 'axios';

const MedicineSearch = ({ onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/api/medicines/search`, {
        params: { name: searchTerm },
      });
      onSearchResults(response.data);
    } catch (error) {
      console.error('Error searching for medicines:', error);
    }
  };

  return (
    <div className="medicine-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for medicines..."
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default MedicineSearch; 