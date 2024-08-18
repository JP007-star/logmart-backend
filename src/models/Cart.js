const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  items: [
    {
      productId: { 
        type: String, 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true,
        min: [1, 'Quantity must be at least 1']  // Ensure quantity is at least 1
      },
      productName: { 
        type: String 
      },
      price: { 
        type: Number 
      },
      discount: { 
        type: Number, // Assuming discount is a percentage
        default: 0 
      },
      image: { 
        type: String 
      },
      sgst: { 
        type: Number, 
        default: 0  // State Goods and Services Tax
      },
      cgst: { 
        type: Number, 
        default: 0  // Central Goods and Services Tax
      }
    }
  ],
}, { timestamps: true });  // Add timestamps

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
