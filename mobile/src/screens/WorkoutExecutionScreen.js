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
import { useAudioPlayer } from "expo-audio";
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
  const [pingSoundUri, setPingSoundUri] = useState(null);

  // Create audio player - hook must always be called
  const pingPlayer = useAudioPlayer(pingSoundUri || "");

  const currentExercise = workout.exercises[currentExerciseIndex];
  const nextExercise = workout.exercises[currentExerciseIndex + 1];
  const totalExercises = workout.exercises.length;
  const restTimeSeconds = workout.restTimeSeconds || 0;
  const exerciseDurationSeconds = workout.exerciseDurationSeconds || 60;

  // Load ping sound URI on mount
  useEffect(() => {
    const loadSound = async () => {
      try {
        // Load asset using expo-asset for proper handling
        const asset = Asset.fromModule(require("../../assets/ping.mp3"));
        await asset.downloadAsync();

        const uri = asset.localUri || asset.uri;
        setPingSoundUri(uri);
        console.log("Ping sound loaded successfully, URI:", uri);
      } catch (error) {
        console.error(
          "Could not load ping sound, will use vibration fallback:",
          error.message || error
        );
        console.error("Error stack:", error.stack);
        // Will fallback to vibration in playPing function
      }
    };
    loadSound();
  }, []);

  // Update player source when URI becomes available
  useEffect(() => {
    if (pingSoundUri && pingPlayer) {
      // The useAudioPlayer hook should automatically update when the source changes,
      // but we can try to ensure it's ready by checking if replace method exists
      if (pingPlayer.replace && typeof pingPlayer.replace === "function") {
        try {
          pingPlayer.replace(pingSoundUri);
        } catch (error) {
          console.error("Error updating audio player source:", error);
        }
      }
    }
  }, [pingSoundUri, pingPlayer]);

  // Play ping sound - audio with vibration fallback
  const playPing = async () => {
    try {
      if (pingPlayer && pingSoundUri) {
        // Ensure we're at the beginning and play
        try {
          // Reset to beginning
          if (pingPlayer.seekTo) {
            pingPlayer.seekTo(0);
          }

          // Try to play
          if (pingPlayer.playing) {
            // If already playing, use replay
            if (pingPlayer.replay) {
              pingPlayer.replay();
            } else {
              pingPlayer.seekTo(0);
              pingPlayer.play();
            }
          } else {
            // Not playing, just play
            pingPlayer.play();
          }
        } catch (playError) {
          console.error("Error in play() call:", playError);
          throw playError;
        }
      } else {
        // Fallback to vibration if audio not loaded
        console.log("Ping sound not available, using vibration", {
          hasPlayer: !!pingPlayer,
          hasUri: !!pingSoundUri,
        });
        Vibration.vibrate(100);
      }
    } catch (error) {
      // Fallback to vibration on error
      console.error("Error playing ping sound:", error);
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
          {isResting ? (
            <View style={styles.restScreenContainer}>
              {/* Timer */}
              <View style={styles.timerContainer}>
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

              {/* Next Exercise Info */}
              {nextExercise && (
                <View style={styles.restNextExercise}>
                  <Text style={styles.restNextLabel}>Next Exercise</Text>
                  <Text style={styles.restNextExerciseName}>
                    {nextExercise.name}
                  </Text>
                  <Text style={styles.restNextExerciseCategory}>
                    {nextExercise.category.charAt(0).toUpperCase() +
                      nextExercise.category.slice(1)}
                  </Text>
                  {nextExercise.description && (
                    <Text
                      style={styles.restNextExerciseDescription}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {nextExercise.description}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.exerciseScreenContainer}>
              {/* Timer */}
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

              {/* Exercise Info */}
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
              </View>

              {/* Controls */}
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
            </View>
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: "100%",
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
  exerciseScreenContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  restScreenContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10,
  },
  timerContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
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
    paddingVertical: 10,
    paddingTop: 10,
    paddingHorizontal: 0,
    backgroundColor: "#f5f5f5",
    width: "100%",
  },
  controlsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
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
    width: "100%",
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
    padding: 20,
    alignItems: "center",
    width: "100%",
  },
  skipButtonText: {
    color: "#f44336",
    fontSize: 16,
    fontWeight: "600",
  },
  restHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  restTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF9800",
    textAlign: "center",
  },
  restNextExercise: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
    justifyContent: "center",
  },
  restNextLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  restNextExerciseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  restNextExerciseCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    textTransform: "capitalize",
  },
  restNextExerciseDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  restNextExerciseTags: {
    flexDirection: "row",
    gap: 10,
  },
  restTag: {
    backgroundColor: "#fff3e0",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  restTagText: {
    fontSize: 14,
    color: "#FF9800",
    textTransform: "capitalize",
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
