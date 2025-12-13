import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { API_BASE_URL } from '../config';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const [totalTime, setTotalTime] = useState('30');
  const [intensity, setIntensity] = useState('medium');
  const [equipment, setEquipment] = useState(['none']);
  const [loading, setLoading] = useState(false);

  const generateWorkout = async () => {
    if (!totalTime || parseInt(totalTime) <= 0) {
      Alert.alert('Error', 'Please enter a valid workout time');
      return;
    }

    setLoading(true);
    try {
      // Send equipment array to backend (backend handles both string and array)
      // If empty, default to ['none']
      const equipmentParam = equipment.length === 0 ? ['none'] : equipment;
      
      const response = await axios.post(`${API_BASE_URL}/api/workouts/generate`, {
        totalTimeMinutes: parseInt(totalTime),
        intensity,
        equipment: equipmentParam,
      });

      navigation.navigate('Workout', { workout: response.data });
    } catch (error) {
      console.error('Error generating workout:', error);
      
      // Provide helpful error message for network errors
      let errorMessage = 'Failed to generate workout';
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        errorMessage = `Network Error: Cannot connect to ${API_BASE_URL}\n\n` +
          `Make sure:\n` +
          `1. Backend server is running (npm run dev)\n` +
          `2. Device and computer are on the same network\n` +
          `3. Update LOCAL_IP in mobile/src/config.js if needed`;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Your Workout</Text>
        <Text style={styles.subtitle}>Choose your parameters and let us create a randomized workout for you!</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Total Workout Time (minutes)</Text>
          <TextInput
            style={styles.input}
            value={totalTime}
            onChangeText={setTotalTime}
            keyboardType="numeric"
            placeholder="30"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Intensity</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonGroupContainer}
            style={styles.buttonGroupScroll}
          >
            {['low', 'medium', 'high'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  intensity === level && styles.optionButtonActive
                ]}
                onPress={() => setIntensity(level)}
              >
                <Text style={[
                  styles.optionText,
                  intensity === level && styles.optionTextActive
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Equipment Available</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonGroupContainer}
            style={styles.buttonGroupScroll}
          >
            {['none', 'dumbbells', 'resistance-bands'].map((item) => {
              const isSelected = equipment.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonActive
                  ]}
                  onPress={() => {
                    if (item === 'none') {
                      // Selecting "None" clears all other selections
                      setEquipment(['none']);
                    } else {
                      // Selecting other equipment removes "None" and toggles the item
                      setEquipment(prev => {
                        const withoutNone = prev.filter(e => e !== 'none');
                        if (withoutNone.includes(item)) {
                          // Deselect if already selected
                          const newSelection = withoutNone.filter(e => e !== item);
                          // If nothing selected, default to 'none'
                          return newSelection.length > 0 ? newSelection : ['none'];
                        } else {
                          // Select the item
                          return [...withoutNone, item];
                        }
                      });
                    }
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextActive
                  ]}>
                    {item === 'none' ? 'None' : item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={generateWorkout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate Workout</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.historyButtonText}>View Workout History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exercisesButton}
          onPress={() => navigation.navigate('Exercises')}
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  buttonGroupScroll: {
    marginHorizontal: -4,
  },
  buttonGroupContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
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
  generateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  exercisesButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  exercisesButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;

