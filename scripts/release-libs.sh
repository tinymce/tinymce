#!/usr/bin/env bash

set -e

# ============================================================================
# OVERVIEW:
#   This script coordinates changelog generation (via changie) and version
#   updates (via lerna) for all public library packages in the monorepo.
#
# PREREQUISITES:
#   - changie (changelog management): https://changie.dev
#   - lerna (monorepo management): https://lerna.js.org
#   - jq (JSON processing)
#   - npx (Node package executor)
#
# TYPICAL WORKFLOWS:
#   Pre-release:  ./release-libs.sh --batch --version
#   Release day:  ./release-libs.sh --merge
#   Full release: ./release-libs.sh --batch --merge --version --yes
#
# EXCLUDED PACKAGES:
#   tinymce, oxide, oxide-components, oxide-icons-default
#   These follow a different release process and are managed separately.
#
# RECOVERY:
#   If the script fails partway through:
#   1. Check git status to see what was changed
#   2. Either: git reset --hard to start over, or
#   3. Re-run with --changed to process remaining packages
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
CHANGES_DIR="$PROJECT_ROOT/.changes/unreleased"
EXCLUDED_PACKAGES=("tinymce" "oxide" "oxide-components" "oxide-icons-default")

# Flags
DRY_RUN=false
YES=false
INTERACTIVE_VERSIONS=false
BATCH_CHANGELOG=false
MERGE_CHANGELOG=false
UPDATE_VERSIONS=false
CHANGED_ONLY=false

# Usage function
usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Automate changelog generation and versioning for library packages.

OPTIONS:
    -h, --help              Show this help message
    -n, --dry-run           Preview changes without applying them
    -y, --yes               Skip confirmation prompts
    -i, --interactive       Prompt to confirm/override each version
    --batch                 Batch changelog fragments into versioned files
                            (Use during development - does NOT set release date)
    --merge                 Merge changelog into CHANGELOG.md and set release date
                            (Use on actual release day only)
    --version               Update package versions with Lerna
    --changed               Only release packages with changes
                            (Default: all packages get at least a patch bump for synchronized releases)

EXAMPLES:
    # Preview what would be changed (dry-run)
    $(basename "$0") --dry-run --batch --version

    # Batch changelogs only (all packages)
    $(basename "$0") --batch

    # Batch and version (typical pre-release workflow - all packages)
    $(basename "$0") --batch --version

    # Batch and version with custom version prompts
    $(basename "$0") --batch --version --interactive

    # Merge changelogs on release day (sets dates)
    $(basename "$0") --merge

    # Full release workflow without prompts (all packages)
    $(basename "$0") --batch --merge --version --yes

    # Only release packages with changes
    $(basename "$0") --changed --batch --version

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -y|--yes)
            YES=true
            shift
            ;;
        -i|--interactive)
            INTERACTIVE_VERSIONS=true
            shift
            ;;
        --batch)
            BATCH_CHANGELOG=true
            shift
            ;;
        --merge)
            MERGE_CHANGELOG=true
            shift
            ;;
        --version)
            UPDATE_VERSIONS=true
            shift
            ;;
        --changed)
            CHANGED_ONLY=true
            shift
            ;;
        *)
            echo -e "${RED}Error: Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Helper function to check if package should be excluded
is_excluded() {
    local package=$1
    for excluded in "${EXCLUDED_PACKAGES[@]}"; do
        if [[ "$package" == "$excluded"* ]]; then
            return 0
        fi
    done
    return 1
}

# Extract package name from scoped package (e.g., @ephox/katamari -> katamari)
# Assumes packages are scoped as @ephox/* or @tinymce/*
extract_package_name() {
    local scoped_name=$1
    # Remove @ephox/ or @tinymce/ prefix
    echo "$scoped_name" | sed 's/@[^/]*\///'
}

# Get all packages from lerna (excludes private packages automatically)
get_all_packages() {
    local packages=()

    # Get lerna list output (excludes private packages)
    while IFS= read -r line; do
        # Skip empty lines, package manager messages, and lerna metadata
        if [[ -n "$line" ]] && \
           [[ "$line" != "yarn"* ]] && \
           [[ "$line" != "npm"* ]] && \
           [[ "$line" != "lerna"* ]] && \
           [[ "$line" != "Done"* ]] && \
           [[ "$line" != "\$"* ]]; then
            local pkg_name=$(extract_package_name "$line")
            # Skip if excluded
            if ! is_excluded "$pkg_name"; then
                packages+=("$pkg_name")
            fi
        fi
    done < <(npx lerna list --loglevel=error 2>/dev/null || true)

    # Sort packages
    printf '%s\n' "${packages[@]}" | sort -u
}

