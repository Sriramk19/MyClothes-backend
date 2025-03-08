const mongoose = require("mongoose");
const clothCollectionSchema = new mongoose.Schema({
  fromUserId: {
    //owner of the collection
    type: String,
    required: true,
    ref: "User",
  },
  fromclothId: [
    {
      //clothes related to the collection
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Cloth",
    },
  ],
  collectionName: {
    type: String,
    required: true,
  },
  collectionDescription: {
    type: String,
  },
  collectionOccasion: {
    type: String,
    required: true,
  },
  favourite: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ClothCollection = mongoose.model(
  "ClothCollection",
  clothCollectionSchema
);
module.exports = ClothCollection;
