#!/bin/bash
# Start backend for mobile app. Ensure phone and computer are on same WiFi.
cd "$(dirname "$0")"
echo "Starting backend at http://0.0.0.0:3000"
echo "Mobile app API URL: http://$(hostname -I 2>/dev/null | awk '{print $1}'):3000"
echo "Run: npm run dev"
npm run dev
