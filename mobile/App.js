import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import WorkoutHistoryScreen from './src/screens/WorkoutHistoryScreen';
import ExercisesScreen from './src/screens/ExercisesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Workout Roulette' }}
        />
        <Stack.Screen 
          name="Workout" 
          component={WorkoutScreen}
          options={{ title: 'Your Workout' }}
        />
        <Stack.Screen 
          name="History" 
          component={WorkoutHistoryScreen}
          options={{ title: 'Workout History' }}
        />
        <Stack.Screen 
          name="Exercises" 
          component={ExercisesScreen}
          options={{ title: 'Exercise Database' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

