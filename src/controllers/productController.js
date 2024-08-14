const Product = require('../models/Product');
const { generateAndUploadQRCode } = require('../firebase');

const productController = {
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
