// Seller type constants - must match backend validation in util package
export const SELLER_TYPES = {
  RETAIL: 'retail',
  WHOLESALE: 'wholesale',
  HOSPITAL: 'hospital',
  NGO: 'ngo'
};

export const SELLER_TYPE_LABELS = {
  [SELLER_TYPES.RETAIL]: 'Retail Pharmacy',
  [SELLER_TYPES.WHOLESALE]: 'Wholesale Distributor',
  [SELLER_TYPES.HOSPITAL]: 'Hospital',
  [SELLER_TYPES.NGO]: 'NGO'
};

export default SELLER_TYPES; 