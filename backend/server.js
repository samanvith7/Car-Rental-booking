const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// ❌ REMOVE MongoDB
// const connectDB = require('./config/db');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// ✅ PostgreSQL (Supabase)
const pool = require('./db');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// =========================
// ROUTES (TEMPORARY FIX)
// =========================

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Car Rental API is running ✅' });
});

// Cars route (Supabase)
app.get('/cars', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// COMMENT OLD ROUTES (IMPORTANT)
// =========================

// ❌ These still use MongoDB — disable for now
/*
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
*/

// =========================
// ERROR HANDLING
// =========================

app.use(notFound);
app.use(errorHandler);

// =========================
// SERVER START
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});