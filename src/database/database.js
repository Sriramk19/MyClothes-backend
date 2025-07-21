// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect(process.env.MONGODB_URI);
};

module.exports = connectDB;
