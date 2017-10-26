/**
 * ForceBlocks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Makes sure that everything gets wrapped in paragraphs.
 *
 * @private
 * @class tinymce.ForceBlocks
 */
define(
  'tinymce.core.ForceBlocks',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'tinymce.core.dom.BookmarkManager',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.Parents',
    'tinymce.core.focus.EditorFocus'
  ],
  function (Arr, Fun, Element, BookmarkManager, NodeType, Parents, EditorFocus) {
    var isBlockElement = function (blockElements, node) {
      return blockElements.hasOwnProperty(node.nodeName);
    };

    var isValidTarget = function (blockElements, node) {
      if (NodeType.isText(node)) {
        return true;
      } else if (NodeType.isElement(node)) {
        return !isBlockElement(blockElements, node) && !BookmarkManager.isBookmarkNode(node);
      } else {
        return false;
      }
    };

    var hasBlockParent = function (blockElements, root, node) {
      return Arr.exists(Parents.parents(Element.fromDom(node), Element.fromDom(root)), function (elm) {
        return isBlockElement(blockElements, elm.dom());
      });
    };

    var addRootBlocks = function (editor) {
      var settings = editor.settings, dom = editor.dom, selection = editor.selection;
      var schema = editor.schema, blockElements = schema.getBlockElements();
      var node = selection.getStart(), rootNode = editor.getBody(), rng;
      var startContainer, startOffset, endContainer, endOffset, rootBlockNode;
      var tempNode, wrapped, restoreSelection;
      var rootNodeName, forcedRootBlock;

      forcedRootBlock = settings.forced_root_block;

      if (!node || !NodeType.isElement(node) || !forcedRootBlock) {
        return;
      }

      rootNodeName = rootNode.nodeName.toLowerCase();
      if (!schema.isValidChild(rootNodeName, forcedRootBlock.toLowerCase()) || hasBlockParent(blockElements, rootNode, node)) {
        return;
      }

      // Get current selection
      rng = selection.getRng();
      startContainer = rng.startContainer;
      startOffset = rng.startOffset;
      endContainer = rng.endContainer;
      endOffset = rng.endOffset;
      restoreSelection = EditorFocus.hasFocus(editor);

      // Wrap non block elements and text nodes
      node = rootNode.firstChild;
      while (node) {
        if (isValidTarget(blockElements, node)) {
          // Remove empty text nodes
          if (NodeType.isText(node) && node.nodeValue.length === 0) {
            tempNode = node;
            node = node.nextSibling;
            dom.remove(tempNode);
            continue;
          }

          if (!rootBlockNode) {
            rootBlockNode = dom.create(forcedRootBlock, editor.settings.forced_root_block_attrs);
            node.parentNode.insertBefore(rootBlockNode, node);
            wrapped = true;
          }

          tempNode = node;
          node = node.nextSibling;
          rootBlockNode.appendChild(tempNode);
        } else {
          rootBlockNode = null;
          node = node.nextSibling;
        }
      }

      if (wrapped && restoreSelection) {
        rng.setStart(startContainer, startOffset);
        rng.setEnd(endContainer, endOffset);
        selection.setRng(rng);
        editor.nodeChanged();
      }
    };

    var setup = function (editor) {
      if (editor.settings.forced_root_block) {
        editor.on('NodeChange', Fun.curry(addRootBlocks, editor));
      }
    };

    return {
      setup: setup
    };
  }
);