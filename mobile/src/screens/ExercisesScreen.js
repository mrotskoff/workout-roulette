import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ExercisesScreen = ({ navigation }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    description: '',
    duration_seconds: '30',
    intensity: 'medium',
    equipment: 'none',
    calories_per_minute: '5'
  });

  const categories = ['cardio', 'strength', 'flexibility', 'core', 'balance', 'general'];
  const intensities = ['low', 'medium', 'high'];
  const equipmentOptions = ['none', 'dumbbells', 'resistance-bands', 'kettlebell', 'barbell', 'yoga-mat'];

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/exercises`);
      setExercises(response.data);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Error', 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingExercise(null);
    setFormData({
      name: '',
      category: 'general',
      description: '',
      duration_seconds: '30',
      intensity: 'medium',
      equipment: 'none',
      calories_per_minute: '5'
    });
    setModalVisible(true);
  };

  const openEditModal = (exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name || '',
      category: exercise.category || 'general',
      description: exercise.description || '',
      duration_seconds: String(exercise.duration_seconds || 30),
      intensity: exercise.intensity || 'medium',
      equipment: exercise.equipment || 'none',
      calories_per_minute: String(exercise.calories_per_minute || 5)
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        duration_seconds: parseInt(formData.duration_seconds) || 30,
        intensity: formData.intensity,
        equipment: formData.equipment,
        calories_per_minute: parseInt(formData.calories_per_minute) || 5
      };

      if (editingExercise) {
        await axios.put(`${API_BASE_URL}/api/exercises/${editingExercise.id}`, payload);
        Alert.alert('Success', 'Exercise updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/exercises`, payload);
        Alert.alert('Success', 'Exercise created successfully');
      }

      setModalVisible(false);
      loadExercises();
    } catch (error) {
      console.error('Error saving exercise:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to save exercise');
    }
  };

  const handleDelete = (exercise) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/api/exercises/${exercise.id}`);
              Alert.alert('Success', 'Exercise deleted successfully');
              loadExercises();
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert('Error', 'Failed to delete exercise');
            }
          }
        }
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
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises found</Text>
            <Text style={styles.emptySubtext}>Tap "+ Add Exercise" to create one</Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.badgeContainer}>
                  <Text style={[styles.badge, styles.categoryBadge]}>{exercise.category}</Text>
                  <Text style={[styles.badge, styles.intensityBadge]}>{exercise.intensity}</Text>
                </View>
              </View>
              {exercise.description && (
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              )}
              <View style={styles.exerciseDetails}>
                <Text style={styles.detailText}>Duration: {exercise.duration_seconds}s</Text>
                <Text style={styles.detailText}>Equipment: {exercise.equipment}</Text>
                <Text style={styles.detailText}>{exercise.calories_per_minute} cal/min</Text>
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
              {editingExercise ? 'Edit Exercise' : 'Add Exercise'}
            </Text>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Exercise name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.optionButton,
                        formData.category === cat && styles.optionButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, category: cat })}
                    >
                      <Text style={[
                        styles.optionText,
                        formData.category === cat && styles.optionTextActive
                      ]}>
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
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Exercise description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Duration (seconds)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.duration_seconds}
                  onChangeText={(text) => setFormData({ ...formData, duration_seconds: text })}
                  keyboardType="numeric"
                  placeholder="30"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Intensity</Text>
                <View style={styles.optionsRow}>
                  {intensities.map((int) => (
                    <TouchableOpacity
                      key={int}
                      style={[
                        styles.optionButton,
                        formData.intensity === int && styles.optionButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, intensity: int })}
                    >
                      <Text style={[
                        styles.optionText,
                        formData.intensity === int && styles.optionTextActive
                      ]}>
                        {int.charAt(0).toUpperCase() + int.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Equipment</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
                  {equipmentOptions.map((eq) => (
                    <TouchableOpacity
                      key={eq}
                      style={[
                        styles.optionButton,
                        formData.equipment === eq && styles.optionButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, equipment: eq })}
                    >
                      <Text style={[
                        styles.optionText,
                        formData.equipment === eq && styles.optionTextActive
                      ]}>
                        {eq === 'none' ? 'None' : eq.charAt(0).toUpperCase() + eq.slice(1).replace('-', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Calories per Minute</Text>
                <TextInput
                  style={styles.input}
                  value={formData.calories_per_minute}
                  onChangeText={(text) => setFormData({ ...formData, calories_per_minute: text })}
                  keyboardType="numeric"
                  placeholder="5"
                />
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 0,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
  },
  intensityBadge: {
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    marginVertical: 5,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  optionButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExercisesScreen;



