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

// AI Virtual Try-On endpoint using Replicate API (IDM-VTON)
app.post('/api/tryon', async (req, res) => {
  const { personImage, garmentImage, garmentType } = req.body;

  if (!process.env.REPLICATE_API_TOKEN) {
    console.warn('REPLICATE_API_TOKEN is not defined. Falling back to local client processing.');
    return res.json({
      success: false,
      message: 'Replicate API token missing. Using high-fidelity client-side local canvas fallback.'
    });
  }

  try {
    // 1. Call Replicate predictions API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Model: yisol/idm-vton (prediction version)
        version: "c87181b27dbfb4e68e404b9015cb87799b7f5ff9f6dd819c968f76e330be8610",
        input: {
          crop: true,
          seed: 42,
          steps: 30,
          category: garmentType === 'full' ? 'dresses' : 'upper_body',
          garm_img: garmentImage,
          human_img: personImage,
          garment_des: garmentType === 'full' ? 'a beautiful dress' : 'a casual top'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate API failed: ${errorText}`);
    }

    let prediction = await response.json();
    const predictionId = prediction.id;
    let status = prediction.status;
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds timeout

    // 2. Poll Replicate prediction result status
    while (status !== 'succeeded' && status !== 'failed' && status !== 'canceled' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
        }
      });

      if (pollRes.ok) {
        prediction = await pollRes.json();
        status = prediction.status;
      }
    }

    if (status === 'succeeded' && prediction.output) {
      const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      return res.json({ success: true, imageUrl: outputUrl });
    }

    throw new Error(`Try-on prediction timed out or finished with status: ${status}`);

  } catch (err) {
    console.error('Error executing Replicate VTON prediction:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error executing AI Try-On prediction'
    });
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
