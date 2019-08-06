# Description
`snooker` is a project that implements the table model.
# Installation
`snooker` is available as an `npm` package.  You can install it via the npm package `@ephox/snooker`
## Install from npm
`npm install @ephox/snooker`

# Usage
`CellLocation`: The CellLocation ADT is used to represent a cell when navigating.
`CellMutations`: A collection of cell mutations to perform on cells when an operation has occured.
`CellProperties`: Used to set attributes and styles of a cell.
`CopyRows`: Used to duplicate DOM rows of selected cells.
`Generators`: Provides methods for generating new rows and cells for table operations.
`Picker`: Used to a table picker UI.
`PickerDirection`: Used to set the picker UI to be LTR or RTL.
`ResizeDirection`: Provides LTR and RTL options for resize bar directions.
`ResizeWire`: Used to provide a means with which to create resizers for either inline or iframe modes of editors.
`Sizes`: Provides a means with which to redistribute cell sizes of tables.
`TableContent`: Merges the contents of cells.
`TableDirection`: Provides functionality related to the directionality of a table.
`TableFill`: Provides methods for creating new rows and cells for table operations.
`TableLookup`: Provides methods such as querying a table cell for it's owner row or table.
`TableOperations`: Provides methods for modifying a table such as adding rows or deleting columns.
`TableRender`: Creates a table.
`TableResize`: Provides resize events for the resize bars.
# Tests
`snooker` uses [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) to run tests.
## Running Tests
`$ yarn test-manual`
`$ yarn test`
