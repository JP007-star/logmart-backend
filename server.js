// server.js
const app = require('./app');
const PORT = process.env.PORT;


// Connect to the database
require('./src/config/databaseConfig');

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
