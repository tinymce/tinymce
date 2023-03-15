# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 8.0.9 - 2023-03-15

### Fixed
- Table cells that are in a noneditable context was incorrectly selectable with keyboard and mouse.

## 8.0.0 - 2022-03-03

### Changed
- Upgraded to Katamari 9.0, which includes breaking changes to the `Optional` API used in this module.
- Changed the `CellOpSelection` module to take selected cells directly instead of a `Selections` instance.
- Changed the `SelectionTypes` ADT to its TypeScript equivalent and renamed the `cata` API to `fold`.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 7.0.2 - 2021-10-11

### Fixed
- Some of the selection annotation attributes were not cleared if the `Ephemera.selectedSelector` attribute was not present.

## 7.0.0 - 2021-08-26

### Added
- Added new `selectNode` API to `WindowBridge`.

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.
- Changed the `MouseSelection` and `KeySelection` fake selection logic to only apply if more than one cell of the same table is selected.

### Fixed
- Fixed incorrect type for single selections in the `Selections` and `CellOpSelection` modules.
- `MouseSelection` fake selection did not apply to a single selected CEF cell.
