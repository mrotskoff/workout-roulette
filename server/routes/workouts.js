const express = require('express');
const router = express.Router();
const db = require('../database');
const workoutGenerator = require('../services/workoutGenerator');

// Generate a new workout
router.post('/generate', (req, res) => {
  const { totalTimeMinutes, intensity, equipment, categories } = req.body;

  if (!totalTimeMinutes || totalTimeMinutes <= 0) {
    res.status(400).json({ error: 'totalTimeMinutes is required and must be greater than 0' });
    return;
  }

  const totalTimeSeconds = totalTimeMinutes * 60;

  // Normalize equipment: support both string and array, default to 'none'
  let normalizedEquipment = equipment || 'none';
  if (Array.isArray(normalizedEquipment) && normalizedEquipment.length === 0) {
    normalizedEquipment = 'none';
  }
  
  workoutGenerator.generateWorkout(
    totalTimeSeconds,
    intensity || 'medium',
    normalizedEquipment,
    categories || null
  )
    .then(workout => {
      res.json(workout);
    })
    .catch(err => {
      console.error('Error generating workout:', err);
      res.status(500).json({ error: 'Failed to generate workout', details: err.message });
    });
});

// Save a workout
router.post('/', (req, res) => {
  const { total_time_seconds, intensity, equipment, exercises } = req.body;

  if (!total_time_seconds || !intensity || !equipment || !exercises) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  db.getDb().run(
    'INSERT INTO workouts (total_time_seconds, intensity, equipment, exercises) VALUES (?, ?, ?, ?)',
    [total_time_seconds, intensity, equipment, JSON.stringify(exercises)],
    function(err) {
      if (err) {
        console.error('Error saving workout:', err);
        res.status(500).json({ error: 'Failed to save workout' });
        return;
      }
      res.status(201).json({ id: this.lastID, message: 'Workout saved successfully' });
    }
  );
});

// Get workout history
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  db.getDb().all(
    'SELECT * FROM workouts ORDER BY created_at DESC LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        console.error('Error fetching workouts:', err);
        res.status(500).json({ error: 'Failed to fetch workouts' });
        return;
      }
      const workouts = rows.map(row => ({
        ...row,
        exercises: JSON.parse(row.exercises)
      }));
      res.json(workouts);
    }
  );
});

// Get workout by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getDb().get('SELECT * FROM workouts WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching workout:', err);
      res.status(500).json({ error: 'Failed to fetch workout' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }
    res.json({
      ...row,
      exercises: JSON.parse(row.exercises)
    });
  });
});

module.exports = router;

