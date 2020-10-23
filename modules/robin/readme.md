# Description
`robin` is a project that groups sibling DOM nodes together by boundary points, for example the list of elements and nodes representing a word.
# Installation
`robin` is available as an `npm` package.  You can install it via the npm package `@ephox/robin`
## Install from npm
`npm install @ephox/robin`

# Usage
## Text node traversal within text boundaries

Robin text search API functions generally operate on and navigate through text nodes
rather than general DOM elements. Text searches also generally stop at boundary (block) elements such as DIVs.

## Finding a text node, given an element

If you have a DOM element and need to find a specific contained text node and offset to start searching from then consider the `phoenix` `DomDescent` API functions `freefallLtr()` and `freefallRtl()` functions which, given an element, return a text node and offset from the left-most or right-most end of the element, respectively.
# Tests
`robin` uses [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) to run tests.
## Running Tests
`$ yarn test-manual`
`$ yarn test`
