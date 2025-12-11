import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const WorkoutHistoryScreen = ({ navigation }) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/workouts?limit=20`);
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No workout history yet</Text>
          <Text style={styles.emptySubtext}>Generate your first workout to see it here!</Text>
        </View>
      ) : (
        workouts.map((workout) => {
          const exercises = typeof workout.exercises === 'string' 
            ? JSON.parse(workout.exercises) 
            : workout.exercises;
          const totalMinutes = Math.round(workout.total_time_seconds / 60);

          return (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutDate}>
                  {new Date(workout.created_at).toLocaleDateString()}
                </Text>
                <Text style={styles.workoutTime}>
                  {new Date(workout.created_at).toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.workoutStats}>
                <Text style={styles.workoutStat}>
                  {totalMinutes} min • {exercises.length} exercises • {workout.intensity}
                </Text>
              </View>
              <View style={styles.workoutTags}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{workout.intensity}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{workout.equipment || 'none'}</Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 15,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  workoutTime: {
    fontSize: 14,
    color: '#666',
  },
  workoutStats: {
    marginBottom: 10,
  },
  workoutStat: {
    fontSize: 14,
    color: '#666',
  },
  workoutTags: {
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
});

export default WorkoutHistoryScreen;

