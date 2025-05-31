require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 4000;

// Allow CORS from your frontend (adjust origin as needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

/**
 * GET /api/reviews
 * Fetches reviews from Google Places Details endpoint (up to 5 reviews).
 */
app.get('/api/reviews', async (req, res) => {
  try {
    const placeId = process.env.PLACE_ID;
    const apiKey  = process.env.GOOGLE_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;
    const { data } = await axios.get(url);

    if (data.status !== 'OK') {
      return res.status(500).json({ error: 'Failed to fetch reviews', details: data.status });
    }

    // Each review object has properties like author_name, rating, text, time, profile_photo_url, etc.
    const reviews = data.result.reviews || [];

    // For consistency, map to a clean shape (rating, author, text, time, photo)
    const simplified = reviews.map(r => ({
      author    : r.author_name,
      rating    : r.rating,
      text      : r.text,
      time      : new Date(r.time * 1000).toISOString(), // optional formatting
      photoUrl  : r.profile_photo_url || null
    }));

    return res.json(simplified);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving reviews' });
  }
});

app.listen(PORT, () => {
  console.log(`👉 Server listening on http://localhost:${PORT}`);
});
