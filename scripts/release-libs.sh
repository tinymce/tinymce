#!/usr/bin/env bash

# Enable strict mode
set -euo pipefail

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
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Script directory and project root
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
readonly CHANGES_DIR="$PROJECT_ROOT/.changes/unreleased"
# Packages excluded from lerna entirely (different release process)
readonly EXCLUDED_PACKAGES=("tinymce" "oxide-components")
# Packages that skip changie but are still versioned by lerna
readonly SKIP_CHANGIE_PACKAGES=("oxide" "oxide-icons-default")

# Flags
DRY_RUN=false

# ============================================================================
# Helper Functions for Colored Output
# ============================================================================

# Print error message to stderr
print_error() {
    echo -e "${RED}$*${NC}" >&2
}

# Print success message
print_success() {
    echo -e "${GREEN}$*${NC}"
}

# Print warning message
print_warning() {
    echo -e "${YELLOW}$*${NC}"
}

# Print info message
print_info() {
    echo -e "${BLUE}$*${NC}"
}

# Print separator line
print_separator() {
    local char="${1:-━}"
    local color="${2:-$BLUE}"
    echo -e "${color}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${NC}"
}

# Usage function
usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Preview version updates and run lerna version with automatic changelog generation.

OPTIONS:
    -h, --help              Show this help message
    -n, --dry-run           Preview what would happen without making changes

EXAMPLES:
    # Interactive version update with changelog generation (typical workflow)
    $(basename "$0")

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
        *)
            print_error "Error: Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# ============================================================================
# Package Helper Functions
# ============================================================================

# Check if package should be excluded from processing
# Args:
#   $1 - Package name
# Returns:
#   0 if excluded, 1 otherwise
is_excluded() {
    local package="$1"
    local excluded

    for excluded in "${EXCLUDED_PACKAGES[@]}"; do
        if [[ "$package" == "$excluded"* ]]; then
            return 0
        fi
    done
    return 1
}

# Extract package name from scoped package
# Examples: @ephox/katamari -> katamari, @tinymce/foo -> foo
# Assumes packages are scoped as @ephox/* or @tinymce/*
# Used for accessing files in modules/ directory
# Args:
#   $1 - Scoped package name
# Output:
#   Unscoped package name
extract_package_name() {
    local scoped_name="$1"
    # Remove @ephox/ or @tinymce/ prefix
    echo "$scoped_name" | sed 's/@[^/]*\///'
}

# Get all packages from lerna (excludes private packages automatically)
# Returns full scoped package names (e.g., @ephox/katamari, @tinymce/whatever)
# Output:
#   Sorted list of full scoped package names, one per line
# Exits:
#   1 if lerna command fails
get_all_packages() {
    local -a packages=()
    local line pkg_dir
    local lerna_output lerna_stderr lerna_exit_code

    # Capture lerna output and errors
    lerna_stderr=$(mktemp)
    lerna_output=$(npx lerna list --loglevel=error 2>"$lerna_stderr")
    lerna_exit_code=$?
    if [ "$lerna_exit_code" -ne 0 ]; then
        print_error "Error: Failed to run 'npx lerna list' (exit code: $lerna_exit_code)"
        if [[ -s "$lerna_stderr" ]]; then
            print_error "Lerna error output:"
            cat "$lerna_stderr" >&2
        fi
        rm -f "$lerna_stderr"
        exit 1
    fi
    rm -f "$lerna_stderr"

    # Parse lerna output (excludes private packages automatically)
    while IFS= read -r line; do
        # Skip empty lines and noise from package managers
        if [[ -z "$line" ]] || \
           [[ "$line" == "yarn"* ]] || \
           [[ "$line" == "npm"* ]] || \
           [[ "$line" == "lerna"* ]] || \
           [[ "$line" == "Done"* ]] || \
           [[ "$line" == "\$"* ]]; then
            continue
        fi

        pkg_dir=$(extract_package_name "$line")
        # Skip if excluded from processing
        if ! is_excluded "$pkg_dir"; then
            packages+=("$line")
        fi
    done <<< "$lerna_output"

    # Sort and deduplicate packages
    printf '%s\n' "${packages[@]}" | sort -u
}

