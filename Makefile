UNRELEASED_FILES := $(wildcard .changes/unreleased/*)
PROJECTS := $(patsubst .changes/unreleased/%,%,$(UNRELEASED_FILES))
CHANGELOGS := $(addprefix modules/,$(addsuffix /changelog.md,$(PROJECTS)))

VERSION_FILE := versions.txt

extract_first_word = $(firstword $(subst -, ,$1))
get_version = $(shell grep '^$(call extract_first_word,$1)@' $(VERSION_FILE) | cut -d '@' -f 2)

.PHONY: all check_files preview dry_run confirm update_projects update_changelogs

all: check_files

check_files:
	@if [ -z "$(UNRELEASED_FILES)" ]; then \
		echo "No unreleased files found. Exiting..."; \
	else \
		$(MAKE) preview confirm update_changelogs; \
	fi

preview: $(UNRELEASED_FILES)
	@echo "----------------------------------------"
	@echo "Overview of packages to be processed:"
	@echo "----------------------------------------"
	@$(MAKE) $(addprefix preview-,$(PROJECTS))

preview-%: .changes/unreleased/%
	@project_name=$(call extract_first_word,$(notdir $<)); \
	version=$(call get_version,$(notdir $<)); \
	if [ -z "$$version" ]; then \
		echo "Error: No version found for $$project_name in $(VERSION_FILE)"; \
		exit 1; \
	fi; \
	echo "$$project_name: release version $$version"; \
	changie batch $$version --project $$project_name --dry-run; \
	echo "----------------------------------------"

confirm:
	@echo "Press Enter to continue with updating changelog or Ctrl+C to cancel..."
	@read

update_changelogs: $(CHANGELOGS)

modules/%/changelog.md: .changes/unreleased/%
	@project_name=$(call extract_first_word,$(notdir $<)); \
	version=$(call get_version,$(notdir $<)); \
	changie batch $$version --project $$project_name; \
	yarn changie-merge; \
	echo "Updated changelog $$project_name with version $$version"
