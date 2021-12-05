import { Arr, Fun, Optional } from '@ephox/katamari';
import { SelectorFilter, SelectorFind, Selectors, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import { getAttrValue } from '../util/CellUtils';
import * as LayerSelector from '../util/LayerSelector';
import * as Structs from './Structs';

type IsRootFn = (e: SugarElement<Node>) => boolean;

// lookup inside this table
const lookup = <T extends Element> (tags: string[], element: SugarElement<Node>, isRoot: IsRootFn = Fun.never): Optional<SugarElement<T>> => {
  // If the element we're inspecting is the root, we definitely don't want it.
  if (isRoot(element)) {
    return Optional.none();
  }
  // This looks a lot like SelectorFind.closest, with one big exception - the isRoot check.
  // The code here will look for parents if passed a table, SelectorFind.closest with that specific isRoot check won't.
  if (Arr.contains(tags, SugarNode.name(element))) {
    return Optional.some(element as SugarElement<T>);
  }

  const isRootOrUpperTable = (elm: SugarElement<Node>) => Selectors.is(elm, 'table') || isRoot(elm);

  return SelectorFind.ancestor<T>(element, tags.join(','), isRootOrUpperTable);
};

/*
 * Identify the optional cell that element represents.
 */
const cell = (element: SugarElement<Node>, isRoot?: IsRootFn): Optional<SugarElement<HTMLTableCellElement>> =>
  lookup<HTMLTableCellElement>([ 'td', 'th' ], element, isRoot);

const cells = (ancestor: SugarElement<Node>): SugarElement<HTMLTableCellElement>[] =>
  LayerSelector.firstLayer(ancestor, 'th,td');

const columns = (ancestor: SugarElement<Node>): SugarElement<HTMLTableColElement>[] => {
  if (Selectors.is(ancestor, 'colgroup')) {
    return SelectorFilter.children<HTMLTableColElement>(ancestor, 'col');
  } else {
    return Arr.bind(columnGroups(ancestor), (columnGroup) =>
      SelectorFilter.children<HTMLTableColElement>(columnGroup, 'col')
    );
  }
};

const notCell = (element: SugarElement<Node>, isRoot?: IsRootFn): Optional<SugarElement<Element>> =>
  lookup<Element>([ 'caption', 'tr', 'tbody', 'tfoot', 'thead' ], element, isRoot);

const neighbours = <T extends Element = Element> (selector: string) => (element: SugarElement<Node>): Optional<SugarElement<T>[]> =>
  Traverse.parent(element).map((parent) => SelectorFilter.children(parent, selector));

const neighbourCells = neighbours<HTMLTableCellElement>('th,td');
const neighbourRows = neighbours<HTMLTableRowElement>('tr');

const firstCell = (ancestor: SugarElement<Node>): Optional<SugarElement<HTMLTableCellElement>> =>
  SelectorFind.descendant<HTMLTableCellElement>(ancestor, 'th,td');

const table = (element: SugarElement<Node>, isRoot?: IsRootFn): Optional<SugarElement<HTMLTableElement>> =>
  SelectorFind.closest<HTMLTableElement>(element, 'table', isRoot);

const row = (element: SugarElement<Node>, isRoot?: IsRootFn): Optional<SugarElement<HTMLTableRowElement>> =>
  lookup<HTMLTableRowElement>([ 'tr' ], element, isRoot);

const rows = (ancestor: SugarElement<Node>): SugarElement<HTMLTableRowElement>[] =>
  LayerSelector.firstLayer(ancestor, 'tr');

const columnGroups = (ancestor: SugarElement<Node>): SugarElement<HTMLTableColElement>[] => table(ancestor).fold(
  Fun.constant([]),
  (table) => SelectorFilter.children<HTMLTableColElement>(table, 'colgroup')
);

const attr = (element: SugarElement<Element>, property: string): number =>
  getAttrValue(element, property);

const grid = (element: SugarElement<Element>, rowProp: string, colProp: string): Structs.Grid => {
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
  grid,
  columnGroups,
  columns
};
