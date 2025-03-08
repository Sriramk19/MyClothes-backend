const mongoose = require("mongoose");
const clothSchema = new mongoose.Schema({
  fromUserId: {
    type: String,
    required: true,
    ref: "User",
  },
  clothType: {
    type: String,
    //required: true,
  },
  occasion: {
    type: String,
    // required: true,
    enum: {
      values: ["Formal", "Semi-formal", "Casual", "Activewear", "Party"],
      message: "Invalid occasion type: {VALUE}",
    },
  },
  brand: {
    type: String,
  },

  tag: {
    type: String,
  },
  imageUrl: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Cloth = mongoose.model("Cloth", clothSchema);
module.exports = Cloth;
