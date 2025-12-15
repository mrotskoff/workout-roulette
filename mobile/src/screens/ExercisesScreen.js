import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  getEquipmentOptions,
  resetDatabase,
} from "../database";

const ExercisesScreen = ({ navigation }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "general",
    description: "",
    equipment: "none",
  });
  const [equipmentOptions, setEquipmentOptions] = useState([
    "none",
    "dumbbells",
    "kettlebells",
    "resistance-bands",
  ]);

  const categories = [
    "cardio",
    "strength",
    "flexibility",
    "core",
    "balance",
    "general",
  ];

  useEffect(() => {
    loadExercises();
    loadEquipmentOptions();
  }, []);

  const loadEquipmentOptions = async () => {
    try {
      const options = await getEquipmentOptions();
      setEquipmentOptions(options);
    } catch (error) {
      console.error("Error loading equipment options:", error);
      // Keep default options on error
    }
  };

  const loadExercises = async (retryCount = 0) => {
    try {
      setLoading(true);
      // Add a small delay on retry to allow database to initialize
      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const exercises = await getExercises();
      setExercises(exercises || []);
    } catch (error) {
      console.error("Error loading exercises:", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });

      // Retry once if it's the first attempt
      if (retryCount === 0) {
        console.log("Retrying loadExercises...");
        return loadExercises(1);
      }

      Alert.alert(
        "Error",
        `Failed to load exercises: ${
          error?.message || "Unknown error"
        }\n\nPlease try restarting the app.`
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingExercise(null);
    setFormData({
      name: "",
      category: "general",
      description: "",
      equipment: "none",
    });
    setModalVisible(true);
  };

  const openEditModal = (exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name || "",
      category: exercise.category || "general",
      description: exercise.description || "",
      equipment: exercise.equipment || "none",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        equipment: formData.equipment,
      };

      if (editingExercise) {
        await updateExercise(editingExercise.id, payload);
        Alert.alert("Success", "Exercise updated successfully");
      } else {
        await createExercise(payload);
        Alert.alert("Success", "Exercise created successfully");
      }

      setModalVisible(false);
      loadExercises();
      loadEquipmentOptions(); // Reload equipment options in case new equipment was added
    } catch (error) {
      console.error("Error saving exercise:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to save exercise"
      );
    }
  };

  const handleResetDatabase = () => {
    Alert.alert(
      "Reset Database",
      "This will delete all exercises and restore the default sample exercises. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await resetDatabase();
              await loadExercises();
              await loadEquipmentOptions();
              Alert.alert("Success", "Database reset to default exercises");
            } catch (error) {
              console.error("Error resetting database:", error);
              Alert.alert("Error", "Failed to reset database");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (exercise) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExercise(exercise.id);
              Alert.alert("Success", "Exercise deleted successfully");
              loadExercises();
            } catch (error) {
              console.error("Error deleting exercise:", error);
              Alert.alert("Error", "Failed to delete exercise");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Exercise Database</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Text style={styles.addButtonText}>+ Add Exercise</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetDatabase}
            >
              <Text style={styles.resetButtonText}>Reset to Default</Text>
            </TouchableOpacity>
          </View>
        </View>

        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises found</Text>
            <Text style={styles.emptySubtext}>
              Tap "+ Add Exercise" to create one
            </Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.badgeContainer}>
                  <Text style={[styles.badge, styles.categoryBadge]}>
                    {exercise.category}
                  </Text>
                </View>
              </View>
              {exercise.description && (
                <Text style={styles.exerciseDescription}>
                  {exercise.description}
                </Text>
              )}
              <View style={styles.exerciseDetails}>
                <Text style={styles.detailText}>
                  Equipment: {exercise.equipment}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(exercise)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(exercise)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingExercise ? "Edit Exercise" : "Add Exercise"}
            </Text>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="Exercise name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.optionsContainer}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.optionButton,
                        formData.category === cat && styles.optionButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, category: cat })
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          formData.category === cat && styles.optionTextActive,
                        ]}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="Exercise description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Equipment</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.optionsContainer}
                >
                  {equipmentOptions.map((eq) => (
                    <TouchableOpacity
                      key={eq}
                      style={[
                        styles.optionButton,
                        formData.equipment === eq && styles.optionButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, equipment: eq })
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          formData.equipment === eq && styles.optionTextActive,
                        ]}
                      >
                        {eq === "none"
                          ? "None"
                          : eq.charAt(0).toUpperCase() +
                            eq.slice(1).replace("-", " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  addButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    flex: 1,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    backgroundColor: "#f44336",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    flex: 1,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
  exerciseCard: {
    backgroundColor: "#fff",
    margin: 15,
    marginBottom: 0,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  categoryBadge: {
    backgroundColor: "#E3F2FD",
    color: "#1976D2",
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  exerciseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: "#999",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#4CAF50",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  optionsContainer: {
    marginVertical: 5,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
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
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#2196F3",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ExercisesScreen;
