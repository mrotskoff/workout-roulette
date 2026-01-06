import { getExercises } from "../database";

// Helper: Remove duplicate exercises by ID
const removeDuplicates = (exercises) => {
  const seenIds = new Set();
  return exercises.filter((ex) => {
    if (seenIds.has(ex.id)) return false;
    seenIds.add(ex.id);
    return true;
  });
};

// Helper: Create exercise object with duration and order
const createExerciseEntry = (exercise, duration, order) => ({
  ...exercise,
  duration_seconds: duration,
  order,
});

// Helper: Get exercise from sequence by index
const getExerciseFromSequence = (selectedExercises, sequenceIndex) => {
  const index = sequenceIndex % selectedExercises.length;
  return { ...selectedExercises[index], id: selectedExercises[index].id };
};

// Helper: Create weighted pool (equipment exercises 5x weight)
const createWeightedPool = (equipmentExercises, noEquipmentExercises) => {
  const pool = [];
  for (let i = 0; i < 5; i++) {
    pool.push(...equipmentExercises);
  }
  pool.push(...noEquipmentExercises);
  return pool;
};

// Helper: Select from weighted pool randomly
const selectFromWeightedPool = (pool) => {
  if (pool.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

// Helper: Add final exercise and break
const addFinalExercise = (
  selected,
  selectedExercises,
  exerciseDuration,
  currentTime
) => {
  const exerciseEntry = createExerciseEntry(
    selected,
    exerciseDuration,
    selectedExercises.length + 1
  );
  selectedExercises.push(exerciseEntry);
  return currentTime + exerciseDuration;
};

// Helper: Try to get exercise from sequence or return null
const tryGetFromSequence = (
  selectedExercises,
  sequenceRepeatIndex,
  remainingTime,
  exerciseDuration,
  restTimeSeconds
) => {
  const timeNeededWithRest =
    exerciseDuration + restTimeSeconds + exerciseDuration;
  const timeNeededJustExercise = exerciseDuration;

  if (timeNeededWithRest <= remainingTime) {
    // Can fit exercise + rest + another exercise
    return {
      exercise: getExerciseFromSequence(selectedExercises, sequenceRepeatIndex),
      isFinal: false,
    };
  } else if (timeNeededJustExercise <= remainingTime) {
    // Can only fit one more exercise (last one)
    return {
      exercise: getExerciseFromSequence(selectedExercises, sequenceRepeatIndex),
      isFinal: true,
    };
  }
  return null;
};

export const generateWorkout = async (
  numCircuits,
  exercisesPerCircuit,
  repetitionsPerCircuit,
  equipment,
  restTimeSeconds = 0,
  categories = null,
  exerciseDurationSeconds = 60
) => {
  console.log("[DEBUG] generateWorkout called:", {
    numCircuits,
    exercisesPerCircuit,
    repetitionsPerCircuit,
    equipment,
    restTimeSeconds,
    categories,
  });
  try {
    // Normalize equipment input
    const equipmentList = Array.isArray(equipment) ? equipment : [equipment];
    const equipmentFilter = equipmentList.filter((e) => e !== "none");
    const hasEquipment = equipmentFilter.length > 0;
    const exerciseDuration = exerciseDurationSeconds || 60;

    // Fetch exercises from database
    let exercises = [];
    if (hasEquipment) {
      // Fetch exercises for each selected equipment type
      const allEquipmentExercises = [];
      for (const eq of equipmentFilter) {
        const eqExercises = await getExercises({ equipment: eq });
        allEquipmentExercises.push(...eqExercises);
      }
      // Also fetch 'none' equipment exercises
      const noneExercises = await getExercises({ equipment: "none" });
      exercises = removeDuplicates([
        ...allEquipmentExercises,
        ...noneExercises,
      ]);
      console.log(
        "[DEBUG] Fetched exercises for equipment types:",
        equipmentFilter,
        "Total exercises:",
        exercises.length
      );
    } else {
      exercises = await getExercises({ equipment: "none" });
      console.log(
        "[DEBUG] getExercises returned",
        exercises?.length,
        "exercises"
      );
    }

    // Don't filter by user categories - we have our own category logic
    // But we need to ensure we have warmup, core, strength, and cardio exercises

    // Separate exercises by category and filter by equipment
    const filterByEquipment = (exerciseList) => {
      // Only include exercises that use selected equipment or no equipment
      if (!hasEquipment) {
        return exerciseList.filter((ex) => ex.equipment === "none");
      }
      return exerciseList.filter(
        (ex) =>
          ex.equipment === "none" || equipmentFilter.includes(ex.equipment)
      );
    };

    const warmupExercises = filterByEquipment(
      exercises.filter((ex) => ex.category === "warmup")
    );
    const coreExercises = filterByEquipment(
      exercises.filter((ex) => ex.category === "core")
    );
    const strengthCardioExercises = filterByEquipment(
      exercises.filter(
        (ex) => ex.category === "strength" || ex.category === "cardio"
      )
    );

    // Check if we have enough exercises
    if (warmupExercises.length < 2) {
      throw new Error(
        "Not enough warmup exercises available. Need at least 2 warmup exercises with no equipment or matching equipment."
      );
    }
    if (coreExercises.length === 0 && strengthCardioExercises.length === 0) {
      throw new Error(
        "No core, strength, or cardio exercises available with no equipment or matching the selected equipment."
      );
    }

    // Helper: Separate by equipment preference within a category
    const separateByEquipmentPreference = (exerciseList) => {
      if (!hasEquipment) {
        return {
          withEquipment: [],
          withoutEquipment: exerciseList,
        };
      }
      return {
        withEquipment: exerciseList.filter((ex) =>
          equipmentFilter.includes(ex.equipment)
        ),
        withoutEquipment: exerciseList.filter(
          (ex) =>
            ex.equipment === "none" || !equipmentFilter.includes(ex.equipment)
        ),
      };
    };

    // Shuffle all category pools
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const warmupPool = separateByEquipmentPreference(warmupExercises);
    const corePool = separateByEquipmentPreference(coreExercises);
    const strengthCardioPool = separateByEquipmentPreference(
      strengthCardioExercises
    );

    const shuffledWarmup = {
      withEquipment: shuffle(warmupPool.withEquipment),
      withoutEquipment: shuffle(warmupPool.withoutEquipment),
    };
    const shuffledCore = {
      withEquipment: shuffle(corePool.withEquipment),
      withoutEquipment: shuffle(corePool.withoutEquipment),
    };
    const shuffledStrengthCardio = {
      withEquipment: shuffle(strengthCardioPool.withEquipment),
      withoutEquipment: shuffle(strengthCardioPool.withoutEquipment),
    };

    // Helper: Select from a pool with equipment preference
    const selectFromPool = (pool, usedIds) => {
      const availableEquipment = pool.withEquipment.filter(
        (ex) => !usedIds.has(ex.id)
      );
      const availableNoEquipment = pool.withoutEquipment.filter(
        (ex) => !usedIds.has(ex.id)
      );
      const allAvailable = [...availableEquipment, ...availableNoEquipment];
      if (allAvailable.length === 0) return null;

      const weightedPool = createWeightedPool(
        availableEquipment,
        availableNoEquipment
      );
      return selectFromWeightedPool(weightedPool);
    };

    // Track used exercise IDs to avoid repeats
    const usedExerciseIds = new Set();
    const selectedExercises = [];
    let currentTime = 0;

    // Step 1: Add 2 warmup exercises first
    for (let i = 0; i < 2; i++) {
      const selected = selectFromPool(shuffledWarmup, usedExerciseIds);
      if (!selected) {
        throw new Error("Not enough unique warmup exercises available");
      }
      const exerciseEntry = createExerciseEntry(
        selected,
        exerciseDuration,
        selectedExercises.length + 1
      );
      selectedExercises.push(exerciseEntry);
      usedExerciseIds.add(selected.id);
      currentTime += exerciseDuration;
      if (i < 1) {
        // Add rest time between warmup exercises
        currentTime += restTimeSeconds;
      }
    }
    // Add rest time after last warmup exercise (before first circuit exercise)
    currentTime += restTimeSeconds;

    // Step 2: Generate circuits
    // For each circuit, generate exercisesPerCircuit exercises
    // Then repeat each circuit repetitionsPerCircuit times
    let postWarmupExerciseCount = 0;

    // Helper: Get all available exercises from a category pool
    const getAllAvailableFromPool = (pool, usedIds) => {
      return [
        ...pool.withEquipment.filter((ex) => !usedIds.has(ex.id)),
        ...pool.withoutEquipment.filter((ex) => !usedIds.has(ex.id)),
      ];
    };

    // Helper: Determine which category to select from based on 25/75 ratio
    const shouldSelectCore = (postWarmupCount) => {
      // Maintain 25% core, 75% strength/cardio
      // After 3 strength/cardio exercises, we should have 1 core exercise
      // So every 4th exercise (1, 5, 9, etc.) should be core
      return postWarmupCount % 4 === 0;
    };

    // Store circuit definitions (exercises for each circuit)
    const circuitDefinitions = [];

    // Step 2a: Generate circuit definitions
    for (let circuitIndex = 0; circuitIndex < numCircuits; circuitIndex++) {
      const circuitExercises = [];

      for (
        let exerciseIndex = 0;
        exerciseIndex < exercisesPerCircuit;
        exerciseIndex++
      ) {
        // Get all available exercises from both pools
        const availableCore = getAllAvailableFromPool(
          shuffledCore,
          usedExerciseIds
        );
        const availableStrengthCardio = getAllAvailableFromPool(
          shuffledStrengthCardio,
          usedExerciseIds
        );
        const allAvailable = [...availableCore, ...availableStrengthCardio];

        // Check if we've used all unique exercises - if so, repeat the sequence
        const allUniqueExercisesUsed =
          allAvailable.length === 0 && circuitExercises.length > 0;

        let selected = null;

        if (allUniqueExercisesUsed) {
          // Repeat sequence from this circuit's exercises
          if (circuitExercises.length > 0) {
            const sequenceIndex = exerciseIndex % circuitExercises.length;
            selected = { ...circuitExercises[sequenceIndex] };
          } else {
            // If this is the first exercise and we've run out, use from previous circuits
            const previousExercises = circuitDefinitions.flat();
            if (previousExercises.length > 0) {
              const sequenceIndex = exerciseIndex % previousExercises.length;
              selected = { ...previousExercises[sequenceIndex] };
            }
          }
        } else if (allAvailable.length === 0) {
          // No exercises available - use from previous circuits or this circuit
          const previousExercises = circuitDefinitions.flat();
          if (previousExercises.length > 0) {
            const sequenceIndex = exerciseIndex % previousExercises.length;
            selected = { ...previousExercises[sequenceIndex] };
          } else if (circuitExercises.length > 0) {
            const sequenceIndex = exerciseIndex % circuitExercises.length;
            selected = { ...circuitExercises[sequenceIndex] };
          }
        } else {
          // Determine which category to select from (25% core, 75% strength/cardio)
          const selectCore = shouldSelectCore(postWarmupExerciseCount);

          // Get candidate pool based on category
          let candidatePool = selectCore
            ? availableCore
            : availableStrengthCardio;

          // If the preferred category has no available exercises, use the other
          if (candidatePool.length === 0) {
            candidatePool = selectCore
              ? availableStrengthCardio
              : availableCore;
          }

          // Separate by equipment preference
          const suitableEquipment = candidatePool.filter(
            (ex) => hasEquipment && equipmentFilter.includes(ex.equipment)
          );
          const suitableNoEquipment = candidatePool.filter(
            (ex) =>
              !hasEquipment ||
              ex.equipment === "none" ||
              !equipmentFilter.includes(ex.equipment)
          );
          const weightedPool = createWeightedPool(
            suitableEquipment,
            suitableNoEquipment
          );
          selected = selectFromWeightedPool(weightedPool);
        }

        if (!selected) {
          throw new Error("Failed to select exercise for circuit");
        }

        // Store exercise in circuit definition
        circuitExercises.push(selected);
        if (!allUniqueExercisesUsed) {
          usedExerciseIds.add(selected.id);
        }
        postWarmupExerciseCount++;
      }

      circuitDefinitions.push(circuitExercises);
    }

    // Step 2b: Build workout by repeating each circuit
    for (let circuitIndex = 0; circuitIndex < numCircuits; circuitIndex++) {
      const circuitExercises = circuitDefinitions[circuitIndex];

      for (let rep = 0; rep < repetitionsPerCircuit; rep++) {
        for (
          let exerciseIndex = 0;
          exerciseIndex < circuitExercises.length;
          exerciseIndex++
        ) {
          const exercise = circuitExercises[exerciseIndex];
          const exerciseEntry = createExerciseEntry(
            exercise,
            exerciseDuration,
            selectedExercises.length + 1
          );
          selectedExercises.push(exerciseEntry);
          currentTime += exerciseDuration;

          // Add rest time between exercises (but not after the last exercise of the last rep of the last circuit)
          const isLastExerciseOfLastRepOfLastCircuit =
            circuitIndex === numCircuits - 1 &&
            rep === repetitionsPerCircuit - 1 &&
            exerciseIndex === circuitExercises.length - 1;

          if (!isLastExerciseOfLastRepOfLastCircuit) {
            currentTime += restTimeSeconds;
          }
        }
      }
    }

    const workout = {
      exercises: selectedExercises,
      totalTimeSeconds: currentTime,
      totalTimeMinutes: Math.round(currentTime / 60),
      equipment,
      restTimeSeconds,
      exerciseDurationSeconds: exerciseDuration,
      exerciseCount: selectedExercises.length,
      numCircuits,
      exercisesPerCircuit,
      repetitionsPerCircuit,
      generatedAt: new Date().toISOString(),
    };

    return workout;
  } catch (error) {
    console.error("[DEBUG] generateWorkout error:", error);
    console.error("Error generating workout:", error);
    throw error;
  }
};
