# TechFolio Mobile (Expo)

This folder contains a minimal Expo React Native app that consumes the TechFolio API.

Setup

1. Install Expo CLI (optional but recommended globally):

```bash
npm install -g expo-cli
```

2. Install dependencies:

```bash
cd mobile
npm install
```

3. Start the app:

```bash
npm start
```

Notes
- Default API base is `http://10.0.2.2:5000/api` in `App.js`. On Android emulators use `10.0.2.2` to reach the host machine's `localhost`.
- For a physical device, set `EXPO_PUBLIC_API_BASE` or edit `API_BASE` in `App.js` to point to your machine IP: e.g. `http://192.168.1.100:5000/api`.
- This is a minimal scaffold. To share authentication and feature parity with the web app, port `AuthContext` logic and use secure token storage (e.g., `expo-secure-store`).
