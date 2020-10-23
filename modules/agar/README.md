# Description

`agar` is a library containing testing infrastructure for _keyboard_, _mouse_, _focus_, and _DOM Manipulation_. It is designed to provide a pipeline for composing together asynchronous testing operations. It does not bundle any commands. It is only a collection of modules.

# Installation

`agar` is available as an `npm` package. You can install it via the npm package `@ephox/agar`

## Install from npm

`npm install @ephox/agar`

# Usage

As mentioned earlier, `agar` contains testing infrastructure for _keyboard_, _mouse_, _focus_, and _DOM Manipulation_. The best place to see how it works is to look at the demos provided in the project directory at `src/demo/js/ephox/agar/demo`. More complete public documentation will be available in the future.

# Running Tests

`agar` uses [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) to run tests. This is packaged as a dev dependency of `agar`. There are two types of tests:

* browser tests
* webdriver tests

The default `yarn test` command just runs browser tests using `Chrome`.

## Running Browser Tests

The browser tests are in the `src/test/js/browser` directory. They do not require a webdriver and can be run using the `bedrock` mode (rather than `bedrock-auto`).

`$ bedrock --testdir src/test/js/browser`

In this mode, bedrock will not open the browser, nor will it close it. This mode is used for development and debugging.

## Running Webdriver Tests

Some tests in agar need to access raw WebDriver APIs like `sendKeys`. This allows tests to use selenium to provide actual *real* key events, rather than simulated JavaScript events. However, to run these tests, you need to use `bedrock-auto`. The tests are stored in the `src/test/js/webdriver` directory.

For example, to run the tests on Chrome:

`$ bedrock-auto -b chrome --testdir src/test/js/webdriver`

