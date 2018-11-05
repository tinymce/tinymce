/**
 * ParseLists.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Cell, Fun, Option } from '@ephox/katamari';
import { Attr, Compare, Element, Replication, Traverse } from '@ephox/sugar';
import { getListType, isList, ListType } from './ListType';
import { Entry } from './Entry';

type Parser = (depth: number, itemSelection: Option<ItemTuple>, selectionState: Cell<boolean>, el: Element) => Entry[];

export interface ItemTuple {
  start: Element;
  end: Element;
}

export interface EntrySet {
  entries: Entry[];
  sourceList: Element;
}

const getItemContent = (li: Element): Element[] => {
  const childNodes = Traverse.children(li);
  const hasSublist = Arr.last(childNodes).map(isList).getOr(false);
  const contentLength = childNodes.length + (hasSublist ? -1 : 0);
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

  const updateSelectionState = (section: 'start' | 'end') => itemSelection.each((selection) => {
    if (Compare.eq(selection[section], item)) {
      selectionState.set(section === 'start');
    }
  });

  return Traverse.firstChild(item).filter(isList).fold(() => {
    updateSelectionState('start');
    const fromCurrentItem: Entry = createEntry(item, depth, selectionState.get());
    updateSelectionState('end');
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
