UNRELEASED_FILES := $(wildcard .changes/unreleased/*)
PACKAGES := $(patsubst .changes/unreleased/%,%,$(UNRELEASED_FILES))

extract_first_word = $(word 1, $(subst -, ,$1))

PACKAGE_NAMES := $(sort $(foreach proj,$(PACKAGES),$(call extract_first_word,$(proj))))
TINY_PACKAGES := $(filter tinymce%,$(PACKAGE_NAMES))
OTHER_PACKAGES := $(filter-out tinymce%,$(PACKAGE_NAMES))

VERSION_FILE := versions.txt

get_tiny_version = $(shell jq -r '.version' modules/tinymce/package.json)
get_version = $(shell grep '^$(call extract_first_word,$1)@' $(VERSION_FILE) | cut -d '@' -f 2)

.PHONY: tiny other
tiny: $(TINY_PACKAGES)
other: $(OTHER_PACKAGES)

$(OTHER_PACKAGES):
	@echo "========================================="
	@echo "Running changie batch (dry run) for $@"
	@version=$(call get_version,$@); \
	if [ -z "$$version" ]; then \
		echo "Version not found for package $@"; \
		echo "Please add it to $(VERSION_FILE)"; \
		exit 1; \
	else \
		changie batch $$version --project $@ --dry-run; \
		echo "Press Enter to continue with actual changie batch or Ctrl+C to cancel..."; \
		read; \
		changie batch $$version --project $@; \
	fi

$(TINY_PACKAGES):
	@echo "Running changie batch (dry run) for TinyMCE"
	@version=$(get_tiny_version); \
	changie batch $$version --project tinymce --dry-run; \
	echo "Press Enter to continue with actual changie batch or Ctrl+C to cancel..."; \
	read; \
	changie batch $$version --project tinymce

