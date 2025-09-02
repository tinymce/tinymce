
# Description
Once completed, it is hoped that `darwin` will provide a framework for taking over selection entirely (like a DOM-based editor). At this stage, it is only being used for tables.
# Installation
`darwin` is available as an `npm` package.  You can install it via the npm package `@ephox/darwin`
## Install from npm
`npm install @ephox/darwin`

# Usage
1. Handling Webkit Up/Down in a Table

For Webkit browsers, when the user presses Up or Down, the native behaviour is to move to the next cell horizontally, not vertically. This confuses the user. The project `darwin` seeks to remedy this by potentially overriding the Up/Down key event.

With current the (element, offset)
a. If the user is on a <br> (or referencing a <br> by the parent offset), and the respective adjacent node is the edge of cell, restart the process but start from the edge of the cell. If the adjacent node is not the edge, DO NOT OVERRIDE the key. The browser should naturally move to the adjacent node.
b. If the user is not in a <br>, continue the process

c. find the (x, y) coordinate of the (element, offset) and shift it in the respective direction. Continue shifting until we find an element that contains this (x, y) position and the element's y position is different from the initial y position. Note, if we don't ... then DO NOT OVERRIDE the key.
d. find the element under the shifted (x, y) position, scrolling if necessary
e. assess this element by comparing it with the original element

  i. if the elements are in different rows, and the x values overlap, then this is the cell above/below the other one, and we have a successful override. OVERRIDE the key event.
  ii. if the elements are in different cells, and either different rows with a non x value overlap or the same row, repeat (c) with the respective edge of the cell.
  iii. DO NOT OVERRIDE the key event.

The purpose is that we are only overriding the key event if:

 1. we find an element that is horizontally aligned with the original element with a y value in the right direction.

Note, if we don't override the key, then the browser's default handling is considered good enough. This will be the case for pressing up/down near br tags that are not at the edge of the cell.
