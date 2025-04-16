// intermediateServer.js

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors"); // Import CORS middleware

dotenv.config();

const app = express();
const port = 3000;

// MongoDB connection string parts (edit these with your actual values)
const DB_HOST = process.env.DB_HOST || "mongodb://44.201.181.130:27017";
const DB_NAME = "pepsiVending";
const COLLECTION_NAME = "products";

// Use CORS middleware to allow requests from specific origin
app.use(cors());

app.use(express.json()); // to parse JSON in POST bodies

let db, productsCollection;

// Connect to MongoDB
MongoClient.connect(DB_HOST, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(DB_NAME);
    productsCollection = db.collection(COLLECTION_NAME);
    console.log(`Connected to MongoDB at ${DB_HOST}`);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// GET product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await productsCollection.findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { name: 1, price: 1, quantity: 1 } }
    );

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch product", details: err.message });
  }
});

// POST to update quantity
app.post("/api/products/:id", async (req, res) => {
  const { quantity } = req.body;
  if (typeof quantity !== "number") {
    return res.status(400).json({ error: "Quantity must be a number" });
  }

  try {
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { quantity } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Quantity updated", id: req.params.id, quantity });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update quantity", details: err.message });
  }
});

// Example error handling with logging
app.get("/api/products", async (req, res) => {
  try {
    const products = await productsCollection.find().toArray();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err); // Log error for debugging
    res
      .status(500)
      .json({ error: "Failed to fetch products", details: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
