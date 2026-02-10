#!/usr/bin/env bash

set -e

# ============================================================================
# OVERVIEW:
#   This script provides a preview of suggested version updates for library
#   packages, then runs lerna version which automatically generates changelogs
#   via the version lifecycle hook.
#
# PREREQUISITES:
#   - changie (changelog management): https://changie.dev
#   - lerna (monorepo management): https://lerna.js.org
#   - jq (JSON processing)
#   - npx (Node package executor)
#
# TYPICAL WORKFLOWS:
#   Interactive:  ./release-libs.sh
#   Changed only: ./release-libs.sh --changed
#   Dry run:      ./release-libs.sh --dry-run
#
# HOW IT WORKS:
#   1. Script scans packages and shows version suggestions
#   2. User confirms to proceed
#   3. Script runs `npx lerna version`
#   4. Lerna version lifecycle hook automatically:
#      - Generates changelogs from change fragments
#      - Merges changelogs into CHANGELOG.md files
#      - Commits everything (package.json + changelogs) with tags
#
# EXCLUDED PACKAGES:
#   tinymce, oxide-components - Fully excluded (different release process)
#   oxide, oxide-icons-default - Versioned by lerna but skip changie
#
# RECOVERY:
#   If lerna fails partway through:
#   1. Check git status to see what was committed
#   2. Use: git reset --hard HEAD~1 to undo the commit
#   3. Use: git tag -d <tag> to remove any tags created
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
# Packages excluded from lerna entirely (different release process)
EXCLUDED_PACKAGES=("tinymce" "oxide-components")
# Packages that skip changie but are still versioned by lerna
SKIP_CHANGIE_PACKAGES=("oxide" "oxide-icons-default")

# Flags
DRY_RUN=false
CHANGED_ONLY=false

# Usage function
usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Preview version updates and run lerna version with automatic changelog generation.

OPTIONS:
    -h, --help              Show this help message
    -n, --dry-run           Preview what would happen without making changes
    --changed               Only show changed packages (filters lerna version scope)
                            (Default: lerna will prompt for all packages)

EXAMPLES:
    # Interactive version update with changelog generation (typical workflow)
    $(basename "$0")

    # Only process packages with changes
    $(basename "$0") --changed

    # Preview without making changes
    $(basename "$0") --dry-run

NOTE:
    Changelogs are automatically generated and merged during lerna version
    via the version lifecycle hook. No separate merge step is needed.

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

    # Verify changie configuration exists
    if [[ ! -f "$PROJECT_ROOT/.changie.yaml" ]]; then
        echo -e "${RED}Error: .changie.yaml not found in project root${NC}"
        echo -e "${YELLOW}Changie needs to be configured before running this script.${NC}"
        exit 1
    fi

    # Verify lerna lifecycle hook is configured
    local hook_script="$PROJECT_ROOT/scripts/lerna-changie-hook.sh"
    if [[ ! -f "$hook_script" ]]; then
        echo -e "${RED}Error: Lerna changelog hook not found: $hook_script${NC}"
        exit 1
    fi

    if [[ ! -x "$hook_script" ]]; then
        echo -e "${RED}Error: Lerna changelog hook is not executable: $hook_script${NC}"
        echo -e "${YELLOW}Run: chmod +x $hook_script${NC}"
        exit 1
    fi

    # Verify package.json has version script configured
    local package_json="$PROJECT_ROOT/package.json"
    if ! grep -q '"version".*lerna-changie-hook.sh' "$package_json" 2>/dev/null; then
        echo -e "${RED}Error: package.json is missing the version lifecycle script${NC}"
        echo -e "${YELLOW}Add this to the scripts section of package.json:${NC}"
        echo -e '${BLUE}    "version": "./scripts/lerna-changie-hook.sh"${NC}'
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

    # Confirm before proceeding
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Ready to run lerna version${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Lerna will:${NC}"
    echo -e "  1. Prompt you to select versions for each package"
    echo -e "  2. Update all package.json files and interdependencies"
    echo -e "  3. ${GREEN}Automatically generate changelogs${NC} (via version lifecycle hook)"
    echo -e "  4. ${GREEN}Merge changelogs into CHANGELOG.md files${NC}"
    echo -e "  5. Create a git commit with all changes"
    echo -e "  6. Create git tags for each package"
    echo ""
    echo -e "${BLUE}Use the suggested versions above as guidance.${NC}"
    echo -e "${BLUE}You can cancel at any time by pressing Ctrl+C.${NC}"
    echo ""

    read -p "Continue? (y/n) " -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Cancelled by user.${NC}"
        exit 0
    fi

    # Build lerna command
    local lerna_cmd="npx lerna version --no-push"
    if [[ "$CHANGED_ONLY" == true ]]; then
        # Add scope for each package with changes
        for pkg in "${packages[@]}"; do
            lerna_cmd+=" --scope @ephox/$pkg"
        done
    fi

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Running lerna version${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Run lerna version (interactive)
    # The version lifecycle hook will automatically generate and merge changelogs
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
        echo -e "${YELLOW}To undo: git reset --hard HEAD~1 && git tag -d <tags>${NC}"
        exit 1
    fi

    echo ""

    # Summary
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Summary                                                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✓ Release completed successfully${NC}"
    echo -e "${GREEN}  ${#packages[@]} package(s) released${NC}"
    echo ""
    echo -e "${BLUE}What was done:${NC}"
    echo -e "  ✓ Lerna updated package.json versions and interdependencies"
    echo -e "  ✓ Changelogs generated from change fragments"
    echo -e "  ✓ Changelogs merged into CHANGELOG.md files"
    echo -e "  ✓ Git commit created with all changes"
    echo -e "  ✓ Git tags created for each package"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Review the changes: ${YELLOW}git show HEAD${NC}"
    echo -e "  2. Build and test to verify everything works"
    echo -e "  3. Push changes: ${YELLOW}git push --follow-tags${NC}"
    echo ""
}

# Run main function
main
