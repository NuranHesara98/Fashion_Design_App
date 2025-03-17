const mongoose = require('mongoose');
require('dotenv').config();

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  sslValidate: true,
  sslCA: process.env.MONGODB_CA_CERT, // Path to CA certificate
  user: process.env.MONGODB_USER,
  pass: process.env.MONGODB_PASS
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));
