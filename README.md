# TinyMCE Oxide skin for Alloy

This is the design development repository for the TinyMCE Oxide skin for Alloy. This project contains development templates in HTML and CSS which is used as basis for implementation in Alloy.

The main template files are located in `src/demo/tinymce` with each component as a partial HTML file within subfolders.

The project also contains a crude skin tool where LESS variables can be changed in real time.

**Important!** Icons are separated from the theme into their own repositories and loaded into the project using NPM. Peek into the `gulpfile.js` for how this is done.

## Getting started
The Oxide theme development preview is built using Gulp and served to the browser via BrowserSync. All source files are located in the `src` directory. Keep in mind that all files in the build directory will be overwritten during build.


# Installation
`oxide` is available as an `npm` package.  You can install it via the npm package `@ephox/oxide`

## Install from npm
`npm install @ephox/oxide`

# Usage

To get started, type the following commands in your terminal of choice:

1. Install all dependencies with `npm install`
2. Start the server using the command `gulp`. Follow the instructions given in the terminal

### Run atomic tests
`npm run test`

## Styleguide

General CSS are linted using a linter. Please install [Stylelint](https://github.com/shinnn/vscode-stylelint) or similar tool that can read stylelint configuration files.

The project has a module based approach to variables. Instead of a big variable file, each component contains it's own variables. The philosophy is that a component should be a self contained entity and not have any outside dependencies. In reality this is not 100% achievable but give it your best shot.

### Variable naming

Variables are named after the following convention:

**[component]-[state]-[property]**

Some examples

```less
@button-naked-focus-background-color
@input-label-font-size
@toolbar-margin
```

* Only use dash `-` separators in variable names.
* Don't be afraid of long variable names.
* Private variables are prefixes with a underscore like this: `@_somevar`. Private variables indicates to a developer that they should not be changed or used (there is no tecnical barrier preventing them from doing so though)

## Visual regression testing with Backstop
Oxide includes visual regression testing through [Backstopjs](https://github.com/garris/BackstopJS). The purpose of these tests is to make sure CSS updates didn't cause unwanted changes somewhere else. In summary it generates screenshots which is compared to reference images. To get consistent results the tests is feed through a Docker image.

### Perform a test

1. Make sure docker is installed and running. [Install Docker here](https://store.docker.com/search?type=edition&offering=community&architecture=amd64).
2. Run the test using the terminal commant `npm run backstop:test`

After the test a website with the result will open where you can inspect the test.

### A test failed!
It's best to think about the test as a visual diff tool rather than in terms of _passes_ and _fails_. If you made a new component, the test will technically fail without it being a _fail_. When you have made a change and the test fails, inspect the changes and if they look alright you need to generate new reference files using `npm run backstop:reference`. You should commit these files to the repo.

If every test failed and "everything is changed" it's likely a issue with Docker. It's usually because font rendering differs between platforms and why we're using Docker to get consistent testing. Check that Docker is installed or running. If you cant get it sorted out, please feel free to file a bug.

### Create a new test

New tests is created in `tools/tasks/backstop_config.js. See the [Backstopjs repository](https://github.com/garris/BackstopJS) for documentation.

## Troubleshooting

Any questions regarding the skin can be directed to Fredrik Danielsson, preferably via Slack.

### Known issues

After running gulp clean, then gulp and you get an error
Error: File not found with singular glob: /oxide/build (if this was purposeful, use 'allowEmpty' option)

run gulp icon
then gulp build
then gulp

TODO: The issue is due to clean not liking empty folders, need to fix this

### Adding icon packs
1. Provide the path of the icon pack to the iconPacks-array in the gulpfile
2. Add an entry to the selector in icon-pack-select.html

```bash
[13:52:50] 'buildHtml' errored after 146 ms
[13:52:50] Error: write callback called multiple times
(... a lot of lines)
```
