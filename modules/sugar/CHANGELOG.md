# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 9.3.0 - 2023-11-22

### Improved
- The `Focus.focus` function now takes an additional `preventScroll` parameter to allow focus on an element without scrolling.

## 9.2.0 - 2023-03-15

### Changed
- `Awareness.isCursorPosition` API now returns `true` for passed `contenteditable=false` elements.

## 9.1.0 - 2022-09-08

### Improved
- The `SugarNode.isHTMLElement` function now ensures the `nodeType` is `1` before checking the prototypes.

## 9.0.0 - 2022-03-03

### Added
- New `Ready.image` function that returns a promise which will not resolve until the image element has loaded. Errors trigger promise rejection.

### Changed
- Upgraded to Katamari 9.0, which includes breaking changes to the `Optional` API used in this module.
- Renamed `Ready.execute` to `Ready.document`, for better clarity on what it does
- `Remove.unwrap` API now inserts children after the current node, instead of before.
- `Replication.mutate` API now inserts the replacement node after the current node, instead of before.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

### Fixed
- The `Class.toggle` API didn't cleanup the class attribute when empty.

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
