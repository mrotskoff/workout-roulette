import * as SQLite from "expo-sqlite";

let db = null;
let initialized = false;

const getDb = async () => {
  if (!db) {
    try {
      console.log("[DEBUG] Opening database...");
      db = await SQLite.openDatabaseAsync("workout_roulette.db");
      console.log("[DEBUG] Database opened successfully:", !!db);
    } catch (error) {
      console.error("[DEBUG] Failed to open database:", error);
      throw error;
    }
  }
  return db;
};

export const initDatabase = async () => {
  console.log("[DEBUG] initDatabase called, initialized:", initialized);
  if (initialized) {
    console.log("[DEBUG] Database already initialized, returning");
    return;
  }

  try {
    console.log("[DEBUG] Getting database instance...");
    const database = await getDb();
    console.log("[DEBUG] Database instance obtained:", !!database);

    // Create exercises table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        equipment TEXT DEFAULT 'none',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample exercises if database is empty
    const result = await database.getFirstAsync(
      "SELECT COUNT(*) as count FROM exercises"
    );
    console.log(
      "[DEBUG] Exercise count result:",
      result,
      "type:",
      typeof result
    );
    // Handle different result structures - expo-sqlite returns {count: number} for COUNT queries
    const count =
      result?.count ??
      (result && typeof result === "object" ? Object.values(result)[0] : 0) ??
      0;
    console.log("[DEBUG] Extracted count:", count);
    if (count === 0) {
      await insertSampleExercises(database);
    }

    initialized = true;
    console.log(
      "[DEBUG] Database initialization complete, initialized flag set to true"
    );
  } catch (error) {
    console.error("[DEBUG] Database initialization error:", error);
    console.error("[DEBUG] Error message:", error.message);
    console.error("[DEBUG] Error stack:", error.stack);
    initialized = false; // Reset flag on error so we can retry
    console.error("Database initialization error:", error);
    throw error;
  }
};

