# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 8.1.0 - 2021-10-11

### Added
- Added new `parentElement` function to the `Traverse` API.
- Added new `setOptions` function to the `Attribute` API.
- Added new `getInner` and `getRuntime` functions to the `Width` and `Height` APIs.

### Fixed
- Disabled `window.visualViewport` in Mozilla Firefox as it was returning an incorrect value for `pageTop` when using `position: 'fixed'`.

## 8.0.0 - 2021-08-26

### Added
- Added new `ContentEditable` module to determine if an HTML element is content editable.

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.