# Check if package has unreleased changes
# Args:
#   $1 - Full scoped package name (e.g., @ephox/katamari)
# Returns:
#   0 if changes exist, 1 otherwise
has_changes() {
    local scoped_name="$1"
    local package
    local file

    package=$(extract_package_name "$scoped_name")

    # Check for any YAML change fragments for this package
    for file in "$CHANGES_DIR"/"${package}"-*.yaml; do
        if [[ -f "$file" ]]; then
            return 0
        fi
    done
    return 1
}

# Get current version from package.json
# Args:
#   $1 - Full scoped package name (e.g., @ephox/katamari)
# Output:
#   Current version or "unknown" if package.json not found
get_current_version() {
    local scoped_name="$1"
    local package package_json

    package=$(extract_package_name "$scoped_name")
    package_json="$PROJECT_ROOT/modules/$package/package.json"

    if [[ ! -f "$package_json" ]]; then
        echo "unknown"
        return 1
    fi

    jq -r '.version' "$package_json" 2>/dev/null || echo "unknown"
}

# Get next version using changie auto-calculation
# Args:
#   $1 - Full scoped package name (e.g., @ephox/katamari)
# Output:
#   Next version based on change fragments
# Returns:
#   0 on success, 1 on error
get_next_version() {
    local scoped_name="$1"
    local package next_version

    package=$(extract_package_name "$scoped_name")

    # Run changie to calculate next version from change fragments
    next_version=$(cd "$PROJECT_ROOT" && \
        changie next auto --project "$package" 2>/dev/null | \
        tr -d '%' | \
        sed "s/^${package}//")

    if [[ -z "$next_version" ]]; then
        echo "error"
        return 1
    fi

    echo "$next_version"
}

