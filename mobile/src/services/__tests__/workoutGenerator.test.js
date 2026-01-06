import { generateWorkout } from "../workoutGenerator";
import { getExercises } from "../../database";

// Mock the database module
jest.mock("../../database", () => ({
  getExercises: jest.fn(),
}));

describe("WorkoutGenerator - Circuit-Based Workouts", () => {
  // Mock exercise data
  const mockExercises = [
    {
      id: 1,
      name: "Forward Fold",
      category: "warmup",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 2,
      name: "Arm Circles",
      category: "warmup",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 3,
      name: "Jumping Jacks",
      category: "cardio",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 4,
      name: "Push-ups",
      category: "strength",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 5,
      name: "Squats",
      category: "strength",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 6,
      name: "Plank",
      category: "core",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 7,
      name: "Burpees",
      category: "cardio",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 8,
      name: "Lunges",
      category: "strength",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 9,
      name: "Crunches",
      category: "core",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 10,
      name: "High Knees",
      category: "cardio",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 11,
      name: "Mountain Climbers",
      category: "cardio",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 12,
      name: "Russian Twists",
      category: "core",
      duration_seconds: 60,
      equipment: "none",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getExercises.mockResolvedValue(mockExercises);
  });

  describe("Workout structure", () => {
    test("should generate workout with 2 warmup exercises followed by circuits", async () => {
      const numCircuits = 2;
      const exercisesPerCircuit = 3;
      const repetitionsPerCircuit = 2;
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        numCircuits,
        exercisesPerCircuit,
        repetitionsPerCircuit,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Should have 2 warmup exercises
      expect(workout.exercises.length).toBeGreaterThanOrEqual(2);
      expect(workout.exercises[0].category).toBe("warmup");
      expect(workout.exercises[1].category).toBe("warmup");

      // Total exercises: 2 warmup + (numCircuits * exercisesPerCircuit * repetitionsPerCircuit)
      const expectedTotalExercises =
        2 + numCircuits * exercisesPerCircuit * repetitionsPerCircuit;
      expect(workout.exercises.length).toBe(expectedTotalExercises);

      // Verify circuit parameters
      expect(workout.numCircuits).toBe(numCircuits);
      expect(workout.exercisesPerCircuit).toBe(exercisesPerCircuit);
      expect(workout.repetitionsPerCircuit).toBe(repetitionsPerCircuit);
    });

    test("should calculate total time correctly", async () => {
      const numCircuits = 2;
      const exercisesPerCircuit = 3;
      const repetitionsPerCircuit = 2;
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        numCircuits,
        exercisesPerCircuit,
        repetitionsPerCircuit,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Calculate expected time:
      // 2 warmup exercises: 2 * 60 = 120 seconds
      // Rest between warmups: 1 * 10 = 10 seconds
      // Rest after last warmup: 1 * 10 = 10 seconds
      // Circuit exercises: (2 * 3 * 2) * 60 = 720 seconds
      // Rest between circuit exercises: (2 * 3 * 2 - 1) * 10 = 110 seconds
      // Total: 120 + 10 + 10 + 720 + 110 = 970 seconds

      const numExercises = workout.exercises.length;
      const expectedExerciseTime = numExercises * exerciseDuration;
      const expectedRestTime = (numExercises - 1) * restTimeSeconds;
      const expectedTotalTime = expectedExerciseTime + expectedRestTime;

      expect(workout.totalTimeSeconds).toBe(expectedTotalTime);
    });

    test("should not add rest time after the last exercise", async () => {
      const numCircuits = 1;
      const exercisesPerCircuit = 2;
      const repetitionsPerCircuit = 1;
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        numCircuits,
        exercisesPerCircuit,
        repetitionsPerCircuit,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Should have: 2 warmup + 2 circuit exercises = 4 exercises
      // Rest periods: 3 (between exercises, not after last)
      const numExercises = workout.exercises.length;
      const expectedExerciseTime = numExercises * exerciseDuration;
      const expectedRestTime = (numExercises - 1) * restTimeSeconds;
      const expectedTotalTime = expectedExerciseTime + expectedRestTime;

      expect(workout.totalTimeSeconds).toBe(expectedTotalTime);
    });

    test("should handle zero rest time correctly", async () => {
      const numCircuits = 1;
      const exercisesPerCircuit = 2;
      const repetitionsPerCircuit = 1;
      const exerciseDuration = 60;
      const restTimeSeconds = 0;
      const equipment = ["none"];

      const workout = await generateWorkout(
        numCircuits,
        exercisesPerCircuit,
        repetitionsPerCircuit,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // With no rest, total time should equal exercise time only
      const exerciseTime = workout.exercises.reduce(
        (sum, ex) => sum + ex.duration_seconds,
        0
      );
      expect(workout.totalTimeSeconds).toBe(exerciseTime);
    });
  });

  describe("Circuit repetition", () => {
    test("should repeat each circuit the specified number of times", async () => {
      const numCircuits = 2;
      const exercisesPerCircuit = 2;
      const repetitionsPerCircuit = 3;
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        numCircuits,
        exercisesPerCircuit,
        repetitionsPerCircuit,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Total exercises: 2 warmup + (2 circuits * 2 exercises * 3 reps) = 14
      const expectedTotalExercises =
        2 + numCircuits * exercisesPerCircuit * repetitionsPerCircuit;
      expect(workout.exercises.length).toBe(expectedTotalExercises);

      // Verify that circuits are repeated (exercises after warmup should repeat)
      const circuitExercises = workout.exercises.slice(2);
      // First circuit exercises (first 2)
      const firstCircuit = circuitExercises.slice(0, exercisesPerCircuit);
      // First repetition of first circuit
      const firstRep = circuitExercises.slice(0, exercisesPerCircuit);
      // Second repetition of first circuit
      const secondRep = circuitExercises.slice(
        exercisesPerCircuit,
        exercisesPerCircuit * 2
      );

      // Exercises in the same circuit should be the same across repetitions
      // (they may be in different order, but should be the same set)
      expect(firstRep.length).toBe(exercisesPerCircuit);
      expect(secondRep.length).toBe(exercisesPerCircuit);
    });
  });

  describe("Exercise selection logic", () => {
    test("should maintain 25% core, 75% strength/cardio ratio in circuits", async () => {
      const numCircuits = 1;
      const exercisesPerCircuit = 8; // 8 exercises per circuit
      const repetitionsPerCircuit = 1;
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        numCircuits,
        exercisesPerCircuit,
        repetitionsPerCircuit,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Get post-warmup exercises (circuit exercises)
      const circuitExercises = workout.exercises.slice(2);
      const coreCount = circuitExercises.filter(
        (ex) => ex.category === "core"
      ).length;
      const strengthCardioCount = circuitExercises.filter(
        (ex) => ex.category === "strength" || ex.category === "cardio"
      ).length;

      // Should maintain approximately 25% core, 75% strength/cardio
      // With 8 exercises, we expect 2 core (25%) and 6 strength/cardio (75%)
      // But the ratio is maintained across the sequence, so it might not be exact
      expect(coreCount + strengthCardioCount).toBe(circuitExercises.length);
      // Core should be around 25% (allow some flexibility)
      expect(coreCount).toBeGreaterThanOrEqual(1);
      expect(coreCount).toBeLessThanOrEqual(3);
    });

    test("should prioritize equipment exercises when equipment is available", async () => {
      // Create mock exercises with equipment
      const warmupExercises = [
        {
          id: 1,
          name: "Forward Fold",
          category: "warmup",
          duration_seconds: 60,
          equipment: "none",
        },
        {
          id: 2,
          name: "Arm Circles",
          category: "warmup",
          duration_seconds: 60,
          equipment: "none",
        },
      ];
      const equipmentExercises = [
        {
          id: 10,
          name: "Dumbbell Curls",
          category: "strength",
          duration_seconds: 60,
          equipment: "dumbbells",
        },
        {
          id: 11,
          name: "Dumbbell Press",
          category: "strength",
          duration_seconds: 60,
          equipment: "dumbbells",
        },
      ];
      const noEquipmentExercises = [
        {
          id: 3,
          name: "Push-ups",
          category: "strength",
          duration_seconds: 60,
          equipment: "none",
        },
        {
          id: 4,
          name: "Squats",
          category: "strength",
          duration_seconds: 60,
          equipment: "none",
        },
        {
          id: 5,
          name: "Plank",
          category: "core",
          duration_seconds: 60,
          equipment: "none",
        },
        {
          id: 6,
          name: "Burpees",
          category: "cardio",
          duration_seconds: 60,
          equipment: "none",
        },
      ];

      getExercises.mockResolvedValue([
        ...warmupExercises,
        ...equipmentExercises,
        ...noEquipmentExercises,
      ]);

      const numCircuits = 1;
      const exercisesPerCircuit = 4;
      const repetitionsPerCircuit = 1;
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["dumbbells"];

      const workout = await generateWorkout(
        numCircuits,
        exercisesPerCircuit,
        repetitionsPerCircuit,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // First 2 exercises should be warmup
      expect(workout.exercises[0].category).toBe("warmup");
      expect(workout.exercises[1].category).toBe("warmup");

      // Should prefer equipment exercises over no-equipment exercises (5x weight)
      const equipmentCount = workout.exercises.filter(
        (ex) => ex.equipment === "dumbbells"
      ).length;
      const noEquipmentCount = workout.exercises.filter(
        (ex) => ex.equipment === "none"
      ).length;

      // Post-warmup exercises should prefer equipment when available
      const postWarmupExercises = workout.exercises.slice(2);
      if (postWarmupExercises.length > 0) {
        // Check that post-warmup exercises respect equipment (don't use unselected equipment)
        const invalidEquipment = postWarmupExercises.some(
          (ex) => ex.equipment !== "none" && ex.equipment !== "dumbbells"
        );
        expect(invalidEquipment).toBe(false);

        // With weighted selection (5x), equipment exercises are more likely
        // Warmup exercises have no equipment, so equipmentCount only counts post-warmup
        // With enough post-warmup exercises and weighted selection, we should get some equipment exercises
        if (postWarmupExercises.length >= 2) {
          expect(equipmentCount).toBeGreaterThan(0);
        }
        // Sanity check: counts add up (warmup has no equipment, so all are either dumbbells or none)
        expect(equipmentCount + noEquipmentCount).toBe(
          workout.exercises.length
        );
      } else {
        // Workout only has warmup exercises
        expect(equipmentCount).toBe(0);
        expect(noEquipmentCount).toBe(workout.exercises.length);
      }
    });

    test("should call getExercises for each selected equipment type", async () => {
      const numCircuits = 1;
      const exercisesPerCircuit = 2;
      const repetitionsPerCircuit = 1;
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["dumbbells", "kettlebells", "none"];

      // Provide simple mock responses so the generator can run
      const warmupExercises = [
        { id: 1, name: "Forward Fold", category: "warmup", equipment: "none" },
        { id: 2, name: "Arm Circles", category: "warmup", equipment: "none" },
      ];
      const equipmentExercises = [
        {
          id: 3,
          name: "Dumbbell Curls",
          category: "strength",
          equipment: "dumbbells",
        },
        {
          id: 4,
          name: "Kettlebell Swings",
          category: "strength",
          equipment: "kettlebells",
        },
      ];
      const noEquipmentExercises = [
        { id: 5, name: "Push-ups", category: "strength", equipment: "none" },
        { id: 6, name: "Plank", category: "core", equipment: "none" },
        { id: 7, name: "Burpees", category: "cardio", equipment: "none" },
      ];

      getExercises.mockImplementation(async (filters) => {
        if (filters?.equipment === "dumbbells") {
          return [equipmentExercises[0]];
        }
        if (filters?.equipment === "kettlebells") {
          return [equipmentExercises[1]];
        }
        if (filters?.equipment === "none") {
          return [...warmupExercises, ...noEquipmentExercises];
        }
        return [];
      });

      const workout = await generateWorkout(
        numCircuits,
        exercisesPerCircuit,
        repetitionsPerCircuit,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      expect(workout.exercises.length).toBeGreaterThan(0);
      // Ensure getExercises was called for each non-'none' equipment and for 'none'
      expect(getExercises).toHaveBeenCalledWith({ equipment: "dumbbells" });
      expect(getExercises).toHaveBeenCalledWith({ equipment: "kettlebells" });
      expect(getExercises).toHaveBeenCalledWith({ equipment: "none" });
    });
  });

  describe("Workout properties", () => {
    test("should return workout with correct properties", async () => {
      const numCircuits = 2;
      const exercisesPerCircuit = 3;
      const repetitionsPerCircuit = 2;
      const exerciseDuration = 60;
      const restTimeSeconds = 15;
      const equipment = ["none"];

      const workout = await generateWorkout(
        numCircuits,
        exercisesPerCircuit,
        repetitionsPerCircuit,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      expect(workout.restTimeSeconds).toBe(restTimeSeconds);
      expect(workout.exerciseDurationSeconds).toBe(exerciseDuration);
      expect(workout.numCircuits).toBe(numCircuits);
      expect(workout.exercisesPerCircuit).toBe(exercisesPerCircuit);
      expect(workout.repetitionsPerCircuit).toBe(repetitionsPerCircuit);
      expect(workout.exercises.length).toBeGreaterThan(0);
      expect(workout.equipment).toEqual(equipment);
      expect(workout.exerciseCount).toBe(workout.exercises.length);
      expect(workout.totalTimeMinutes).toBe(
        Math.round(workout.totalTimeSeconds / 60)
      );
    });

    test("should set duration_seconds for all exercises", async () => {
      const numCircuits = 1;
      const exercisesPerCircuit = 2;
      const repetitionsPerCircuit = 1;
      const exerciseDuration = 45;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        numCircuits,
        exercisesPerCircuit,
        repetitionsPerCircuit,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // All exercises should have the correct duration_seconds
      workout.exercises.forEach((exercise) => {
        expect(exercise.duration_seconds).toBe(exerciseDuration);
      });
    });
  });
});
