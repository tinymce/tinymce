# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 6.0.0 - 2023-11-22

### Changed
- Updated alloy to latest major. #TINY-10275

## 5.0.8 - 2023-03-15

### Fixed
- Color Picker doesn't handle hex color prefixed with #.

## 5.0.0 - 2022-03-03

### Added
- Added a new `rgbaToHexString` API, to convert RGBA to Hex.

### Changed
- Upgraded to Katamari 9.0, which includes breaking changes to the `Optional` API used in this module.

### Fixed
- Fix RGBA and RGB parsing to account for whitespace.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 4.0.0 - 2021-08-26

### Added
- Added a new `anyToHex` API to the `Transformations` module. This uses a canvas to convert any value to a hex colour #TINY-7480

### Changed
- `HexColour.fromString` will now normalize the hex value to strip the leading `#` if present and uppercase the values #TINY-7480
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.
