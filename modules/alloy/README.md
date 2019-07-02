# Description

`alloy` is a UI library that specialises in creating reusable behaviours and components that are not opinionated about DOM structure and styling. It is a very low-level library.

# Installation

## Prerequisites

A webserver to run demos, npm, webpack is required to run and develop alloy

`alloy` is available as an `npm` package. You can install it via the npm package `@ephox/alloy`

`yarn` install the dependencies
`webpack` compile the src code

# Usage

## Running Tests

`alloy` uses [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) to run its tests. If you are running the browser tests, you may need to ensure that you have valid webdrivers on your path. You can install many of the webdrivers through npm.

There are four kinds of tests that alloy runs:

* atomic tests
* phantomjs tests
* browser tests
* webdriver tests

### Running PhantomJS Tests

`$ yarn run test`

Note, will run phantomjs tests.

### Running Browser Tests

The browser tests are in the `src/test/js/browser` directory. They do not require a webdriver and can be run using the `bedrock` mode (rather than `bedrock-auto`).

`$ bedrock --testdir src/test/js/browser`

In this mode, bedrock will not open the browser, nor will it close it. This mode is used for development and debugging.

### Running Webdriver Tests

Some tests in alloy need to access raw WebDriver APIs like `sendKeys`. This allows tests to use selenium to provide actual *real* key events, rather than simulated JavaScript events. However, to run these tests, you need to use `bedrock-auto`. The tests are stored in the `src/test/js/webdriver` directory.

For example, to run the tests on Chrome:

`$ bedrock-auto -b chrome --testdir src/test/js/webdriver`

Note, `webdriver` tests are still rather fragile.

## Alloy APIs

We are currently working on documenting the alloy APIs. For now, there are many demos available in `src/demo/html` that demonstrate how to use `alloy`. Be aware that the library is still in a state of constant adjustment.
