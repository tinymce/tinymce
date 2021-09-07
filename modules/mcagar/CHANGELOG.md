# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

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
