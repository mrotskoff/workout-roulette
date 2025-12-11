# Workout Roulette

A mobile fitness app that generates randomized workouts based on user preferences. Users can select workout duration, intensity level, and available equipment, and the app will create a customized workout from a categorized exercise database.

## Features

- **Workout Generation**: Create randomized workouts based on time, intensity, and equipment preferences
- **Exercise Database**: Categorized exercises with details (duration, calories, equipment requirements)
- **Admin Interface**: Web-based admin panel to add, edit, and manage exercises
- **Workout History**: Save and view previously generated workouts
- **Mobile App**: React Native app for iOS and Android

## Project Structure

```
workout-roulette/
├── server/              # Backend API (Node.js/Express)
│   ├── index.js        # Main server file
│   ├── database.js     # Database setup and initialization
│   ├── routes/         # API routes
│   └── services/       # Business logic (workout generator)
├── mobile/             # React Native mobile app
│   ├── src/
│   │   ├── screens/    # App screens
│   │   └── config.js   # API configuration
│   └── App.js          # Main app component
└── admin/              # React web admin interface
    └── src/
        └── components/ # Admin components
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- For mobile development: Expo CLI and React Native setup
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### 1. Install Root Dependencies

```bash
npm install
```

### 2. Backend Setup

The backend server uses SQLite for simplicity. No additional database setup is required.

```bash
# Start the backend server
npm run dev

# Or in production mode
npm start
```

The server will run on `http://localhost:3000` by default.

The database will be automatically created with sample exercises on first run.

### 3. Mobile App Setup

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

**Important**: Update `mobile/src/config.js` with your backend server URL:
- For Android emulator: `http://10.0.2.2:3000`
- For iOS simulator: `http://localhost:3000`
- For physical device: `http://YOUR_IP_ADDRESS:3000` (replace with your computer's IP)

### 4. Admin Interface Setup

```bash
cd admin
npm install

# Start the admin interface
npm start
```

The admin interface will run on `http://localhost:3001` (or next available port).

## API Endpoints

### Exercises

- `GET /api/exercises` - Get all exercises (with optional filters: category, intensity, equipment)
- `GET /api/exercises/:id` - Get exercise by ID
- `POST /api/exercises` - Create new exercise
- `PUT /api/exercises/:id` - Update exercise
- `DELETE /api/exercises/:id` - Delete exercise
- `GET /api/exercises/meta/categories` - Get all categories

### Workouts

- `POST /api/workouts/generate` - Generate a new workout
  - Body: `{ totalTimeMinutes, intensity, equipment, categories? }`
- `POST /api/workouts` - Save a workout
- `GET /api/workouts` - Get workout history
- `GET /api/workouts/:id` - Get workout by ID

## Usage

### Generating a Workout

1. Open the mobile app
2. Select your preferences:
   - Total workout time (in minutes)
   - Intensity level (low, medium, high)
   - Available equipment (none, dumbbells, resistance-bands, etc.)
3. Tap "Generate Workout"
4. Review your randomized workout
5. Optionally save it to history

### Managing Exercises (Admin)

1. Open the admin interface in your browser
2. View all exercises with filtering options
3. Click "Add New Exercise" to create exercises
4. Click the edit icon (✏️) to modify existing exercises
5. Click the delete icon (🗑️) to remove exercises

## Exercise Categories

- **Cardio**: Cardiovascular exercises
- **Strength**: Strength training exercises
- **Flexibility**: Stretching and flexibility work
- **Core**: Core strengthening exercises
- **Balance**: Balance and stability exercises
- **General**: General exercises

## Intensity Levels

- **Low**: Light intensity, suitable for beginners
- **Medium**: Moderate intensity
- **High**: High intensity, challenging workouts

## Equipment Options

- **none**: No equipment required
- **dumbbells**: Requires dumbbells
- **resistance-bands**: Requires resistance bands
- **kettlebell**: Requires kettlebell
- **barbell**: Requires barbell
- **yoga-mat**: Requires yoga mat

## Development

### Adding New Features

- Backend logic: Add routes in `server/routes/` and services in `server/services/`
- Mobile screens: Add new screens in `mobile/src/screens/` and update navigation in `App.js`
- Admin features: Add components in `admin/src/components/`

### Database

The app uses SQLite for simplicity. To use a different database (PostgreSQL, MongoDB, etc.), modify `server/database.js` accordingly.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

