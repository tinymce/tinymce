# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.

## 8.0.4 - 2021-06-23

### Fixed
- Fixed a bug in `TableMerge` that caused layout issues when merging cells from tables containing `colgroup`s into tables without `colgroup`s #TINY-6675
