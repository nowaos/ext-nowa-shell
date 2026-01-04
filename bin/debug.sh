#!/bin/bash

# Nowa Shell - Debug

EXTENSION_UUID="nowa-shell@nowaos"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "======================================"
echo "Nowa Shell - Debugger"
echo "======================================"
echo ""

# Check if extension is installed
if [ -d "$EXTENSION_DIR" ]; then
  echo -e "${GREEN}✓ Extension directory exists${NC}"
else
  echo "✗ Extension directory NOT found"
  exit 1
fi

# Check if enabled
if gnome-extensions list --enabled | grep -q "$EXTENSION_UUID"; then
  echo -e "${GREEN}✓ Extension is ENABLED${NC}"
else
  echo "✗ Extension is DISABLED"
  echo "  Run: gnome-extensions enable $EXTENSION_UUID"
  exit 1
fi

echo ""
echo "======================================"
echo "Live Logs (Ctrl+C to stop):"
echo "======================================"
echo ""
echo "Looking for 'Nowa Shell' messages..."
echo ""

journalctl -f -o cat /usr/bin/gnome-shell 2>/dev/null | grep --line-buffered "Nowa Shell"
