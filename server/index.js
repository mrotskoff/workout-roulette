const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const exerciseRoutes = require('./routes/exercises');
const workoutRoutes = require('./routes/workouts');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
db.init();

// Routes
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Workout Roulette API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

