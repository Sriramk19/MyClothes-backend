// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect(
    "mongodb+srv://sriramdk99:6mowBKFMvrCw3sNn@myclothes.a7usf.mongodb.net/MyClothes" // Specify database name
  );
};

module.exports = connectDB;
