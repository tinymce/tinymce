# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- `Warehouse` now contains the colgroup elements from the table.

### Improved
- Rows are now stored and tracked in the table model structures.

### Changed
- `RowDetails` has been renamed to `RowDetail` and now takes a generic argument to define what is the type of cells stored.
- `row` and `colgroup` generators are now passed the previous element during transform or modification operations.
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.

### Fixed
- Table operations that replace all cells in a row now re-use the existing row instead of creating a new row.

### Removed
- `Structs.RowData` has been merged into and replaced by `Structs.RowDetail` to remove some duplication.
- The `cursor` function has been removed from `Generators` as it was unused and incorrectly implemented.

## 8.0.4 - 2021-06-23

### Fixed
- Fixed a bug in `TableMerge` that caused layout issues when merging cells from tables containing `colgroup`s into tables without `colgroup`s #TINY-6675
