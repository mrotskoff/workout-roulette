import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';

const WorkoutScreen = ({ route, navigation }) => {
  const { workout } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Workout</Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{workout.totalTimeMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{workout.exerciseCount}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>
      </View>

      <View style={styles.exercisesContainer}>
        {workout.exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseNumber}>{exercise.order}</Text>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseCategory}>{exercise.category}</Text>
              </View>
            </View>
            {exercise.description && (
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
            )}
            <View style={styles.exerciseTags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{exercise.equipment || 'none'}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('WorkoutExecution', { workout })}
      >
        <Text style={styles.startButtonText}>Let's Go!</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.newWorkoutButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.newWorkoutButtonText}>Create New Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  exercisesContainer: {
    padding: 15,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    width: 40,
    textAlign: 'center',
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  exerciseDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
    textTransform: 'capitalize',
  },
  startButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 18,
    margin: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  newWorkoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    margin: 15,
    marginTop: 0,
    alignItems: 'center',
  },
  newWorkoutButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutScreen;

