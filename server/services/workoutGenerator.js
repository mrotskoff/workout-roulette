const db = require('../database');

const generateWorkout = async (totalTimeSeconds, intensity, equipment, categories = null) => {
  return new Promise((resolve, reject) => {
    // Build query to get eligible exercises
    let query = 'SELECT * FROM exercises WHERE intensity = ?';
    const params = [intensity];

    // Filter by equipment
    // Support both single string and array of equipment
    const equipmentList = Array.isArray(equipment) ? equipment : [equipment];
    
    if (equipmentList.length === 1 && equipmentList[0] === 'none') {
      // Only no-equipment exercises
      query += ' AND equipment = ?';
      params.push('none');
    } else {
      // Filter out 'none' from the list if other equipment is selected
      const equipmentFilter = equipmentList.filter(e => e !== 'none');
      
      if (equipmentFilter.length === 0) {
        // Fallback to none if array is empty
        query += ' AND equipment = ?';
        params.push('none');
      } else {
        // Show exercises that match any selected equipment OR require no equipment
        const placeholders = equipmentFilter.map(() => '?').join(',');
        query += ` AND (equipment IN (${placeholders}) OR equipment = ?)`;
        params.push(...equipmentFilter, 'none');
      }
    }

    // Filter by categories if specified
    if (categories && categories.length > 0) {
      const placeholders = categories.map(() => '?').join(',');
      query += ` AND category IN (${placeholders})`;
      params.push(...categories);
    }

    db.getDb().all(query, params, (err, exercises) => {
      if (err) {
        reject(err);
        return;
      }

      if (exercises.length === 0) {
        reject(new Error('No exercises found matching the criteria'));
        return;
      }

      // Shuffle exercises array
      const shuffled = [...exercises].sort(() => Math.random() - 0.5);

      // Build workout by selecting exercises until we reach the target time
      const selectedExercises = [];
      let currentTime = 0;
      let attempts = 0;
      const maxAttempts = 1000;

      while (currentTime < totalTimeSeconds && attempts < maxAttempts) {
        attempts++;
        
        // Try to find an exercise that fits
        const remainingTime = totalTimeSeconds - currentTime;
        const suitableExercises = shuffled.filter(ex => ex.duration_seconds <= remainingTime);

        if (suitableExercises.length === 0) {
          // If no exercise fits exactly, use the shortest one available
          if (shuffled.length > 0) {
            const shortest = shuffled.reduce((min, ex) => 
              ex.duration_seconds < min.duration_seconds ? ex : min
            );
            selectedExercises.push({ ...shortest, order: selectedExercises.length + 1 });
            currentTime += shortest.duration_seconds;
          }
          break;
        }

        // Randomly select from suitable exercises
        const randomIndex = Math.floor(Math.random() * suitableExercises.length);
        const selected = suitableExercises[randomIndex];
        
        selectedExercises.push({ ...selected, order: selectedExercises.length + 1 });
        currentTime += selected.duration_seconds;

        // Reshuffle to avoid repetition
        if (Math.random() < 0.3) {
          shuffled.sort(() => Math.random() - 0.5);
        }
      }

      // Calculate total calories
      const totalCalories = selectedExercises.reduce((sum, ex) => {
        const minutes = ex.duration_seconds / 60;
        return sum + (ex.calories_per_minute * minutes);
      }, 0);

      const workout = {
        exercises: selectedExercises,
        totalTimeSeconds: currentTime,
        totalTimeMinutes: Math.round(currentTime / 60),
        intensity,
        equipment,
        totalCalories: Math.round(totalCalories),
        exerciseCount: selectedExercises.length,
        generatedAt: new Date().toISOString()
      };

      resolve(workout);
    });
  });
};

module.exports = {
  generateWorkout
};

