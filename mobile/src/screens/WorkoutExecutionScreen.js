import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Vibration,
  BackHandler,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { Asset } from "expo-asset";

const WorkoutExecutionScreen = ({ route, navigation }) => {
  const { workout } = route.params;
  const insets = useSafeAreaInsets();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const intervalRef = useRef(null);
  const restIntervalRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pingSound = useRef(null);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const restTimeSeconds = workout.restTimeSeconds || 0;
  const exerciseDurationSeconds = workout.exerciseDurationSeconds || 60;

  // Load ping sound on mount
  useEffect(() => {
    const loadSound = async () => {
      try {
        // Try to load the asset first
        let audioUri;
        try {
          const asset = Asset.fromModule(require("../assets/ping.mp3"));
          await asset.downloadAsync();
          audioUri = asset.localUri || asset.uri;
        } catch (assetError) {
          console.log("Asset loading error, trying direct require:", assetError);
          // Fallback to direct require
          audioUri = require("../assets/ping.mp3");
        }

        const { sound } = await Audio.Sound.createAsync(
          audioUri,
          { shouldPlay: false, volume: 1.0 }
        );
        pingSound.current = sound;
        console.log("Ping sound loaded successfully");
      } catch (error) {
        console.error(
          "Could not load ping sound, will use vibration fallback:",
          error.message || error
        );
        console.error("Error details:", error);
      }
    };
    loadSound();

    return () => {
      if (pingSound.current) {
        pingSound.current.unloadAsync().catch((err) => {
          console.log("Error unloading sound:", err);
        });
      }
    };
  }, []);

  // Play ping sound - audio with vibration fallback
  const playPing = async () => {
    try {
      if (pingSound.current) {
        await pingSound.current.replayAsync();
      } else {
        // Fallback to vibration if audio not loaded
        Vibration.vibrate(100);
      }
    } catch (error) {
      // Fallback to vibration on error
      Vibration.vibrate(100);
    }
  };

  useEffect(() => {
    if (currentExercise && !isComplete) {
      setTimeRemaining(exerciseDurationSeconds);
      // Auto-start first exercise when workout starts
      if (
        workoutStarted &&
        currentExerciseIndex === 0 &&
        !isRunning &&
        !isResting
      ) {
        setIsRunning(true);
      }
    }
  }, [currentExerciseIndex, currentExercise, isComplete, workoutStarted]);

  // Exercise timer
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0 && !isResting) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          // Play ping for last 5 seconds
          if (newTime > 0 && newTime <= 5) {
            playPing();
          }
          if (newTime <= 0) {
            handleExerciseComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeRemaining, isResting]);

  // Rest timer
  useEffect(() => {
    if (isResting && restTimeRemaining > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimeRemaining((prev) => {
          const newTime = prev - 1;
          // Play ping for last 5 seconds
          if (newTime > 0 && newTime <= 5) {
            playPing();
          }
          if (newTime <= 0) {
            handleRestComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    }

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [isResting, restTimeRemaining]);

  useEffect(() => {
    if (
      (isRunning && timeRemaining > 0) ||
      (isResting && restTimeRemaining > 0)
    ) {
      // Pulse animation when timer is running
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [isRunning, timeRemaining, isResting, restTimeRemaining]);

  const handleExerciseComplete = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      // Start rest period if configured
      if (restTimeSeconds > 0) {
        setIsResting(true);
        setRestTimeRemaining(restTimeSeconds);
        setIsRunning(false);
        setIsPaused(false);
      } else {
        // Move directly to next exercise
        setTimeout(() => {
          setCurrentExerciseIndex((prev) => prev + 1);
          setIsRunning(false);
          setIsPaused(false);
        }, 500);
      }
    } else {
      // Workout complete
      setIsComplete(true);
      setIsRunning(false);
      Alert.alert(
        "Workout Complete!",
        `Great job! You completed ${totalExercises} exercises.`,
        [
          {
            text: "View Summary",
            onPress: () => navigation.navigate("Workout", { workout }),
          },
          {
            text: "New Workout",
            onPress: () => navigation.navigate("Home"),
            style: "default",
          },
        ]
      );
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    setRestTimeRemaining(0);
    // Automatically move to next exercise and start it
    setCurrentExerciseIndex((prev) => prev + 1);
    // Auto-start the next exercise after a brief delay
    setTimeout(() => {
      setIsRunning(true);
      setIsPaused(false);
    }, 500);
  };

  const cancelWorkout = () => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel this workout?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            // Clear all intervals
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            if (restIntervalRef.current) {
              clearInterval(restIntervalRef.current);
            }
            navigation.navigate("Home");
          },
        },
      ]
    );
  };

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (isRunning || isResting) {
        cancelWorkout();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isRunning, isResting]);

  const startWorkout = () => {
    setWorkoutStarted(true);
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseWorkout = () => {
    setIsPaused(true);
  };

  const resumeWorkout = () => {
    setIsPaused(false);
  };

  const skipExercise = () => {
    Alert.alert("Skip Exercise", `Skip "${currentExercise.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Skip",
        style: "destructive",
        onPress: () => {
          if (currentExerciseIndex < totalExercises - 1) {
            // Skip to next exercise, but still show rest if configured
            if (restTimeSeconds > 0) {
              setIsResting(true);
              setRestTimeRemaining(restTimeSeconds);
            } else {
              setCurrentExerciseIndex((prev) => prev + 1);
            }
            setIsRunning(false);
            setIsPaused(false);
          } else {
            handleExerciseComplete();
          }
        },
      },
    ]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((currentExerciseIndex + 1) / totalExercises) * 100;

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeTitle}>🎉 Workout Complete!</Text>
          <Text style={styles.completeSubtitle}>
            You finished {totalExercises} exercises
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>Create New Workout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Exercise {currentExerciseIndex + 1} of {totalExercises}
        </Text>
      </View>

      {/* Start Workout Button - Only show at the very beginning */}
      {!workoutStarted && currentExerciseIndex === 0 ? (
        <View style={styles.startWorkoutContainer}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <Text style={styles.exerciseCategory}>
              {currentExercise.category.charAt(0).toUpperCase() +
                currentExercise.category.slice(1)}
            </Text>
            {currentExercise.description && (
              <Text style={styles.exerciseDescription}>
                {currentExercise.description}
              </Text>
            )}
            <View style={styles.exerciseTags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {currentExercise.equipment || "None"}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.startWorkoutButton,
              { marginBottom: Math.max(30, insets.bottom + 10) },
            ]}
            onPress={startWorkout}
          >
            <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.workoutContent}>
          {/* Exercise Info - Compressed at top */}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <Text style={styles.exerciseCategory}>
              {currentExercise.category.charAt(0).toUpperCase() +
                currentExercise.category.slice(1)}
            </Text>
            {currentExercise.description && (
              <Text
                style={styles.exerciseDescription}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {currentExercise.description}
              </Text>
            )}
            <View style={styles.exerciseTags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {currentExercise.equipment || "None"}
                </Text>
              </View>
            </View>
          </View>

          {/* Rest Screen */}
          {isResting ? (
            <View style={styles.restContainer}>
              <View style={styles.restHeader}>
                <Text style={styles.restTitle}>Rest Time</Text>
              </View>
              <View style={styles.restTimerContainer}>
                <Animated.View
                  style={[
                    styles.timerCircle,
                    { opacity: fadeAnim, backgroundColor: "#FF9800" },
                  ]}
                >
                  <Text style={styles.timerText}>
                    {formatTime(restTimeRemaining)}
                  </Text>
                  <Text style={styles.timerLabel}>Time Remaining</Text>
                </Animated.View>
              </View>
              <View style={styles.restFooter}>
                <Text style={styles.restSubtitle}>
                  Next exercise starting automatically...
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Timer - Centered in middle */}
              <View style={styles.timerContainer}>
                <Animated.View
                  style={[styles.timerCircle, { opacity: fadeAnim }]}
                >
                  <Text style={styles.timerText}>
                    {formatTime(timeRemaining)}
                  </Text>
                  <Text style={styles.timerLabel}>Time Remaining</Text>
                </Animated.View>
              </View>

              {/* Controls - Fixed at bottom */}
              <View
                style={[
                  styles.controls,
                  { paddingBottom: Math.max(20, insets.bottom + 10) },
                ]}
              >
                {isPaused ? (
                  <TouchableOpacity
                    style={styles.resumeButton}
                    onPress={resumeWorkout}
                  >
                    <Text style={styles.resumeButtonText}>Resume</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.pauseButton}
                      onPress={pauseWorkout}
                    >
                      <Text style={styles.pauseButtonText}>Pause</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={skipExercise}
                    >
                      <Text style={styles.skipButtonText}>Skip</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  workoutContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  cancelContainer: {
    padding: 15,
    paddingTop: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  startWorkoutContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 40,
  },
  startWorkoutButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginTop: 30,
  },
  startWorkoutButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  exerciseInfo: {
    padding: 15,
    paddingTop: 10,
    paddingBottom: 5,
    alignItems: "center",
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  exerciseCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    textTransform: "capitalize",
  },
  exerciseDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
    paddingHorizontal: 20,
    maxHeight: 40,
  },
  exerciseTags: {
    flexDirection: "row",
    gap: 10,
  },
  tag: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: "#1976d2",
    textTransform: "capitalize",
  },
  timerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timerText: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  timerLabel: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#f5f5f5",
  },
  startButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  pauseButton: {
    backgroundColor: "#FF9800",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  pauseButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  resumeButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  resumeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  skipButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f44336",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#f44336",
    fontSize: 16,
    fontWeight: "600",
  },
  restContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  restHeader: {
    flex: 0,
    paddingTop: 20,
    alignItems: "center",
  },
  restTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF9800",
    textAlign: "center",
  },
  restTimerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 250,
  },
  restFooter: {
    flex: 0,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  restSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  completeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  completeTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  completeSubtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    padding: 18,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WorkoutExecutionScreen;
