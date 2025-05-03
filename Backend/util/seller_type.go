package util

const (
	RetailSeller    = "retail"
	WholesaleSeller = "wholesale"
	HospitalSeller  = "hospital"
	NGOSeller       = "ngo"
)

func IsValidSellerType(sellerType string) bool {
	switch sellerType {
	case RetailSeller, WholesaleSeller, HospitalSeller, NGOSeller:
		return true
	default:
		return false
	}
}
