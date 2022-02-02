/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as NodeType from './NodeType';

const getParentList = (editor: Editor, node?: Node): HTMLElement => {
  const selectionStart = node || editor.selection.getStart(true);

  return editor.dom.getParent(selectionStart, 'OL,UL,DL', getClosestListRootElm(editor, selectionStart));
};

const isParentListSelected = (parentList: HTMLElement, selectedBlocks: Element[]): boolean =>
  parentList && selectedBlocks.length === 1 && selectedBlocks[0] === parentList;

const findSubLists = (parentList: HTMLElement): HTMLElement[] =>
  Arr.filter(parentList.querySelectorAll('ol,ul,dl'), NodeType.isListNode);

const getSelectedSubLists = (editor: Editor): HTMLElement[] => {
  const parentList = getParentList(editor);
  const selectedBlocks = editor.selection.getSelectedBlocks();

  if (isParentListSelected(parentList, selectedBlocks)) {
    return findSubLists(parentList);
  } else {
    return Arr.filter(selectedBlocks, (elm): elm is HTMLElement => {
      return NodeType.isListNode(elm) && parentList !== elm;
    });
  }
};

const findParentListItemsNodes = (editor: Editor, elms: Element[]): Element[] => {
  const listItemsElms = Tools.map(elms, (elm) => {
    const parentLi = editor.dom.getParent(elm, 'li,dd,dt', getClosestListRootElm(editor, elm));

    return parentLi ? parentLi : elm;
  });

  return DomQuery.unique(listItemsElms);
};

const getSelectedListItems = (editor: Editor): Array<HTMLLIElement | HTMLElement> => {
  const selectedBlocks = editor.selection.getSelectedBlocks();
  return Arr.filter(findParentListItemsNodes(editor, selectedBlocks), NodeType.isListItemNode);
};

const getSelectedDlItems = (editor: Editor): HTMLElement[] =>
  Arr.filter(getSelectedListItems(editor), NodeType.isDlItemNode);

const getClosestListRootElm = (editor: Editor, elm: Node): HTMLElement => {
  const parentTableCell = editor.dom.getParents<HTMLTableCellElement>(elm, 'TD,TH');
  return parentTableCell.length > 0 ? parentTableCell[0] : editor.getBody();
};

const findLastParentListNode = (editor: Editor, elm: Node): Optional<HTMLOListElement | HTMLUListElement> => {
  const parentLists = editor.dom.getParents<HTMLOListElement | HTMLUListElement>(elm, 'ol,ul', getClosestListRootElm(editor, elm));
  return Arr.last(parentLists);
};

const getSelectedLists = (editor: Editor): Array<HTMLOListElement | HTMLUListElement> => {
  const firstList = findLastParentListNode(editor, editor.selection.getStart());
  const subsequentLists = Arr.filter(editor.selection.getSelectedBlocks(), NodeType.isOlUlNode);

  return firstList.toArray().concat(subsequentLists);
};

const getSelectedListRoots = (editor: Editor): HTMLElement[] => {
  const selectedLists = getSelectedLists(editor);
  return getUniqueListRoots(editor, selectedLists);
};

const getUniqueListRoots = (editor: Editor, lists: HTMLElement[]): HTMLElement[] => {
  const listRoots = Arr.map(lists, (list) => findLastParentListNode(editor, list).getOr(list));
  return DomQuery.unique(listRoots);
};

export {
  getParentList,
  getSelectedSubLists,
  getSelectedListItems,
  getClosestListRootElm,
  getSelectedDlItems,
  getSelectedListRoots
};
