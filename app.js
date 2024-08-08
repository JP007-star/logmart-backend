// app.js
const express = require('express');
const bodyParser = require('body-parser');
const authenticationRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin/auth');

const authenticationMiddleware = require('./src/middleware/index');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const path= require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }
 
app.use(cors(corsOptions))
app.use(bodyParser.json());
// Middleware function to log request details
const logRequest = (req, res, next) => {
    req.startTime = new Date(); // Store start time of the request
    req.logData = { 
        timestamp: req.startTime.toISOString(),
        method: req.method,
        url: req.url,
        headers: req.headers,
        params: req.params,
        query: req.query,
        requestBody: req.body 
    };
    next(); // Pass control to the next middleware or route handler
};

// Middleware function to log response details
const logResponse = (req, res, next) => {
    const originalSend = res.send;

    res.send = function(data) {
        const responseTime = new Date() - req.startTime; // Calculate response time
        const responseBody = JSON.parse(data);
        const logData = { ...req.logData, responseTime, responseBody };
        console.log(JSON.stringify(logData)); // Log the combined data as JSON
        originalSend.apply(res, arguments);
    };

    next(); // Pass control to the next middleware or route handler
};

// Apply the middleware globally to log all requests and responses
app.use(express.json()); // This middleware must come before logRequest and logResponse to parse request bodies
app.use(logRequest);
app.use(logResponse);
app.use("/public", express.static(path.join(__dirname, "src/uploads")));


app.use('/api/v1', authenticationRoutes);
app.use('/api/v1', adminRoutes);


module.exports = app;
