#!/usr/bin/env bash

set -e

# ============================================================================
# LERNA VERSION LIFECYCLE HOOK
#
# This script is called by lerna during the "version" lifecycle step,
# which runs AFTER package.json files are updated but BEFORE git commit.
#
# It generates changelogs using changie based on the new versions that
# lerna has already set in package.json files.
#
# SETUP:
#   This script must be:
#   1. Executable: chmod +x scripts/lerna-changie-hook.sh
#   2. Configured in root package.json:
#      "version": "./scripts/lerna-changie-hook.sh"
#
# Lerna lifecycle order:
# 1. Update all package.json files with new versions
# 2. Run this script (root "version" lifecycle)
# 3. git add all changes
# 4. git commit and tag
# 5. git push (if not --no-push)
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Packages that skip changie but are still versioned by lerna
SKIP_CHANGIE_PACKAGES=("oxide" "oxide-icons-default")

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Lerna Version Hook: Generating Changelogs${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_ROOT"

# Get list of all public packages from lerna
echo -e "${BLUE}Reading updated package versions from lerna...${NC}"
echo ""

# Check if package should skip changie
should_skip_changie() {
    local package=$1
    for skip_pkg in "${SKIP_CHANGIE_PACKAGES[@]}"; do
        if [[ "$package" == "$skip_pkg" ]]; then
            return 0
        fi
    done
    return 1
}

# Get package version from its package.json
get_package_version() {
    local package=$1
    local package_json="$PROJECT_ROOT/modules/$package/package.json"

    if [[ ! -f "$package_json" ]]; then
        echo "unknown"
        return 1
    fi

    # Use jq if available, otherwise grep/sed
    if command -v jq >/dev/null 2>&1; then
        jq -r '.version' "$package_json"
    else
        grep '"version"' "$package_json" | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/'
    fi
}

# Process each package directory
for package_dir in "$PROJECT_ROOT"/modules/*; do
    if [[ ! -d "$package_dir" ]]; then
        continue
    fi

    package=$(basename "$package_dir")

    # Skip if no package.json
    if [[ ! -f "$package_dir/package.json" ]]; then
        continue
    fi

    # Skip private packages
    if grep -q '"private": *true' "$package_dir/package.json" 2>/dev/null; then
        continue
    fi

    version=$(get_package_version "$package")

    if [[ "$version" == "unknown" ]]; then
        continue
    fi

    echo -e "${GREEN}Processing: $package (version: $version)${NC}"

    # Check if this package should skip changie
    if should_skip_changie "$package"; then
        echo -e "${BLUE}  → Skipping changelog (package not configured for changie)${NC}"
        echo ""
        continue
    fi

    # Check if package has unreleased changes
    change_count=0
    for file in "$PROJECT_ROOT/.changes/unreleased"/"$package"-*.yaml; do
        if [[ -f "$file" ]]; then
            ((change_count++))
        fi
    done

    echo -e "${BLUE}  → Generating changelog for $package version $version ($change_count change(s))${NC}"

    # Batch changelog with the version lerna set (even if no changes)
    if ! changie batch "$version" --project "$package"; then
        echo -e "${RED}Error: Failed to generate changelog for $package${NC}"
        exit 1
    fi

    echo ""
done

# Merge all changelogs into CHANGELOG.md files
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Merging Changelogs${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}  → Merging all changelogs${NC}"

if ! changie merge; then
    echo -e "${RED}Error: Failed to merge changelogs${NC}"
    exit 1
fi

echo ""

# Explicitly git add all changelog-related files
# Lerna uses granular pathspec by default (only adds package.json files)
# We need to ensure changie-generated files are included in the commit
echo -e "${BLUE}  → Adding changelog files to git${NC}"

# Add version directories and CHANGELOG.md files
git add .changes/
git add modules/*/CHANGELOG.md 2>/dev/null

echo ""
echo -e "${GREEN}✓ Changelog generation complete${NC}"
echo -e "${GREEN}  Lerna will now commit all changes and create tags${NC}"
echo ""

exit 0
