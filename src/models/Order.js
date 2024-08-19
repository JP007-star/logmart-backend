const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
});

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true }, 
  price: { type: Number, required: true }, 
  quantity: { type: Number, required: true },
  sgst: { type: Number, default: 0 },  // SGST for the product
  cgst: { type: Number, default: 0 },  // CGST for the product
  discount: { type: Number, default: 0 }, // Discount percentage for the product
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user: {
    name: { type: String, required: true },  
    email: { type: String, required: true }, 
  },
  products: [productSchema],
  shippingAddress: addressSchema,
  totalAmount: { type: Number, required: true },
  totalSGST: { type: Number, default: 0 },  // Total SGST for the order
  totalCGST: { type: Number, default: 0 },  // Total CGST for the order
  totalDiscount: { type: Number, default: 0 }, // Total discount for the order
  paymentMode: { type: String, default: 'Cash On Delivery', required: true },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
});



const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
