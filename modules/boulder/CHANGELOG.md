# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 7.1.0 - 2022-09-08

### Improved
- Added an optional parameter to `oneOf` that allows boulder to generate consistent output for different schema. #TINY-8952

## 7.0.0 - 2022-03-03

### Changed
- Upgraded to Katamari 9.0, which includes breaking changes to the `Optional` API used in this module.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 6.0.0 - 2021-08-26

### Improved
- Improved the performance of the `StructureProcessor.objOf` and `StructureProcessor.objOfOnly` functions #TINY-7572

### Changed
- Replaced `FieldPresenceAdt` with the native TypeScript equivalent, and renamed to `FieldPresence`  #TINY-7549
- Replaced `ValueProcessorAdt` (and its alias `FieldProcessorAdt`) with the native TypeScript equivalent, and renamed to `FieldProcessor` #TINY-7549
- Renamed `FieldSchema` methods starting with "strict" to start with "required" for clarity #TINY-7549
- Moved `anyValue`, `number`, `boolean`, `strign`, `func`, `postMessageable` from `ValueSchema` to `ValueType` #TINY-7549
- Renamed `ValueSchema` to `StructureSchema` #TINY-7549
- Renamed `Processor` type to `StructureProcessor` #TINY-7549
- Renamed `FieldSchema.state` to `FieldSchema.customField` #TINY-7549
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.

### Removed
- Removed `asStruct` and `asStructOrDie` from `ValueSchema` as they were unused #TINY-7549
- Removed the Strength concept #TINY-7549
- Removed `indexOnKey` from the `Objects` API #TINY-7549
- Removed Map and Set from `postMessageable` because they are not IE compatible #TINY-7549
