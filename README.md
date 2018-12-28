# Default icons for Oxide Theme

Icons in TinyMCE 5 is loaded using icon packs through NPM packages. A icon pack is technically the `dist/js/TinymceIcons.js` icon file.

Icons do not have a defined size and will use whatever size the SVG has. This makes it easy to create icons of different sizes.

Colors are applied using `fill` via CSS, so make sure to follow the steps under _Designing an icon_.

# Installation
`oxide-icons-default` is available as an `npm` package.  You can install it via the npm package `@ephox/oxide-icons-default`

## Install from npm
`npm install @ephox/oxide-icons-default`

## Updating Icons

The master icon document is a Sketch file located in `src/sketch/icons.sketch`.

1. Duplicate an Artboard
2. Rename the artboard. Icons should be named by their function, not what they depict, for example use `icon-brightness` instead of `icon-sun`.
3. Design an icon. See designing an icon
4. Use the Sketch plugin _Symbol organizer_ to have the icon be sorted alpahabetically and to generate the labels next to the icons. Read more below
5. Export **only the updated icons**  to `src/svg/`
6. Perform design testing (see below)
7. Commit the changes to the git repository and push your changes. Commits to the master branch will be automatically transformed into a NPM package and automatically updated to TinyMCE

### Design testing

Perform the following steps to make sure your icons look good in the browser:

1. Open a terminal window in the root folder of the icon repository
2. Run `gulp`
3. Open the `dist/html/Icons.html` in a browser (no server needed)
4. Look through the icons and make sure everything looks good. No errors in subtractions or forgetting to hide the frame layer etc.

## Designing an icon

Use the following guidelines when designing icons:

* Don't use any groups
* Ideally the icon is only one Shape
* A layer called `frame` is included to help rezising icons if needed. Make sure that layer is hidden before export
* Make sure the fill color is set to `#000000` to be able to colorize the icon through CSS (black colors will be stripped out of the SVG code.
* Expand all strokes to fills (or else the icon wont be colorized properly via CSS).

## Symbol organizer

Symbol organizer is a Sketch plugin that organizes your symbols page alphabetically (including layer list) and into groupings determined by your symbol names.  [Download Symbol organizer here](https://github.com/sonburn/symbol-organizer).

Use the following settings:

![symbol-organizer settings](src/readme-assets/symbol-organizer.png)
