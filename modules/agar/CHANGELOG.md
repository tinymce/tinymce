# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 8.0.0 - 2023-11-22

### Added
- Added `Clipboard.pPasteUrlItems` API to paste url files as clipboard items. #TINY-10275
- Added `Files.getFileDataAsString` API to make it easier to get file data out for testing. #TINY-10275

### Removed
- Removed the `RealClipboard.sImportToClipboard` API. #TINY-10275

## 7.4.0 - 2023-03-15

### Added
- Added `measurement` API to StrAssert to allow for approximate measurements in strings. #TINY-9242

## 7.3.0 - 2022-11-23

### Added
- Added `TestStore` API, which was moved from Alloy and requires types. #TINY-9157
- Added `exactAttrs`, `exactClasses` and `exactStyles` to `ApproxStructures.element`. #TINY-9102

## 7.2.0 - 2022-09-08

### Improved
- Exposed the `ArrayAssert` and `StringAssert` types.
- Exposed the `KeyPressAdt` type. #TINY-8952

## 7.1.0 - 2022-06-29

### Added
- Added `detail` property to emulated mouse events settings.
- Added `pClick` to the `RealMouse` API.

## 7.0.0 - 2022-03-03

### Changed
- The `sizzle` library is now used directly instead of using the `@ephox/wrap-sizzle` wrapper library.
- Replaced `jsverify` with `fast-check` for the `Arbitraries` module.
- Upgraded to Katamari 9.0, which includes breaking changes to the `Optional` API used in this module.

### Removed
- Removed usage of polyfill promises in favor of native promises.
- Removed the `PhantomSkipper` module.
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 6.0.0 - 2021-08-26

### Added
- Added new `pasteDataTransfer`, `pasteItems`, `pasteFiles`, `cut` and `copy` helpers to the `Clipboard` module.

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.

### Fixed
- The `DataTransfer.clearData` API threw an exception when no format was provided.
- The `Keyboard` module generated fake keys was missing the `charCode` property for `keypress` events.

## 5.4.0 - 2021-07-19

### Improved
- `UiControls.setValue` now takes an optional `eventName` to fire after changing the value.

## 5.3.0 - 2021-05-06

### Added
- Added `pageUp` and `pageDown` constants to the `Keys` API

## 4.13.1 - 2019-05-20

### Added
- Added new FileInput to enable simulating file picking.

## 4.12.3 - 2019-04-16

### Added
- Added new DragnDrop.cDragnDrop

## 4.12.0 - 2019-04-11

### Added
- Added support for mock testing native drag and drop
- Added support for mock testing cut, copy, paste

## 4.11.0 - 2019-01-03

### Added
- adds ability for approx structure assertions to match on multiple nodes
- adds new structure assertion methods: either, repeat, zeroOrOne, zeroOrMore, oneOrMore and theRest

### Changed
- changed text structure assertion to take a new optional parameter specifying if it should match on multiple text nodes

## 4.10.0 - 2018-12-18

### Added
- Exposed Clicks.point on Mouse api.

## 4.9.0 - 2018-12-05

### Added
- Added cExists and cNotExists to UiFinder.

## 4.8.0 - 2018-12-04

### Fixed
- fixed Chain.fromParent so logs are retained from the child chains

## 4.7.0 - 2018-11-07

### Changed
- changed Guard.tryUntil and Guard.tryUntilNot to measure full elapsed time

## 4.6.0 - 2018-11-05

### Added
- adds Chain.label to allow the Chain equivalent of Logger.t
- adds Step.label as an alternative for Logger.t

### Changed
- changed Chain.log and Step.log to write an entry in the TestLogs object

### Removed
- removed Logger.suite as it was never implemented (use Log module instead)

## 4.4.0 - 2018-09-05

### Added
- adds chainsAsStep to Log

## 4.3.0 - 2018-09-03

### Added
- adds cClick to RealMouse

## 4.2.0 - 2018-08-30

### Added
- adds Log module for QA reporting
- adds convenience methods for StepAssertions

## 2.4.0 - 2017-12-05

### Changed
- update synethetic key events to work with Firefox Quantum

## 2.0.0 - 2016-12-12

### Added
- implements basic testing infrastructure
