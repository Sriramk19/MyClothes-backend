require("dotenv").config(); // Load environment variables
const cors = require("cors");
const express = require("express");
const connectDB = require("./database/database");
const User = require("./model/user");
const Cloth = require("./model/cloth");
const multer = require("multer");
const { clerkClient, EmailAddress } = require("@clerk/express");
const { clerkMiddleware, requireAuth } = require("@clerk/express");
const ClothCollection = require("./model/colthCollection");
const { ClerkExpressWithAuth } = require("@clerk/express");
const app = express();
const PORT = process.env.PORT || 7777;
const upload = multer();

connectDB() //To ensure data is stored in the database, the database connection from database.js must be established before starting the server.
  .then(() => {
    console.log("Databse connection establised...");
  })
  .catch((err) => {
    console.log("Database cannot be connected!!!");
  });

// Apply Clerk Middleware
app.use(clerkMiddleware());
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "https://clothes-web-a8tq.vercel.app",
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
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

app.post("/clothes", requireAuth(), upload.none(), async (req, res) => {
  // Dont forget to add the middleware for authentication!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const { category, tag, occasion, brand, image } = req.body;
  const userId = req.auth.userId;
  console.log("User Auth Info:", req.auth);
  console.log(req.body);
  try {
    const newClothDetails = Cloth({
      fromUserId: userId,
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
app.post("/clothCollection", requireAuth(), async (req, res) => {
  const {
    fromUserId,
    fromclothId,
    collectionName,
    collectionDescription,
    collectionOccasion,
    favourite,
  } = req.body;
  const userId = req.auth.userId;
  try {
    const newColthCollection = ClothCollection({
      fromUserId: userId,
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
//Deleting a cloth collection
app.delete("/clothCollectionDelete/:id", requireAuth(), async (req, res) => {
  const collectionId = req.params.id;
  const userId = req.auth.userId;

  try {
    const deletedCollection = await ClothCollection.findOneAndDelete({
      _id: collectionId,
      fromUserId: userId, // Ensure user can delete only their collections
    });

    if (!deletedCollection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.json({ message: "Collection deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting collection: " + err.message });
  }
});

//get clothes of a user
app.get("/getClothes", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;

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

app.get("/getCollection", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const collectionData = await ClothCollection.find({
      fromUserId: userId,
    })
      .populate("fromclothId")
      .exec();
    res.json(collectionData);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching collections: " + err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server started successfully on http://localhost:${PORT}`);
});
