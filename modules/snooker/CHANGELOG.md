# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 11.0.9 - 2023-03-15

### Fixed
- TableResize.on/off functions will now toggle the mouseover resize bar refresh state.
- The `TableFill.cellOperations` function incorrectly declared the mutate element types as generic when they should have been a `CellElement`.

## 11.0.3 - 2022-06-29

### Fixed
- Copying one or more columns with a cell with colspan which starts outside of the selected area will no longer result in a copy with one or more cells missing.
- Pasting a column into a table with a colspan cell will no longer result in missing cells.

## 11.0.2 - 2022-03-18

### Fixed
- The `CopySelected` module was incorrectly extracting the selected cells in a table that contained colgroups.

## 11.0.0 - 2022-03-03

### Added
- Added new `refreshBars` API to `TableResize`.

### Changed
- Upgraded to Katamari 9.0, which includes breaking changes to the `Optional` API used in this module.
- `RunOperation.run` no longer requires the `wire` to be provided, instead the resize bars should be refreshed after the run operation if required.

### Fixed
- All `th` rows in `tfoot` sections were incorrectly detected as header rows.
- `OtherCells.getOtherCells` would incorrectly return `col` elements for `colgroup` tables.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 10.0.0 - 2021-10-11

### Changed
- The `pixelSize` and `percentSize` functions in `TableSize` no longer require the initial width to be provided.
- `ColumnSizes` will now use `col` elements to calculate the column width where appropriate.
- `Sizes.redistribute` no longer requires a `TableSize` instance to be provided.
- `TableOperations.makeRowHeader` and `TableOperations.makeRowsHeader` no longer add the deprecated `scope` attribute to `td` elements.
- `Generators.transform` no longer accepts a scope, as `TransformOperations` now calculates the appropriate scope.
- `Transitions.toGrid` will now add and remove `col` elements to ensure the number of `col` elements matches the number of columns in a table.

### Fixed
- Resizing table cells caused incorrect widths in cases where those cells had grown to fit extra content.
- Resizing percent tables caused widths to be offset by a few pixels due to an incorrect pixel -> percent conversion.
- Converting rows or columns to regular cells would in some cases incorrectly convert a cell that was still part of a header.
- An exception was thrown in `TableGrid` when there were more `col` elements than columns in a table.
- Table percent sizes were incorrectly calculated when the parent element had padding.

## 9.0.0 - 2021-08-26

### Added
- `Warehouse` now contains the colgroup elements from the table.
- `TableOperations` now includes functions to convert individual table cells to header cells (and vice-versa).
- Added new `makeRowBody`, `makeRowsBody`, `makeRowFooter` and `makeRowsFooter` APIs to the `TableOperations` module.
- Added a new `TableSection` module to control how table cells, rows, and sections are modified when moving rows to different sections.

### Improved
- Rows are now stored and tracked in the table model structures.
- Table operations will now ensure the cursor is placed in an editable cell.

### Changed
- `RowDetails` has been renamed to `RowDetail` and now takes a generic argument to define the type of cells stored.
- `row` and `colgroup` generators are now passed the previous element during transform or modification operations.
- Renamed `getColType` to `getColsType` in the `TableOperations` module to reflect that it can lookup the type from multiple columns.
- The `getCellsType` in the `TableOperations` module has been changed to be consistent with the `getColsType` function.
- The `RunOperation` and `TableOperation` module now requires an object containing the optional table behaviours (e.g. sizing and resizing) instead of passing them as separate arguments.
- The `prev` and `next` functions in `CellNavigation` now accept a predicate to check if the next or previous location is an eligible location to move to. If it's not then it'll keep walking to find an eligible location.
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.

### Fixed
- Table operations that replace all cells in a row now re-use the existing row instead of creating a new row.
- Table erase operations could place the cursor in an invalid location if erasing the last row or column.

### Removed
- `Structs.RowData` has been merged into and replaced by `Structs.RowDetail` to remove some duplication.
- The `cursor` function has been removed from `Generators` as it was unused and incorrectly implemented.
- `unmakeRowHeader` and `unmakeRowsHeader` APIs have been removed from the `TableOperations` module.

## 8.0.4 - 2021-06-23

### Fixed
- Fixed a bug in `TableMerge` that caused layout issues when merging cells from tables containing `colgroup`s into tables without `colgroup`s #TINY-6675