# Check if package has unreleased changes
has_changes() {
    local package=$1
    for file in "$CHANGES_DIR"/"$package"-*.yaml; do
        if [[ -f "$file" ]]; then
            return 0
        fi
    done
    return 1
}

# Get current version from package.json
get_current_version() {
    local package=$1
    local package_json="$PROJECT_ROOT/modules/$package/package.json"

    if [[ ! -f "$package_json" ]]; then
        echo "unknown"
        return
    fi

    jq -r '.version' "$package_json"
}

# Get next version using changie
get_next_version() {
    local package=$1
    local next_version

    next_version=$(cd "$PROJECT_ROOT" && changie next auto --project "$package" 2>/dev/null | tr -d '%' | sed 's/^'$package'//')

    if [[ -z "$next_version" ]]; then
        echo "error"
        return 1
    fi

    echo "$next_version"
}

# Calculate next patch version
get_next_patch_version() {
    local current_version=$1

    # Parse version components
    if [[ $current_version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
        local major="${BASH_REMATCH[1]}"
        local minor="${BASH_REMATCH[2]}"
        local patch="${BASH_REMATCH[3]}"
        local next_patch=$((patch + 1))
        echo "${major}.${minor}.${next_patch}"
    else
        echo "error"
        return 1
    fi
}

# Count change fragments for a package
count_changes() {
    local package=$1
    local count=0

    for file in "$CHANGES_DIR"/"$package"-*.yaml; do
        if [[ -f "$file" ]]; then
            ((count++))
        fi
    done

    echo "$count"
}

# Prompt for version override (interactive versions mode)
prompt_version() {
    local package=$1
    local current_version=$2
    local suggested_version=$3
    local change_count=$4

    # Get change kinds for context
    local kinds=""
    for file in "$CHANGES_DIR"/"$package"-*.yaml; do
        if [[ -f "$file" ]]; then
            local kind=$(grep '^kind:' "$file" | sed 's/kind: *//')
            if [[ -n "$kind" ]]; then
                if [[ -n "$kinds" ]]; then kinds+=", "; fi
                kinds+="$kind"
            fi
        fi
    done

    echo "" >&2
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" >&2
    echo -e "${GREEN}📦 Package: ${YELLOW}$package${NC}" >&2
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" >&2
    echo -e "  Current version:   ${YELLOW}$current_version${NC}" >&2
    echo -e "  Suggested version: ${GREEN}$suggested_version${NC}" >&2
    echo -e "  Changes: $change_count ($kinds)" >&2
    echo "" >&2
    echo -e "  ${BLUE}Press Enter to accept suggested version, or type a different version:${NC}" >&2
    read -p "  Version for $package [$suggested_version]: " version_input

    # Use suggested version if empty input
    if [[ -z "$version_input" ]]; then
        echo "$suggested_version"
    else
        # Basic validation (semantic version format)
        if [[ "$version_input" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$ ]]; then
            echo "$version_input"
        else
            echo -e "${RED}  Invalid version format. Using suggested: $suggested_version${NC}" >&2
            echo "$suggested_version"
        fi
    fi
}

# Batch changelog for a package
# Note: changie batch supports packages with or without changes via --allow-no-changes
batch_changelog() {
    local package=$1
    local version=$2

    echo -e "${BLUE}  → Batching changelog for $package to version $version${NC}"

    if [[ "$DRY_RUN" == true ]]; then
        changie batch "$version" --project "$package" --dry-run
    else
        changie batch "$version" --project "$package"
    fi
}

# Merge changelog into CHANGELOG.md
merge_changelog() {
    local package=$1

    echo -e "${BLUE}  → Merging changelog for $package${NC}"

    if [[ "$DRY_RUN" == false ]]; then
        changie merge --project "$package"
    fi
}

# Update package version with Lerna
update_package_version() {
    local package=$1
    local version=$2

    echo -e "${BLUE}  → Updating package.json for $package to $version${NC}"

    if [[ "$DRY_RUN" == false ]]; then
        # Use lerna version with specific package scope
        # Note: --force-publish updates package.json version, does NOT publish to NPM
        npx lerna version "$version" \
            --no-git-tag-version \
            --no-push \
            --yes \
            --scope "@ephox/$package" \
            --force-publish \
            --loglevel=error
    fi
}

# Check for required tools
check_prerequisites() {
    local missing=()
    command -v changie >/dev/null 2>&1 || missing+=("changie")
    command -v jq >/dev/null 2>&1 || missing+=("jq")
    command -v npx >/dev/null 2>&1 || missing+=("npx/node")

    if [[ ${#missing[@]} -gt 0 ]]; then
        echo -e "${RED}Error: Missing required tools: ${missing[*]}${NC}"
        echo ""
        echo "Please install:"
        for tool in "${missing[@]}"; do
            case $tool in
                changie)
                    echo "  - changie: https://changie.dev/guide/installation/"
                    ;;
                jq)
                    echo "  - jq: brew install jq (or see https://jqlang.github.io/jq/)"
                    ;;
                npx/node)
                    echo "  - Node.js/npx: https://nodejs.org/"
                    ;;
            esac
        done
        exit 1
    fi
}

# Main function
main() {
    cd "$PROJECT_ROOT"

    # Check prerequisites before starting
    check_prerequisites

    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Library Release Automation                                   ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}🔍 DRY-RUN MODE: Previewing changes only${NC}"
        echo ""
    fi

    # Get packages from lerna (source of truth for valid, public packages)
    echo -e "${BLUE}📦 Scanning packages from lerna...${NC}"
    all_packages=()
    while IFS= read -r line; do
        all_packages+=("$line")
    done < <(get_all_packages)

    if [[ ${#all_packages[@]} -eq 0 ]]; then
        echo -e "${YELLOW}No packages found.${NC}"
        exit 0
    fi

    # Filter to only packages with changes if --changed flag is set
    if [[ "$CHANGED_ONLY" == true ]]; then
        echo -e "${BLUE}📦 Filtering to packages with unreleased changes (--changed mode)...${NC}"
        packages=()
        for pkg in "${all_packages[@]}"; do
            if has_changes "$pkg"; then
                packages+=("$pkg")
            fi
        done

        if [[ ${#packages[@]} -eq 0 ]]; then
            echo -e "${YELLOW}No packages with unreleased changes found.${NC}"
            exit 0
        fi

        echo -e "${GREEN}Found ${#packages[@]} package(s) with changes (out of ${#all_packages[@]} total):${NC}"
    else
        packages=("${all_packages[@]}")
        echo -e "${GREEN}Found ${#packages[@]} package(s):${NC}"
    fi
    echo ""

    # Collect version information
    declare -a package_list=()
    declare -a current_versions=()
    declare -a next_versions=()
    declare -a change_counts=()
    declare -a has_changes_flags=()

    for package in "${packages[@]}"; do
        current_version=$(get_current_version "$package")
        change_count=$(count_changes "$package")

        # Determine next version:
        # - Packages WITH changes: Use changie to auto-calculate from change types
        # - Packages WITHOUT changes: Bump patch version to keep synchronized releases
        if has_changes "$package"; then
            if ! suggested_version=$(get_next_version "$package"); then
                echo -e "${RED}Error: Failed to determine next version for $package${NC}"
                exit 1
            fi
            has_changes_flag="yes"
        else
            # No changes - use patch bump
            if ! suggested_version=$(get_next_patch_version "$current_version"); then
                echo -e "${RED}Error: Failed to calculate patch version for $package${NC}"
                exit 1
            fi
            has_changes_flag="no"
            change_count=0
        fi

        # Allow interactive version override if flag is set
        if [[ "$INTERACTIVE_VERSIONS" == true ]]; then
            next_version=$(prompt_version "$package" "$current_version" "$suggested_version" "$change_count")
        else
            next_version="$suggested_version"
        fi

        package_list+=("$package")
        current_versions+=("$current_version")
        next_versions+=("$next_version")
        change_counts+=("$change_count")
        has_changes_flags+=("$has_changes_flag")
    done

    # Clear screen context after interactive prompts for cleaner display
    if [[ "$INTERACTIVE_VERSIONS" == true ]]; then
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
    fi

    # Display table
    echo -e "${BLUE}┌──────────────────────┬──────────────┬──────────────┬──────────┬──────────┐${NC}"
    echo -e "${BLUE}│ Package              │ Current Ver  │ Next Ver     │ Changes  │ Type     │${NC}"
    echo -e "${BLUE}├──────────────────────┼──────────────┼──────────────┼──────────┼──────────┤${NC}"

    for i in "${!package_list[@]}"; do
        local type_label=""
        if [[ "${has_changes_flags[$i]}" == "yes" ]]; then
            type_label="auto"
        else
            type_label="patch"
        fi

        printf "${BLUE}│${NC} %-20s ${BLUE}│${NC} %-12s ${BLUE}│${NC} %-12s ${BLUE}│${NC} %-8s ${BLUE}│${NC} %-8s ${BLUE}│${NC}\n" \
            "${package_list[$i]}" \
            "${current_versions[$i]}" \
            "${next_versions[$i]}" \
            "${change_counts[$i]}" \
            "$type_label"
    done

    echo -e "${BLUE}└──────────────────────┴──────────────┴──────────────┴──────────┴──────────┘${NC}"
    echo ""

    # Show detailed change breakdown
    echo -e "${BLUE}Change Details:${NC}"
    for i in "${!package_list[@]}"; do
        local pkg="${package_list[$i]}"
        local kinds=""
        local issues=""

        # Extract kinds and issues
        for file in "$CHANGES_DIR"/"$pkg"-*.yaml; do
            if [[ -f "$file" ]]; then
                local kind=$(grep '^kind:' "$file" | sed 's/kind: *//')
                local issue=$(grep '^\s*Issue:' "$file" | sed 's/.*Issue: *//')

                if [[ -n "$kind" ]]; then
                    if [[ -n "$kinds" ]]; then kinds+=", "; fi
                    kinds+="$kind"
                fi
                if [[ -n "$issue" ]]; then
                    if [[ -n "$issues" ]]; then issues+=", "; fi
                    issues+="#$issue"
                fi
            fi
        done

        echo -e "  ${GREEN}$pkg${NC}: $kinds"
        if [[ -n "$issues" ]]; then
            echo -e "    Issues: $issues"
        fi
    done
    echo ""

    # Check if any actions are specified
    if [[ "$BATCH_CHANGELOG" == false ]] && [[ "$MERGE_CHANGELOG" == false ]] && [[ "$UPDATE_VERSIONS" == false ]]; then
        echo -e "${YELLOW}⚠️  No actions specified. Use --batch, --merge, or --version flags.${NC}"
        echo ""
        echo "Examples:"
        echo "  $(basename "$0") --batch --version"
        echo "  $(basename "$0") --merge"
        echo ""
        exit 0
    fi

    # Show what will be performed
    echo -e "${BLUE}Actions to perform:${NC}"
    if [[ "$BATCH_CHANGELOG" == true ]]; then
        echo -e "  ✓ Batch changelog fragments"
    fi
    if [[ "$MERGE_CHANGELOG" == true ]]; then
        echo -e "  ✓ Merge changelog (set date)"
    fi
    if [[ "$UPDATE_VERSIONS" == true ]]; then
        echo -e "  ✓ Update package versions"
    fi
    echo ""

    # Confirm if not in yes mode and not dry-run
    if [[ "$YES" == false ]] && [[ "$DRY_RUN" == false ]]; then
        read -p "Continue? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Aborted.${NC}"
            exit 0
        fi
        echo ""
    fi

    # Process each package
    for i in "${!package_list[@]}"; do
        package="${package_list[$i]}"
        current_version="${current_versions[$i]}"
        next_version="${next_versions[$i]}"
        has_changes_flag="${has_changes_flags[$i]}"

        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        if [[ "$has_changes_flag" == "yes" ]]; then
            echo -e "${GREEN}Processing: $package ($current_version → $next_version)${NC}"
        else
            echo -e "${GREEN}Processing: $package ($current_version → $next_version) [patch - no changes]${NC}"
        fi
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        # Batch changelog (if flag is set)
        if [[ "$BATCH_CHANGELOG" == true ]]; then
            batch_changelog "$package" "$next_version"
        fi

        if [[ "$DRY_RUN" == false ]]; then
            # Merge changelog (if flag is set)
            if [[ "$MERGE_CHANGELOG" == true ]]; then
                merge_changelog "$package"
            fi

            # Update package version with Lerna (if flag is set)
            if [[ "$UPDATE_VERSIONS" == true ]]; then
                update_package_version "$package" "$next_version"
            fi
        fi

        echo ""
    done

    # Summary
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Summary                                                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}✓ Dry-run completed successfully${NC}"
        echo -e "${YELLOW}  Run with --execute to apply changes${NC}"
    else
        echo -e "${GREEN}✓ Release preparation completed${NC}"
        echo -e "${GREEN}  ${#packages[@]} package(s) processed${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo -e "  1. Review the changes (git status, git diff)"
        echo -e "  2. Commit the changes: ${YELLOW}git add . && git commit -m 'chore: release libraries'${NC}"
        echo -e "  3. Create tags if needed"
        echo -e "  4. Push changes: ${YELLOW}git push${NC}"
    fi
    echo ""
}

# Run main function
main
