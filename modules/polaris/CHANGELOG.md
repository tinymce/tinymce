# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 5.0.2 - 2021-10-11

### Fixed
- `Pattern.chars` and `Pattern.wordbreak` now treat soft hyphen characters (`&shy;` entities) as part of a word #TINY-7908

## 5.0.0 - 2021-08-26

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.

## 4.0.8 - 2021-07-02

### Fixed
- Fixed incorrect `Regexes.link` URL detection for custom schemes #TINY-5074
