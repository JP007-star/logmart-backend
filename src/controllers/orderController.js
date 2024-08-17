const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');
const htmlPdf = require('html-pdf');


// Create order and reduce stock quantities
async function createOrder(req, res) {
  const { userId, user, products, shippingAddress, totalAmount } = req.body;

  try {
    // Check and update stock quantities
    for (const product of products) {
      const { productId, quantity } = product;
      const dbProduct = await Product.findById(productId);

      if (!dbProduct) {
        return res.status(404).json({ message: `Product with ID ${productId} not found` });
      }

      if (dbProduct.quantity < quantity) {
        return res.status(400).json({ message: `Insufficient stock for product with ID ${productId}` });
      }

      // Reduce the product quantity in stock
      await dbProduct.save();
    }

    // Create and save the order
    const order = new Order({
      userId,
      user,                // Adding user information
      products,            // Products array with detailed product info
      shippingAddress,     // Adding shipping address
      totalAmount,
    });

    const newOrder = await order.save();

    // Optionally, clear the cart after placing an order
    await Cart.findOneAndDelete({ userId });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(400).json({ message: error.message });
  }
}

// Get all orders
async function getAllOrders(req, res) {
  try {
    const orders = await Order.find();
    return res.status(200).json({
      orders,
      message: 'All orders retrieved successfully',
    });
  } catch (error) {
    console.error('Error retrieving orders:', error.message);
    res.status(500).json({ message: error.message });
  }
}


async function generateInvoicePdf(req, res) {
  const { orderId } = req.params;

  try {
    // Load the HTML template
    const templatePath = path.join(__dirname, '../templates/invoice-template.html');
    console.log('Template Path:', templatePath); // Log the path for debugging

    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    // Fetch the order details
    const order = await Order.findById(orderId).populate('products.productId'); // Adjust if needed

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Prepare the data for the template
    const orderData = {
      orderNumber: order._id,
      customerName: order.user.name, // Adjust based on your schema
      shippingAddress: order.shippingAddress,
      totalAmount: order.totalAmount.toFixed(2),
      status: order.status,
      orderDate: new Date(order.orderDate).toLocaleString(), // Includes both date and time
      products: order.products.map(p => ({
        name: p.name, // Adjust if needed
        quantity: p.quantity,
        price: p.price.toFixed(2),
      })),
    };

    // Replace placeholders with actual data
    let htmlContent = htmlTemplate
      .replace(/{{orderNumber}}/g, orderData.orderNumber)
      .replace(/{{customerName}}/g, orderData.customerName)
      .replace(/{{orderDate}}/g, orderData.orderDate)
      .replace(/{{status}}/g, orderData.status)
      .replace(/{{shippingAddress.street}}/g, orderData.shippingAddress.street)
      .replace(/{{shippingAddress.city}}/g, orderData.shippingAddress.city)
      .replace(/{{shippingAddress.state}}/g, orderData.shippingAddress.state)
      .replace(/{{shippingAddress.country}}/g, orderData.shippingAddress.country)
      .replace(/{{shippingAddress.postalCode}}/g, orderData.shippingAddress.postalCode)
      .replace(/{{totalAmount}}/g, orderData.totalAmount);

    // Handle products table
    let productsHtml = '';
    for (const product of orderData.products) {
      productsHtml += `
        <tr>
          <td>${product.name}</td>
          <td>${product.quantity}</td>
          <td>₹${product.price}</td>
        </tr>
      `;
    }
    
    // Directly replace the placeholder with the products HTML
    htmlContent = htmlContent.replace('{{productsTable}}', productsHtml);

    // Generate PDF
    const pdfOptions = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
    };

    htmlPdf.create(htmlContent, pdfOptions).toBuffer((err, buffer) => {
      if (err) {
        console.error('Error generating PDF:', err);
        return res.status(500).json({ message: 'Failed to generate PDF', error: err.message });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');

      res.send(buffer);
    });

  } catch (error) {
    console.error('Error generating PDF:', error.message);
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  generateInvoicePdf
};