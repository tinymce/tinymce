# Description

`default-avatar` is a utility library for generating default user avatars as SVG data URLs. It creates colorful circular avatars with the first character of a user's name, using a consistent color scheme based on the user's ID.

# Usage

The library provides two main functions for generating avatars:

## generateAvatar

Generate a custom avatar with specific content, color, and size.

## generateUserAvatar

Generate an avatar for a user object, automatically determining color and content based on the user's name and ID.

The color is deterministically generated based on the user's ID using the djb2 hash algorithm, ensuring consistent colors for the same user across sessions.

# Features

- Generates SVG-based circular avatars
- 26 predefined colors for consistent theming
- Supports Unicode characters using Intl.Segmenter when available
- Deterministic color assignment based on user ID
- Configurable avatar size
- Returns data URLs ready for use in HTML `src` attributes
