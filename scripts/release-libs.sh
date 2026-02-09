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
EXCLUDED_PACKAGES=("tinymce")

# Flags
DRY_RUN=false
MERGE_CHANGELOG=false
CHANGED_ONLY=false

# Usage function
usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Automate changelog generation and versioning for library packages.

OPTIONS:
    -h, --help              Show this help message
    -n, --dry-run           Preview what would happen without making changes
    --merge                 Merge changelog into CHANGELOG.md and set release date
                            (Use on actual release day only)
    --changed               Only show changed packages (filters lerna version scope)
                            (Default: lerna will prompt for all packages)

EXAMPLES:
    # Interactive version update and changelog generation (typical workflow)
    $(basename "$0")

    # Include changelog merge (for release day)
    $(basename "$0") --merge

    # Only process packages with changes
    $(basename "$0") --changed

    # Preview without making changes
    $(basename "$0") --dry-run

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
        --merge)
            MERGE_CHANGELOG=true
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

# Batch changelog for a package with the version that lerna set
batch_changelog() {
    local package=$1
    local version=$2

    echo -e "${BLUE}  → Generating changelog for $package version $version${NC}"

    if [[ "$DRY_RUN" == false ]]; then
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

# Get version that lerna set for a package
get_lerna_version() {
    local package=$1
    local package_json="$PROJECT_ROOT/modules/$package/package.json"

    if [[ ! -f "$package_json" ]]; then
        echo "unknown"
        return 1
    fi

    jq -r '.version' "$package_json"
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

        next_version="$suggested_version"

        package_list+=("$package")
        current_versions+=("$current_version")
        next_versions+=("$next_version")
        change_counts+=("$change_count")
        has_changes_flags+=("$has_changes_flag")
    done

    # Display table
    echo -e "${BLUE}┌──────────────────────┬──────────────┬──────────────┬──────────┐${NC}"
    echo -e "${BLUE}│ Package              │ Current Ver  │ Suggested    │ Changes  │${NC}"
    echo -e "${BLUE}├──────────────────────┼──────────────┼──────────────┼──────────┤${NC}"

    for i in "${!package_list[@]}"; do
        printf "${BLUE}│${NC} %-20s ${BLUE}│${NC} %-12s ${BLUE}│${NC} %-12s ${BLUE}│${NC} %-8s ${BLUE}│${NC}\n" \
            "${package_list[$i]}" \
            "${current_versions[$i]}" \
            "${next_versions[$i]}" \
            "${change_counts[$i]}"
    done

    echo -e "${BLUE}└──────────────────────┴──────────────┴──────────────┴──────────┘${NC}"
    echo ""

    # Show detailed change breakdown
    echo -e "${BLUE}Change Summary:${NC}"
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

        if [[ -n "$kinds" ]]; then
            echo -e "  ${GREEN}$pkg${NC}: $kinds"
            if [[ -n "$issues" ]]; then
                echo -e "    Issues: $issues"
            fi
        else
            echo -e "  ${GREEN}$pkg${NC}: No changes (will use patch bump)"
        fi
    done
    echo ""

    echo -e "${YELLOW}Note: Suggested versions are from changie. You'll be prompted by lerna to select actual versions.${NC}"
    echo ""

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}Dry-run complete. Run without --dry-run to proceed.${NC}"
        exit 0
    fi

    # Prepare lerna version command with scope if --changed was specified
    local lerna_cmd="npx lerna version --no-push --no-changelog"
    if [[ "$CHANGED_ONLY" == true ]]; then
        # Add scope for each package with changes
        for pkg in "${packages[@]}"; do
            lerna_cmd+=" --scope @ephox/$pkg"
        done
    fi

    # Run lerna version interactively
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Running lerna version${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Lerna will now prompt you to select versions for each package.${NC}"
    echo -e "${BLUE}Use the suggested versions above as guidance.${NC}"
    echo -e "${BLUE}You can cancel at any time by pressing Ctrl+C or saying 'N' to lerna's prompts.${NC}"
    echo ""

    read -p "Press Enter to continue with lerna version..."
    echo ""

    # Run lerna version (interactive)
    # Temporarily disable exit-on-error to handle lerna cancellation gracefully
    set +e
    eval "$lerna_cmd"
    lerna_exit_code=$?
    set -e

    if [[ $lerna_exit_code -ne 0 ]]; then
        echo ""
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}Error: lerna version failed or was cancelled${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}Operation cancelled. Check 'git status' to see if any changes were made.${NC}"
        echo -e "${YELLOW}You can undo any changes with: git reset --hard${NC}"
        exit 1
    fi

    echo ""

    # Generate changelogs based on versions lerna set
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Generating changelogs${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Process each package - get version lerna set and generate changelog
    for package in "${packages[@]}"; do
        # Get the version that lerna actually set
        new_version=$(get_lerna_version "$package")

        if [[ "$new_version" == "unknown" ]]; then
            echo -e "${YELLOW}Warning: Could not read version for $package, skipping changelog${NC}"
            continue
        fi

        echo -e "${GREEN}Processing: $package (version: $new_version)${NC}"

        # Batch changelog with the version lerna set
        batch_changelog "$package" "$new_version"

        # Merge changelog (if flag is set)
        if [[ "$MERGE_CHANGELOG" == true ]]; then
            merge_changelog "$package"
        fi

        echo ""
    done

    # Summary
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Summary                                                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✓ Release preparation completed${NC}"
    echo -e "${GREEN}  ${#packages[@]} package(s) processed${NC}"
    echo ""
    echo -e "${BLUE}What was done:${NC}"
    echo -e "  ✓ Lerna updated package.json versions and interdependencies"
    echo -e "  ✓ Changelogs generated from change fragments"
    if [[ "$MERGE_CHANGELOG" == true ]]; then
        echo -e "  ✓ Changelogs merged into CHANGELOG.md files"
    fi
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Review the changes (git status, git diff)"
    echo -e "  2. Build and test to verify everything works"
    if [[ "$MERGE_CHANGELOG" == false ]]; then
        echo -e "  3. Run with --merge when ready to finalize changelogs"
    fi
    echo -e "  3. Lerna has already created the commit and tags"
    echo -e "  4. Push changes: ${YELLOW}git push --follow-tags${NC}"
    echo ""
}

# Run main function
main
