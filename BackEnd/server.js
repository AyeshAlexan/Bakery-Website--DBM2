const express = require("express");
const mongoose = require("mongoose");
const oracledb = require("oracledb");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("./Models/user");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Oracle DB Config
const oracleConfig = {
  user: "system",
  password: "Oracle21c#@",
  connectString: "localhost:1521/ORCLPDB"
};

// Middleware
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/bakerydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    return res.json({
      success: true,
      message: "Login successful",
      username: user.username
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Registration route
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    return res.json({ success: true, message: "Registration successful" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Serve homepage as the landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/normaluser/homepage.html'));
});

// GET admin login page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/adminuser/adminlogin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

//plsql
// Add a new product
app.post("/add-item", async (req, res) => {
  const { name, price, description, image_url } = req.body;

  try {
    const conn = await oracledb.getConnection(oracleConfig);

    await conn.execute(
      `INSERT INTO items (name, price, description, image_url)
       VALUES (:name, :price, :description, :image_url)`,
      { name, price, description, image_url },
      { autoCommit: true }
    );

    await conn.close();
    res.json({ success: true, message: "Item added successfully" });
  } catch (err) {
    console.error("Oracle INSERT error:", err);
    res.status(500).json({ success: false, message: "Failed to add item" });
  }
});

// Get all products
app.get("/items", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(oracleConfig);
    const result = await conn.execute(`SELECT * FROM items ORDER BY id DESC`);
    await conn.close();

    res.json(result.rows); // [ [id, name, price, desc, url], ... ]
  } catch (err) {
    console.error("Oracle SELECT error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
});

// Delete a product by ID
app.delete("/delete-item/:id", async (req, res) => {
  const itemId = req.params.id;

  try {
    const conn = await oracledb.getConnection(oracleConfig);
    await conn.execute(`DELETE FROM items WHERE id = :id`, [itemId], { autoCommit: true });
    await conn.close();

    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    console.error("Oracle DELETE error:", err);
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
});
