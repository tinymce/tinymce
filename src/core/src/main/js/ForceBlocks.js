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
    'ephox.katamari.api.Fun'
  ],
  function (Fun) {
    var addRootBlocks = function (editor) {
      var settings = editor.settings, dom = editor.dom, selection = editor.selection;
      var schema = editor.schema, blockElements = schema.getBlockElements();
      var node = selection.getStart(), rootNode = editor.getBody(), rng;
      var startContainer, startOffset, endContainer, endOffset, rootBlockNode;
      var tempNode, wrapped, restoreSelection;
      var rootNodeName, forcedRootBlock;

      forcedRootBlock = settings.forced_root_block;

      if (!node || node.nodeType !== 1 || !forcedRootBlock) {
        return;
      }

      // Check if node is wrapped in block
      while (node && node !== rootNode) {
        if (blockElements[node.nodeName]) {
          return;
        }

        node = node.parentNode;
      }

      // Get current selection
      rng = selection.getRng();
      startContainer = rng.startContainer;
      startOffset = rng.startOffset;
      endContainer = rng.endContainer;
      endOffset = rng.endOffset;

      try {
        restoreSelection = editor.getDoc().activeElement === rootNode;
      } catch (ex) {
        // IE throws unspecified error here sometimes
      }

      // Wrap non block elements and text nodes
      node = rootNode.firstChild;
      rootNodeName = rootNode.nodeName.toLowerCase();
      while (node) {
        // TODO: Break this up, too complex
        if (((node.nodeType === 3 || (node.nodeType == 1 && !blockElements[node.nodeName]))) &&
          schema.isValidChild(rootNodeName, forcedRootBlock.toLowerCase())) {
          // Remove empty text nodes
          if (node.nodeType === 3 && node.nodeValue.length === 0) {
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