# Calculate next patch version by incrementing patch number
# Used for packages without changes to maintain synchronized releases
# Args:
#   $1 - Current version (e.g., 1.2.3)
# Output:
#   Next patch version (e.g., 1.2.4) or "error" if invalid
# Returns:
#   0 on success, 1 if version format is invalid
get_next_patch_version() {
    local current_version="$1"
    local major minor patch next_patch

    # Parse semantic version (major.minor.patch)
    if [[ $current_version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
        major="${BASH_REMATCH[1]}"
        minor="${BASH_REMATCH[2]}"
        patch="${BASH_REMATCH[3]}"
        next_patch=$((patch + 1))
        echo "${major}.${minor}.${next_patch}"
        return 0
    else
        echo "error"
        return 1
    fi
}

# Count change fragments for a package
# Args:
#   $1 - Full scoped package name (e.g., @ephox/katamari)
# Output:
#   Number of YAML change fragments found
count_changes() {
    local scoped_name="$1"
    local package count

    package=$(extract_package_name "$scoped_name")
    count=0

    # Count YAML files matching pattern: {package}-*.yaml
    for file in "$CHANGES_DIR"/"${package}"-*.yaml; do
        if [[ -f "$file" ]]; then
            count=$((count + 1))
        fi
    done

    echo "$count"
}

# ============================================================================
# Prerequisite Checks
# ============================================================================

# Check for required tools and configuration
# Exits with error if any prerequisites are missing
check_prerequisites() {
    local -a missing=()
    local tool hook_script package_json

    # Check for required command-line tools
    command -v changie >/dev/null 2>&1 || missing+=("changie")
    command -v jq >/dev/null 2>&1 || missing+=("jq")
    command -v npx >/dev/null 2>&1 || missing+=("npx/node")

    if [[ ${#missing[@]} -gt 0 ]]; then
        print_error "Error: Missing required tools: ${missing[*]}"
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
        print_error "Error: .changie.yaml not found in project root"
        print_warning "Changie needs to be configured before running this script."
        exit 1
    fi

    # Verify lerna lifecycle hook is configured
    hook_script="$PROJECT_ROOT/scripts/lerna-changie-hook.sh"
    if [[ ! -f "$hook_script" ]]; then
        print_error "Error: Lerna changelog hook not found: $hook_script"
        exit 1
    fi

    if [[ ! -x "$hook_script" ]]; then
        print_error "Error: Lerna changelog hook is not executable: $hook_script"
        print_warning "Run: chmod +x $hook_script"
        exit 1
    fi

    # Verify package.json has version script configured
    package_json="$PROJECT_ROOT/package.json"
    if ! grep -q '"version".*lerna-changie-hook.sh' "$package_json" 2>/dev/null; then
        print_error "Error: package.json is missing the version lifecycle script"
        print_warning "Add this to the scripts section of package.json:"
        print_info '    "version": "./scripts/lerna-changie-hook.sh"'
        exit 1
    fi
}

# ============================================================================
# Main Function
# ============================================================================

main() {
    local -a all_packages packages package_list current_versions next_versions change_counts has_changes_flags
    local current_version change_count suggested_version has_changes_flag next_version
    local package i pkg pkg_dir kinds issues file kind issue
    local -a lerna_args
    local lerna_exit_code

    # Change to project root directory
    cd "$PROJECT_ROOT" || {
        print_error "Error: Cannot change to project root: $PROJECT_ROOT"
        exit 1
    }

    # Check prerequisites before starting
    check_prerequisites

    # Print header
    print_success "╔════════════════════════════════════════════════════════════════╗"
    print_success "║  Library Release Automation                                   ║"
    print_success "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    if [[ "$DRY_RUN" == true ]]; then
        print_warning "🔍 DRY-RUN MODE: Previewing changes only"
        echo ""
    fi

    # Get packages from lerna (source of truth for valid, public packages)
    print_info "📦 Scanning packages from lerna..."
    all_packages=()
    while IFS= read -r line; do
        all_packages+=("$line")
    done < <(get_all_packages)

    if [[ ${#all_packages[@]} -eq 0 ]]; then
        print_warning "No packages found."
        exit 0
    fi

    packages=("${all_packages[@]}")
    print_success "Found ${#packages[@]} package(s):"
    echo ""

    # Collect version information for all packages
    package_list=()
    current_versions=()
    next_versions=()
    change_counts=()
    has_changes_flags=()

    for package in "${packages[@]}"; do
        current_version=$(get_current_version "$package")
        change_count=$(count_changes "$package")

        # Determine next version:
        # - Packages WITH changes: Use changie to auto-calculate from change types
        # - Packages WITHOUT changes: Bump patch version to keep synchronized releases
        if has_changes "$package"; then
            if ! suggested_version=$(get_next_version "$package"); then
                print_error "Error: Failed to determine next version for $package"
                exit 1
            fi
            has_changes_flag="yes"
        else
            # No changes - use patch bump to keep packages in sync
            if ! suggested_version=$(get_next_patch_version "$current_version"); then
                print_error "Error: Failed to calculate patch version for $package"
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

    # Display summary table
    print_info "┌──────────────────────┬──────────────┬──────────────┬──────────┐"
    print_info "│ Package              │ Current Ver  │ Suggested    │ Changes  │"
    print_info "├──────────────────────┼──────────────┼──────────────┼──────────┤"

    for i in "${!package_list[@]}"; do
        printf "${BLUE}│${NC} %-20s ${BLUE}│${NC} %-12s ${BLUE}│${NC} %-12s ${BLUE}│${NC} %-8s ${BLUE}│${NC}\n" \
            "${package_list[$i]}" \
            "${current_versions[$i]}" \
            "${next_versions[$i]}" \
            "${change_counts[$i]}"
    done

    print_info "└──────────────────────┴──────────────┴──────────────┴──────────┘"
    echo ""

    # Show detailed change breakdown
    print_info "Change Summary:"
    for i in "${!package_list[@]}"; do
        pkg="${package_list[$i]}"
        pkg_dir=$(extract_package_name "$pkg")
        kinds=""
        issues=""

        # Extract change kinds and related issues from YAML fragments
        for file in "$CHANGES_DIR"/"${pkg_dir}"-*.yaml; do
            if [[ -f "$file" ]]; then
                kind=$(grep '^kind:' "$file" | sed 's/kind: *//')
                issue=$( (grep '^[[:space:]]*Issue:' "$file" || true) | sed 's/.*Issue: *//')

                if [[ -n "$kind" ]]; then
                    [[ -n "$kinds" ]] && kinds+=", "
                    kinds+="$kind"
                fi
                if [[ -n "$issue" ]]; then
                    [[ -n "$issues" ]] && issues+=", "
                    issues+="#$issue"
                fi
            fi
        done

        # Display package changes
        if [[ -n "$kinds" ]]; then
            print_success "  $pkg: $kinds"
            if [[ -n "$issues" ]]; then
                echo "    Issues: $issues"
            fi
        else
            print_success "  $pkg: No changes (will use patch bump)"
        fi
    done
    echo ""

    print_warning "Note: Suggested versions are from changie. You'll be prompted by lerna to select actual versions."
    echo ""

    # Exit early if dry-run mode
    if [[ "$DRY_RUN" == true ]]; then
        print_warning "Dry-run complete. Run without --dry-run to proceed."
        exit 0
    fi

    # Confirm before proceeding with actual release
    print_separator "━" "$YELLOW"
    print_warning "Ready to run lerna version"
    print_separator "━" "$YELLOW"
    echo ""
    print_info "Lerna will:"
    echo "  1. Prompt you to select versions for each package"
    echo "  2. Update all package.json files and interdependencies"
    print_success "  3. Automatically generate changelogs (via version lifecycle hook)"
    print_success "  4. Merge changelogs into CHANGELOG.md files"
    echo "  5. Create a git commit with all changes"
    echo "  6. Create git tags for each package"
    echo ""
    print_info "Use the suggested versions above as guidance."
    print_info "You can cancel at any time by pressing Ctrl+C."
    echo ""

    # Get user confirmation
    read -p "Continue? (y/n) " -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Cancelled by user."
        exit 0
    fi

    # Build lerna command (--no-push to allow review before pushing)
    lerna_args=("npx" "lerna" "version" "--no-push")

    echo ""
    print_separator "━" "$GREEN"
    print_success "Running lerna version"
    print_separator "━" "$GREEN"
    echo ""

    # Run lerna version (interactive)
    # The version lifecycle hook will automatically generate and merge changelogs
    set +e
    "${lerna_args[@]}"
    lerna_exit_code=$?
    set -e

    # Handle lerna failure or cancellation
    if [[ $lerna_exit_code -ne 0 ]]; then
        echo ""
        print_separator "━" "$RED"
        print_error "Error: lerna version failed or was cancelled"
        print_separator "━" "$RED"
        echo ""
        print_warning "Operation cancelled. Check 'git status' to see if any changes were made."
        print_warning "To undo: git reset --hard HEAD~1 && git tag -d <tags>"
        exit 1
    fi

    echo ""

    # Display success summary
    print_success "╔════════════════════════════════════════════════════════════════╗"
    print_success "║  Summary                                                       ║"
    print_success "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    print_success "✓ Release completed successfully"
    print_success "  ${#packages[@]} package(s) released"
    echo ""
    print_info "What was done:"
    echo "  ✓ Lerna updated package.json versions and interdependencies"
    echo "  ✓ Changelogs generated from change fragments"
    echo "  ✓ Changelogs merged into CHANGELOG.md files"
    echo "  ✓ Git commit created with all changes"
    echo "  ✓ Git tags created for each package"
    echo ""
    print_info "Next steps:"
    print_warning "  1. Review the changes: git show HEAD"
    echo "  2. Build and test to verify everything works"
    print_warning "  3. Push changes: git push --follow-tags"
    echo ""
    print_info "If you need to undo (before pushing):"
    echo "  # Remove the commit but keep changes in working directory:"
    print_warning "  git reset --soft HEAD~1"
    echo ""
    echo "  # Remove the commit AND discard all changes:"
    print_warning "  git reset --hard HEAD~1"
    echo ""
    echo "  # Reset all local tags to match remote (removes local-only tags):"
    print_warning "  git tag -l | xargs git tag -d && git fetch --tags"
    echo ""
    echo "  # Or delete specific package tags:"
    print_warning "  git tag -l | grep -E '@(ephox|tinymce)/' | xargs git tag -d"
    echo ""
    echo "  # Or delete individual tags:"
    print_warning "  git tag -d @ephox/katamari@1.2.3 @ephox/agar@2.3.4"
    echo ""
}

# Run main function
main
