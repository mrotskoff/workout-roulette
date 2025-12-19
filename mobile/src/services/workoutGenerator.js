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
  totalTimeSeconds,
  equipment,
  restTimeSeconds = 0,
  categories = null,
  exerciseDurationSeconds = 60
) => {
  console.log("[DEBUG] generateWorkout called:", {
    totalTimeSeconds,
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

    // Filter by categories if specified
    if (categories && categories.length > 0) {
      exercises = exercises.filter((ex) => categories.includes(ex.category));
    }

    if (exercises.length === 0) {
      throw new Error("No exercises found matching the criteria");
    }

    // Separate exercises by equipment preference
    let equipmentExercises = [];
    let noEquipmentExercises = [];
    if (hasEquipment) {
      equipmentExercises = exercises.filter((ex) =>
        equipmentFilter.includes(ex.equipment)
      );
      noEquipmentExercises = exercises.filter(
        (ex) =>
          ex.equipment === "none" || !equipmentFilter.includes(ex.equipment)
      );
    } else {
      equipmentExercises = exercises;
      noEquipmentExercises = [];
    }

    // Shuffle both arrays
    const shuffledEquipment = [...equipmentExercises].sort(
      () => Math.random() - 0.5
    );
    const shuffledNoEquipment = [...noEquipmentExercises].sort(
      () => Math.random() - 0.5
    );

    // Track used exercise IDs to avoid repeats
    const usedExerciseIds = new Set();
    const allAvailableExercises = [
      ...shuffledEquipment,
      ...shuffledNoEquipment,
    ];

    // Build workout by selecting exercises until we reach the target time
    const selectedExercises = [];
    let currentTime = 0;
    let attempts = 0;
    const maxAttempts = 1000;
    let sequenceRepeatIndex = 0;

    while (currentTime < totalTimeSeconds && attempts < maxAttempts) {
      attempts++;
      const remainingTime = totalTimeSeconds - currentTime;
      const timeNeededWithRest =
        exerciseDuration + restTimeSeconds + exerciseDuration;
      const timeNeededJustExercise = exerciseDuration;
      const allUniqueExercisesUsed =
        usedExerciseIds.size >= allAvailableExercises.length;

      let selected = null;
      let isFinalExercise = false;

      // Check if we need to repeat the sequence
      if (allUniqueExercisesUsed && selectedExercises.length > 0) {
        const sequenceResult = tryGetFromSequence(
          selectedExercises,
          sequenceRepeatIndex,
          remainingTime,
          exerciseDuration,
          restTimeSeconds
        );
        if (sequenceResult) {
          selected = sequenceResult.exercise;
          isFinalExercise = sequenceResult.isFinal;
          sequenceRepeatIndex++;
        } else {
          break; // Can't fit any more exercises
        }
      } else {
        // Get available exercises (not yet used)
        const getAvailableExercises = (exerciseList) =>
          exerciseList.filter((ex) => !usedExerciseIds.has(ex.id));

        let availableEquipment = [];
        let availableNoEquipment = [];

        if (hasEquipment && shuffledEquipment.length > 0) {
          availableEquipment = getAvailableExercises(shuffledEquipment);
          availableNoEquipment = getAvailableExercises(shuffledNoEquipment);
        } else {
          availableEquipment = getAvailableExercises(allAvailableExercises);
          availableNoEquipment = [];
        }

        const allAvailable = [...availableEquipment, ...availableNoEquipment];

        // If no available exercises, try repeating sequence
        if (allAvailable.length === 0 && selectedExercises.length > 0) {
          const sequenceResult = tryGetFromSequence(
            selectedExercises,
            sequenceRepeatIndex,
            remainingTime,
            exerciseDuration,
            restTimeSeconds
          );
          if (sequenceResult) {
            selected = sequenceResult.exercise;
            isFinalExercise = sequenceResult.isFinal;
            sequenceRepeatIndex++;
          } else {
            break;
          }
        } else if (allAvailable.length === 0) {
          break; // No exercises available at all
        } else {
          // Filter by time constraints
          const suitableEquipment = availableEquipment.filter(
            () => timeNeededWithRest <= remainingTime
          );
          const suitableNoEquipment = availableNoEquipment.filter(
            () => timeNeededWithRest <= remainingTime
          );

          if (
            suitableEquipment.length === 0 &&
            suitableNoEquipment.length === 0
          ) {
            // Can't fit exercise + rest + another exercise
            // Check if we can fit just one more exercise (as the last one)
            const exercisesThatFitWithoutRest = allAvailable.filter(
              () => timeNeededJustExercise <= remainingTime
            );
            if (exercisesThatFitWithoutRest.length > 0) {
              const finalEquipment = exercisesThatFitWithoutRest.filter(
                (ex) => hasEquipment && equipmentFilter.includes(ex.equipment)
              );
              const finalNoEquipment = exercisesThatFitWithoutRest.filter(
                (ex) =>
                  !hasEquipment ||
                  ex.equipment === "none" ||
                  !equipmentFilter.includes(ex.equipment)
              );
              const weightedPool = createWeightedPool(
                finalEquipment,
                finalNoEquipment
              );
              selected = selectFromWeightedPool(weightedPool);
              isFinalExercise = true;
            }
            if (!selected) break;
          } else {
            // Create weighted pool and select
            const weightedPool = createWeightedPool(
              suitableEquipment,
              suitableNoEquipment
            );
            selected = selectFromWeightedPool(weightedPool);
          }
        }
      }

      // Add selected exercise
      if (!selected) break;

      if (isFinalExercise) {
        currentTime = addFinalExercise(
          selected,
          selectedExercises,
          exerciseDuration,
          currentTime
        );
        if (!allUniqueExercisesUsed) {
          usedExerciseIds.add(selected.id);
        }
        break; // Last exercise added, done
      }

      // Regular exercise addition
      const exerciseEntry = createExerciseEntry(
        selected,
        exerciseDuration,
        selectedExercises.length + 1
      );
      selectedExercises.push(exerciseEntry);
      if (!allUniqueExercisesUsed) {
        usedExerciseIds.add(selected.id);
      }
      currentTime += exerciseDuration + restTimeSeconds;
    }

    const workout = {
      exercises: selectedExercises,
      totalTimeSeconds: currentTime,
      totalTimeMinutes: Math.round(currentTime / 60),
      equipment,
      restTimeSeconds,
      exerciseDurationSeconds: exerciseDuration,
      exerciseCount: selectedExercises.length,
      generatedAt: new Date().toISOString(),
    };

    return workout;
  } catch (error) {
    console.error("[DEBUG] generateWorkout error:", error);
    console.error("Error generating workout:", error);
    throw error;
  }
};
