const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Import routes
const authenticationRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin/auth');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const cartRoutes = require('./src/routes/cartRoutes');

const app = express();

// CORS setup
const corsOptions = {
    origin: '*',
    credentials: true, // Access-Control-Allow-Credentials:true
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan('combined')); // Logging

// Static files
app.use("/public", express.static(path.join(__dirname, "src/uploads")));

// Logging requests and responses
const logRequest = (req, res, next) => {
    req.startTime = new Date(); // Store start time of the request
    req.logData = {
        timestamp: req.startTime.toISOString(),
        method: req.method,
        url: req.url,
        headers: req.headers,
        params: req.params,
        query: req.query,
        requestBody: req.body,
    };
    next(); // Pass control to the next middleware or route handler
};

const logResponse = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function (data) {
        const responseTime = new Date() - req.startTime; // Calculate response time
        
        // Only attempt to parse JSON responses
        let responseBody;
        if (res.getHeader('Content-Type') && res.getHeader('Content-Type').includes('application/json')) {
            try {
                responseBody = JSON.parse(data);
            } catch (err) {
                responseBody = 'Failed to parse JSON'; // Handle parse error
                console.error('Error parsing JSON response:', err);
            }
        } else {
            responseBody = 'Non-JSON response'; // Handle non-JSON response
        }
        
        const logData = { ...req.logData, responseTime, responseBody };
        console.log(JSON.stringify(logData)); // Log the combined data as JSON

        // Send the original response
        originalSend.apply(res, arguments);
    };

    next(); // Pass control to the next middleware or route handler
};

app.use(logRequest);
app.use(logResponse);

// Define routes
app.use('/api/v1', authenticationRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1', cartRoutes);

// Export the Express app for Vercel serverless function
module.exports = app;
