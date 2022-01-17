# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- New `slider` dialog component #TINY-8304
- New `buttonType` property on dialog button components, supporting `toolbar` style in addition to `primary` and `secondary` #TINY-8304
- New `imagepreview` dialog component, allowing preview and zoom of any image URL #TINY-8333

### Deprecated
- The dialog button component `primary` property has been deprecated in favour of the new `buttonType` property #TINY-8304

### Changed
- Upgraded to Katamari 9.0, which includes breaking changes to the `Optional` API used in this module.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 3.0.2 - 2021-08-27

### Fixed
- Fixed `FancyMenuItem` types failing to compile in strict mode.

## 3.0.0 - 2021-08-26

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.
