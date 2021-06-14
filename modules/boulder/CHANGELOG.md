# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed
- Replaced `FieldPresenceAdt` with the native TypeScript equivalent, and renamed to `FieldPresence`  #TINY-7549
- Replaced `ValueProcessorAdt` (and its alias `FieldProcessorAdt`) with the native TypeScript equivalent, and renamed to `FieldProcessor` #TINY-7549
- Renamed FieldSchema methods starting with "strict" to start with "required" for clarity #TINY-7549
- Moved `anyValue`, `number`, `boolean`, `strign`, `func`, `postMessageable` from `ValueSchema` to `ValueType` #TINY-7549
- Renamed `ValueSchema` to `StructureSchema` #TINY-7549
- Renamed `Processor` type to `StructureProcessor` #TINY-7549
- Renamed `FieldSchema.state` to `FieldSchema.customField` #TINY-7549

### Removed
- Removed `asStruct` and `asStructOrDie` from ValueSchema as they were unused #TINY-7549
- Removed the Strength concept #TINY-7549
- Removed `indexOnKey` from the `Objects` API #TINY-7549
- Removed Map and Set from postMessageable because not IE compatible #TINY-7549
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.
