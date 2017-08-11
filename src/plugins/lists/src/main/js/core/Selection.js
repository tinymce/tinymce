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
      return editor.dom.getParent(editor.selection.getStart(true), 'OL,UL,DL');
    };

    var getSelectedSubLists = function (editor) {
      var parentList = getParentList(editor);
      return Tools.grep(editor.selection.getSelectedBlocks(), function (elm) {
        return NodeType.isListNode(elm) && parentList !== elm;
      });
    };

    var findParentListItemsNodes = function (elms) {
      var listItemsElms = Tools.map(elms, function (elm) {
        var parentNode = elm.parentNode;
        return !NodeType.isListItemNode(elm) && NodeType.isListItemNode(parentNode) ? parentNode : elm;
      });

      return DomQuery.unique(listItemsElms);
    };

    var getSelectedListItems = function (editor) {
      var selectedBlocks = editor.selection.getSelectedBlocks();
      return Tools.grep(findParentListItemsNodes(selectedBlocks), function (block) {
        return NodeType.isListItemNode(block);
      });
    };

    return {
      getParentList: getParentList,
      getSelectedSubLists: getSelectedSubLists,
      getSelectedListItems: getSelectedListItems
    };
  }
);

