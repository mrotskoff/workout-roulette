import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity, Text, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./src/screens/HomeScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import ExercisesScreen from "./src/screens/ExercisesScreen";
import WorkoutExecutionScreen from "./src/screens/WorkoutExecutionScreen";
import { initDatabase } from "./src/database";

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Initialize database on app start
    console.log("[DEBUG] App mounted, initializing database...");
    initDatabase()
      .then(() => {
        console.log("[DEBUG] Database initialized successfully");
      })
      .catch((error) => {
        console.error("[DEBUG] Failed to initialize database:", error);
        console.error("[DEBUG] Error stack:", error.stack);
        console.error("[DEBUG] Error name:", error.constructor.name);
      });
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Workout Roulette" }}
          />
          <Stack.Screen
            name="Workout"
            component={WorkoutScreen}
            options={{ title: "Your Workout" }}
          />
          <Stack.Screen
            name="Exercises"
            component={ExercisesScreen}
            options={{ title: "Exercise Database" }}
          />
          <Stack.Screen
            name="WorkoutExecution"
            component={WorkoutExecutionScreen}
            options={({ navigation, route }) => ({
              title: "Workout",
              headerShown: true,
              headerTitleAlign: "center",
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Cancel Workout",
                      "Are you sure you want to cancel this workout?",
                      [
                        { text: "No", style: "cancel" },
                        {
                          text: "Yes, Cancel",
                          style: "destructive",
                          onPress: () => navigation.navigate("Home"),
                        },
                      ]
                    );
                  }}
                  style={{ marginLeft: 15 }}
                >
                  <Text style={{ fontSize: 16, color: "#f44336" }}>Cancel</Text>
                </TouchableOpacity>
              ),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
