# Description

`sugar` is a library for manipulating and accessing the DOM. It does not bundle any commands. It is only a collection of modules.

# Installation

`sugar` is available as an `npm` package. You can install it via the npm package `@ephox/sugar`

## Install from npm

`npm install @ephox/sugar`

# Usage

`sugar` is the base DOM library used in many projects. It has an API which is broken up into seven main packages. Do not use any modules directly that are not in an `api` package.

`dom`: mostly handles inserting, appending, and manipulating *individual* DOM nodes.
`events`: handles DOM events and listeners
`node`: handles different types of nodes such as comments, elements, and text nodes
`properties`: handles reading, writing, and removing style properties, attributes, and values
`search`: handles searching for DOM nodes based on selectors, predicates, and DOM position
`selection`: handles browser ranges and selection
`tag`: handles specialised HTML tags like `option` and `select`
`view`: handles scrolling, visibility, and measurements

# Running Tests

`sugar` uses [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) to run tests. This is packaged as a dev dependency of `sugar`. To run the tests, use:

`$ yarn test`
