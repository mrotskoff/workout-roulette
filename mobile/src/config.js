// Update this to match your backend server URL
// For local development, use your computer's IP address
// For Android emulator: http://10.0.2.2:3000
// For iOS simulator: http://localhost:3000
// For physical device: http://YOUR_IP_ADDRESS:3000
//
// To find your computer's IP address:
// - Windows: Run `ipconfig` and look for IPv4 Address
// - Mac/Linux: Run `ifconfig` or `ip addr` and look for your local network IP

// Set your computer's local IP address here (for physical devices)
// Leave as null to use localhost (works for simulators/emulators only)
const LOCAL_IP = '192.168.0.117'; // Update this with your computer's IP if it changes

export const API_BASE_URL = __DEV__ 
  ? (LOCAL_IP ? `http://${LOCAL_IP}:3000` : 'http://localhost:3000')
  : 'https://your-production-api.com';

