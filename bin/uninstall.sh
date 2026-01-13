#!/bin/bash

EXTENSION_UUID="nowa-shell@nowaos"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"

echo "======================================"
echo "Nowa Shell - Uninstall"
echo "======================================"
echo ""

if [ ! -d "$EXTENSION_DIR" ]; then
  echo "✓ Extension is not installed"
  exit 0
fi

echo "✓ Disabling extension..."
gnome-extensions disable "$EXTENSION_UUID" 2>/dev/null || true

echo "✓ Removing extension files..."
rm -rf "$EXTENSION_DIR"

echo ""
echo "======================================"
echo "Uninstall complete!"
echo "======================================"
echo ""

if [ "$XDG_SESSION_TYPE" = "wayland" ]; then
  echo "You are using Wayland:"
  echo "Please LOGOUT and LOGIN again for changes to take effect."
else
  echo "You are using X11:"
  echo "Please restart GNOME Shell (Alt+F2, type 'r', press Enter)"
fi

echo ""
