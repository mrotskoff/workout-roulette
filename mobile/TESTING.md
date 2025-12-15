# Testing Guide

This document explains how to run tests for the Workout Roulette mobile app.

## Running Tests

### Run all tests:

```bash
cd mobile
npm test
```

### Run tests in watch mode (auto-rerun on file changes):

```bash
npm run test:watch
```

### Run a specific test file:

```bash
npm test -- src/services/__tests__/workoutGenerator.test.js
```

## Test Coverage

The test suite includes comprehensive tests for the workout generator, specifically verifying:

### Rest Time Calculation Tests

- ✅ Rest time is included in total workout time
- ✅ Workout does not exceed target time when rest is included
- ✅ Zero rest time is handled correctly
- ✅ No rest time is added after the last exercise
- ✅ Workout respects time constraints with various rest times
- ✅ Large rest times are handled correctly
- ✅ Edge cases (very short workouts, single exercise workouts)

### Workout Structure Tests

- ✅ Workout includes correct `restTimeSeconds` property

## Test Structure

Tests are located in:

- `src/services/__tests__/workoutGenerator.test.js` - Tests for workout generation logic

## Key Test Scenarios

### Example Test Case

```javascript
// Test: Rest time is included in total time
const totalTimeSeconds = 300; // 5 minutes
const exerciseDuration = 60; // 60 seconds per exercise
const restTimeSeconds = 10; // 10 seconds rest between exercises

// Expected: For N exercises, total time = (N × exerciseDuration) + ((N-1) × restTimeSeconds)
// Example: 4 exercises = (4 × 60) + (3 × 10) = 240 + 30 = 270 seconds
```

## Continuous Verification

These tests ensure that:

1. Rest time between exercises is correctly accounted for in workout generation
2. The total workout time never exceeds the user's specified target
3. The last exercise doesn't have rest time after it
4. Edge cases are handled gracefully

Run `npm test` after making changes to the workout generator to ensure rest time calculations remain correct.
