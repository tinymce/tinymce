# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 9.0.0 - 2023-11-22

### Changed
- Updated agar to latest major. #TINY-10275

### Fixed
- Changed so `TinyState.withNoneditableRootEditor` and `TinyState.withNoneditableRootEditorAsync` calls the setEditableRoot API instead of using direct dom mutation. #TINY-10304

## 8.4.0 - 2023-06-12

### Added
- Added `TinyState` module that contains transactional functions for editor states.

## 8.3.0 - 2023-03-15

### Added
- Exposed `getUiRoot` from `TinyUiActions` for easier ShadowDOM support. #TINY-9226

## 8.2.0 - 2022-11-23

### Added
- Add new `pWaitForEventToStopFiring` function to the `TinyContentActions` helper methods to allow tests to wait until an event stops being triggered.

## 8.1.0 - 2022-09-08

### Changed
- The new `promotion` option added in TinyMCE 6.2 is set to `false` by default.

## 8.0.0 - 2022-03-03

### Added
- Added the `getSel()` function to the `EditorTypes.Selection` interface.
- Added the `setRawSelection()` function to the `TinySelections` helper methods to allow setting the selection without using any TinyMCE APIs.

### Improved
- Updated the APIs to work with the TinyMCE 6 options API.

### Changed
- Upgraded to Katamari 9.0, which is incompatible with Katamari 8.0 if used in the same bundle.

### Deprecated
- The `setSetting` and `deleteSetting` APIs have been deprecated and replaced with `setOption` and `unsetOption` APIs.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 7.0.2 - 2021-09-08

### Fixed
- `TinyHooks` setup modules were incorrectly executed before TinyMCE was loaded #TINY-7957

## 7.0.0 - 2021-08-26

### Added
- Added optional `args` parameter to `TinyAssertions.assertContent` to be passed to `editor.getContent()` #TINY-3388
- Added two functions to click into the editor: `TinyContentActions.trueClick` and `TinyContentActions.trueClickOn` #TINY-7399

### Changed
- Upgraded to Katamari 8.0, which is incompatible with Katamari 7.0 if used in the same bundle.
- TinyMCE is no longer imported and is instead loaded from `node_modules` if a `tinymce` global isn't available.
