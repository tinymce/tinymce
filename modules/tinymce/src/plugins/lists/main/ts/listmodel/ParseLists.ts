/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Optional } from '@ephox/katamari';
import { Compare, SugarElement, Traverse } from '@ephox/sugar';

import { createEntry, Entry } from './Entry';
import { isList } from './Util';

type Parser = (depth: number, itemSelection: Optional<ItemSelection>, selectionState: Cell<boolean>, element: SugarElement) => Entry[];

export interface ItemSelection {
  readonly start: SugarElement<HTMLElement>;
  readonly end: SugarElement<HTMLElement>;
}

export interface EntrySet {
  readonly entries: Entry[];
  readonly sourceList: SugarElement<HTMLElement>;
}

const parseItem: Parser = (depth: number, itemSelection: Optional<ItemSelection>, selectionState: Cell<boolean>, item: SugarElement<HTMLElement>): Entry[] =>
  Traverse.firstChild(item).filter(isList).fold(() => {

    // Update selectionState (start)
    itemSelection.each((selection) => {
      if (Compare.eq(selection.start, item)) {
        selectionState.set(true);
      }
    });

    const currentItemEntry = createEntry(item, depth, selectionState.get());

    // Update selectionState (end)
    itemSelection.each((selection) => {
      if (Compare.eq(selection.end, item)) {
        selectionState.set(false);
      }
    });

    const childListEntries: Entry[] = Traverse.lastChild(item)
      .filter(isList)
      .map((list) => parseList(depth, itemSelection, selectionState, list))
      .getOr([]);

    return currentItemEntry.toArray().concat(childListEntries);
  }, (list) => parseList(depth, itemSelection, selectionState, list));

const parseList: Parser = (depth: number, itemSelection: Optional<ItemSelection>, selectionState: Cell<boolean>, list: SugarElement<HTMLElement>): Entry[] =>
  Arr.bind(Traverse.children(list), (element) => {
    const parser = isList(element) ? parseList : parseItem;
    const newDepth = depth + 1;
    return parser(newDepth, itemSelection, selectionState, element);
  });

const parseLists = (lists: SugarElement<HTMLElement>[], itemSelection: Optional<ItemSelection>): EntrySet[] => {
  const selectionState = Cell(false);
  const initialDepth = 0;

  return Arr.map(lists, (list) => ({
    sourceList: list,
    entries: parseList(initialDepth, itemSelection, selectionState, list)
  }));
};

export { parseLists };
