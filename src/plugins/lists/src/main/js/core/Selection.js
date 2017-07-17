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
    var findParentListItemsNodes = function (elms) {
      var listItemsElms = Tools.map(elms, function (elm) {
        var parentNode = elm.parentNode;

        if (NodeType.isListItemNode(elm)) {
          return elm;
        } else if (NodeType.isListItemNode(parentNode)) {
          return parentNode;
        } else {
          return elm;
        }
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
      getSelectedListItems: getSelectedListItems
    };
  }
);

