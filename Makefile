PROJECTS := $(filter-out .changes/unreleased .changes/header.tpl.md,$(wildcard .changes/*))
PROJECT_NAMES := $(notdir $(PROJECTS))


batch: $(PROJECTS)
	@for project in $(PROJECTS); do \
		yarn changie batch auto --project $$(basename $$project) >/dev/null 2>&1; \
	done

merge:
	yarn changie merge

all: batch merge

.PHONY: all batch merge $(PROJECT_NAMES)

default: all
