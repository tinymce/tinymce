# Description

`persona` is a utility library for generating default user avatars as SVG data URLs. It creates colorful circular avatars with the first character of a user's name, using a consistent color scheme based on the user's ID.

# Features

- Generates SVG-based circular avatars
- 26 predefined colors for consistent theming
- Supports Unicode characters using Intl.Segmenter when available
- Deterministic color assignment based on user ID
- Configurable avatar size
- Returns data URLs ready for use in HTML `src` attributes
