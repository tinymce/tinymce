/**
 * NewLineUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.newline.NewLineUtils',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'tinymce.core.dom.ElementType',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.TreeWalker'
  ],
  function (Fun, Option, Element, ElementType, NodeType, TreeWalker) {
    var firstNonWhiteSpaceNodeSibling = function (node) {
      while (node) {
        if (node.nodeType === 1 || (node.nodeType === 3 && node.data && /[\r\n\s]/.test(node.data))) {
          return node;
        }

        node = node.nextSibling;
      }
    };

    var moveToCaretPosition = function (editor, root) {
      var walker, node, rng, lastNode = root, tempElm, dom = editor.dom;
      var moveCaretBeforeOnEnterElementsMap = editor.schema.getMoveCaretBeforeOnEnterElements();

      if (!root) {
        return;
      }

      if (/^(LI|DT|DD)$/.test(root.nodeName)) {
        var firstChild = firstNonWhiteSpaceNodeSibling(root.firstChild);

        if (firstChild && /^(UL|OL|DL)$/.test(firstChild.nodeName)) {
          root.insertBefore(dom.doc.createTextNode('\u00a0'), root.firstChild);
        }
      }

      rng = dom.createRng();
      root.normalize();

      if (root.hasChildNodes()) {
        walker = new TreeWalker(root, root);

        while ((node = walker.current())) {
          if (NodeType.isText(node)) {
            rng.setStart(node, 0);
            rng.setEnd(node, 0);
            break;
          }

          if (moveCaretBeforeOnEnterElementsMap[node.nodeName.toLowerCase()]) {
            rng.setStartBefore(node);
            rng.setEndBefore(node);
            break;
          }

          lastNode = node;
          node = walker.next();
        }

        if (!node) {
          rng.setStart(lastNode, 0);
          rng.setEnd(lastNode, 0);
        }
      } else {
        if (NodeType.isBr(root)) {
          if (root.nextSibling && dom.isBlock(root.nextSibling)) {
            rng.setStartBefore(root);
            rng.setEndBefore(root);
          } else {
            rng.setStartAfter(root);
            rng.setEndAfter(root);
          }
        } else {
          rng.setStart(root, 0);
          rng.setEnd(root, 0);
        }
      }

      editor.selection.setRng(rng);

      // Remove tempElm created for old IE:s
      dom.remove(tempElm);
      editor.selection.scrollIntoView(root);
    };

    var getEditableRoot = function (dom, node) {
      var root = dom.getRoot(), parent, editableRoot;

      // Get all parents until we hit a non editable parent or the root
      parent = node;
      while (parent !== root && dom.getContentEditable(parent) !== "false") {
        if (dom.getContentEditable(parent) === "true") {
          editableRoot = parent;
        }

        parent = parent.parentNode;
      }

      return parent !== root ? editableRoot : root;
    };

    var getParentBlock = function (editor) {
      return Option.from(editor.dom.getParent(editor.selection.getStart(true), editor.dom.isBlock));
    };

    var getParentBlockName = function (editor) {
      return getParentBlock(editor).fold(
        Fun.constant(''),
        function (parentBlock) {
          return parentBlock.nodeName.toUpperCase();
        }
      );
    };

    var isListItemParentBlock = function (editor) {
      return getParentBlock(editor).filter(function (elm) {
        return ElementType.isListItem(Element.fromDom(elm));
      }).isSome();
    };

    return {
      moveToCaretPosition: moveToCaretPosition,
      getEditableRoot: getEditableRoot,
      getParentBlock: getParentBlock,
      getParentBlockName: getParentBlockName,
      isListItemParentBlock: isListItemParentBlock
    };
  }
);
