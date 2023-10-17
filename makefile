PROJECTS := $(filter-out .changes/unreleased .changes/header.tpl.md,$(wildcard .changes/*))
PROJECT_NAMES := $(notdir $(PROJECTS))

all: batch merge

batch: $(PROJECTS)
	@for project in $(PROJECTS); do \
		projectName=$$(basename $$project); \
		changie batch auto --project $$projectName 2>&1 > /dev/null; \
	done

merge: $(PROJECTS)
	@for project in $(PROJECTS); do \
		projectName=$$(basename $$project); \
		changie merge --project $$projectName 2>&1 > /dev/null; \
	done

$(PROJECT_NAMES): 
	@projectName=$$(basename $@); \
	changie batch auto --project $$projectName 2>&1 > /dev/null; \
	changie merge --project $$projectName 2>&1 > /dev/null;

.PHONY: all batch merge $(PROJECT_NAMES)
