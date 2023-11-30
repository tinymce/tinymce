# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 4.7.0 - 2023-11-22

### Added
- Added `setTooltip` function to `ToolbarSplitButtonInstanceApi` and `NestedMenuItemInstanceApi`. #TINY-9796
- Added `picker_text` optional property to `UrlInputSpec`. #TINY-10155

## 4.5.0 - 2023-07-12

### Added
- Added `streamContent` optional property to `IframeSpec` that defaults to `false`. #TINY-10032
- Added `border` optional property to `IframeSpec` that defaults to `false`. #TINY-10049
- Added `align` optional property to `LabelSpec` that defaults to `start`. #TINY-10058

### Changed
- Made `buttons` an optional property of `DialogSpec` that defaults to an empty array. #TINY-9996
- Alert icon in alertbanner component is not clickable when `url` is not provided. #TINY-10013

## 4.3.0 - 2023-03-15

### Added
- Added `Tree` component that can be a `BodyComponent`. #TINY-9532
- Added optional `select`-property to `colorswatch`-type `fancymenuitem` to allow setting colors as selected. #TINY-9395
- Added new `setIconFill` function to `nestedmenuitemspec`. #TINY-9497
- Added `setText` and `setIcon` properties to toolbar button api and menu button api. #TINY-9268
- Provide menu button `api` property as an argument to the fetch function to allow menu items to change the icon or text of the parent menu. #TINY-9268

## 4.2.0 - 2022-11-23

### Added
- Added optional `storageKey` property to `colorinput` component and `colorswatch` fancy menu item. #TINY-9184
- New `view` component. #TINY-9210

### Fixed
- Fixed type errors caused by upgrading to TypeScript 4.8. #TINY-9161

## 4.1.0 - 2022-09-08

### Improved
- The `MenuButton` type now takes a `search` field for configuring searchable menus. #TINY-8952

### Fixed
- The `colors` property was incorrectly marked as required for the `ColorSwatchMenuItemSpec` type.

## 4.0.2 - 2022-03-22

### Fixed
- The `buttonType` property did not work for dialog footer buttons #TINY-8582

## 4.0.0 - 2022-03-03

### Added
- New `slider` dialog component #TINY-8304
- New `buttonType` property on dialog button components, supporting `toolbar` style in addition to `primary` and `secondary` #TINY-8304
- New `imagepreview` dialog component, allowing preview and zoom of any image URL #TINY-8333

### Deprecated
- The dialog button component `primary` property has been deprecated in favour of the new `buttonType` property #TINY-8304

### Changed
- Upgraded to Katamari 9.0, which includes breaking changes to the `Optional` API used in this module.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 3.0.2 - 2021-08-27

### Fixed
- Fixed `FancyMenuItem` types failing to compile in strict mode.

## 3.0.0 - 2021-08-26

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.
