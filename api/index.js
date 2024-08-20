const express = require('express');
const app = require('../app'); // Use the existing Express app
const databaseConfig = require('../src/config/databaseConfig'); // Ensure your database is connected

// Export the express app as a Vercel serverless function
module.exports = app;
