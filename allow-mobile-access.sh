#!/bin/bash
# Allow incoming connections on port 3000 for mobile app access.
# Run: sudo ./allow-mobile-access.sh
if command -v ufw &>/dev/null; then
  sudo ufw allow 3000/tcp
  sudo ufw status
  echo "Port 3000 allowed. If backend still unreachable, ensure phone is on same WiFi."
else
  echo "ufw not found. Check firewall manually or disable to test."
fi
