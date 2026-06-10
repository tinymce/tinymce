#!/usr/bin/env bash

set -euo pipefail

# ============================================================================
# UPDATE PRIVATE PACKAGE DEPENDENCY RANGES
#
# Called by lerna-libs-version-hook.sh during the lerna version lifecycle,
# after lerna has updated all public package.json versions but before the
# git commit is created.
#
# Scans all private packages in modules/ and updates any dependency ranges
# that no longer satisfy the newly bumped public package versions.
# Only updates ranges that are actually broken (new version outside range).
#
# Can also be run standalone for manual recovery without a full release.
#
# PREREQUISITES:
#   - jq (JSON processing)
#   - node with semver available in node_modules
# ============================================================================

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

print_error()   { echo -e "${RED}$*${NC}" >&2; }
print_success() { echo -e "${GREEN}$*${NC}"; }
print_warning() { echo -e "${YELLOW}$*${NC}"; }
print_info()    { echo -e "${BLUE}$*${NC}"; }

# ============================================================================
# Prerequisite Checks
# ============================================================================

check_prerequisites() {
    local missing=()
    command -v jq   >/dev/null 2>&1 || missing+=("jq")
    command -v node >/dev/null 2>&1 || missing+=("node")
    if [[ ${#missing[@]} -gt 0 ]]; then
        print_error "Error: Missing required tools: ${missing[*]}"
        exit 1
    fi
    if ! node -e "require('semver')" >/dev/null 2>&1; then
        print_error "Error: 'semver' package not found in node_modules"
        print_error "Run 'yarn install' to install dependencies"
        exit 1
    fi
}

# ============================================================================
# Package Helper Functions
# ============================================================================

# Returns the current version of a public (non-private) workspace package.
# Args:
#   $1 - package name (e.g. "@ephox/agar")
# Output: version string (e.g. "10.0.0")
# Returns: 0 if found as a public package, 1 otherwise
get_public_package_version() {
    local dep_name="$1"
    local pkg_json is_private name

    for pkg_json in "$PROJECT_ROOT"/modules/*/package.json; do
        [[ -f "$pkg_json" ]] || continue
        is_private=$(jq -r '.private // false' "$pkg_json")
        [[ "$is_private" == "true" ]] && continue
        name=$(jq -r '.name' "$pkg_json")
        if [[ "$name" == "$dep_name" ]]; then
            jq -r '.version' "$pkg_json"
            return 0
        fi
    done
    return 1
}

# Returns 0 if at least one public (non-private) package exists in modules/
has_public_packages() {
    local pkg_json is_private
    for pkg_json in "$PROJECT_ROOT"/modules/*/package.json; do
        [[ -f "$pkg_json" ]] || continue
        is_private=$(jq -r '.private // false' "$pkg_json")
        [[ "$is_private" != "true" ]] && return 0
    done
    return 1
}

# Returns 0 if version satisfies the semver range, 1 otherwise
# Args:
#   $1 - version (e.g. "10.0.0")
#   $2 - semver range (e.g. "^9.0.0")
satisfies_range() {
    local version="$1" range="$2"
    node -e "process.exit(require('semver').satisfies('$version', '$range') ? 0 : 1)" 2>/dev/null
}

# Extracts the non-numeric prefix from a semver range (e.g. "^" from "^9.0.0")
# Args:
#   $1 - range string
# Output: prefix character(s), or empty string for exact versions
extract_prefix() {
    local range="$1"
    local i char prefix=""
    for (( i=0; i<${#range}; i++ )); do
        char="${range:$i:1}"
        [[ "$char" =~ [0-9] ]] && break
        prefix+="$char"
    done
    echo "$prefix"
}

# Extracts the major version number from a semver version string
# Handles pre-release versions (e.g. "10.0.0-beta.1" -> "10")
# Args:
#   $1 - version string
# Output: major version number
extract_major() {
    node -e "console.log(require('semver').major('$1'))" 2>/dev/null
}

# ============================================================================
# Core Logic
# ============================================================================

# Checks and updates broken dependency ranges in a single package.json.
# Only updates ranges where the new public package version does not satisfy
# the existing range. Stages the file with git add if any changes are made.
# Args:
#   $1 - absolute path to package.json
# Returns: 0 on success, 1 on any error
update_package_deps() {
    local pkg_json="$1"
    local dep_field dep new_version current_range prefix new_major new_range
    local modified=false tmp

    for dep_field in dependencies devDependencies; do
        local deps
        deps=$(jq -r ".${dep_field} // {} | keys[]" "$pkg_json" 2>/dev/null) || continue

        while IFS= read -r dep; do
            [[ -z "$dep" ]] && continue

            # Skip if this dep is not a lerna-managed public workspace package
            if ! new_version=$(get_public_package_version "$dep"); then
                continue
            fi

            current_range=$(jq -r ".${dep_field}[\"$dep\"]" "$pkg_json")
            [[ "$current_range" == "null" || -z "$current_range" ]] && continue

            # Skip if the new version already satisfies the existing range
            if satisfies_range "$new_version" "$current_range"; then
                continue
            fi

            # Range is broken -- compute updated range preserving the prefix
            prefix=$(extract_prefix "$current_range")
            new_major=$(extract_major "$new_version")

            if [[ -z "$new_major" ]]; then
                print_error "Error: Could not extract major version from '$new_version' for dep '$dep'"
                return 1
            fi

            new_range="${prefix}${new_major}.0.0"
            print_success "    $dep: $current_range → $new_range"

            tmp=$(mktemp)
            if ! jq ".${dep_field}[\"$dep\"] = \"$new_range\"" "$pkg_json" > "$tmp"; then
                rm -f "$tmp"
                print_error "Error: jq failed to update '$dep' in $dep_field"
                return 1
            fi
            mv "$tmp" "$pkg_json"
            modified=true

        done <<< "$deps"
    done

    if [[ "$modified" == true ]]; then
        if ! git add "$pkg_json"; then
            print_error "Error: Failed to stage $(basename "$(dirname "$pkg_json")")/package.json"
            return 1
        fi
        print_info "    Staged: $(basename "$(dirname "$pkg_json")")/package.json"
    fi
}

# ============================================================================
# Main
# ============================================================================

main() {
    cd "$PROJECT_ROOT" || exit 1

    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_info "Updating Private Package Dependency Ranges"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    check_prerequisites

    if ! has_public_packages; then
        print_error "Error: No public packages found in modules/"
        exit 1
    fi

    local found_private=false
    local pkg_json is_private pkg_name

    for pkg_json in "$PROJECT_ROOT"/modules/*/package.json; do
        [[ -f "$pkg_json" ]] || continue
        is_private=$(jq -r '.private // false' "$pkg_json")
        [[ "$is_private" != "true" ]] && continue

        found_private=true
        pkg_name=$(jq -r '.name' "$pkg_json")
        print_info "Checking: $pkg_name"

        if ! update_package_deps "$pkg_json"; then
            exit 1
        fi

        echo ""
    done

    if [[ "$found_private" == false ]]; then
        print_warning "No private packages found -- nothing to update"
        exit 0
    fi

    print_success "✓ Private package dependency ranges up to date"
    echo ""
}

main
