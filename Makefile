UNRELEASED_FILES := $(wildcard .changes/unreleased/*)

extract_first_word = $(firstword $(subst -, ,$1))

get_version = $(shell grep '"version"' modules/$(call extract_first_word,$(notdir $(1)))/package.json | head -1 | awk -F '"' '{print $$4}')

define echo_project_info
	project_name=$(call extract_first_word,$(notdir $(1))); \
	version=$(call get_version,$(1)); \
	echo "$$project_name: release version $$version"; \
	changie batch $$version --project $$project_name --dry-run; \
	echo "----------------------------------------"; 
endef

define process_file
	$(call echo_project_info,$(1)) \
	changie batch $$version --project $$project_name; \
	changie merge -u '## Unreleased'; \
	echo "Updated changelog $$project_name with version $$version";
endef

dev:
	@echo "Overview of packages to be processed:"; \
	echo "----------------------------------------"; \
	$(foreach file,$(UNRELEASED_FILES),$(call echo_project_info,$(file)))
	@read -p "Press Enter to continue with updating changelog or Ctrl+C to cancel..."; \
	$(MAKE) update_projects

update_projects:
	@echo "Starting the update process..."; \
	$(foreach file,$(UNRELEASED_FILES),$(call process_file,$(file)))