const insertSampleExercises = async (database) => {
  const sampleExercises = [
    // Cardio
    {
      name: "Jumping Jacks",
      category: "cardio",
      description: "Full body jumping exercise",
      equipment: "none",
    },
    {
      name: "High Knees",
      category: "cardio",
      description: "Running in place with high knees",
      equipment: "none",
    },
    {
      name: "Burpees",
      category: "cardio",
      description: "Full body explosive movement",
      equipment: "none",
    },
    {
      name: "Mountain Climbers",
      category: "cardio",
      description: "Core and cardio exercise",
      equipment: "none",
    },

    // Strength
    {
      name: "Push-ups",
      category: "strength",
      description: "Upper body strength exercise",
      equipment: "none",
    },
    {
      name: "Squats",
      category: "strength",
      description: "Lower body strength exercise",
      equipment: "none",
    },
    {
      name: "Lunges",
      category: "strength",
      description: "Leg strength and balance",
      equipment: "none",
    },
    {
      name: "Plank",
      category: "strength",
      description: "Core strength hold",
      equipment: "none",
    },
    {
      name: "Dumbbell Curls",
      category: "strength",
      description: "Bicep curls with weights",
      equipment: "dumbbells",
    },
    {
      name: "Dumbbell Press",
      category: "strength",
      description: "Chest press with weights",
      equipment: "dumbbells",
    },
    {
      name: "Kettlebell Swings",
      category: "strength",
      description: "Hip hinge movement with kettlebell",
      equipment: "kettlebells",
    },
    {
      name: "Kettlebell Goblet Squats",
      category: "strength",
      description: "Squats holding a kettlebell",
      equipment: "kettlebells",
    },
    {
      name: "Band Rows",
      category: "strength",
      description: "Back exercise with resistance band",
      equipment: "resistance-bands",
    },
    {
      name: "Band Chest Press",
      category: "strength",
      description: "Chest exercise with resistance band",
      equipment: "resistance-bands",
    },

    // Flexibility
    {
      name: "Stretching",
      category: "flexibility",
      description: "General stretching",
      equipment: "none",
    },
    {
      name: "Yoga Flow",
      category: "flexibility",
      description: "Gentle yoga sequence",
      equipment: "none",
    },

    // Core
    {
      name: "Crunches",
      category: "core",
      description: "Abdominal crunches",
      equipment: "none",
    },
    {
      name: "Leg Raises",
      category: "core",
      description: "Lower ab exercise",
      equipment: "none",
    },
    {
      name: "Russian Twists",
      category: "core",
      description: "Rotational core exercise",
      equipment: "none",
    },
    {
      name: "Bicycle Crunches",
      category: "core",
      description: "Alternating knee-to-elbow crunches",
      equipment: "none",
    },
    {
      name: "Side Plank",
      category: "core",
      description: "Lateral core strength hold",
      equipment: "none",
    },
    {
      name: "Dead Bug",
      category: "core",
      description: "Core stability exercise on back",
      equipment: "none",
    },
    {
      name: "Hollow Body Hold",
      category: "core",
      description: "Full body core isometric hold",
      equipment: "none",
    },
    {
      name: "Kettlebell Turkish Get-Up",
      category: "core",
      description: "Full body movement with kettlebell",
      equipment: "kettlebells",
    },

    // Balance
    {
      name: "Single Leg Stand",
      category: "balance",
      description: "Balance on one leg",
      equipment: "none",
    },
    {
      name: "Tree Pose",
      category: "balance",
      description: "Yoga balance pose",
      equipment: "none",
    },
    {
      name: "Single Leg Deadlift",
      category: "balance",
      description: "Balance and hamstring exercise",
      equipment: "none",
    },
    {
      name: "Dumbbell Single Leg Deadlift",
      category: "balance",
      description: "Single leg deadlift with weight",
      equipment: "dumbbells",
    },
    {
      name: "Kettlebell Single Leg Deadlift",
      category: "balance",
      description: "Single leg deadlift with kettlebell",
      equipment: "kettlebells",
    },
    {
      name: "Warrior III",
      category: "balance",
      description: "Yoga balance pose",
      equipment: "none",
    },

    // More Cardio
    {
      name: "Jump Squats",
      category: "cardio",
      description: "Explosive squat jumps",
      equipment: "none",
    },
    {
      name: "Butt Kicks",
      category: "cardio",
      description: "Running in place kicking heels to glutes",
      equipment: "none",
    },
    {
      name: "Star Jumps",
      category: "cardio",
      description: "Jumping jacks with arms and legs spread wide",
      equipment: "none",
    },
    {
      name: "Sprint in Place",
      category: "cardio",
      description: "Fast running in place",
      equipment: "none",
    },
    {
      name: "Dumbbell Thrusters",
      category: "cardio",
      description: "Squat to overhead press with dumbbells",
      equipment: "dumbbells",
    },
    {
      name: "Kettlebell Snatches",
      category: "cardio",
      description: "Explosive overhead movement",
      equipment: "kettlebells",
    },
    {
      name: "Band Jumping Jacks",
      category: "cardio",
      description: "Jumping jacks with resistance band overhead",
      equipment: "resistance-bands",
    },

    // More Strength
    {
      name: "Dips",
      category: "strength",
      description: "Tricep dips using body weight",
      equipment: "none",
    },
    {
      name: "Wall Sit",
      category: "strength",
      description: "Isometric squat against wall",
      equipment: "none",
    },
    {
      name: "Glute Bridges",
      category: "strength",
      description: "Hip thrust exercise",
      equipment: "none",
    },
    {
      name: "Calf Raises",
      category: "strength",
      description: "Rising onto toes",
      equipment: "none",
    },
    {
      name: "Dumbbell Rows",
      category: "strength",
      description: "Bent-over row with dumbbells",
      equipment: "dumbbells",
    },
    {
      name: "Dumbbell Shoulder Press",
      category: "strength",
      description: "Overhead press with dumbbells",
      equipment: "dumbbells",
    },
    {
      name: "Dumbbell Lunges",
      category: "strength",
      description: "Lunges holding dumbbells",
      equipment: "dumbbells",
    },
    {
      name: "Dumbbell Squats",
      category: "strength",
      description: "Squats holding dumbbells",
      equipment: "dumbbells",
    },
    {
      name: "Dumbbell Tricep Extensions",
      category: "strength",
      description: "Overhead tricep extension",
      equipment: "dumbbells",
    },
    {
      name: "Kettlebell Rows",
      category: "strength",
      description: "Bent-over row with kettlebell",
      equipment: "kettlebells",
    },
    {
      name: "Kettlebell Press",
      category: "strength",
      description: "Overhead press with kettlebell",
      equipment: "kettlebells",
    },
    {
      name: "Kettlebell Lunges",
      category: "strength",
      description: "Lunges holding kettlebell",
      equipment: "kettlebells",
    },
    {
      name: "Kettlebell Deadlift",
      category: "strength",
      description: "Hip hinge movement with kettlebell",
      equipment: "kettlebells",
    },
    {
      name: "Band Pull-Aparts",
      category: "strength",
      description: "Shoulder and upper back exercise",
      equipment: "resistance-bands",
    },
    {
      name: "Band Bicep Curls",
      category: "strength",
      description: "Bicep curls with resistance band",
      equipment: "resistance-bands",
    },
    {
      name: "Band Tricep Extensions",
      category: "strength",
      description: "Tricep extension with resistance band",
      equipment: "resistance-bands",
    },
    {
      name: "Band Squats",
      category: "strength",
      description: "Squats with resistance band",
      equipment: "resistance-bands",
    },
    {
      name: "Band Lateral Raises",
      category: "strength",
      description: "Shoulder lateral raises with band",
      equipment: "resistance-bands",
    },

    // More Flexibility
    {
      name: "Forward Fold",
      category: "flexibility",
      description: "Standing forward bend stretch",
      equipment: "none",
    },
    {
      name: "Hip Circles",
      category: "flexibility",
      description: "Circular hip mobility movement",
      equipment: "none",
    },
    {
      name: "Arm Circles",
      category: "flexibility",
      description: "Circular arm movement for shoulder mobility",
      equipment: "none",
    },
    {
      name: "Quad Stretch",
      category: "flexibility",
      description: "Standing quadricep stretch",
      equipment: "none",
    },
    {
      name: "Hamstring Stretch",
      category: "flexibility",
      description: "Seated or standing hamstring stretch",
      equipment: "none",
    },
    {
      name: "Shoulder Stretch",
      category: "flexibility",
      description: "Cross-body shoulder stretch",
      equipment: "none",
    },
    {
      name: "Cat-Cow Stretch",
      category: "flexibility",
      description: "Spinal mobility movement",
      equipment: "none",
    },
    {
      name: "Child's Pose",
      category: "flexibility",
      description: "Restorative yoga pose",
      equipment: "none",
    },
    {
      name: "Band Assisted Stretches",
      category: "flexibility",
      description: "Stretching with resistance band assistance",
      equipment: "resistance-bands",
    },

    // General
    {
      name: "Jump Rope",
      category: "general",
      description: "Simulated jump rope movement",
      equipment: "none",
    },
    {
      name: "Bear Crawl",
      category: "general",
      description: "Quadrupedal movement exercise",
      equipment: "none",
    },
    {
      name: "Crab Walk",
      category: "general",
      description: "Reverse tabletop movement",
      equipment: "none",
    },
    {
      name: "Donkey Kicks",
      category: "general",
      description: "Kneeling leg kick exercise",
      equipment: "none",
    },
    {
      name: "Fire Hydrants",
      category: "general",
      description: "Quadruped hip abduction exercise",
      equipment: "none",
    },
    {
      name: "Dumbbell Complex",
      category: "general",
      description: "Multi-movement sequence with dumbbells",
      equipment: "dumbbells",
    },
    {
      name: "Kettlebell Complex",
      category: "general",
      description: "Multi-movement sequence with kettlebell",
      equipment: "kettlebells",
    },
  ];

  const stmt = await database.prepareAsync(`
    INSERT INTO exercises (name, category, description, equipment)
    VALUES (?, ?, ?, ?)
  `);

  for (const exercise of sampleExercises) {
    await stmt.executeAsync([
      exercise.name,
      exercise.category,
      exercise.description,
      exercise.equipment,
    ]);
  }

  await stmt.finalizeAsync();
};

