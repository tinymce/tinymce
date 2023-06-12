# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 10.2.0 - 2023-06-12

### Improved
- `Words.identify`, `TextZones.single` and `TextZones.range` now include words containing non-Latin characters. #TINY-9654

## 10.0.0 - 2022-03-03

### Changed
- Upgraded to Katamari 9.0, which is incompatible with Katamari 8.0 if used in the same bundle.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 9.0.2 - 2021-10-11

### Fixed
- `TextZone` functions no longer treat soft hyphens (`&shy;` entities) as word breaks #TINY-7908

## 9.0.0 - 2021-08-26

### Added
- Exposed the `TextZones.Zone` and `Words.WordScope` types.

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.

## 8.1.0 - 2021-07-12

### Changed
- `TextZones` APIs now use `universe.property().getLanguage` function instead of looking at `lang` attribute directly #TINY-7570
