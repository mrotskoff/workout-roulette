// Update this to match your backend server URL
// For local development, use your computer's IP address
// For Android emulator: http://10.0.2.2:3000
// For iOS simulator: http://localhost:3000
// For physical device: http://YOUR_IP_ADDRESS:3000

export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000'  // Change this to your actual IP for physical devices
  : 'https://your-production-api.com';

