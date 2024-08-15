const Product = require('../models/Product');
const { generateAndUploadQRCode } = require('../firebase');
const htmlPdf = require('html-pdf');


const { jsPDF } = require('jspdf');
const { convertToDataUrl } = require('../utils/convertToDataUrl'); // Utility to convert image URL to base64





const productController = {
    generatePdfForAllProducts: async (req, res) => {
      try {
        // Fetch all products from the database
        const products = await Product.find();
  
        // Start building the HTML content
        let htmlContent = `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  border: 1px solid black;
                  padding: 4px;
                  text-align: left;
                }
                th {
                  background-color: #f2f2f2;
                }
                .qr-code {
                  width: 150px;
                  height: 150px;
                }
              </style>
            </head>
            <body>
              <h1>Product List</h1>
              <table>
                <thead>
                  <tr>
                     <th>SL No</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>QR Code</th>
                  </tr>
                </thead>
                <tbody>
        `;
        var i=1;
        for (const product of products) {
          const qrCodeDataUrl = await convertToDataUrl(product.qrCode);
  
          htmlContent += `
            <tr>
            <td>${i}</td>
              <td>${product.title}</td>
              <td>$${product.price}</td>
              <td>${product.category}</td>
              <td>${product.quantity}</td>
              <td><img src="${qrCodeDataUrl}" class="qr-code" /></td>
            </tr>
          `;
          i++;
        }
  
        htmlContent += `
              </tbody>
            </table>
          </body>
        </html>
        `;
  
        // Define PDF options
        const pdfOptions = {
          format: 'A4',
          orientation: 'portrait',
          border: '10mm'
        };
  
        // Generate PDF
        htmlPdf.create(htmlContent, pdfOptions).toBuffer((err, buffer) => {
          if (err) {
            console.error('Error generating PDF:', err);
            return res.status(500).json({ message: 'Failed to generate PDF' });
          }
  
          // Set headers to indicate PDF content
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=products.pdf');
  
          // Send the PDF as a binary response
          res.send(buffer);
        });
  
      } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Failed to generate PDF' });
      }
    },
  

  // Retrieve all products
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      return res.status(200).json({
        products,
        message: 'All products retrieved successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Retrieve a product by ID
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Create a new product
  createProduct: async (req, res) => {
    try {
      const { title, price, description, quantity, category, image, discount, status, rating = { rate: 0, count: 0 } } = req.body;

      // Create a new product
      const newProduct = new Product({ title, price, description, quantity, category, image, discount, status, rating });
      const savedProduct = await newProduct.save();

      // Ensure we have a valid product ID before proceeding
      if (!savedProduct || !savedProduct._id) {
        throw new Error('Product creation failed');
      }

      // Generate and upload QR code for the new product
      const qrCodeUrl = await generateAndUploadQRCode(savedProduct._id.toString());

      // Update the product with the QR code URL
      savedProduct.qrCode = qrCodeUrl;
      await savedProduct.save(); // Save the updated product

      res.status(201).json(savedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update a product by ID
  updateProductById: async (req, res) => {
    try {
      const { title, price, description, quantity, category, image, discount, status, rating } = req.body;
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { title, price, description, quantity, category, image, discount, status, rating },
        { new: true } // Return the updated document
      );
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Delete a product by ID
  deleteProductById: async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: `Product id ${req.params.id} deleted successfully` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = productController;
