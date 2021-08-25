# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 7.0.0 - 2021-08-26

## Added
- Added new `selectNode` API to `WindowBridge`.

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.
- Changed the `MouseSelection` and `KeySelection` fake selection logic to only apply if more than one cell of the same table is selected.

### Fixed
- Fixed incorrect type for single selections in the `Selections` and `CellOpSelection` modules.
- `MouseSelection` fake selection did not apply to a single selected CEF cell.
