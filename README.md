# Workout Roulette

A mobile fitness app that generates randomized workouts based on user preferences. Users can select workout duration, exercise duration, rest time, and available equipment, and the app will create a customized workout from a categorized exercise database.

## Features

- **Workout Generation**: Create randomized workouts based on time, exercise duration, rest time, and equipment preferences
- **Exercise Database**: Categorized exercises with details (duration, equipment requirements)
- **Workout Execution**: Built-in timer with countdown for each exercise and rest periods
- **Exercise Management**: Add, edit, and delete exercises directly in the app
- **Mobile App**: React Native app for iOS and Android (works completely offline with local SQLite database)

## Project Structure

```
workout-roulette/
└── mobile/             # React Native mobile app (self-contained, no server required)
    ├── src/
    │   ├── screens/    # App screens
    │   ├── database.js # Local SQLite database
    │   └── services/   # Workout generation logic
    └── App.js          # Main app component
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- For mobile development: Expo CLI and React Native setup
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### 1. Mobile App Setup

The mobile app now uses a local SQLite database and works completely offline - **no backend server required!**

```bash
cd mobile
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

**Note**: The app uses a local SQLite database stored on your device. All data (exercises) is stored locally and persists between app sessions. The database is automatically initialized with sample exercises on first launch. **No server or internet connection is required.**

## Usage

### Generating a Workout

1. Open the mobile app
2. Select your preferences:
   - Total workout time (in minutes)
   - Exercise duration (in seconds)
   - Rest time between exercises (in seconds)
   - Available equipment (none, dumbbells, resistance-bands, etc.)
3. Tap "Generate Workout"
4. Review your randomized workout
5. Tap "Let's Go!" to start the workout with built-in timer

### Managing Exercises

1. Tap "Manage Exercises" on the home screen
2. View all exercises with filtering options
3. Tap "Add Exercise" to create new exercises
4. Tap "Edit" to modify existing exercises
5. Tap "Delete" to remove exercises

## Exercise Categories

- **Cardio**: Cardiovascular exercises
- **Strength**: Strength training exercises
- **Flexibility**: Stretching and flexibility work
- **Core**: Core strengthening exercises
- **Balance**: Balance and stability exercises
- **General**: General exercises

## Equipment Options

- **none**: No equipment required
- **dumbbells**: Requires dumbbells
- **resistance-bands**: Requires resistance bands
- **kettlebell**: Requires kettlebell
- **barbell**: Requires barbell
- **yoga-mat**: Requires yoga mat

## Development

### Adding New Features

- Mobile screens: Add new screens in `mobile/src/screens/` and update navigation in `App.js`
- Workout generation: Modify logic in `mobile/src/services/workoutGenerator.js`
- Database: Update schema and operations in `mobile/src/database.js`

### Database

- **Mobile App**: Uses `expo-sqlite` for local SQLite database storage on the device. All data is stored locally and works completely offline. No server connection required.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
