import { Element as DomElement, HTMLTableCellElement, HTMLTableElement, HTMLTableRowElement } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Element, Node, SelectorFilter, SelectorFind, Selectors, Traverse } from '@ephox/sugar';
import { getAttrValue } from '../util/CellUtils';
import * as LayerSelector from '../util/LayerSelector';
import * as Structs from './Structs';

// lookup inside this table
const lookup = <T extends DomElement = DomElement> (tags: string[], element: Element, isRoot: (e: Element) => boolean = Fun.never): Option<Element<T>> => {
  // If the element we're inspecting is the root, we definitely don't want it.
  if (isRoot(element)) {
    return Option.none();
  }
  // This looks a lot like SelectorFind.closest, with one big exception - the isRoot check.
  // The code here will look for parents if passed a table, SelectorFind.closest with that specific isRoot check won't.
  if (Arr.contains(tags, Node.name(element))) {
    return Option.some(element);
  }

  const isRootOrUpperTable = (elm: Element) => Selectors.is(elm, 'table') || isRoot(elm);

  return SelectorFind.ancestor(element, tags.join(','), isRootOrUpperTable);
};

/*
 * Identify the optional cell that element represents.
 */
const cell = (element: Element, isRoot?: (e: Element) => boolean) => lookup<HTMLTableCellElement>([ 'td', 'th' ], element, isRoot);

const cells = (ancestor: Element): Element<HTMLTableCellElement>[] => LayerSelector.firstLayer(ancestor, 'th,td');

const notCell = (element: Element, isRoot?: (e: Element) => boolean) => lookup<DomElement>([ 'caption', 'tr', 'tbody', 'tfoot', 'thead' ], element, isRoot);

const neighbours = <T extends DomElement = DomElement> (selector: string) => (element: Element): Option<Element<T>[]> =>
  Traverse.parent(element).map((parent) => SelectorFilter.children(parent, selector));

const neighbourCells = neighbours<HTMLTableCellElement>('th,td');
const neighbourRows = neighbours<HTMLTableRowElement>('tr');

const firstCell = (ancestor: Element) => SelectorFind.descendant<HTMLTableCellElement>(ancestor, 'th,td');

const table = (element: Element, isRoot?: (e: Element) => boolean) => SelectorFind.closest<HTMLTableElement>(element, 'table', isRoot);

const row = (element: Element, isRoot?: (e: Element) => boolean) => lookup<HTMLTableRowElement>([ 'tr' ], element, isRoot);

const rows = (ancestor: Element): Element<HTMLTableRowElement>[] => LayerSelector.firstLayer(ancestor, 'tr');

const attr = (element: Element, property: string) => getAttrValue(element, property);

const grid = (element: Element, rowProp: string, colProp: string) => {
  const rowsCount = attr(element, rowProp);
  const cols = attr(element, colProp);
  return Structs.grid(rowsCount, cols);
};

export {
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