// Ensure database is initialized before operations
const ensureInitialized = async () => {
  if (!initialized) {
    console.log("[DEBUG] Database not initialized, calling initDatabase...");
    try {
      await initDatabase();
      console.log(
        "[DEBUG] Database initialization completed in ensureInitialized"
      );
    } catch (error) {
      console.error(
        "[DEBUG] Database initialization failed in ensureInitialized:",
        error
      );
      throw error;
    }
  }
};

// Exercise CRUD operations
export const getExercises = async (filters = {}) => {
  console.log(
    "[DEBUG] getExercises called with filters:",
    filters,
    "initialized:",
    initialized
  );
  try {
    console.log("[DEBUG] Ensuring database initialized...");
    await ensureInitialized();
    console.log("[DEBUG] Getting database instance for getExercises...");
    const database = await getDb();
    console.log(
      "[DEBUG] Database instance obtained for getExercises:",
      !!database
    );
    let query = "SELECT * FROM exercises WHERE 1=1";
    const params = [];

    if (filters.category) {
      query += " AND category = ?";
      params.push(filters.category);
    }

    if (filters.equipment) {
      if (filters.equipment === "none") {
        query += " AND equipment = ?";
        params.push("none");
      } else {
        query += " AND (equipment = ? OR equipment = ?)";
        params.push(filters.equipment, "none");
      }
    }

    query += " ORDER BY name";

    console.log("[DEBUG] Executing query:", query, "with params:", params);
    const result = await database.getAllAsync(query, params);
    console.log("[DEBUG] getExercises result count:", result?.length);
    return result;
  } catch (error) {
    console.error("[DEBUG] getExercises error:", error);
    console.error("Error in getExercises:", error);
    throw error;
  }
};

