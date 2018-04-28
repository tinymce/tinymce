/**
 * Selection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import Tools from 'tinymce/core/api/util/Tools';
import NodeType from './NodeType';

const getParentList = function (editor) {
  const selectionStart = editor.selection.getStart(true);

  return editor.dom.getParent(selectionStart, 'OL,UL,DL', getClosestListRootElm(editor, selectionStart));
};

const isParentListSelected = function (parentList, selectedBlocks) {
  return parentList && selectedBlocks.length === 1 && selectedBlocks[0] === parentList;
};

const findSubLists = function (parentList) {
  return Tools.grep(parentList.querySelectorAll('ol,ul,dl'), function (elm) {
    return NodeType.isListNode(elm);
  });
};

const getSelectedSubLists = function (editor) {
  const parentList = getParentList(editor);
  const selectedBlocks = editor.selection.getSelectedBlocks();

  if (isParentListSelected(parentList, selectedBlocks)) {
    return findSubLists(parentList);
  } else {
    return Tools.grep(selectedBlocks, function (elm) {
      return NodeType.isListNode(elm) && parentList !== elm;
    });
  }
};

const findParentListItemsNodes = function (editor, elms) {
  const listItemsElms = Tools.map(elms, function (elm) {
    const parentLi = editor.dom.getParent(elm, 'li,dd,dt', getClosestListRootElm(editor, elm));

    return parentLi ? parentLi : elm;
  });

  return DomQuery.unique(listItemsElms);
};

const getSelectedListItems = function (editor) {
  const selectedBlocks = editor.selection.getSelectedBlocks();
  return Tools.grep(findParentListItemsNodes(editor, selectedBlocks), function (block) {
    return NodeType.isListItemNode(block);
  });
};

const getClosestListRootElm = function (editor, elm) {
  const parentTableCell = editor.dom.getParents(elm, 'TD,TH');
  const root = parentTableCell.length > 0 ? parentTableCell[0] : editor.getBody();

  return root;
};

export default {
  getParentList,
  getSelectedSubLists,
  getSelectedListItems,
  getClosestListRootElm
};