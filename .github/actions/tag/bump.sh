#!/bin/sh

set -e

CURRENT_VERSION=$(git tag --sort=-v:refname|grep -E '^[0-9]+\.[0-9]+\.[0-9+]' |head -1)
CURRENT_VERSION=${CURRENT_VERSION:-0.0.1}

IFS='.-' read version minor patch extra <<EOF
$CURRENT_VERSION
EOF

if ! echo "$1" | grep -qE '^[0-9]+\.[0-9]+\.[0-9+]|major|minor|patch'; then
    echo La version doit être major, minor, patch, ou une version au format 1.2.3
    exit 1
fi

case "$1" in
    major) NEXT_VERSION="$((version+1)).0.0"; ;;
    minor) NEXT_VERSION="$version.$((minor+1)).0"; ;;
    patch) NEXT_VERSION="$version.$minor.$((patch+1))"; ;;
    *)     NEXT_VERSION="$1" ;;
esac

echo Version précédente : "$CURRENT_VERSION"
echo Nouvelle version : "$NEXT_VERSION"

git tag -a -m "Release $NEXT_VERSION" "$NEXT_VERSION"