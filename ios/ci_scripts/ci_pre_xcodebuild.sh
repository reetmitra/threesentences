#!/bin/sh
set -e

# Xcode Cloud pre-build: install CocoaPods dependencies.
# Runs before every build action in the workflow.

echo "--- Installing CocoaPods dependencies ---"

# Xcode Cloud sets CI_WORKSPACE_PATH to the directory containing the .xcworkspace.
# We need to run `pod install` from the ios/ directory.
cd "$CI_WORKSPACE_PATH/.."

brew install cocoapods 2>/dev/null || true
pod install
