# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed
- Replaced the FieldPresence and ValueProcessor ADTs with standard functions #TINY-7549

### Removed
- Removed the `FieldPresenceAdt` and `ValueProcessorAdt` types (which was aliased to `FieldProcessorAdt` externally) #TINY-7549
- Removed `asStruct` and `asStructOrDie` from ValueSchema as they were unused #TINY-7549
- Removed the Strength concept #TINY-7549
- Removed `indexOnKey` from the `Objects` API #TINY-7549