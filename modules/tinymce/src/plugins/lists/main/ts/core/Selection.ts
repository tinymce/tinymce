/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { SandHTMLElement } from '@ephox/sand';
import DomQuery from 'tinymce/core/api/dom/DomQuery';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as NodeType from './NodeType';

const getParentList = (editor: Editor, node?: Node) => {
  const selectionStart = node || editor.selection.getStart(true);

  return editor.dom.getParent(selectionStart, 'OL,UL,DL', getClosestListRootElm(editor, selectionStart));
};

const isParentListSelected = (parentList, selectedBlocks) => {
  return parentList && selectedBlocks.length === 1 && selectedBlocks[0] === parentList;
};

const findSubLists = (parentList) => {
  return Tools.grep(parentList.querySelectorAll('ol,ul,dl'), (elm: Node) => {
    return NodeType.isListNode(elm);
  });
};

const getSelectedSubLists = (editor) => {
  const parentList = getParentList(editor);
  const selectedBlocks = editor.selection.getSelectedBlocks();

  if (isParentListSelected(parentList, selectedBlocks)) {
    return findSubLists(parentList);
  } else {
    return Tools.grep(selectedBlocks, (elm: Node) => {
      return NodeType.isListNode(elm) && parentList !== elm;
    });
  }
};

const findParentListItemsNodes = (editor, elms) => {
  const listItemsElms = Tools.map(elms, (elm) => {
    const parentLi = editor.dom.getParent(elm, 'li,dd,dt', getClosestListRootElm(editor, elm));

    return parentLi ? parentLi : elm;
  });

  return DomQuery.unique(listItemsElms);
};

const getSelectedListItems = (editor) => {
  const selectedBlocks = editor.selection.getSelectedBlocks();
  return Tools.grep(findParentListItemsNodes(editor, selectedBlocks), (block) => {
    return NodeType.isListItemNode(block);
  });
};

const getSelectedDlItems = (editor: Editor): Node[] => Arr.filter(getSelectedListItems(editor), NodeType.isDlItemNode);

const getClosestListRootElm = (editor, elm) => {
  const parentTableCell = editor.dom.getParents(elm, 'TD,TH');
  const root = parentTableCell.length > 0 ? parentTableCell[0] : editor.getBody();

  return root;
};

const findLastParentListNode = (editor: Editor, elm: Node): Optional<Node> => {
  const parentLists = editor.dom.getParents(elm, 'ol,ul', getClosestListRootElm(editor, elm));
  return Arr.last(parentLists);
};

const getSelectedLists = (editor: Editor): Node[] => {
  const firstList = findLastParentListNode(editor, editor.selection.getStart());
  const subsequentLists = Arr.filter(editor.selection.getSelectedBlocks(), NodeType.isOlUlNode);

  return firstList.toArray().concat(subsequentLists);
};

const getSelectedListRoots = (editor: Editor): Node[] => {
  const selectedLists = getSelectedLists(editor);
  return getUniqueListRoots(editor, selectedLists);
};

const getUniqueListRoots = (editor: Editor, lists: Node[]): Node[] => {
  const listRoots = Arr.map(lists, (list) => findLastParentListNode(editor, list).getOr(list));
  return DomQuery.unique(listRoots);
};

const isList = (editor: Editor): boolean => {
  const list = getParentList(editor);
  return SandHTMLElement.isPrototypeOf(list);
};

export {
  isList,
  getParentList,
  getSelectedSubLists,
  getSelectedListItems,
  getClosestListRootElm,
  getSelectedDlItems,
  getSelectedListRoots
};
