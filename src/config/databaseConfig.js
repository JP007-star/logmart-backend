// databaseConfig.js
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://justice_of_peace:Prasad123@cluster0.nj4bnqt.mongodb.net/smile', {
})
  .then(() => console.log('Connected to the database'))
  .catch(error => console.error('Database connection error:', error));