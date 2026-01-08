#!/bin/bash
# recompile-schema.sh
# Simple script to recompile GNOME extension schemas
# This script is located in my-extension/bin/
# It will compile the schemas located in my-extension/schemas/

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Go one level up (my-extension/) and then into schemas/
SCHEMA_DIR="$SCRIPT_DIR/../schemas"

echo "Recompiling schemas in $SCHEMA_DIR..."
glib-compile-schemas "$SCHEMA_DIR"
echo "Done!"
