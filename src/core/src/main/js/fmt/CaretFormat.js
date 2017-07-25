/**
 * CaretFormat.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.fmt.CaretFormat',
  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'tinymce.core.dom.PaddingBr',
    'tinymce.core.dom.RangeUtils',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.fmt.ExpandRange',
    'tinymce.core.fmt.FormatUtils',
    'tinymce.core.fmt.MatchFormat',
    'tinymce.core.text.Zwsp',
    'tinymce.core.util.Fun',
    'tinymce.core.util.Tools'
  ],
  function (Arr, Element, PaddingBr, RangeUtils, TreeWalker, ExpandRange, FormatUtils, MatchFormat, Zwsp, Fun, Tools) {
    var ZWSP = Zwsp.ZWSP, CARET_ID = '_mce_caret', DEBUG = false;

    var isCaretNode = function (node) {
      return node.nodeType === 1 && node.id === CARET_ID;
    };

    var isCaretContainerEmpty = function (node, nodes) {
      while (node) {
        if ((node.nodeType === 3 && node.nodeValue !== ZWSP) || node.childNodes.length > 1) {
          return false;
        }

        // Collect nodes
        if (nodes && node.nodeType === 1) {
          nodes.push(node);
        }

        node = node.firstChild;
      }

      return true;
    };

    var findFirstTextNode = function (node) {
      var walker;

      if (node) {
        walker = new TreeWalker(node, node);

        for (node = walker.current(); node; node = walker.next()) {
          if (node.nodeType === 3) {
            return node;
          }
        }
      }

      return null;
    };

    var createCaretContainer = function (dom, fill) {
      var caretContainer = dom.create('span', { id: CARET_ID, 'data-mce-bogus': '1', style: DEBUG ? 'color:red' : '' });

      if (fill) {
        caretContainer.appendChild(dom.doc.createTextNode(ZWSP));
      }

      return caretContainer;
    };

    var getParentCaretContainer = function (node) {
      while (node) {
        if (node.id === CARET_ID) {
          return node;
        }

        node = node.parentNode;
      }
    };

    // Checks if the parent caret container node isn't empty if that is the case it
    // will remove the bogus state on all children that isn't empty
    var unmarkBogusCaretParents = function (dom, selection) {
      var caretContainer;

      caretContainer = getParentCaretContainer(selection.getStart());
      if (caretContainer && !dom.isEmpty(caretContainer)) {
        Tools.walk(caretContainer, function (node) {
          if (node.nodeType === 1 && node.id !== CARET_ID && !dom.isEmpty(node)) {
            dom.setAttrib(node, 'data-mce-bogus', null);
          }
        }, 'childNodes');
      }
    };

    var trimZwspFromCaretContainer = function (caretContainerNode) {
      var textNode = findFirstTextNode(caretContainerNode);
      if (textNode && textNode.nodeValue.charAt(0) === ZWSP) {
        textNode.deleteData(0, 1);
      }

      return textNode;
    };

    var removeCaretContainerNode = function (dom, selection, node, moveCaret) {
      var rng, block, textNode;

      rng = selection.getRng(true);
      block = dom.getParent(node, dom.isBlock);

      if (isCaretContainerEmpty(node)) {
        if (moveCaret !== false) {
          rng.setStartBefore(node);
          rng.setEndBefore(node);
        }

        dom.remove(node);
      } else {
        textNode = trimZwspFromCaretContainer(node);
        if (rng.startContainer === textNode && rng.startOffset > 0) {
          rng.setStart(textNode, rng.startOffset - 1);
        }

        if (rng.endContainer === textNode && rng.endOffset > 0) {
          rng.setEnd(textNode, rng.endOffset - 1);
        }

        dom.remove(node, true);
      }

      if (block && dom.isEmpty(block)) {
        PaddingBr.fillWithPaddingBr(Element.fromDom(block));
      }

      selection.setRng(rng);
    };

    // Removes the caret container for the specified node or all on the current document
    var removeCaretContainer = function (dom, selection, node, moveCaret) {
      if (!node) {
        node = getParentCaretContainer(selection.getStart());

        if (!node) {
          while ((node = dom.get(CARET_ID))) {
            removeCaretContainerNode(dom, selection, node, false);
          }
        }
      } else {
        removeCaretContainerNode(dom, selection, node, moveCaret);
      }
    };

    var insertCaretContainerNode = function (editor, caretContainer, formatNode) {
      var dom = editor.dom, block = dom.getParent(formatNode, Fun.curry(FormatUtils.isTextBlock, editor));

      if (block && dom.isEmpty(block)) {
        // Replace formatNode with caretContainer when removing format from empty block like <p><b>|</b></p>
        formatNode.parentNode.replaceChild(caretContainer, formatNode);
      } else {
        PaddingBr.removeTrailingBr(Element.fromDom(formatNode));
        if (dom.isEmpty(formatNode)) {
          formatNode.parentNode.replaceChild(caretContainer, formatNode);
        } else {
          dom.insertAfter(caretContainer, formatNode);
        }
      }
    };

    var appendNode = function (parentNode, node) {
      parentNode.appendChild(node);
      return node;
    };

    var insertFormatNodesIntoCaretContainer = function (formatNodes, caretContainer) {
      var innerMostFormatNode = Arr.foldr(formatNodes, function (parentNode, formatNode) {
        return appendNode(parentNode, formatNode.cloneNode(false));
      }, caretContainer);

      return appendNode(innerMostFormatNode, innerMostFormatNode.ownerDocument.createTextNode(ZWSP));
    };

    var setupCaretEvents = function (editor) {
      if (!editor._hasCaretEvents) {
        bindEvents(editor);
        editor._hasCaretEvents = true;
      }
    };

    var applyCaretFormat = function (editor, name, vars) {
      var rng, caretContainer, textNode, offset, bookmark, container, text;
      var dom = editor.dom, selection = editor.selection;

      setupCaretEvents(editor);

      rng = selection.getRng(true);
      offset = rng.startOffset;
      container = rng.startContainer;
      text = container.nodeValue;

      caretContainer = getParentCaretContainer(selection.getStart());
      if (caretContainer) {
        textNode = findFirstTextNode(caretContainer);
      }

      // Expand to word if caret is in the middle of a text node and the char before/after is a alpha numeric character
      var wordcharRegex = /[^\s\u00a0\u00ad\u200b\ufeff]/;
      if (text && offset > 0 && offset < text.length &&
        wordcharRegex.test(text.charAt(offset)) && wordcharRegex.test(text.charAt(offset - 1))) {
        // Get bookmark of caret position
        bookmark = selection.getBookmark();

        // Collapse bookmark range (WebKit)
        rng.collapse(true);

        // Expand the range to the closest word and split it at those points
        rng = ExpandRange.expandRng(editor, rng, editor.formatter.get(name));
        rng = new RangeUtils(dom).split(rng);

        // Apply the format to the range
        editor.formatter.apply(name, vars, rng);

        // Move selection back to caret position
        selection.moveToBookmark(bookmark);
      } else {
        if (!caretContainer || textNode.nodeValue !== ZWSP) {
          caretContainer = createCaretContainer(dom, true);
          textNode = caretContainer.firstChild;

          rng.insertNode(caretContainer);
          offset = 1;

          editor.formatter.apply(name, vars, caretContainer);
        } else {
          editor.formatter.apply(name, vars, caretContainer);
        }

        // Move selection to text node
        selection.setCursorLocation(textNode, offset);
      }
    };

    var removeCaretFormat = function (editor, name, vars, similar) {
      var dom = editor.dom, selection = editor.selection;
      var rng = selection.getRng(true), container, offset, bookmark;
      var hasContentAfter, node, formatNode, parents = [], caretContainer;

      setupCaretEvents(editor);

      container = rng.startContainer;
      offset = rng.startOffset;
      node = container;

      if (container.nodeType === 3) {
        if (offset !== container.nodeValue.length) {
          hasContentAfter = true;
        }

        node = node.parentNode;
      }

      while (node) {
        if (MatchFormat.matchNode(editor, node, name, vars, similar)) {
          formatNode = node;
          break;
        }

        if (node.nextSibling) {
          hasContentAfter = true;
        }

        parents.push(node);
        node = node.parentNode;
      }

      // Node doesn't have the specified format
      if (!formatNode) {
        return;
      }

      // Is there contents after the caret then remove the format on the element
      if (hasContentAfter) {
        bookmark = selection.getBookmark();

        // Collapse bookmark range (WebKit)
        rng.collapse(true);

        // Expand the range to the closest word and split it at those points
        rng = ExpandRange.expandRng(editor, rng, editor.formatter.get(name), true);
        rng = new RangeUtils(dom).split(rng);

        editor.formatter.remove(name, vars, rng);
        selection.moveToBookmark(bookmark);
      } else {
        caretContainer = getParentCaretContainer(formatNode);
        var newCaretContainer = createCaretContainer(dom, false);
        var caretNode = insertFormatNodesIntoCaretContainer(parents, newCaretContainer);

        if (caretContainer) {
          insertCaretContainerNode(editor, newCaretContainer, caretContainer);
        } else {
          insertCaretContainerNode(editor, newCaretContainer, formatNode);
        }

        removeCaretContainerNode(dom, selection, caretContainer, false);
        selection.setCursorLocation(caretNode, 1);

        if (dom.isEmpty(formatNode)) {
          dom.remove(formatNode);
        }
      }
    };

    var bindEvents = function (editor) {
      var dom = editor.dom, selection = editor.selection;

      if (!editor._hasCaretEvents) {
        var markCaretContainersBogus, disableCaretContainer;

        editor.on('BeforeGetContent', function (e) {
          if (markCaretContainersBogus && e.format !== 'raw') {
            markCaretContainersBogus();
          }
        });

        editor.on('mouseup keydown', function (e) {
          if (disableCaretContainer) {
            disableCaretContainer(e);
          }
        });

        // Mark current caret container elements as bogus when getting the contents so we don't end up with empty elements
        markCaretContainersBogus = function () {
          var nodes = [], i;

          if (isCaretContainerEmpty(getParentCaretContainer(selection.getStart()), nodes)) {
            // Mark children
            i = nodes.length;
            while (i--) {
              dom.setAttrib(nodes[i], 'data-mce-bogus', '1');
            }
          }
        };

        disableCaretContainer = function (e) {
          var keyCode = e.keyCode;

          removeCaretContainer(dom, selection, null, false);

          // Remove caret container if it's empty
          if (keyCode === 8 && selection.isCollapsed() && selection.getStart().innerHTML === ZWSP) {
            removeCaretContainer(dom, selection, getParentCaretContainer(selection.getStart()));
          }

          // Remove caret container on keydown and it's left/right arrow keys
          if (keyCode === 37 || keyCode === 39) {
            removeCaretContainer(dom, selection, getParentCaretContainer(selection.getStart()));
          }

          unmarkBogusCaretParents(dom, selection);
        };

        // Remove bogus state if they got filled by contents using editor.selection.setContent
        editor.on('SetContent', function (e) {
          if (e.selection) {
            unmarkBogusCaretParents(dom, selection);
          }
        });
        editor._hasCaretEvents = true;
      }
    };

    return {
      applyCaretFormat: applyCaretFormat,
      removeCaretFormat: removeCaretFormat,
      isCaretNode: isCaretNode
    };
  }
);