import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaInfoCircle, FaEdit, FaSearch, FaTrash, FaSave, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

// Sample medicine data for demonstration
const sampleMedicines = [
  { id: 1, name: "Paracetamol", manufacturer: "ABC Pharma", price: "5.99", stock: "120", category: "Analgesic", description: "Fever and pain relief medication", expiryDate: "2025-06-30", dosage: "500mg" },
  { id: 2, name: "Amoxicillin", manufacturer: "XYZ Health", price: "12.50", stock: "85", category: "Antibiotic", description: "Treats bacterial infections", expiryDate: "2025-08-15", dosage: "250mg" },
  { id: 3, name: "Omeprazole", manufacturer: "HealthPlus", price: "8.75", stock: "65", category: "Antacid", description: "Reduces stomach acid production", expiryDate: "2025-09-20", dosage: "20mg" },
  { id: 4, name: "Lisinopril", manufacturer: "MediCare", price: "15.30", stock: "45", category: "Antihypertensive", description: "For high blood pressure treatment", expiryDate: "2025-11-28", dosage: "10mg" },
  { id: 5, name: "Metformin", manufacturer: "DiaCare", price: "10.20", stock: "90", category: "Antidiabetic", description: "Manages type 2 diabetes", expiryDate: "2025-07-18", dosage: "500mg" },
  { id: 6, name: "Atorvastatin", manufacturer: "LipidHealth", price: "18.90", stock: "72", category: "Statin", description: "Lowers cholesterol levels", expiryDate: "2025-10-05", dosage: "20mg" },
  { id: 7, name: "Aspirin", manufacturer: "Heart Life", price: "3.99", stock: "150", category: "Analgesic", description: "Pain, fever, and inflammation reduction", expiryDate: "2026-01-12", dosage: "100mg" },
  { id: 8, name: "Loratadine", manufacturer: "AllerCare", price: "7.25", stock: "60", category: "Antihistamine", description: "Relieves allergy symptoms", expiryDate: "2025-12-10", dosage: "10mg" },
  { id: 9, name: "Sertraline", manufacturer: "MindWell", price: "20.15", stock: "35", category: "Antidepressant", description: "Treats depression and anxiety", expiryDate: "2025-09-30", dosage: "50mg" },
  { id: 10, name: "Ibuprofen", manufacturer: "Relief Pharma", price: "6.50", stock: "110", category: "NSAID", description: "Anti-inflammatory pain reliever", expiryDate: "2026-02-28", dosage: "400mg" },
  { id: 11, name: "Cetirizine", manufacturer: "AllerCare", price: "9.35", stock: "55", category: "Antihistamine", description: "For allergies and rhinitis", expiryDate: "2025-11-15", dosage: "10mg" },
  { id: 12, name: "Azithral 500", manufacturer: "Alembic Pharmaceuticals", price: "199.00", stock: "25", category: "Antibiotic", description: "Effective for respiratory infections, skin infections, and STIs", expiryDate: "2025-09-10", dosage: "500mg" },
];

const MedicineManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    manufacturer: "",
    price: "",
    stock: "",
    category: "",
    dosage: "",
    description: "",
    expiryDate: ""
  });
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  
  // Categories for filter dropdown
  const categories = [...new Set(medicines.map(med => med.category))];
  
  // Load medicines from localStorage or use sample data
  useEffect(() => {
    const storedMedicines = localStorage.getItem('sellerMedicines');
    if (storedMedicines) {
      setMedicines(JSON.parse(storedMedicines));
    } else {
      // Initialize with sample data
      setMedicines(sampleMedicines);
      localStorage.setItem('sellerMedicines', JSON.stringify(sampleMedicines));
    }
  }, []);
  
  // Filter and sort medicines
  const filteredAndSortedMedicines = medicines
    .filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          medicine.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          medicine.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory ? medicine.category === filterCategory : true;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Convert strings to numbers for numerical sorting
      const aValue = sortBy === 'price' || sortBy === 'stock' ? parseFloat(a[sortBy]) : a[sortBy];
      const bValue = sortBy === 'price' || sortBy === 'stock' ? parseFloat(b[sortBy]) : b[sortBy];
      
      // Date sorting for expiry date
      if (sortBy === 'expiryDate') {
        return sortOrder === 'asc' 
          ? new Date(a.expiryDate) - new Date(b.expiryDate)
          : new Date(b.expiryDate) - new Date(a.expiryDate);
      }
      
      // Default sorting for strings and numbers
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  
  // Calculate stats for cards
  const totalMedicines = medicines.length;
  const lowStock = medicines.filter(med => parseInt(med.stock) <= 20).length;
  const expiringIn3Months = medicines.filter(med => {
    const expiryDate = new Date(med.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  }).length;
  
  // Handle sorting column click
  const handleSort = (column) => {
    if (sortBy === column) {
      // If already sorting by this column, toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new column, set it as the sort column with ascending order
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      manufacturer: "",
      price: "",
      stock: "",
      category: "",
      dosage: "",
      description: "",
      expiryDate: ""
    });
    setIsEditing(false);
    setShowForm(false);
  };
  
  // Add or update medicine
  const handleAddMedicine = (e) => {
    e.preventDefault();
    
    let updatedMedicines;
    
    if (isEditing) {
      // Update existing medicine
      updatedMedicines = medicines.map(med => 
        med.id.toString() === formData.id.toString() ? formData : med
      );
    } else {
      // Add new medicine with a new ID
      const newId = Math.max(0, ...medicines.map(m => parseInt(m.id))) + 1;
      updatedMedicines = [
        ...medicines, 
        { ...formData, id: newId.toString() }
      ];
    }
    
    // Update state and localStorage
    setMedicines(updatedMedicines);
    localStorage.setItem('sellerMedicines', JSON.stringify(updatedMedicines));
    
    // Reset form
    resetForm();
  };
  
  // Delete medicine
  const handleDeleteMedicine = (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      const updatedMedicines = medicines.filter(med => med.id.toString() !== id.toString());
      setMedicines(updatedMedicines);
      localStorage.setItem('sellerMedicines', JSON.stringify(updatedMedicines));
    }
  };
  
  // Set data for editing
  const handleSetEditData = (medicine) => {
    setFormData({ ...medicine });
    setIsEditing(true);
    setShowForm(true);
  };
  
  // Show medicine details in modal
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
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-8">Medicine Management</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg p-6 border border-[#00FFAB]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Medicines</p>
              <p className="text-3xl font-bold text-white mt-1">{totalMedicines}</p>
            </div>
            <div className="bg-[#00FFAB]/10 p-3 rounded-full">
              <FaMedicineBox className="text-[#00FFAB] text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg p-6 border border-[#00FFAB]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock Alert</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{lowStock}</p>
            </div>
            <div className="bg-yellow-400/10 p-3 rounded-full">
              <FaExclamationTriangle className="text-yellow-400 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg p-6 border border-[#00FFAB]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Expiring Soon</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{expiringIn3Months}</p>
            </div>
            <div className="bg-red-400/10 p-3 rounded-full">
              <FaCalendarAlt className="text-red-400 text-2xl" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search medicines..."
              className="bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md pl-10 pr-4 py-2 text-white w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Category Filter */}
          <div>
            <select
              className="bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white w-full"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Sort Order Toggle */}
          <button
            className="flex items-center gap-2 bg-[#1a1a1a] border border-[#00FFAB]/30 rounded-md px-4 py-2 text-white"
            onClick={handleToggleSortOrder}
          >
            {sortOrder === 'asc' ? 
              <><FaSortAmountUp className="text-[#00FFAB]" /> Ascending</> : 
              <><FaSortAmountDown className="text-[#00FFAB]" /> Descending</>
            }
          </button>
        </div>
        
        {/* Add New Button */}
        <button
          className="bg-[#00FFAB] text-black py-2 px-4 rounded-md hover:bg-[#00D37F] transition-colors font-semibold flex items-center gap-2 justify-center"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add New Medicine</>}
        </button>
      </div>
      
      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-[#1a1a1a]/80 rounded-xl shadow-lg p-6 border border-[#00FFAB]/10">
          <h3 className="text-xl font-bold text-white mb-4">
            {isEditing ? "Edit Medicine" : "Add New Medicine"}
          </h3>
          
          <form onSubmit={handleAddMedicine}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#00FFAB] mb-1">Name</label>
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
                <label className="block text-[#00FFAB] mb-1">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#00FFAB] mb-1">Stock</label>
                <input
                  type="number"
                  name="stock"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#00FFAB] mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  className="w-full bg-[#121212] border border-[#00FFAB]/30 rounded-md px-3 py-2 text-white"
                  value={formData.category}
                  onChange={handleInputChange}
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