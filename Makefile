PROJECTS := $(filter-out .changes/unreleased .changes/header.tpl.md,$(wildcard .changes/*))
PROJECT_NAMES := $(notdir $(PROJECTS))

default: dev

$(PROJECT_NAMES):
	changie batch auto --project $(basename $@)

merge:
	yarn changie merge

dev:
	yarn changie merge -u "## Unreleased"

.PHONY: all merge $(PROJECT_NAMES)
