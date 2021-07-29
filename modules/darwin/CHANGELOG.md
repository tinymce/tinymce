# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.
- Changed the `MouseSelection` and `KeySelection` fake selection logic to only apply if more than one cell of the same table is selected.
