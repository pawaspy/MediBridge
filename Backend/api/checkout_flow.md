# MediBridge Checkout and Payment Flow

This document outlines the complete checkout and payment flow for the MediBridge pharmacy system.

## Checkout Flow

### 1. Cart Management

The cart system allows patients to:
- Add medicines to their cart
- View their cart items with details (medicine name, price, quantity, etc.)
- Update quantities
- Remove items
- View cart totals

### 2. Checkout Process

The checkout process follows these steps:

1. **Cart Validation**
   - The system verifies all medicines in the cart are:
     - In stock (requested quantity ≤ available quantity)
     - Not expired
   - If any items fail validation, checkout is blocked with appropriate error messages

2. **Checkout Initiation**
   - Patient initiates checkout via `POST /api/cart/checkout`
   - System generates a unique checkout ID
   - Returns cart summary and payment instructions

3. **Payment Processing**
   - Patient is directed to make payment
   - Payment amount is based on cart total
   - Upon successful payment, the system will:
     - Create an order record
     - Reserve medicines (reduce inventory)
     - Clear the cart

## Payment Integration

The payment process integrates with the cart system as follows:

### Front-end Integration

```javascript
// Example of front-end checkout flow
async function checkout() {
  try {
    // 1. Get checkout info from cart
    const checkoutResponse = await fetch('/api/cart/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const checkoutData = await checkoutResponse.json();
    
    if (!checkoutResponse.ok) {
      throw new Error(checkoutData.error);
    }
    
    // 2. Initiate payment with checkout data
    const paymentResponse = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: checkoutData.checkout_id,
        amount: Math.round(checkoutData.total * 100), // Convert to cents
        currency: 'usd',
        save_card: true // Optional
      })
    });
    
    const paymentData = await paymentResponse.json();
    
    // 3. Handle payment response
    if (paymentData.requires_action) {
      // Handle additional authentication if needed
      // Use Stripe.js for this
    } else {
      // Payment successful
      return paymentData;
    }
  } catch (error) {
    console.error('Checkout failed:', error);
    throw error;
  }
}
```

### Back-end Flow

1. **Checkout Endpoint**: `POST /api/cart/checkout`
   - Validates the cart
   - Returns checkout information including total amount

2. **Payment Endpoint**: `POST /api/payments`
   - Creates a payment intent
   - Processes the payment
   - On success, creates an order

3. **Order Processing**:
   - Once payment is confirmed, the system:
     - Updates medicine inventory
     - Creates delivery information
     - Sends confirmation emails

## Implementation Details

### Cart to Payment Handoff

The cart's `CheckoutCart` handler prepares data for payment by:
1. Validating all items in the cart
2. Calculating the total amount
3. Generating a unique checkout ID
4. Returning payment instructions

### Payment Confirmation to Order Creation

After payment is successful:
1. Payment webhook or callback confirms successful payment
2. System creates an order with items from the cart
3. Cart is cleared once order is successfully created

## Testing the Integration

To test the complete flow:

1. Add items to cart: `POST /api/cart`
2. Initiate checkout: `POST /api/cart/checkout`
3. Make payment with test card: `POST /api/payments`
4. Verify order creation and cart clearing

## Next Steps for Implementation

To complete the integration:

1. Implement the order handling system to receive successful payments
2. Create inventory management logic to reduce stock when orders are placed
3. Implement email notifications for order confirmation
4. Add order tracking and history for patients 