import { getExercises } from "../database";

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
    // Build query filters
    const filters = {};

    // Filter by equipment
    const equipmentList = Array.isArray(equipment) ? equipment : [equipment];
    const equipmentFilter = equipmentList.filter((e) => e !== "none");
    const hasEquipment = equipmentFilter.length > 0;

    // Get exercises from database
    // If multiple equipment types are selected, fetch exercises for ALL of them
    let exercises = [];

    if (hasEquipment) {
      // Fetch exercises for each selected equipment type
      const allEquipmentExercises = [];
      for (const eq of equipmentFilter) {
        const eqFilters = { equipment: eq };
        const eqExercises = await getExercises(eqFilters);
        allEquipmentExercises.push(...eqExercises);
      }

      // Also fetch 'none' equipment exercises
      const noneFilters = { equipment: "none" };
      const noneExercises = await getExercises(noneFilters);

      // Combine all exercises and remove duplicates by ID
      const combinedExercises = [...allEquipmentExercises, ...noneExercises];
      const uniqueExercises = [];
      const seenIds = new Set();
      for (const ex of combinedExercises) {
        if (!seenIds.has(ex.id)) {
          seenIds.add(ex.id);
          uniqueExercises.push(ex);
        }
      }
      exercises = uniqueExercises;

      console.log(
        "[DEBUG] Fetched exercises for equipment types:",
        equipmentFilter,
        "Total exercises:",
        exercises.length
      );
    } else {
      // No equipment selected, only get 'none' exercises
      filters.equipment = "none";
      exercises = await getExercises(filters);
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
    // If equipment is available (not just 'none'), prioritize exercises that use that equipment
    let equipmentExercises = [];
    let noEquipmentExercises = [];

    if (hasEquipment) {
      // Split exercises into those that use equipment and those that don't
      equipmentExercises = exercises.filter((ex) =>
        equipmentFilter.includes(ex.equipment)
      );
      noEquipmentExercises = exercises.filter(
        (ex) =>
          ex.equipment === "none" || !equipmentFilter.includes(ex.equipment)
      );
    } else {
      // No equipment selected, all exercises are equally valid
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
    // Account for rest time between exercises (N exercises = N-1 rest periods)
    const selectedExercises = [];
    let currentTime = 0;
    let attempts = 0;
    const maxAttempts = 1000;
    const exerciseDuration = exerciseDurationSeconds || 60;
    let sequenceRepeatIndex = 0; // Track position when repeating the sequence

    while (currentTime < totalTimeSeconds && attempts < maxAttempts) {
      attempts++;

      const remainingTime = totalTimeSeconds - currentTime;

      // Calculate time needed: exercise duration + rest time (if we're adding another exercise after this)
      // We need to check if we can fit: current exercise + rest + next exercise
      // If we can't fit that, we check if we can fit just the current exercise (as the last one)
      const timeNeededWithRest =
        exerciseDuration + restTimeSeconds + exerciseDuration;
      const timeNeededJustExercise = exerciseDuration;

      // Check if we've used all unique exercises - if so, repeat the sequence
      const allUniqueExercisesUsed =
        usedExerciseIds.size >= allAvailableExercises.length;

      let selected;
      if (allUniqueExercisesUsed && selectedExercises.length > 0) {
        // Repeat the sequence: cycle through already selected exercises in order
        // But first check if we can fit an exercise + rest + another exercise
        const timeNeededWithRest =
          exerciseDuration + restTimeSeconds + exerciseDuration;
        const timeNeededJustExercise = exerciseDuration;

        if (timeNeededWithRest <= remainingTime) {
          // Can fit exercise + rest + another exercise, continue with sequence
          const sequenceIndex = sequenceRepeatIndex % selectedExercises.length;
          const exerciseFromSequence = selectedExercises[sequenceIndex];
          selected = {
            ...exerciseFromSequence,
            id: exerciseFromSequence.id,
          };
          sequenceRepeatIndex++;
        } else if (timeNeededJustExercise <= remainingTime) {
          // Can only fit one more exercise (last one, no rest after)
          const sequenceIndex = sequenceRepeatIndex % selectedExercises.length;
          const exerciseFromSequence = selectedExercises[sequenceIndex];
          selected = {
            ...exerciseFromSequence,
            id: exerciseFromSequence.id,
          };
          const finalDuration = exerciseDurationSeconds || 60;
          selectedExercises.push({
            ...selected,
            duration_seconds: finalDuration,
            order: selectedExercises.length + 1,
          });
          currentTime += finalDuration;
          break; // Last exercise added, done
        } else {
          // Can't fit any more exercises
          break;
        }
      } else {
        // Get available exercises (not yet used)
        const getAvailableExercises = (exerciseList) => {
          return exerciseList.filter((ex) => !usedExerciseIds.has(ex.id));
        };

        // Get available exercises from both equipment and no-equipment pools
        let availableEquipment = [];
        let availableNoEquipment = [];

        if (hasEquipment && shuffledEquipment.length > 0) {
          availableEquipment = getAvailableExercises(shuffledEquipment);
          availableNoEquipment = getAvailableExercises(shuffledNoEquipment);
        } else {
          // No equipment preference, use all exercises equally
          availableEquipment = getAvailableExercises(allAvailableExercises);
          availableNoEquipment = [];
        }

        // Combine available exercises for filtering by time constraints
        const allAvailable = [...availableEquipment, ...availableNoEquipment];

        // If no available exercises and we have selected exercises, repeat sequence
        if (allAvailable.length === 0 && selectedExercises.length > 0) {
          // Check time constraints before repeating
          const timeNeededWithRest =
            exerciseDuration + restTimeSeconds + exerciseDuration;
          const timeNeededJustExercise = exerciseDuration;

          if (timeNeededWithRest <= remainingTime) {
            // Can fit exercise + rest + another exercise, continue with sequence
            const sequenceIndex =
              sequenceRepeatIndex % selectedExercises.length;
            const exerciseFromSequence = selectedExercises[sequenceIndex];
            selected = {
              ...exerciseFromSequence,
              id: exerciseFromSequence.id,
            };
            sequenceRepeatIndex++;
          } else if (timeNeededJustExercise <= remainingTime) {
            // Can only fit one more exercise (last one, no rest after)
            const sequenceIndex =
              sequenceRepeatIndex % selectedExercises.length;
            const exerciseFromSequence = selectedExercises[sequenceIndex];
            selected = {
              ...exerciseFromSequence,
              id: exerciseFromSequence.id,
            };
            const finalDuration = exerciseDurationSeconds || 60;
            selectedExercises.push({
              ...selected,
              duration_seconds: finalDuration,
              order: selectedExercises.length + 1,
            });
            currentTime += finalDuration;
            break; // Last exercise added, done
          } else {
            // Can't fit any more exercises
            break;
          }
        } else if (allAvailable.length === 0) {
          // No exercises available at all - shouldn't happen, but break to avoid infinite loop
          break;
        } else {
          // Create weighted selection pool: equipment exercises have 5x weight
          // First filter by time constraints
          const suitableEquipment = availableEquipment.filter(
            (ex) => timeNeededWithRest <= remainingTime
          );
          const suitableNoEquipment = availableNoEquipment.filter(
            (ex) => timeNeededWithRest <= remainingTime
          );

          if (
            suitableEquipment.length === 0 &&
            suitableNoEquipment.length === 0
          ) {
            // Can't fit exercise + rest + another exercise
            // Check if we can fit just one more exercise (as the last one, no rest after it)
            const exercisesThatFitWithoutRest = allAvailable.filter(
              (ex) => timeNeededJustExercise <= remainingTime
            );
            if (exercisesThatFitWithoutRest.length > 0) {
              // Create weighted pool for final exercise
              const weightedPool = [];
              const finalEquipment = exercisesThatFitWithoutRest.filter(
                (ex) => hasEquipment && equipmentFilter.includes(ex.equipment)
              );
              const finalNoEquipment = exercisesThatFitWithoutRest.filter(
                (ex) =>
                  !hasEquipment ||
                  ex.equipment === "none" ||
                  !equipmentFilter.includes(ex.equipment)
              );

              // Add equipment exercises 10 times, no-equipment exercises once
              for (let i = 0; i < 10; i++) {
                weightedPool.push(...finalEquipment);
              }
              weightedPool.push(...finalNoEquipment);

              if (weightedPool.length > 0) {
                const randomIndex = Math.floor(
                  Math.random() * weightedPool.length
                );
                selected = weightedPool[randomIndex];
                const finalDuration = exerciseDurationSeconds || 60;
                selectedExercises.push({
                  ...selected,
                  duration_seconds: finalDuration,
                  order: selectedExercises.length + 1,
                });
                usedExerciseIds.add(selected.id);
                currentTime += finalDuration;
              }
            }
            break;
          }

          // Create weighted pool: equipment exercises appear 5x more often
          const weightedPool = [];
          // Add equipment exercises 5 times
          for (let i = 0; i < 5; i++) {
            weightedPool.push(...suitableEquipment);
          }
          // Add no-equipment exercises once
          weightedPool.push(...suitableNoEquipment);

          // Randomly select from weighted pool
          if (weightedPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * weightedPool.length);
            selected = weightedPool[randomIndex];
          }
        }
      }

      // If we're repeating the sequence and selected is set, add it
      if (allUniqueExercisesUsed && selected) {
        const finalDuration = exerciseDurationSeconds || 60;
        selectedExercises.push({
          ...selected,
          duration_seconds: finalDuration,
          order: selectedExercises.length + 1,
        });
        // Don't add to usedExerciseIds since we're repeating
        currentTime += finalDuration + restTimeSeconds;
        continue; // Skip the rest of the loop and continue
      }

      // If selected is not set at this point, something went wrong
      if (!selected) {
        break;
      }

      // Use the user's chosen exercise duration
      const finalDuration = exerciseDurationSeconds || 60;
      selectedExercises.push({
        ...selected,
        duration_seconds: finalDuration,
        order: selectedExercises.length + 1,
      });
      usedExerciseIds.add(selected.id);

      // Add exercise time + rest time (rest is between this exercise and the next)
      currentTime += finalDuration + restTimeSeconds;
    }

    const workout = {
      exercises: selectedExercises,
      totalTimeSeconds: currentTime,
      totalTimeMinutes: Math.round(currentTime / 60),
      equipment,
      restTimeSeconds,
      exerciseDurationSeconds: exerciseDurationSeconds || 60,
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
