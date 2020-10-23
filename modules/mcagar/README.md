# Description

`mcagar` is a [`tinymce`](https://www.npmjs.com/package/tinymce) specific wrapping of [`agar`](https://www.npmjs.com/package/@ephox/agar)'s testing infrastructure. It is only a collection of modules.

# Installation

`mcagar` is available as an `npm` package. You can install it via the npm package `@ephox/mcagar`

# Installation for development

You need to use `yarn` to install the mcagar devDependencies since `npm` doesn't support package aliasing and that is used in the `package.json`.

## Install from npm

`npm install @ephox/mcagar`

# Usage

Only modules inside the `api` package should be used in other projects. All other modules are implementation detail. The top modules are:

1. TinyActions
2. TinyApis
3. TinyDom
4. TinyLoader
5. TinyScenarios
6. TinyUi

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

# Examples

There are examples in the `src/test/js/browser/doc` directory.


# Running tests

The tests can be run using `bedrock` via `yarn test`. Note, this will only run the tests on Chrome and will require `chromedriver`. You can use `bedrock` directly to test on other browsers. See [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) for more details.

To run the tests on Chrome:

`$ yarn test`

