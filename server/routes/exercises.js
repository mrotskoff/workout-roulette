const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all exercises
router.get('/', (req, res) => {
  const { category, intensity, equipment } = req.query;
  let query = 'SELECT * FROM exercises WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (intensity) {
    query += ' AND intensity = ?';
    params.push(intensity);
  }

  if (equipment) {
    if (equipment === 'none') {
      query += ' AND equipment = ?';
      params.push('none');
    } else {
      query += ' AND (equipment = ? OR equipment = ?)';
      params.push(equipment, 'none');
    }
  }

  query += ' ORDER BY name';

  db.getDb().all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching exercises:', err);
      res.status(500).json({ error: 'Failed to fetch exercises' });
      return;
    }
    res.json(rows);
  });
});

// Get exercise by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getDb().get('SELECT * FROM exercises WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching exercise:', err);
      res.status(500).json({ error: 'Failed to fetch exercise' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }
    res.json(row);
  });
});

// Create new exercise
router.post('/', (req, res) => {
  const { name, category, description, duration_seconds, intensity, equipment, calories_per_minute } = req.body;

  if (!name || !category) {
    res.status(400).json({ error: 'Name and category are required' });
    return;
  }

  db.getDb().run(
    `INSERT INTO exercises (name, category, description, duration_seconds, intensity, equipment, calories_per_minute)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      category || 'general',
      description || '',
      duration_seconds || 30,
      intensity || 'medium',
      equipment || 'none',
      calories_per_minute || 5
    ],
    function(err) {
      if (err) {
        console.error('Error creating exercise:', err);
        res.status(500).json({ error: 'Failed to create exercise' });
        return;
      }
      res.status(201).json({ id: this.lastID, ...req.body });
    }
  );
});

// Update exercise
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, description, duration_seconds, intensity, equipment, calories_per_minute } = req.body;

  db.getDb().run(
    `UPDATE exercises 
     SET name = ?, category = ?, description = ?, duration_seconds = ?, 
         intensity = ?, equipment = ?, calories_per_minute = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      name,
      category,
      description,
      duration_seconds,
      intensity,
      equipment,
      calories_per_minute,
      id
    ],
    function(err) {
      if (err) {
        console.error('Error updating exercise:', err);
        res.status(500).json({ error: 'Failed to update exercise' });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Exercise not found' });
        return;
      }
      res.json({ id, ...req.body });
    }
  );
});

// Delete exercise
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.getDb().run('DELETE FROM exercises WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting exercise:', err);
      res.status(500).json({ error: 'Failed to delete exercise' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }
    res.json({ message: 'Exercise deleted successfully' });
  });
});

// Get categories
router.get('/meta/categories', (req, res) => {
  db.getDb().all(
    'SELECT DISTINCT category FROM exercises ORDER BY category',
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
        return;
      }
      res.json(rows.map(row => row.category));
    }
  );
});

module.exports = router;

