const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'workout_roulette.db');

let db = null;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Exercises table
      db.run(`
        CREATE TABLE IF NOT EXISTS exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          duration_seconds INTEGER DEFAULT 30,
          intensity TEXT DEFAULT 'medium',
          equipment TEXT DEFAULT 'none',
          calories_per_minute INTEGER DEFAULT 5,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating exercises table:', err);
          reject(err);
          return;
        }
      });

      // Workouts table (for saving workout history)
      db.run(`
        CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          total_time_seconds INTEGER NOT NULL,
          intensity TEXT NOT NULL,
          equipment TEXT NOT NULL,
          exercises TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating workouts table:', err);
          reject(err);
          return;
        }
        
        // Insert sample exercises if database is empty
        insertSampleExercises().then(resolve).catch(reject);
      });
    });
  });
};

const insertSampleExercises = () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM exercises', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row.count > 0) {
        resolve();
        return;
      }

      const sampleExercises = [
        // Cardio
        { name: 'Jumping Jacks', category: 'cardio', description: 'Full body jumping exercise', duration_seconds: 30, intensity: 'high', equipment: 'none', calories_per_minute: 10 },
        { name: 'High Knees', category: 'cardio', description: 'Running in place with high knees', duration_seconds: 30, intensity: 'high', equipment: 'none', calories_per_minute: 12 },
        { name: 'Burpees', category: 'cardio', description: 'Full body explosive movement', duration_seconds: 30, intensity: 'high', equipment: 'none', calories_per_minute: 15 },
        { name: 'Mountain Climbers', category: 'cardio', description: 'Core and cardio exercise', duration_seconds: 30, intensity: 'medium', equipment: 'none', calories_per_minute: 10 },
        
        // Strength
        { name: 'Push-ups', category: 'strength', description: 'Upper body strength exercise', duration_seconds: 30, intensity: 'medium', equipment: 'none', calories_per_minute: 8 },
        { name: 'Squats', category: 'strength', description: 'Lower body strength exercise', duration_seconds: 30, intensity: 'medium', equipment: 'none', calories_per_minute: 7 },
        { name: 'Lunges', category: 'strength', description: 'Leg strength and balance', duration_seconds: 30, intensity: 'medium', equipment: 'none', calories_per_minute: 6 },
        { name: 'Plank', category: 'strength', description: 'Core strength hold', duration_seconds: 45, intensity: 'medium', equipment: 'none', calories_per_minute: 5 },
        { name: 'Dumbbell Curls', category: 'strength', description: 'Bicep curls with weights', duration_seconds: 30, intensity: 'medium', equipment: 'dumbbells', calories_per_minute: 6 },
        { name: 'Dumbbell Press', category: 'strength', description: 'Chest press with weights', duration_seconds: 30, intensity: 'medium', equipment: 'dumbbells', calories_per_minute: 7 },
        
        // Flexibility
        { name: 'Stretching', category: 'flexibility', description: 'General stretching', duration_seconds: 60, intensity: 'low', equipment: 'none', calories_per_minute: 2 },
        { name: 'Yoga Flow', category: 'flexibility', description: 'Gentle yoga sequence', duration_seconds: 60, intensity: 'low', equipment: 'none', calories_per_minute: 3 },
        
        // Core
        { name: 'Crunches', category: 'core', description: 'Abdominal crunches', duration_seconds: 30, intensity: 'medium', equipment: 'none', calories_per_minute: 5 },
        { name: 'Leg Raises', category: 'core', description: 'Lower ab exercise', duration_seconds: 30, intensity: 'medium', equipment: 'none', calories_per_minute: 5 },
        { name: 'Russian Twists', category: 'core', description: 'Rotational core exercise', duration_seconds: 30, intensity: 'medium', equipment: 'none', calories_per_minute: 6 },
      ];

      const stmt = db.prepare(`
        INSERT INTO exercises (name, category, description, duration_seconds, intensity, equipment, calories_per_minute)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      sampleExercises.forEach(exercise => {
        stmt.run(
          exercise.name,
          exercise.category,
          exercise.description,
          exercise.duration_seconds,
          exercise.intensity,
          exercise.equipment,
          exercise.calories_per_minute
        );
      });

      stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Sample exercises inserted');
          resolve();
        }
      });
    });
  });
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call init() first.');
  }
  return db;
};

const close = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  init,
  getDb,
  close
};

