# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed
- Upgraded to Katamari 9.0, which is incompatible with Katamari 8.0 if used in the same bundle.
- The `isOSX` API has been renamed to `isMacOS` #TINY-8175
- The `isChrome` API has been renamed to `isChromium` to better reflect its functionality #TINY-8300

## 5.0.0 - 2021-08-26

### Improved
- Detection logic has been updated to use `navigator.userAgentData` for browser detection if it is available.

### Changed
- Upgraded to Katamari 8.0, which is incompatible with Katamari 7.0 if used in the same bundle.

