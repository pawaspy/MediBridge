import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaSort, FaSortAmountDown, 
  FaSortAmountUp, FaSave, FaTimes, FaFilter, FaInfoCircle, 
  FaExclamationTriangle, FaCheck
} from 'react-icons/fa';

const MedicineManagement = () => {
  // State for medicines list
  const [medicines, setMedicines] = useState([]);
  
  // State for form
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    manufacturer: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    expiryDate: '',
    dosage: ''
  });
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // State for medicine details modal
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Form visibility toggle
  const [formVisible, setFormVisible] = useState(false);
  
  // Categories list
  const categories = [
    'Antibiotic',
    'Painkiller',
    'Cardiovascular',
    'Antidiabetic',
    'Antiviral',
    'Respiratory',
    'Gastrointestinal',
    'Dermatological',
    'Neurological',
    'Supplements'
  ];
  
  // Load medicines from localStorage on component mount
  useEffect(() => {
    const storedMedicines = localStorage.getItem('sellerMedicines');
    if (storedMedicines) {
      setMedicines(JSON.parse(storedMedicines));
    } else {
      // Add some sample medicines for testing if none exist
      const sampleMedicines = [
        {
          id: 'MED001',
          name: 'Paracetamol',
          manufacturer: 'Pharma Corp',
          price: '5.99',
          stock: '150',
          category: 'Painkiller',
          description: 'Fever and pain reducer',
          expiryDate: '2025-06-30',
          dosage: '500mg'
        },
        {
          id: 'MED002',
          name: 'Amoxicillin',
          manufacturer: 'MediLabs',
          price: '12.50',
          stock: '75',
          category: 'Antibiotic',
          description: 'Treats bacterial infections',
          expiryDate: '2024-12-15',
          dosage: '250mg'
        },
        {
          id: 'MED003',
          name: 'Loratadine',
          manufacturer: 'AllergyRelief Inc.',
          price: '8.75',
          stock: '100',
          category: 'Antiallergic',
          description: 'Relief from allergy symptoms',
          expiryDate: '2026-03-20',
          dosage: '10mg'
        }
      ];
      
      setMedicines(sampleMedicines);
      localStorage.setItem('sellerMedicines', JSON.stringify(sampleMedicines));
    }
  }, []);
  
  // Save medicines to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('sellerMedicines', JSON.stringify(medicines));
  }, [medicines]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      manufacturer: '',
      price: '',
      stock: '',
      category: '',
      description: '',
      expiryDate: '',
      dosage: ''
    });
    setIsEditing(false);
    setFormVisible(false);
  };
  
  // Add a new medicine
  const handleAddMedicine = (e) => {
    e.preventDefault();
    
    const newMedicine = {
      ...formData,
      id: isEditing ? formData.id : `MED${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    };
    
    if (isEditing) {
      setMedicines(medicines.map(med => med.id === newMedicine.id ? newMedicine : med));
    } else {
      setMedicines([...medicines, newMedicine]);
    }
    
    resetForm();
  };
  
  // Delete a medicine
  const handleDeleteMedicine = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this medicine?');
    
    if (confirmDelete) {
      const filteredMedicines = medicines.filter((medicine) => medicine.id !== id);
      setMedicines(filteredMedicines);
    }
  };
  
  // Set form data for editing
  const handleSetEditData = (medicine) => {
    setFormData(medicine);
    setIsEditing(true);
    setFormVisible(true);
  };
  
  // Show medicine details
  const handleShowDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setShowDetailsModal(true);
  };
  
  // Close details modal
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedMedicine(null);
  };
  
  // Toggle sort order
  const handleToggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Filter and sort medicines
  const filteredAndSortedMedicines = medicines
    .filter((medicine) => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === '' || medicine.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortBy === 'price' || sortBy === 'stock') {
        // Sort numerically for price and stock
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
      } else {
        // Sort alphabetically for other fields
        return sortOrder === 'asc' 
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      }
    });

  // Check if any medicines are low in stock (less than 20 units)
  const lowStockCount = medicines.filter(med => parseInt(med.stock) < 20).length;
  
  // Check for medicines expiring within 3 months
  const expiringCount = medicines.filter(med => {
    const expiryDate = new Date(med.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate < threeMonthsFromNow;
  }).length;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-3xl font-bold text-[#00FFAB]">Medicine Management</h3>
        <button
          className="bg-[#00FFAB]/20 text-[#00FFAB] px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#00FFAB]/30 transition-colors font-bold text-lg shadow-md border border-[#00FFAB]/30"
          onClick={() => {
            setFormData({
              id: '',
              name: '',
              manufacturer: '',
              price: '',
              stock: '',
              category: '',
              description: '',
              expiryDate: '',
              dosage: ''
            });
            setIsEditing(false);
            setFormVisible(true);
          }}
        >
          <FaPlus size={18} /> Add Medicine
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-400 text-sm">Total Medicines</h4>
              <p className="text-2xl font-bold text-white">{medicines.length}</p>
            </div>
            <div className="bg-[#00FFAB]/20 p-3 rounded-full">
              <FaInfoCircle className="text-[#00FFAB] text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-400 text-sm">Low Stock Alert</h4>
              <p className="text-2xl font-bold text-white">{lowStockCount} items</p>
            </div>
            <div className={`${lowStockCount > 0 ? 'bg-red-500/20' : 'bg-green-500/20'} p-3 rounded-full`}>
              {lowStockCount > 0 ? (
                <FaExclamationTriangle className="text-red-500 text-xl" />
              ) : (
                <FaCheck className="text-green-500 text-xl" />
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-400 text-sm">Expiring Soon</h4>
              <p className="text-2xl font-bold text-white">{expiringCount} items</p>
            </div>
            <div className={`${expiringCount > 0 ? 'bg-yellow-500/20' : 'bg-green-500/20'} p-3 rounded-full`}>
              {expiringCount > 0 ? (
                <FaExclamationTriangle className="text-yellow-500 text-xl" />
              ) : (
                <FaCheck className="text-green-500 text-xl" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicines by name, manufacturer, or ID..."
            className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md pl-10 pr-3 py-2 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <FaFilter className="absolute left-3 top-3 text-gray-400" />
          <select
            className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md pl-10 pr-3 py-2 text-white appearance-none cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <select
            className="flex-1 bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white appearance-none cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
            <option value="expiryDate">Expiry Date</option>
          </select>
          <button
            className="bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white hover:bg-[#00FFAB]/20 transition-colors"
            onClick={handleToggleSortOrder}
          >
            {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
        </div>
      </div>
      
      {/* Add/Edit Medicine Form */}
      {formVisible && (
        <div className="bg-[#1a1a1a]/90 rounded-xl shadow-lg border border-[#00FFAB]/10 p-6 backdrop-blur-md mb-8">
          <h4 className="text-xl font-bold text-[#00FFAB] mb-4">
            {isEditing ? 'Edit Medicine' : 'Add New Medicine'}
          </h4>
          <form onSubmit={handleAddMedicine}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[#00FFAB] mb-1">Medicine Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#00FFAB] mb-1">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#00FFAB] mb-1">Category</label>
                <select
                  name="category"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#00FFAB] mb-1">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-[#00FFAB] mb-1">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-[#00FFAB] mb-1">Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#00FFAB] mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[#00FFAB] mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white min-h-[80px]"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#00FFAB] text-black py-2 px-4 rounded-md hover:bg-[#00D37F] transition-colors font-semibold flex items-center gap-2"
              >
                {isEditing ? <><FaSave /> Update Medicine</> : <><FaPlus /> Add Medicine</>}
              </button>
              <button
                type="button"
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors font-semibold flex items-center gap-2"
                onClick={resetForm}
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Medicines Table */}
      <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg border border-[#00FFAB]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#00FFAB]/10">
                <th className="px-4 py-3 text-left text-[#00FFAB]">ID</th>
                <th className="px-4 py-3 text-left text-[#00FFAB]">Name</th>
                <th className="px-4 py-3 text-left text-[#00FFAB]">Manufacturer</th>
                <th className="px-4 py-3 text-left text-[#00FFAB]">Category</th>
                <th className="px-4 py-3 text-right text-[#00FFAB]">Price (₹)</th>
                <th className="px-4 py-3 text-right text-[#00FFAB]">Stock</th>
                <th className="px-4 py-3 text-center text-[#00FFAB]">Expiry Date</th>
                <th className="px-4 py-3 text-center text-[#00FFAB]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00FFAB]/10">
              {filteredAndSortedMedicines.length > 0 ? (
                filteredAndSortedMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-[#00FFAB]/5 transition-colors">
                    <td className="px-4 py-3 text-gray-300">{medicine.id}</td>
                    <td className="px-4 py-3 text-white font-medium">{medicine.name}</td>
                    <td className="px-4 py-3 text-white">{medicine.manufacturer}</td>
                    <td className="px-4 py-3 text-white">{medicine.category}</td>
                    <td className="px-4 py-3 text-white text-right font-bold">₹{medicine.price}</td>
                    <td className="px-4 py-3 text-right">
                      <span 
                        className={`
                          ${parseInt(medicine.stock) <= 10 ? 'text-red-400' : 
                            parseInt(medicine.stock) <= 30 ? 'text-yellow-400' : 'text-green-400'}
                        `}
                      >
                        {medicine.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white text-center">
                      {new Date(medicine.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="text-white hover:text-[#00FFAB] transition-colors"
                          onClick={() => handleShowDetails(medicine)}
                          title="View Details"
                        >
                          <FaInfoCircle />
                        </button>
                        <button
                          className="text-white hover:text-[#00FFAB] transition-colors"
                          onClick={() => handleSetEditData(medicine)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-white hover:text-red-500 transition-colors"
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-400">
                    {searchQuery || filterCategory 
                      ? "No medicines found matching your search criteria." 
                      : "No medicines found. Add some medicines to your inventory."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Medicine Details Modal */}
      {showDetailsModal && selectedMedicine && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={handleCloseDetailsModal}></div>
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-xl p-6 z-10 border border-[#00FFAB]/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-[#00FFAB]">{selectedMedicine.name}</h3>
              <button
                className="text-white hover:text-[#00FFAB] transition-colors text-xl"
                onClick={handleCloseDetailsModal}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="bg-[#121212]/60 rounded-lg p-3 mb-4 border border-[#00FFAB]/10">
              <p className="text-white">{selectedMedicine.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">ID</p>
                <p className="text-white">{selectedMedicine.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Manufacturer</p>
                <p className="text-white">{selectedMedicine.manufacturer}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Category</p>
                <p className="text-white">{selectedMedicine.category}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Dosage</p>
                <p className="text-white">{selectedMedicine.dosage}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Price</p>
                <p className="text-white">₹{selectedMedicine.price}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Stock Quantity</p>
                <p className={`
                  ${parseInt(selectedMedicine.stock) <= 10 ? 'text-red-400' : 
                    parseInt(selectedMedicine.stock) <= 30 ? 'text-yellow-400' : 'text-green-400'}
                `}>{selectedMedicine.stock}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Expiry Date</p>
                <p className="text-white">{new Date(selectedMedicine.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <button
                className="bg-[#121212] text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                onClick={handleCloseDetailsModal}
              >
                <FaTimes /> Close
              </button>
              <button
                className="bg-[#00FFAB] text-black py-2 px-4 rounded-md hover:bg-[#00D37F] transition-colors font-semibold flex items-center gap-2"
                onClick={() => {
                  handleCloseDetailsModal();
                  handleSetEditData(selectedMedicine);
                }}
              >
                <FaEdit /> Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement; 