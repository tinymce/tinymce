# Description
`phoenix` is a project that handles DOM node text gathering.
# Installation
`phoenix` is available as an `npm` package.  You can install it via the npm package `@ephox/phoenix`
## Install from npm
`npm install @ephox/phoenix`

# Usage
## Dom
`DomDescent`: Used to navigate through a node's children.
`DomExtract`: Used to extract a selection point in a node.
`DomFamily`: Used to extract text within a given range or group of elements.
`DomGather`: Used to extract text around a given point.
`DomInjection`: Used to insert text.
`DomSearch`: Used to search for words in given elements.
`DomSplit`: Used to split text nodes in a given element.
`DomWrapping`: Used to wrap text nodes.
## General
`Descent`: Used to navigate through a node's children with a given DOM universe.
`Extract`: Used to extract a selection point in a node with a given DOM universe.
`Family`: Used to extract text within a given range or group of elements with a given DOM universe.
`Gather`: Used to extract text around a given point with a given DOM universe.
`Injection`: Used to insert text with a given DOM universe.
`Search`: Used to search for words in given elements with a given DOM universe.
`Split`: Used to split text nodes in a given element with a given DOM universe.
`Wrapping`: Used to wrap text nodes with a given DOM universe.
# Tests
`phoenix` uses [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) to run atomic tests.
## Running Tests
`$ yarn test`
