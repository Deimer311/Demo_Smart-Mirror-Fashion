const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-mirror';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const Outfit = require('./models/Outfit');

// Routes
app.get('/api/outfits', async (req, res) => {
  try {
    const outfits = await Outfit.find().sort({ createdAt: -1 });
    res.json(outfits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/outfits', async (req, res) => {
  const outfit = new Outfit({
    name: req.body.name,
    items: req.body.items
  });

  try {
    const newOutfit = await outfit.save();
    res.status(201).json(newOutfit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Recommendation Algorithm (Simple Simulation)
app.get('/api/recommendations', (req, res) => {
  const trends = [
    { id: 'r1', name: 'Summer Vibes', items: ['Ocean Shirt', 'White Linen Pants'] },
    { id: 'r2', name: 'Street Noir', items: ['Urban Jacket', 'Black Denim'] }
  ];
  res.json(trends);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
