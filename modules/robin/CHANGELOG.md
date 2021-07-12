# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- Exposed the `TextZones.Zone` and `Words.WordScope` types.

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.

## 8.1.0 - 2021-07-12

### Changed
- `TextZones` APIs now use `universe.property().getLanguage` function instead of looking at `lang` attribute directly #TINY-7570
