/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Fun, Option } from '@ephox/katamari';
import { Attr, Compare, Element, Replication, Traverse } from '@ephox/sugar';
import { getListType, isList, ListType } from './ListType';
import { Entry } from './Entry';
import { hasLastChildList } from './Util';

type Parser = (depth: number, itemSelection: Option<ItemTuple>, selectionState: Cell<boolean>, el: Element) => Entry[];

export interface ItemTuple {
  start: Element;
  end: Element;
}

export interface EntrySet {
  entries: Entry[];
  sourceList: Element;
}

const enum ItemRange {
  Start = 'Start',
  End = 'End'
}

const getItemContent = (li: Element): Element[] => {
  const childNodes = Traverse.children(li);
  const contentLength = childNodes.length + (hasLastChildList(li) ? -1 : 0);
  return Arr.map(childNodes.slice(0, contentLength), Replication.deep);
};

const createEntry = (li: Element, depth: number, isSelected: boolean): Entry => {
  const list = Traverse.parent(li);
  return {
    depth,
    isSelected,
    content: getItemContent(li),
    listType: list.bind(getListType).getOr(ListType.OL),
    listAttributes: list.map(Attr.clone).getOr({}),
    itemAttributes: Attr.clone(li)
  };
};

const parseItem: Parser = (depth: number, itemSelection: Option<ItemTuple>, selectionState: Cell<boolean>, item: Element): Entry[] => {
  const curriedParseList = Fun.curry(parseList, depth, itemSelection, selectionState);

  const updateSelectionState = (itemRange: ItemRange) => itemSelection.each((selection) => {
    if (Compare.eq(itemRange === ItemRange.Start ? selection.start : selection.end, item)) {
      selectionState.set(itemRange === ItemRange.Start);
    }
  });

  return Traverse.firstChild(item).filter(isList).fold(() => {
    updateSelectionState(ItemRange.Start);
    const fromCurrentItem: Entry = createEntry(item, depth, selectionState.get());
    updateSelectionState(ItemRange.End);
    const fromChildList: Entry[] = Traverse.lastChild(item).filter(isList).map(curriedParseList).getOr([]);

    return [ fromCurrentItem, ...fromChildList ];
  }, curriedParseList);
};

const parseList: Parser = (depth: number, itemSelection: Option<ItemTuple>, selectionState: Cell<boolean>, list: Element): Entry[] => {
  const newDepth = depth + 1;
  return Arr.bind(Traverse.children(list), (child) =>
    isList(child) ? parseList(newDepth, itemSelection, selectionState, child) : parseItem(newDepth, itemSelection, selectionState, child)
  );
};

const parseLists = (lists: Element[], itemSelection: Option<ItemTuple>): EntrySet[] => {
  const selectionState = Cell(false);
  const initialDepth = 0;

  return Arr.map(lists, (list) => ({
    entries: parseList(initialDepth, itemSelection, selectionState, list),
    sourceList: list
  }));
};

export { parseLists };