export const getExerciseById = async (id) => {
  await ensureInitialized();
  const database = await getDb();
  const result = await database.getFirstAsync(
    "SELECT * FROM exercises WHERE id = ?",
    [id]
  );
  return result;
};

export const createExercise = async (exercise) => {
  await ensureInitialized();
  const database = await getDb();
  const result = await database.runAsync(
    `INSERT INTO exercises (name, category, description, equipment)
     VALUES (?, ?, ?, ?)`,
    [
      exercise.name,
      exercise.category || "general",
      exercise.description || "",
      exercise.equipment || "none",
    ]
  );
  return { id: result.lastInsertRowId, ...exercise };
};

export const updateExercise = async (id, exercise) => {
  await ensureInitialized();
  const database = await getDb();
  await database.runAsync(
    `UPDATE exercises 
     SET name = ?, category = ?, description = ?, 
         equipment = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      exercise.name,
      exercise.category,
      exercise.description,
      exercise.equipment,
      id,
    ]
  );
  return { id, ...exercise };
};

export const deleteExercise = async (id) => {
  await ensureInitialized();
  const database = await getDb();
  await database.runAsync("DELETE FROM exercises WHERE id = ?", [id]);
};

// Reset database - deletes all exercises and re-inserts sample exercises
export const resetDatabase = async () => {
  await ensureInitialized();
  const database = await getDb();

  try {
    // Delete all exercises
    await database.execAsync("DELETE FROM exercises");

    // Re-insert sample exercises
    await insertSampleExercises(database);

    console.log(
      "[DEBUG] Database reset complete - sample exercises re-inserted"
    );
    return true;
  } catch (error) {
    console.error("[DEBUG] Error resetting database:", error);
    throw error;
  }
};

// Get all unique equipment options from exercises
export const getEquipmentOptions = async () => {
  await ensureInitialized();
  const database = await getDb();
  const result = await database.getAllAsync(
    "SELECT DISTINCT equipment FROM exercises ORDER BY equipment"
  );
  // Extract equipment values and ensure 'none' is first
  const equipmentList = result.map((row) => row.equipment);
  // Ensure 'none' is always included and first
  const uniqueEquipment = [...new Set(equipmentList)];
  if (uniqueEquipment.includes("none")) {
    return ["none", ...uniqueEquipment.filter((e) => e !== "none")];
  }
  return ["none", ...uniqueEquipment];
};
