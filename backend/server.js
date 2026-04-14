const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

dotenv.config();

const app = express();

app.use(express.json());

// ✅ CORS (VERY IMPORTANT)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://car-rental-booking-seven.vercel.app",
    ],
    credentials: true,
  })
);

// =====================
// ROOT
// =====================
app.get("/", (req, res) => {
  res.send("API Running ✅");
});

// =====================
// CARS
// =====================
app.get("/cars", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cars");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// AUTH
// =====================

// REGISTER
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Incoming data:", name, email);

    const existing = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existing.rows.length > 0) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, hashed]
    );

    console.log("User created:", result.rows[0]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("REGISTER ERROR:", err); // 👈 THIS IS IMPORTANT
    res.status(500).json({ error: err.message });
  }
});
// LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN:", email, password);

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    console.log("DB password:", user.password);

    const valid = await bcrypt.compare(password, user.password);

    console.log("Password match:", valid);

    if (!valid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, "secret");

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
// =====================
// BOOKINGS
// =====================
app.post("/bookings", async (req, res) => {
  try {
    const { user_id, car_id, start_date, end_date } = req.body;

    const result = await pool.query(
      "INSERT INTO bookings (user_id, car_id, start_date, end_date) VALUES ($1,$2,$3,$4) RETURNING *",
      [user_id, car_id, start_date, end_date]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});