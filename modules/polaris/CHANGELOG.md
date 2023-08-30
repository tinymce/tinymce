# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 6.2.2 - 2023-08-30

### Fixed
- `Search.findmany` now removes overlapped indices. #TINY-10062

## 6.2.0 - 2023-06-12

### Added
- New `Words.getWordsWithIndices` API to extract words and their start and end indices when provided an array of characters. #TINY-9654
- Added to unicode punctuation string: '$', '~', '+', '|', '№', '`'. #TINY-8122


## 6.0.2 - 2022-06-29

### Fixed
- Fixed incorrect `Regexes.link` URL detection for path segments that contain valid characters such as `!` and `:` #TINY-5074

## 6.0.0 - 2022-03-03

### Changed
- Upgraded to Katamari 9.0, which is incompatible with Katamari 8.0 if used in the same bundle.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 5.0.2 - 2021-10-11

### Fixed
- `Pattern.chars` and `Pattern.wordbreak` now treat soft hyphen characters (`&shy;` entities) as part of a word #TINY-7908

## 5.0.0 - 2021-08-26

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.

## 4.0.8 - 2021-07-02

### Fixed
- Fixed incorrect `Regexes.link` URL detection for custom schemes #TINY-5074
