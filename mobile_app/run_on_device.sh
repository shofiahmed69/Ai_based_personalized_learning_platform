#!/bin/bash
# Run AI Knowledge Base app on connected ADB device
set -e

cd "$(dirname "$0")"

# Get machine IP for API (physical device needs this)
IP=$(ip -4 addr show 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '^127\.' | head -1)
API_URL="http://${IP:-192.168.0.105}:3000"

# List devices
echo "Connected devices:"
adb devices

# Run
echo ""
echo "Starting app... (API: $API_URL)"
echo "Ensure backend is running: cd .. && npm run dev"
echo ""

flutter run -d android --dart-define=API_BASE_URL=$API_URL
