# AI Knowledge Base — Flutter Mobile App

Flutter mobile app for the AI Knowledge Base. Connects to the Express backend API.

## Prerequisites

- Flutter SDK
- Java JDK 17+ (for Android build): `sudo apt install openjdk-17-jdk`
- Backend running at `http://localhost:3000`

## Setup

1. Ensure the backend is running at `http://localhost:3000` (or your machine's IP).

2. Install dependencies:
   ```bash
   cd mobile_app
   flutter pub get
   ```

3. **API URL**:
   - **Android Emulator**: Default `http://10.0.2.2:3000` (10.0.2.2 = host machine)
   - **Physical Device**: Use your computer's IP:
     ```bash
     flutter run --dart-define=API_BASE_URL=http://192.168.1.X:3000
     ```
     Replace `192.168.1.X` with your machine's IP (run `ip addr` or `ifconfig` to find it).

## Run

```bash
# List connected devices
flutter devices

# On Android emulator (default API: 10.0.2.2:3000)
flutter run

# On physical device — use your machine's IP (run `ip addr` or `hostname -I` to find it)
flutter run -d <device_id> --dart-define=API_BASE_URL=http://192.168.x.x:3000

# Example for device R5CT718DEGP with backend at 192.168.0.105
flutter run -d R5CT718DEGP --dart-define=API_BASE_URL=http://192.168.0.105:3000
```

## Features

- **Auth**: Login, Register, Logout
- **Documents**: List, upload (PDF, DOCX, TXT, MD), view detail with summary
- **Chat**: Create conversations, send messages, receive AI replies (Ollama/Gemini)
