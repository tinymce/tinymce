# Pipeline Testing

The following are the primary modules used when testing TinyMCE using the legacy pipeline syntax.

## TinyActions

A collection of agar `Steps` which simulate key events to the editor UI and the editable areas.

## TinyApis

A collection of agar `Steps` and `Chains` used for:

* getting, setting, and asserting content inside tinymce
* getting, setting, and asserting the selection inside tinymce
* focusing the editor
* firing node changed events

## TinyDom

A module for creating the internal structures required for nodes and selection ranges

## TinyLoader

A module for creating a basic testing environment where an editor with specified settings is created, and is available for testing.

## TinyScenarios

A `Scenario` is a combination of initial content and selection. `TinyScenarios` uses `agar`'s generators based on [`jsverify`](https://www.npmjs.com/package/jsverify) structures. It can generate random content and selections for property-based testing.

## TinyUi

A collection of agar `Steps` and `Chains` used for:

* clicking on toolbars, menus, and general UI
* waiting for parts of UI
* triggering context menus
