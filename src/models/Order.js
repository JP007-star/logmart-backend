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
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  user: {
    name: { type: String, required: true },  
    email: { type: String, required: true }, 
  },
  products: [productSchema],
  shippingAddress: addressSchema,
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
