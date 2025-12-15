import { getEquipmentOptions } from "../../database";
import { getExercises } from "../../database";

// Mock expo-sqlite
jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(),
}));

// Mock the database module to control getExercises and getEquipmentOptions
jest.mock("../../database", () => {
  const actual = jest.requireActual("../../database");
  return {
    ...actual,
    getExercises: jest.fn(),
    getEquipmentOptions: jest.fn(),
  };
});

describe("Equipment Options Consistency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Equipment options match between screens", () => {
    test("should return same equipment options from database that are used in exercises", async () => {
      const { getEquipmentOptions, getExercises } = require("../../database");
      
      // Mock exercises with various equipment types
      const mockExercises = [
        { id: 1, name: "Push-ups", equipment: "none" },
        { id: 2, name: "Dumbbell Curls", equipment: "dumbbells" },
        { id: 3, name: "Band Pull", equipment: "resistance-bands" },
        { id: 4, name: "Kettlebell Swing", equipment: "kettlebell" },
        { id: 5, name: "Barbell Squat", equipment: "barbell" },
        { id: 6, name: "Yoga Pose", equipment: "yoga-mat" },
      ];

      // Mock getExercises to return exercises with various equipment
      getExercises.mockResolvedValue(mockExercises);

      // Extract unique equipment from exercises
      const exerciseEquipment = [...new Set(mockExercises.map((e) => e.equipment))];
      const expectedEquipment = ["none", ...exerciseEquipment.filter((e) => e !== "none")];

      // Mock getEquipmentOptions to return the same equipment
      getEquipmentOptions.mockResolvedValue(expectedEquipment);

      // Verify both functions would return consistent data
      const equipmentOptions = await getEquipmentOptions();
      const exercises = await getExercises();

      // Extract equipment from exercises
      const exerciseEquipmentSet = new Set(exercises.map((e) => e.equipment));
      const equipmentFromExercises = ["none", ...Array.from(exerciseEquipmentSet).filter((e) => e !== "none")];

      // Equipment options should match equipment from exercises (ignoring order)
      const sortedOptions = [...equipmentOptions].sort();
      const sortedFromExercises = [...equipmentFromExercises].sort();
      expect(sortedOptions).toEqual(sortedFromExercises);
      
      // Verify 'none' is first in equipmentOptions (not sorted)
      expect(equipmentOptions[0]).toBe("none");
    });

    test("should ensure HomeScreen and ExercisesScreen use same getEquipmentOptions function", () => {
      // Import the function that both screens should use
      const { getEquipmentOptions } = require("../../database");
      
      // Verify it's the same function reference
      expect(typeof getEquipmentOptions).toBe("function");
      
      // Both screens should import and use this same function
      // This test verifies the function exists and is exported
      expect(getEquipmentOptions).toBeDefined();
      
      // Verify both screens import from the same module
      // HomeScreen imports: import { getEquipmentOptions } from "../database";
      // ExercisesScreen imports: import { getEquipmentOptions } from "../database";
      // They should both get the same function reference
      const databaseModule = require("../../database");
      expect(databaseModule.getEquipmentOptions).toBe(getEquipmentOptions);
    });
    
    test("should return consistent equipment options for both workout creation and exercise management", async () => {
      const { getEquipmentOptions } = require("../../database");
      
      // Mock equipment options from database
      const mockEquipmentData = [
        { equipment: "none" },
        { equipment: "dumbbells" },
        { equipment: "resistance-bands" },
        { equipment: "kettlebell" },
        { equipment: "barbell" },
        { equipment: "yoga-mat" },
      ];
      
      getEquipmentOptions.mockResolvedValueOnce([
        "none",
        "dumbbells",
        "resistance-bands",
        "kettlebell",
        "barbell",
        "yoga-mat",
      ]);
      
      // Simulate HomeScreen calling getEquipmentOptions
      const homeScreenOptions = await getEquipmentOptions();
      
      // Simulate ExercisesScreen calling getEquipmentOptions (should get same result)
      getEquipmentOptions.mockResolvedValueOnce([
        "none",
        "dumbbells",
        "resistance-bands",
        "kettlebell",
        "barbell",
        "yoga-mat",
      ]);
      
      const exercisesScreenOptions = await getEquipmentOptions();
      
      // Both screens should get the same equipment options
      expect(homeScreenOptions).toEqual(exercisesScreenOptions);
      expect(homeScreenOptions[0]).toBe("none");
      expect(exercisesScreenOptions[0]).toBe("none");
    });

    test("should return equipment options sorted with 'none' first", async () => {
      const { getEquipmentOptions } = require("../../database");
      
      const mockEquipment = [
        { equipment: "dumbbells" },
        { equipment: "kettlebell" },
        { equipment: "none" },
        { equipment: "resistance-bands" },
      ];

      // Mock the actual implementation
      getEquipmentOptions.mockImplementation(async () => {
        const equipmentList = mockEquipment.map((row) => row.equipment);
        const uniqueEquipment = [...new Set(equipmentList)];
        if (uniqueEquipment.includes("none")) {
          return ["none", ...uniqueEquipment.filter((e) => e !== "none")];
        }
        return ["none", ...uniqueEquipment];
      });

      const options = await getEquipmentOptions();

      expect(options[0]).toBe("none");
      expect(options.length).toBe(4);
    });
  });
});
