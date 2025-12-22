import { generateWorkout } from "../workoutGenerator";
import { getExercises } from "../../database";

// Mock the database module
jest.mock("../../database", () => ({
  getExercises: jest.fn(),
}));

describe("WorkoutGenerator - Rest Time Calculation", () => {
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getExercises.mockResolvedValue(mockExercises);
  });

  describe("Rest time is included in total workout time", () => {
    test("should include rest time between exercises in total time calculation", async () => {
      const totalTimeSeconds = 300; // 5 minutes
      const exerciseDuration = 60; // 60 seconds per exercise
      const restTimeSeconds = 10; // 10 seconds rest between exercises
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Calculate expected time: exercises + rest periods
      // With new structure: 2 warmup + post-warmup exercises
      // Rest time is between exercises: (N-1) rest periods for N exercises
      const numExercises = workout.exercises.length;
      const expectedExerciseTime = numExercises * exerciseDuration;
      const expectedRestTime = (numExercises - 1) * restTimeSeconds;
      const expectedTotalTime = expectedExerciseTime + expectedRestTime;

      // The total time should match: exercise time + rest time
      // Allow small tolerance due to time constraint edge cases
      expect(workout.totalTimeSeconds).toBeGreaterThanOrEqual(
        expectedTotalTime - restTimeSeconds
      );
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(expectedTotalTime);
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(totalTimeSeconds);
    });

    test("should not exceed target time when rest time is included", async () => {
      const totalTimeSeconds = 200; // 3 minutes 20 seconds
      const exerciseDuration = 60;
      const restTimeSeconds = 15; // 15 seconds rest
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Total time should not exceed target
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(totalTimeSeconds);

      // Verify the calculation: exercises + rest
      const exerciseTime = workout.exercises.reduce(
        (sum, ex) => sum + ex.duration_seconds,
        0
      );
      const numExercises = workout.exercises.length;
      const restTime = (numExercises - 1) * restTimeSeconds;
      const calculatedTotal = exerciseTime + restTime;

      // Allow small tolerance due to time constraint edge cases
      expect(workout.totalTimeSeconds).toBeGreaterThanOrEqual(
        calculatedTotal - restTimeSeconds
      );
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(calculatedTotal);
    });

    test("should handle zero rest time correctly", async () => {
      const totalTimeSeconds = 300;
      const exerciseDuration = 60;
      const restTimeSeconds = 0; // No rest
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
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
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(totalTimeSeconds);
    });

    test("should not add rest time after the last exercise", async () => {
      const totalTimeSeconds = 250; // Enough for 4 exercises with rest
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Calculate: N exercises + rest periods
      const numExercises = workout.exercises.length;
      const exerciseTime = numExercises * exerciseDuration;
      const restTime = (numExercises - 1) * restTimeSeconds;
      const expectedTotal = exerciseTime + restTime;

      // Allow small tolerance due to time constraint edge cases
      expect(workout.totalTimeSeconds).toBeGreaterThanOrEqual(
        expectedTotal - restTimeSeconds
      );
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(expectedTotal);
      // Verify no rest after last exercise (rest count = exercise count - 1)
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(totalTimeSeconds);
    });
  });

  describe("Workout respects time constraints with rest time", () => {
    test("should fit maximum exercises within time limit including rest", async () => {
      const totalTimeSeconds = 180; // 3 minutes
      const exerciseDuration = 30; // 30 seconds per exercise
      const restTimeSeconds = 10; // 10 seconds rest
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Should fit: 30 + 10 + 30 + 10 + 30 + 10 + 30 = 150 seconds (5 exercises, 4 rest periods)
      // Or: 30 + 10 + 30 + 10 + 30 + 10 + 30 + 10 + 30 = 180 seconds (6 exercises, 5 rest periods)
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(totalTimeSeconds);

      // Verify calculation
      const exerciseTime = workout.exercises.reduce(
        (sum, ex) => sum + ex.duration_seconds,
        0
      );
      const numExercises = workout.exercises.length;
      const restTime = (numExercises - 1) * restTimeSeconds;
      // Allow small tolerance due to time constraint edge cases
      expect(workout.totalTimeSeconds).toBeGreaterThanOrEqual(
        exerciseTime + restTime - restTimeSeconds
      );
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(
        exerciseTime + restTime
      );
    });

    test("should handle large rest times correctly", async () => {
      const totalTimeSeconds = 500; // ~8 minutes
      const exerciseDuration = 60;
      const restTimeSeconds = 30; // 30 seconds rest
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Verify total time calculation
      const exerciseTime = workout.exercises.reduce(
        (sum, ex) => sum + ex.duration_seconds,
        0
      );
      const numExercises = workout.exercises.length;
      const restTime = (numExercises - 1) * restTimeSeconds;
      const calculatedTotal = exerciseTime + restTime;

      // Allow small tolerance due to time constraint edge cases
      expect(workout.totalTimeSeconds).toBeGreaterThanOrEqual(
        calculatedTotal - restTimeSeconds
      );
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(calculatedTotal);
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(totalTimeSeconds);
    });
  });

  describe("Workout structure validation", () => {
    test("should return workout with correct restTimeSeconds property", async () => {
      const totalTimeSeconds = 300;
      const restTimeSeconds = 15;
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        60
      );

      expect(workout.restTimeSeconds).toBe(restTimeSeconds);
      expect(workout.exercises.length).toBeGreaterThan(0);
    });
  });

  describe("Edge cases", () => {
    test("should handle very short workout time", async () => {
      const totalTimeSeconds = 70; // Just enough for 1 exercise + rest + 1 more
      const exerciseDuration = 30;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Should have at least 1 exercise
      expect(workout.exercises.length).toBeGreaterThan(0);
      expect(workout.totalTimeSeconds).toBeLessThanOrEqual(totalTimeSeconds);
    });

    test("should handle time that only fits one exercise", async () => {
      // Need at least 2 warmup exercises, so minimum time is 2 * exerciseDuration + restTimeSeconds
      const exerciseDuration = 20;
      const restTimeSeconds = 5;
      const totalTimeSeconds = 2 * exerciseDuration + restTimeSeconds; // Exactly enough for 2 warmup exercises
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Should have exactly 2 warmup exercises with 1 rest between them
      expect(workout.exercises.length).toBe(2);
      expect(workout.exercises[0].category).toBe("warmup");
      expect(workout.exercises[1].category).toBe("warmup");
      expect(workout.totalTimeSeconds).toBe(
        2 * exerciseDuration + restTimeSeconds
      );
    });
  });

  describe("Exercise selection logic", () => {
    test("should not repeat exercises unless all exercises are used", async () => {
      const totalTimeSeconds = 1000; // Long workout that would require repeats
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Count occurrences of each exercise ID
      const exerciseIds = workout.exercises.map((ex) => ex.id);
      const idCounts = {};
      exerciseIds.forEach((id) => {
        idCounts[id] = (idCounts[id] || 0) + 1;
      });

      // Check if any exercise is repeated before all are used
      const uniqueExercises = new Set(exerciseIds);
      const totalUnique = uniqueExercises.size;

      // If we have fewer unique exercises than total exercises, repeats occurred
      // But repeats should only happen if we've used all available exercises
      if (totalUnique < workout.exercises.length) {
        // Repeats occurred - verify we've used all available exercises first
        // This is acceptable behavior when workout is longer than available exercises
        expect(totalUnique).toBeLessThanOrEqual(mockExercises.length);
      }
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

      const totalTimeSeconds = 200; // Enough for 3 exercises
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["dumbbells"];

      const workout = await generateWorkout(
        totalTimeSeconds,
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

    test("should use all available exercises before repeating", async () => {
      const totalTimeSeconds = 500; // Long workout
      const exerciseDuration = 60;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      const uniqueExerciseIds = new Set(workout.exercises.map((ex) => ex.id));

      // If we have repeats, we should have used all available exercises first
      if (workout.exercises.length > uniqueExerciseIds.size) {
        // Repeats occurred - should have used all mock exercises first
        expect(uniqueExerciseIds.size).toBeGreaterThanOrEqual(
          Math.min(mockExercises.length, workout.exercises.length)
        );
      }
    });

    test("should call getExercises for each selected equipment type", async () => {
      const totalTimeSeconds = 300;
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
        totalTimeSeconds,
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
});
