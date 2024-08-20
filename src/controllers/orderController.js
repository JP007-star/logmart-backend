const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');
const htmlPdf = require('html-pdf');

// Create order and reduce stock quantities
async function createOrder(req, res) {
  const { userId, user, products, shippingAddress, paymentMode, status } = req.body;
  let totalAmount = 0;
  let totalDiscount = 0;
  let totalSGST = 0;
  let totalCGST = 0;
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

      // Calculate total amount before discounts
      const productTotal = dbProduct.price * quantity;
      console.log('Product Total:', productTotal);

      // Calculate discount
      const discountAmount = (productTotal * (dbProduct.discount || 0)) / 100;
      const discountedPrice = productTotal - discountAmount;
      totalDiscount += discountAmount;
      console.log('Discount Amount:', discountAmount);
      console.log('Discounted Price:', discountedPrice);

      // Calculate taxes based on discounted price
      const sgstAmount = (discountedPrice * dbProduct.sgst) / 100;
      const cgstAmount = (discountedPrice * dbProduct.cgst) / 100;
      totalSGST += sgstAmount;
      totalCGST += cgstAmount;
      totalAmount += discountedPrice + sgstAmount + cgstAmount;
      console.log('SGST Amount:', totalSGST);
      console.log('CGST Amount:', totalCGST);

      // Update the product stock
      await dbProduct.save();
    }

    // Calculate final amount
    const finalAmount = totalAmount;
    console.log('Final Amount:', finalAmount);

    // Create and save the order
    const order = new Order({
      userId,
      user,                // Adding user information
      products,            // Products array with detailed product info
      shippingAddress,     // Adding shipping address
      totalAmount: finalAmount,
      totalDiscount,
      totalSGST,
      totalCGST,
      paymentMode,
      status,
      orderDate: new Date().toISOString()
    });

    // Log order object before saving
    console.log('Order Object Before Save:', order);

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

// Generate PDF invoice
async function generateInvoicePdf(req, res) {
  const { orderId } = req.params;

  try {
    // Load the HTML template
    const templatePath = path.join(__dirname, '../templates/invoice-template.html');
    const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    // Fetch the order details
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Initialize the orderData object
    const orderData = {
      orderNumber: order._id,
      customerName: order.user.name,
      shippingAddress: order.shippingAddress,
      subtotal: 0,
      discount: order.totalDiscount?.toFixed(2) || "0.00",
      totalSGST: 0,
      totalCGST: 0,
      totalAmount: 0,
      status: order.status,
      orderDate: new Date(order.orderDate).toLocaleString(),
      products: []
    };

    // Calculate totals and populate products array
    order.products.forEach(p => {
      const productTotal = p.price * p.quantity;
      const discountAmount = (productTotal * (p.discount || 0)) / 100;
      const discountedPrice = productTotal - discountAmount;

      const productSGST = (discountedPrice * p.sgst) / 100;
      const productCGST = (discountedPrice * p.cgst) / 100;

      // Update the orderData with calculations
      orderData.subtotal += productTotal;
      orderData.totalSGST += productSGST;
      orderData.totalCGST += productCGST;
      orderData.totalAmount += discountedPrice + productSGST + productCGST;

      orderData.products.push({
        name: p.name,
        quantity: p.quantity,
        price: p.price.toFixed(2),
        discount: discountAmount.toFixed(2),
        sgst: productSGST.toFixed(2),
        cgst: productCGST.toFixed(2),
        total: (discountedPrice + productSGST + productCGST).toFixed(2),
      });
    });

    // Convert the totals to fixed decimal format
    orderData.subtotal = orderData.subtotal.toFixed(2);
    orderData.totalSGST = orderData.totalSGST.toFixed(2);
    orderData.totalCGST = orderData.totalCGST.toFixed(2);
    orderData.totalAmount = orderData.totalAmount.toFixed(2);

    // Replace placeholders with actual data
    let htmlContent = htmlTemplate
      .replace(/{{orderNumber}}/g, orderData.orderNumber)
      .replace(/{{customerName}}/g, orderData.customerName)
      .replace(/{{orderDate}}/g, orderData.orderDate)
      .replace(/{{status}}/g, orderData.status)
      .replace(/{{shippingAddress\.street}}/g, orderData.shippingAddress.street)
      .replace(/{{shippingAddress\.city}}/g, orderData.shippingAddress.city)
      .replace(/{{shippingAddress\.state}}/g, orderData.shippingAddress.state)
      .replace(/{{shippingAddress\.country}}/g, orderData.shippingAddress.country)
      .replace(/{{shippingAddress\.postalCode}}/g, orderData.shippingAddress.postalCode)
      .replace(/{{subtotal}}/g, orderData.subtotal)
      .replace(/{{sgst}}/g, orderData.totalSGST)
      .replace(/{{cgst}}/g, orderData.totalCGST)
      .replace(/{{discount}}/g, orderData.discount)
      .replace(/{{totalAmount}}/g, orderData.totalAmount);

    // Handle products table
    let productsHtml = '';
    orderData.products.forEach(product => {
      productsHtml += `
        <tr>
          <td>${product.name}</td>
          <td>${product.quantity}</td>
          <td>₹${product.price}</td>
          <td>₹${product.sgst}</td>
          <td>₹${product.cgst}</td>
          <td>₹${product.discount}</td>
          <td>₹${product.total}</td>
        </tr>
      `;
    });

    // Replace the placeholder with the products HTML
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
  generateInvoicePdf,
  createOrder,
  getAllOrders
};