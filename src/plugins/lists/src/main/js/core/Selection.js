/**
 * Selection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.lists.core.Selection',
  [
    'tinymce.core.dom.DomQuery',
    'tinymce.core.util.Tools',
    'tinymce.plugins.lists.core.NodeType'
  ],
  function (DomQuery, Tools, NodeType) {
    var getParentList = function (editor) {
      var selectionStart = editor.selection.getStart(true);

      return editor.dom.getParent(selectionStart, 'OL,UL,DL', getClosestListRootElm(editor, selectionStart));
    };

    var isParentListSelected = function (parentList, selectedBlocks) {
      return parentList && selectedBlocks.length === 1 && selectedBlocks[0] === parentList;
    };

    var findSubLists = function (parentList) {
      return Tools.grep(parentList.querySelectorAll('ol,ul,dl'), function (elm) {
        return NodeType.isListNode(elm);
      });
    };

    var getSelectedSubLists = function (editor) {
      var parentList = getParentList(editor);
      var selectedBlocks = editor.selection.getSelectedBlocks();

      if (isParentListSelected(parentList, selectedBlocks)) {
        return findSubLists(parentList);
      } else {
        return Tools.grep(selectedBlocks, function (elm) {
          return NodeType.isListNode(elm) && parentList !== elm;
        });
      }
    };

    var findParentListItemsNodes = function (editor, elms) {
      var listItemsElms = Tools.map(elms, function (elm) {
        var parentLi = editor.dom.getParent(elm, 'li,dd,dt', getClosestListRootElm(editor, elm));

        return parentLi ? parentLi : elm;
      });

      return DomQuery.unique(listItemsElms);
    };

    var getSelectedListItems = function (editor) {
      var selectedBlocks = editor.selection.getSelectedBlocks();
      return Tools.grep(findParentListItemsNodes(editor, selectedBlocks), function (block) {
        return NodeType.isListItemNode(block);
      });
    };

    var getClosestListRootElm = function (editor, elm) {
      var parentTableCell = editor.dom.getParents(elm, 'TD,TH');
      var root = parentTableCell.length > 0 ? parentTableCell[0] : editor.getBody();

      return root;
    };

    return {
      getParentList: getParentList,
      getSelectedSubLists: getSelectedSubLists,
      getSelectedListItems: getSelectedListItems,
      getClosestListRootElm: getClosestListRootElm
    };
  }
);

