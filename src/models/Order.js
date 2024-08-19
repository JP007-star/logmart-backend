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
  sgst: { type: Number, default: 0 },  // SGST percentage
  cgst: { type: Number, default: 0 },  // CGST percentage
  discount: { type: Number, default: 0 }, // Discount percentage
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

// Calculate total SGST, CGST, and Discount for the order before saving
orderSchema.pre('save', function(next) {
  if (this.products.length > 0) {
    // Calculate total amount before discount
    const totalBeforeDiscount = this.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);

    // Calculate total discount
    this.totalDiscount = this.products.reduce((total, product) => {
      const discountAmount = (product.price * product.quantity) * (product.discount / 100);
      return total + discountAmount;
    }, 0);

    // Calculate SGST and CGST based on total before discount
    this.totalSGST = this.products.reduce((total, product) => {
      const sgstAmount = (product.price * product.quantity) * (product.sgst / 100);
      return total + sgstAmount;
    }, 0);

    this.totalCGST = this.products.reduce((total, product) => {
      const cgstAmount = (product.price * product.quantity) * (product.cgst / 100);
      return total + cgstAmount;
    }, 0);

    // Calculate total amount after discount
    this.totalAmount = totalBeforeDiscount - this.totalDiscount + this.totalSGST + this.totalCGST;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
