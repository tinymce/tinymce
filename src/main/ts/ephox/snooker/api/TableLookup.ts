import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Structs from './Structs';
import LayerSelector from '../util/LayerSelector';
import { Attr, Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Selectors } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

// lookup inside this table
var lookup = function (tags: string[], element: Element, _isRoot?): Option<Element> {
  var isRoot = _isRoot !== undefined ? _isRoot : Fun.constant(false);
  // If the element we're inspecting is the root, we definitely don't want it.
  if (isRoot(element)) return Option.none();
  // This looks a lot like SelectorFind.closest, with one big exception - the isRoot check.
  // The code here will look for parents if passed a table, SelectorFind.closest with that specific isRoot check won't.
  if (Arr.contains(tags, Node.name(element))) return Option.some(element);

  var isRootOrUpperTable = function (element) {
    return Selectors.is(element, 'table') || isRoot(element);
  };

  return SelectorFind.ancestor(element, tags.join(','), isRootOrUpperTable);
};

/*
 * Identify the optional cell that element represents.
 */
var cell = function (element: Element, isRoot?) {
  return lookup([ 'td', 'th' ], element, isRoot);
};

var cells = function (ancestor: Element) {
  return LayerSelector.firstLayer(ancestor, 'th,td');
};

var notCell = function (element: Element, isRoot?) {
  return lookup([ 'caption', 'tr', 'tbody', 'tfoot', 'thead' ], element, isRoot);
};

var neighbours = function (selector: string, element: Element) {
  return Traverse.parent(element).map(function (parent) {
    return SelectorFilter.children(parent, selector);
  });
};

var neighbourCells = Fun.curry(neighbours, 'th,td');
var neighbourRows  = Fun.curry(neighbours, 'tr');

var firstCell = function (ancestor: Element) {
  return SelectorFind.descendant(ancestor, 'th,td');
};

var table = function (element: Element, isRoot?) {
  return SelectorFind.closest(element, 'table', isRoot);
};

var row = function (element: Element, isRoot?) {
   return lookup([ 'tr' ], element, isRoot);
};

var rows = function (ancestor: Element) {
  return LayerSelector.firstLayer(ancestor, 'tr');
};

var attr = function (element: Element, property: string) {
  return parseInt(Attr.get(element, property), 10);
};

var grid = function (element: Element, rowProp: string, colProp: string) {
  var rows = attr(element, rowProp);
  var cols = attr(element, colProp);
  return Structs.grid(rows, cols);
};

export default {
  cell: cell,
  firstCell: firstCell,
  cells: cells,
  neighbourCells: neighbourCells,
  table: table,
  row: row,
  rows: rows,
  notCell: notCell,
  neighbourRows: neighbourRows,
  attr: attr,
  grid: grid
};