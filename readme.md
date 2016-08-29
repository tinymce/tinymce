# Robin 

Groups sibling DOM nodes together by boundary points, for example the list of elements and nodes representing a word.

## Text node traversal within text boundaries

Robin text search API functions generally operate on and navigate through text nodes
rather than general DOM elements. Text searches also generally stop at boundary (block) elements such as DIVs.

## Finding a text node, given an element

If you have a DOM element and need to find a specific contained text node and offset to start searching from then consider the `phoenix` `DomDescent` API functions `freefallLtr()` and `freefallRtl()` functions which, given an element, return a text node and offset from the left-most or right-most end of the element, respectively.

## Test cases

Look at the `petrie` test cases for `DomTextSearch` in:
```
src/test/js/browser/projects/robin/api/DomTextSearchTest.js
```
