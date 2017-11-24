/**
 * InsertLi.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.newline.InsertLi',
  [
    'tinymce.core.dom.NodeType',
    'tinymce.core.newline.NewLineUtils'
  ],
  function (NodeType, NewLineUtils) {
    var hasFirstChild = function (elm, name) {
      return elm.firstChild && elm.firstChild.nodeName === name;
    };

    var hasParent = function (elm, parentName) {
      return elm && elm.parentNode && elm.parentNode.nodeName === parentName;
    };

    var isListBlock = function (elm) {
      return elm && /^(OL|UL|LI)$/.test(elm.nodeName);
    };

    var isNestedList = function (elm) {
      return isListBlock(elm) && isListBlock(elm.parentNode);
    };

    var getContainerBlock = function (containerBlock) {
      var containerBlockParent = containerBlock.parentNode;

      if (/^(LI|DT|DD)$/.test(containerBlockParent.nodeName)) {
        return containerBlockParent;
      }

      return containerBlock;
    };

    var isFirstOrLastLi = function (containerBlock, parentBlock, first) {
      var node = containerBlock[first ? 'firstChild' : 'lastChild'];

      // Find first/last element since there might be whitespace there
      while (node) {
        if (NodeType.isElement(node)) {
          break;
        }

        node = node[first ? 'nextSibling' : 'previousSibling'];
      }

      return node === parentBlock;
    };

    // Inserts a block or br before/after or in the middle of a split list of the LI is empty
    var insert = function (editor, createNewBlock, containerBlock, parentBlock, newBlockName) {
      var dom = editor.dom;
      var rng = editor.selection.getRng();

      if (containerBlock === editor.getBody()) {
        return;
      }

      if (isNestedList(containerBlock)) {
        newBlockName = 'LI';
      }

      var newBlock = newBlockName ? createNewBlock(newBlockName) : dom.create('BR');

      if (isFirstOrLastLi(containerBlock, parentBlock, true) && isFirstOrLastLi(containerBlock, parentBlock, false)) {
        if (hasParent(containerBlock, 'LI')) {
          // Nested list is inside a LI
          dom.insertAfter(newBlock, getContainerBlock(containerBlock));
        } else {
          // Is first and last list item then replace the OL/UL with a text block
          dom.replace(newBlock, containerBlock);
        }
      } else if (isFirstOrLastLi(containerBlock, parentBlock, true)) {
        if (hasParent(containerBlock, 'LI')) {
          // List nested in an LI then move the list to a new sibling LI
          dom.insertAfter(newBlock, getContainerBlock(containerBlock));
          newBlock.appendChild(dom.doc.createTextNode(' ')); // Needed for IE so the caret can be placed
          newBlock.appendChild(containerBlock);
        } else {
          // First LI in list then remove LI and add text block before list
          containerBlock.parentNode.insertBefore(newBlock, containerBlock);
        }
      } else if (isFirstOrLastLi(containerBlock, parentBlock, false)) {
        // Last LI in list then remove LI and add text block after list
        dom.insertAfter(newBlock, getContainerBlock(containerBlock));
      } else {
        // Middle LI in list the split the list and insert a text block in the middle
        // Extract after fragment and insert it after the current block
        containerBlock = getContainerBlock(containerBlock);
        var tmpRng = rng.cloneRange();
        tmpRng.setStartAfter(parentBlock);
        tmpRng.setEndAfter(containerBlock);
        var fragment = tmpRng.extractContents();

        if (newBlockName === 'LI' && hasFirstChild(fragment, 'LI')) {
          newBlock = fragment.firstChild;
          dom.insertAfter(fragment, containerBlock);
        } else {
          dom.insertAfter(fragment, containerBlock);
          dom.insertAfter(newBlock, containerBlock);
        }
      }

      dom.remove(parentBlock);
      NewLineUtils.moveToCaretPosition(editor, newBlock);
    };

    return {
      insert: insert
    };
  }
);
