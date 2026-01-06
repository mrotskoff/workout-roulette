import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { generateWorkout as generateWorkoutLocal } from "../services/workoutGenerator";
import { getEquipmentOptions } from "../database";

const HomeScreen = ({ navigation }) => {
  const [numCircuits, setNumCircuits] = useState("3");
  const [exercisesPerCircuit, setExercisesPerCircuit] = useState("4");
  const [repetitionsPerCircuit, setRepetitionsPerCircuit] = useState("2");
  const [exerciseDuration, setExerciseDuration] = useState("60");
  const [restTime, setRestTime] = useState("10");
  const [equipment, setEquipment] = useState(["none"]);
  const [loading, setLoading] = useState(false);
  const [equipmentOptions, setEquipmentOptions] = useState([
    "none",
    "dumbbells",
    "kettlebells",
    "resistance-bands",
  ]);

  useEffect(() => {
    loadEquipmentOptions();
  }, []);

  const loadEquipmentOptions = async () => {
    try {
      const options = await getEquipmentOptions();
      // Ensure all expected equipment types are included, even if not in database yet
      const expectedEquipment = [
        "none",
        "dumbbells",
        "kettlebells",
        "resistance-bands",
      ];
      const combinedOptions = [...new Set([...expectedEquipment, ...options])];
      // Keep 'none' first, then sort the rest
      const sortedOptions = [
        "none",
        ...combinedOptions.filter((e) => e !== "none").sort(),
      ];
      setEquipmentOptions(sortedOptions);
    } catch (error) {
      console.error("Error loading equipment options:", error);
      // Keep default options on error
    }
  };

  const generateWorkout = async () => {
    const numCircuitsValue = parseInt(numCircuits);
    const exercisesPerCircuitValue = parseInt(exercisesPerCircuit);
    const repetitionsPerCircuitValue = parseInt(repetitionsPerCircuit);

    if (!numCircuitsValue || numCircuitsValue <= 0) {
      Alert.alert("Error", "Please enter a valid number of circuits");
      return;
    }
    if (!exercisesPerCircuitValue || exercisesPerCircuitValue <= 0) {
      Alert.alert("Error", "Please enter a valid number of exercises per circuit");
      return;
    }
    if (!repetitionsPerCircuitValue || repetitionsPerCircuitValue <= 0) {
      Alert.alert("Error", "Please enter a valid number of repetitions per circuit");
      return;
    }

    setLoading(true);
    try {
      const equipmentParam = equipment.length === 0 ? ["none"] : equipment;
      const exerciseDurationSeconds = parseInt(exerciseDuration) || 60;
      const restTimeSeconds = parseInt(restTime) || 0;
      const workout = await generateWorkoutLocal(
        numCircuitsValue,
        exercisesPerCircuitValue,
        repetitionsPerCircuitValue,
        equipmentParam,
        restTimeSeconds,
        null,
        exerciseDurationSeconds
      );
      navigation.navigate("Workout", { workout });
    } catch (error) {
      console.error("Error generating workout:", error);
      Alert.alert("Error", error.message || "Failed to generate workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create Your Workout</Text>
        <Text style={styles.subtitle}>
          Choose your parameters and let us create a randomized workout for you!
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Number of Circuits</Text>
          <TextInput
            style={styles.input}
            value={numCircuits}
            onChangeText={setNumCircuits}
            keyboardType="numeric"
            placeholder="3"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Exercises Per Circuit</Text>
          <TextInput
            style={styles.input}
            value={exercisesPerCircuit}
            onChangeText={setExercisesPerCircuit}
            keyboardType="numeric"
            placeholder="4"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Repetitions Per Circuit</Text>
          <TextInput
            style={styles.input}
            value={repetitionsPerCircuit}
            onChangeText={setRepetitionsPerCircuit}
            keyboardType="numeric"
            placeholder="2"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Exercise Duration (seconds)</Text>
          <TextInput
            style={styles.input}
            value={exerciseDuration}
            onChangeText={setExerciseDuration}
            keyboardType="numeric"
            placeholder="60"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Rest Between Exercises (seconds)</Text>
          <TextInput
            style={styles.input}
            value={restTime}
            onChangeText={setRestTime}
            keyboardType="numeric"
            placeholder="10"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Equipment Available</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonGroupContainer}
            style={styles.buttonGroupScroll}
          >
            {equipmentOptions.map((item) => {
              const isSelected = equipment.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonActive,
                  ]}
                  onPress={() => {
                    if (item === "none") {
                      // Selecting "None" clears all other selections
                      setEquipment(["none"]);
                    } else {
                      // Selecting other equipment removes "None" and toggles the item
                      setEquipment((prev) => {
                        const withoutNone = prev.filter((e) => e !== "none");
                        if (withoutNone.includes(item)) {
                          // Deselect if already selected
                          const newSelection = withoutNone.filter(
                            (e) => e !== item
                          );
                          // If nothing selected, default to 'none'
                          return newSelection.length > 0
                            ? newSelection
                            : ["none"];
                        } else {
                          // Select the item
                          return [...withoutNone, item];
                        }
                      });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextActive,
                    ]}
                  >
                    {item === "none"
                      ? "None"
                      : item
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[
            styles.generateButton,
            loading && styles.generateButtonDisabled,
          ]}
          onPress={generateWorkout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Spin up a Workout!</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exercisesButton}
          onPress={() => navigation.navigate("Exercises")}
        >
          <Text style={styles.exercisesButtonText}>Manage Exercises</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  buttonGroupScroll: {
    marginHorizontal: -4,
  },
  buttonGroupContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  optionButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  optionButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  optionText: {
    fontSize: 14,
    color: "#666",
  },
  optionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  generateButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  generateButtonDisabled: {
    backgroundColor: "#ccc",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  exercisesButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  exercisesButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
