require("dotenv").config(); // Load environment variables
const cors = require("cors");
const express = require("express");
const connectDB = require("./database/database");
const User = require("./model/user");
const Cloth = require("./model/cloth");
const multer = require("multer");
const { clerkClient, EmailAddress } = require("@clerk/express");
const { clerkMiddleware } = require("@clerk/express");
const ClothCollection = require("./model/colthCollection");

const app = express();
const PORT = 7777;
const upload = multer();

connectDB() //To ensure data is stored in the database, the database connection from database.js must be established before starting the server.
  .then(() => {
    console.log("Databse connection establised...");
  })
  .catch((err) => {
    console.log("Database cannot be connected!!!");
  });

// Apply Clerk Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Change this to your frontend's origin
  })
);
// Test route
app.use("/test", (req, res) => {
  res.send("Hello from the server");
});
//Creating new user
app.post("/createUser", async (req, res) => {
  try {
    const { firstName, lastName, email_address, password } = req.body;

    const clerkUser = await clerkClient.users.createUser({
      firstName,
      lastName,
      email_address: [email_address],
      password,
    });

    const clerkUserId = clerkUser.id;

    console.log(clerkUserId);
    // SigningUp new user (Creating a new instance of a usermodel)

    const newUser = new User({
      _id: clerkUserId,
      firstName,
      lastName,
      emailId: email_address,
    });
    await newUser.save();
    res
      .status(200)
      .json({ message: "User created in mongoDb sucessfully", newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error Creating user" });
  }
});
//Login
app.post("/login", async (req, res) => {
  const { email_address, password } = req.body;

  // Query Clerk users using the correct parameter
  const allUsers = await clerkClient.users.getUserList({
    emailAddress: email_address,
  });
  if (allUsers.length === 0) {
    return res.status(404).json({ error: "No Users found with the email" });
  }
  const user = allUsers.data[0]; // getUserList returns it as a list in an array so creaing a vaiable and accessing the first record to access the id from it
  const userId = user.id;
  await clerkClient.users.verifyPassword({
    userId,
    password,
  });
  res.json({ message: "Sucessfully Logged In" });
});

//Uploading Clothes by a User

app.post("/clothes", upload.none(), async (req, res) => {
  // Dont forget to add the middlewarecler for authentication!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const { category, tag, occasion, brand, image } = req.body;
  console.log(req.body);
  try {
    const newClothDetails = Cloth({
      fromUserId: "user_2tgMeUJSpE5wO9OOxYFnHRWdMEb",
      clothType: category,
      tag: tag,
      occasion: occasion,
      imageUrl: image,
      brand: brand,
    });
    await newClothDetails.save();
    res.json({ message: "Cloth added Sucessfully" });
  } catch (err) {
    res.status(401).json({ message: "Something went wrong" + err.message });
  }
});

//Createing a cloth colelction
app.post("/clothCollection", async (req, res) => {
  const {
    fromUserId,
    fromclothId,
    collectionName,
    collectionDescription,
    collectionOccasion,
    favourite,
  } = req.body;
  try {
    const newColthCollection = ClothCollection({
      fromUserId,
      fromclothId,
      collectionName,
      collectionDescription,
      collectionOccasion,
      favourite,
    });
    await newColthCollection.save();
    res.json({ message: "Cloth collection added Sucessfully" });
  } catch (err) {
    res.status(401).json({ message: "Cloth collection Error: " + err.message });
  }
});

//get favourite of the user
app.get("/getClothes", async (req, res) => {
  try {
    const userId = "user_2tgMeUJSpE5wO9OOxYFnHRWdMEb";

    const clothes = await Cloth.find({ fromUserId: userId });
    const clothesList = clothes.map((cloth) => ({
      id: cloth._id,
      clothType: cloth.clothType,
      occasion: cloth.occasion,
      brand: cloth.brand,
      tag: cloth.tag,
      imageUrl: cloth.imageUrl,
      createdAt: cloth.createdAt,
    }));
    res.json(clothesList);
  } catch (err) {
    res.send(err.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server started successfully on http://localhost:${PORT}`);
});
