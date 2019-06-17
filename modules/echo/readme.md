# Description
`echo` is a project that handles ARIA attributes.
# Installation
`echo` is available as an `npm` package.  You can install it via the npm package `@ephox/echo`
## Install from npm
`npm install @ephox/echo`

# Usage
`AriaDrop`: Used to set the `aria-grabbed` and `aria-dropeffect` attributes.
`AriaFocus`: Used to preserve focus on an element.
`AriaGrid`: Used to create a grid of ARIA compliant cells.
`AriaRegister`: Used to set standardized ARIA attributes for common elements (menus, toolbars etc).
`AriaState`: Used to set stateful ARIA attributes such as `aria-expanded` or `aria-checked`.
`AriaVoice`: Used to set ARIA attributes related to screen readers.
# Tests
`echo` uses `bedrock` to run browser tests.
## Running Tests
`$ grunt bedrock-auto`
