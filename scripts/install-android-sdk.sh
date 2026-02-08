#!/bin/bash
# Install Android SDK for Flutter development on Ubuntu
# Run: sudo bash scripts/install-android-sdk.sh

set -e

echo "=== Installing Android SDK components ==="

# Update and install cmdline-tools (includes sdkmanager, build-tools)
apt-get update
apt-get install -y google-android-cmdline-tools-13.0-installer

# Accept licenses (needed for sdkmanager)
yes | sdkmanager --licenses 2>/dev/null || true

# Install platform, build-tools, and NDK via sdkmanager (Flutter requires these)
SDK_ROOT="${ANDROID_SDK_ROOT:-/usr/lib/android-sdk}"
if [ -d "$SDK_ROOT/cmdline-tools" ]; then
  CMDLINE_BIN=$(find "$SDK_ROOT/cmdline-tools" -name sdkmanager -type f 2>/dev/null | head -1)
  if [ -n "$CMDLINE_BIN" ]; then
    echo "Installing SDK 36, BuildTools 28.0.3, and NDK (required by Flutter)..."
    ANDROID_SDK_ROOT="$SDK_ROOT" "$CMDLINE_BIN" "platforms;android-36" "build-tools;28.0.3" "ndk;28.2.13676358" --install
  fi
fi

echo ""
echo "=== Done. Run 'flutter doctor -v' to verify. ==="
