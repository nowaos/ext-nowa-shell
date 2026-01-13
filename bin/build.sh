#!/usr/bin/env bash

set -e

# Move to project root (script lives in /bin)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Extract UUID from metadata.json
UUID=$(sed -n 's/.*"uuid"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' metadata.json)

if [ -z "$UUID" ]; then
  echo "Error: UUID not found in metadata.json"
  exit 1
fi

ZIP_NAME="$UUID.zip"
BUILD_DIR="$(mktemp -d)"
EXT_DIR="$BUILD_DIR/$UUID"

echo "Building extension for UUID: $UUID"

# Copy project to temp directory
cp -r . "$EXT_DIR"

# Remove unwanted files and directories
rm -rf \
  "$EXT_DIR/.git" \
  "$EXT_DIR/.editorconfig" \
  "$EXT_DIR/.gitignore" \
  "$EXT_DIR/AUTHORS" \
  "$EXT_DIR/README.md" \
  "$EXT_DIR/bin" \
  "$EXT_DIR/build" \
  "$EXT_DIR/previews" \
  "$EXT_DIR"/*.zip

# Create zip with correct folder structure
cd "$BUILD_DIR"
zip -r "$PROJECT_ROOT/build/$ZIP_NAME" . > /dev/null

# Cleanup
rm -rf "$BUILD_DIR"

echo "Build complete: $ZIP_NAME"
