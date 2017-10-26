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
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.PaddingBr',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.fmt.ExpandRange',
    'tinymce.core.fmt.FormatUtils',
    'tinymce.core.fmt.MatchFormat',
    'tinymce.core.selection.SplitRange',
    'tinymce.core.text.Zwsp',
    'tinymce.core.util.Fun',
    'tinymce.core.util.Tools'
  ],
  function (
    Arr, Insert, Remove, Element, Node, Attr, SelectorFind, CaretPosition, NodeType, PaddingBr, TreeWalker, ExpandRange, FormatUtils, MatchFormat, SplitRange,
    Zwsp, Fun, Tools
  ) {
    var ZWSP = Zwsp.ZWSP, CARET_ID = '_mce_caret';

    var importNode = function (ownerDocument, node) {
      return ownerDocument.importNode(node, true);
    };

    var isCaretNode = function (node) {
      return node.nodeType === 1 && node.id === CARET_ID;
    };

    var getEmptyCaretContainers = function (node) {
      var nodes = [];

      while (node) {
        if ((node.nodeType === 3 && node.nodeValue !== ZWSP) || node.childNodes.length > 1) {
          return [];
        }

        // Collect nodes
        if (node.nodeType === 1) {
          nodes.push(node);
        }

        node = node.firstChild;
      }

      return nodes;
    };

    var isCaretContainerEmpty = function (node) {
      return getEmptyCaretContainers(node).length > 0;
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

    var createCaretContainer = function (fill) {
      var caretContainer = Element.fromTag('span');

      Attr.setAll(caretContainer, {
        //style: 'color:red',
        id: CARET_ID,
        'data-mce-bogus': '1'
      });

      if (fill) {
        Insert.append(caretContainer, Element.fromText(ZWSP));
      }

      return caretContainer;
    };

    var getParentCaretContainer = function (body, node) {
      while (node && node !== body) {
        if (node.id === CARET_ID) {
          return node;
        }

        node = node.parentNode;
      }

      return null;
    };

    // Checks if the parent caret container node isn't empty if that is the case it
    // will remove the bogus state on all children that isn't empty
    var unmarkBogusCaretParents = function (body, dom, selection) {
      var caretContainer;

      caretContainer = getParentCaretContainer(body, selection.getStart());
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
    var removeCaretContainer = function (body, dom, selection, node, moveCaret) {
      if (!node) {
        node = getParentCaretContainer(body, selection.getStart());

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

    // Mark caret container elements as bogus when getting the contents so we don't end up with empty elements
    var markCaretContainersBogus = function (dom, scope) {
      SelectorFind.descendant(Element.fromDom(scope), '#' + CARET_ID).each(function (node) {
        Arr.each(getEmptyCaretContainers(node.dom()), function (node) {
          dom.setAttrib(node, 'data-mce-bogus', '1');
        });
      });
    };

    var applyCaretFormat = function (editor, name, vars) {
      var rng, caretContainer, textNode, offset, bookmark, container, text;
      var selection = editor.selection;

      rng = selection.getRng(true);
      offset = rng.startOffset;
      container = rng.startContainer;
      text = container.nodeValue;

      caretContainer = getParentCaretContainer(editor.getBody(), selection.getStart());
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
        rng = SplitRange.split(rng);

        // Apply the format to the range
        editor.formatter.apply(name, vars, rng);

        // Move selection back to caret position
        selection.moveToBookmark(bookmark);
      } else {
        if (!caretContainer || textNode.nodeValue !== ZWSP) {
          // Need to import the node into the document on IE or we get a lovely WrongDocument exception
          caretContainer = importNode(editor.getDoc(), createCaretContainer(true).dom());
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
        rng = SplitRange.split(rng);

        editor.formatter.remove(name, vars, rng);
        selection.moveToBookmark(bookmark);
      } else {
        caretContainer = getParentCaretContainer(editor.getBody(), formatNode);
        var newCaretContainer = createCaretContainer(false).dom();
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

    var disableCaretContainer = function (body, dom, selection, keyCode) {
      removeCaretContainer(body, dom, selection, null, false);

      // Remove caret container if it's empty
      if (keyCode === 8 && selection.isCollapsed() && selection.getStart().innerHTML === ZWSP) {
        removeCaretContainer(body, dom, selection, getParentCaretContainer(body, selection.getStart()));
      }

      // Remove caret container on keydown and it's left/right arrow keys
      if (keyCode === 37 || keyCode === 39) {
        removeCaretContainer(body, dom, selection, getParentCaretContainer(body, selection.getStart()));
      }

      unmarkBogusCaretParents(body, dom, selection);
    };

    var setup = function (editor) {
      var dom = editor.dom, selection = editor.selection;
      var body = editor.getBody();

      editor.on('PreProcess', function (e) {
        if (e.format !== 'raw') {
          markCaretContainersBogus(dom, e.node);
        }
      });

      editor.on('mouseup keydown', function (e) {
        disableCaretContainer(body, dom, selection, e.keyCode);
      });

      // Remove bogus state if they got filled by contents using editor.selection.setContent
      editor.on('SetContent', function (e) {
        if (e.selection) {
          unmarkBogusCaretParents(body, dom, selection);
        }
      });
    };

    var replaceWithCaretFormat = function (targetNode, formatNodes) {
      var caretContainer = createCaretContainer(false);
      var innerMost = insertFormatNodesIntoCaretContainer(formatNodes, caretContainer.dom());
      Insert.before(Element.fromDom(targetNode), caretContainer);
      Remove.remove(Element.fromDom(targetNode));

      return CaretPosition(innerMost, 0);
    };

    var isFormatElement = function (editor, element) {
      var inlineElements = editor.schema.getTextInlineElements();
      return inlineElements.hasOwnProperty(Node.name(element)) && !isCaretNode(element.dom()) && !NodeType.isBogus(element.dom());
    };

    return {
      setup: setup,
      applyCaretFormat: applyCaretFormat,
      removeCaretFormat: removeCaretFormat,
      isCaretNode: isCaretNode,
      getParentCaretContainer: getParentCaretContainer,
      replaceWithCaretFormat: replaceWithCaretFormat,
      isFormatElement: isFormatElement
    };
  }
);