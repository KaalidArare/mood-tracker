// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- MIDDLEWARE ----
app.use(cors());            // allow requests from your React dev server
app.use(express.json());    // parse JSON bodies

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ---- TEST ROUTES ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ connected: true, result: rows[0].result });
  } catch (error) {
    console.error('DB test error:', error);
    res.status(500).json({ connected: false, error: error.message });
  }
});

// ---- MOOD ROUTES ----

// GET all moods
app.get('/api/moods', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM moods ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching moods:', err);
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

// POST new mood
app.post('/api/moods', async (req, res) => {
  const { mood, note } = req.body;
  console.log('Incoming POST /api/moods', req.body); // log for debugging

  if (!mood) {
    return res.status(400).json({ error: 'Mood is required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO moods (mood, note) VALUES (?, ?)',
      [mood, note || null]
    );

    const [rows] = await pool.query('SELECT * FROM moods WHERE id = ?', [
      result.insertId,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error inserting mood:', err);
    res.status(500).json({ error: 'Failed to save mood' });
  }
});

// ---- START SERVER ----
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
