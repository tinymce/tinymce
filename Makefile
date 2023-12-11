UNRELEASED_FILES := $(wildcard .changes/unreleased/*)
PROJECTS := $(patsubst .changes/unreleased/%,%,$(UNRELEASED_FILES))
PUBLIC_PROJECTS := $(filter-out tinymce%,$(PROJECTS))
TINY_PROJECTS := $(filter tinymce%,$(PROJECTS))
CHANGELOGS_PUBLIC := $(addprefix modules/,$(addsuffix /changelog.md,$(PUBLIC_PROJECTS)))
CHANGELOGS_TINY := $(addprefix modules/,$(addsuffix /changelog.md,$(TINY_PROJECTS)))

VERSION_FILE := versions.txt

extract_first_word = $(firstword $(subst -, ,$1))
get_tiny_version = $(shell jq -r '.version' modules/tinymce/package.json)
get_version = $(shell grep '^$(call extract_first_word,$1)@' $(VERSION_FILE) | cut -d '@' -f 2)

.PHONY: public tiny check_files preview dry_run confirm update_projects update_changelogs

public: check_files_public

tiny: check_files_tiny

check_files_common:
	@if [ -z "$(UNRELEASED_FILES)" ]; then \
		echo "No unreleased files found. Exiting..."; \
	fi

check_files_public: check_files_common
	@if [ ! -z "$(PUBLIC_PROJECTS)" ]; then \
		$(MAKE) preview_public confirm update_changelogs_public; \
	fi

check_files_tiny: check_files_common
	@if [ ! -z "$(TINY_PROJECTS)" ]; then \
		$(MAKE) preview_tiny confirm update_changelogs_tiny; \
	fi

preview: preview_public preview_tiny

preview_public: $(addprefix .changes/unreleased/,$(PUBLIC_PROJECTS))
	@echo "----------------------------------------"
	@echo "Overview of public packages to be processed:"
	@echo "----------------------------------------"
	@$(MAKE) $(addprefix preview-,$(PUBLIC_PROJECTS))

preview_tiny: $(addprefix .changes/unreleased/,$(TINY_PROJECTS))
	@echo "----------------------------------------"
	@echo "Overview of tinymce package to be processed:"
	@echo "----------------------------------------"
	@$(MAKE) $(addprefix preview-,$(TINY_PROJECTS))

preview-%: .changes/unreleased/%
	@project_name=$(call extract_first_word,$(notdir $<)); \
	if [ $$project_name == "tinymce" ]; then \
		version=$(call get_tiny_version); \
	else \
		version=$(call get_version,$(notdir $<)); \
	fi; \
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

update_changelogs: update_changelogs_public update_changelogs_tiny

update_changelogs_public: $(CHANGELOGS_PUBLIC)

update_changelogs_tiny: $(CHANGELOGS_TINY)

modules/%/changelog.md: .changes/unreleased/%
	@project_name=$(call extract_first_word,$(notdir $<)); \
	if [ $$project_name == "tinymce" ]; then \
		version=$(call get_tiny_version); \
	else \
		version=$(call get_version,$(notdir $<)); \
	fi; \
	changie batch $$version --project $$project_name; \
	yarn changie merge; \
	echo "Updated changelog $$project_name with version $$version"
