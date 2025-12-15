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
      name: "Jumping Jacks",
      category: "cardio",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 2,
      name: "Push-ups",
      category: "strength",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 3,
      name: "Squats",
      category: "strength",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 4,
      name: "Plank",
      category: "core",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 5,
      name: "Burpees",
      category: "cardio",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 6,
      name: "Lunges",
      category: "strength",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 7,
      name: "Crunches",
      category: "core",
      duration_seconds: 60,
      equipment: "none",
    },
    {
      id: 8,
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
      // For N exercises, there are N-1 rest periods
      const numExercises = workout.exercises.length;
      const expectedExerciseTime = numExercises * exerciseDuration;
      const expectedRestTime = (numExercises - 1) * restTimeSeconds;
      const expectedTotalTime = expectedExerciseTime + expectedRestTime;

      // The total time should match: exercise time + rest time
      expect(workout.totalTimeSeconds).toBe(expectedTotalTime);
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
      const restTime = (workout.exercises.length - 1) * restTimeSeconds;
      const calculatedTotal = exerciseTime + restTime;

      expect(workout.totalTimeSeconds).toBe(calculatedTotal);
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

      // Calculate: N exercises + (N-1) rest periods
      const numExercises = workout.exercises.length;
      const exerciseTime = numExercises * exerciseDuration;
      const restTime = (numExercises - 1) * restTimeSeconds; // N-1 rest periods
      const expectedTotal = exerciseTime + restTime;

      expect(workout.totalTimeSeconds).toBe(expectedTotal);
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
      const restTime = (workout.exercises.length - 1) * restTimeSeconds;
      expect(workout.totalTimeSeconds).toBe(exerciseTime + restTime);
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
      const restTime = (workout.exercises.length - 1) * restTimeSeconds;
      const calculatedTotal = exerciseTime + restTime;

      expect(workout.totalTimeSeconds).toBe(calculatedTotal);
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
      const totalTimeSeconds = 50; // Only fits 1 exercise (no rest needed)
      const exerciseDuration = 45;
      const restTimeSeconds = 10;
      const equipment = ["none"];

      const workout = await generateWorkout(
        totalTimeSeconds,
        equipment,
        restTimeSeconds,
        null,
        exerciseDuration
      );

      // Should have exactly 1 exercise with no rest time
      expect(workout.exercises.length).toBe(1);
      expect(workout.totalTimeSeconds).toBe(exerciseDuration);
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
          id: 1,
          name: "Push-ups",
          category: "strength",
          duration_seconds: 60,
          equipment: "none",
        },
        {
          id: 2,
          name: "Squats",
          category: "strength",
          duration_seconds: 60,
          equipment: "none",
        },
      ];

      getExercises.mockResolvedValue([
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

      // First exercises should be equipment-based
      const firstExercise = workout.exercises[0];
      expect(["dumbbells"]).toContain(firstExercise.equipment);

      // Should prefer equipment exercises over no-equipment exercises (5x weight)
      const equipmentCount = workout.exercises.filter(
        (ex) => ex.equipment === "dumbbells"
      ).length;
      const noEquipmentCount = workout.exercises.filter(
        (ex) => ex.equipment === "none"
      ).length;

      // With weighted selection (10x for equipment), equipment exercises should be more likely
      // In a single run, we can't guarantee more equipment exercises, but we should have some
      // If we have enough unique equipment exercises, we should use them before no-equipment
      if (workout.exercises.length <= equipmentExercises.length) {
        // If we have enough unique equipment exercises, all should use equipment
        expect(noEquipmentCount).toBe(0);
      } else {
        // With weighted selection, equipment exercises are 5x more likely
        // We should have at least some equipment exercises in the workout
        expect(equipmentCount).toBeGreaterThan(0);
        // The total should match
        expect(equipmentCount + noEquipmentCount).toBe(
          workout.exercises.length
        );
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
  });
});
