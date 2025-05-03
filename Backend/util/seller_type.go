package util

const (
	SellerTypePharmacy = "retail pharmacy"
	WholeSaleDistributor = "wholesale distributor"
	Hospital = "hospital"
	NGO = "NGO"
)

func IsValidSellerType(sellerType string) bool {
	switch sellerType {
	case SellerTypePharmacy, WholeSaleDistributor, Hospital, NGO:
		return true
	default:
		return false
	}
}