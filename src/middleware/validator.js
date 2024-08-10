// middleware/validation.js
function validateCartRequest(req, res, next) {
    const { quantity } = req.body;
  
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid request body' });
    }
  
    next();
  }
  
  module.exports = { validateCartRequest };
  