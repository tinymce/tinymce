import { Arr, Fun, Option } from '@ephox/katamari';
import { Attr, Element, Node, SelectorFilter, SelectorFind, Selectors, Traverse } from '@ephox/sugar';
import LayerSelector from '../util/LayerSelector';
import * as Structs from './Structs';

// lookup inside this table
const lookup = function (tags: string[], element: Element, isRoot: (e: Element) => boolean = Fun.never): Option<Element> {
  // If the element we're inspecting is the root, we definitely don't want it.
  if (isRoot(element)) {
    return Option.none();
  }
  // This looks a lot like SelectorFind.closest, with one big exception - the isRoot check.
  // The code here will look for parents if passed a table, SelectorFind.closest with that specific isRoot check won't.
  if (Arr.contains(tags, Node.name(element))) {
    return Option.some(element);
  }

  const isRootOrUpperTable = function (elm: Element) {
    return Selectors.is(elm, 'table') || isRoot(elm);
  };

  return SelectorFind.ancestor(element, tags.join(','), isRootOrUpperTable);
};

/*
 * Identify the optional cell that element represents.
 */
const cell = function (element: Element, isRoot?: (e: Element) => boolean) {
  return lookup([ 'td', 'th' ], element, isRoot);
};

const cells = function (ancestor: Element) {
  return LayerSelector.firstLayer(ancestor, 'th,td');
};

const notCell = function (element: Element, isRoot?: (e: Element) => boolean) {
  return lookup([ 'caption', 'tr', 'tbody', 'tfoot', 'thead' ], element, isRoot);
};

const neighbours = function (selector: string, element: Element) {
  return Traverse.parent(element).map(function (parent) {
    return SelectorFilter.children(parent, selector);
  });
};

const neighbourCells = Fun.curry(neighbours, 'th,td');
const neighbourRows  = Fun.curry(neighbours, 'tr');

const firstCell = function (ancestor: Element) {
  return SelectorFind.descendant(ancestor, 'th,td');
};

const table = function (element: Element, isRoot?: (e: Element) => boolean) {
  return SelectorFind.closest(element, 'table', isRoot);
};

const row = function (element: Element, isRoot?: (e: Element) => boolean) {
   return lookup([ 'tr' ], element, isRoot);
};

const rows = function (ancestor: Element) {
  return LayerSelector.firstLayer(ancestor, 'tr');
};

const attr = function (element: Element, property: string) {
  return parseInt(Attr.get(element, property), 10);
};

const grid = function (element: Element, rowProp: string, colProp: string) {
  const rowsCount = attr(element, rowProp);
  const cols = attr(element, colProp);
  return Structs.grid(rowsCount, cols);
};

export default {
  cell,
  firstCell,
  cells,
  neighbourCells,
  table,
  row,
  rows,
  notCell,
  neighbourRows,
  attr,
  grid
};