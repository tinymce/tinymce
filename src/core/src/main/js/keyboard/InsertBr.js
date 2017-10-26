/**
 * InsertBr.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.InsertBr',
  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.keyboard.BoundaryLocation',
    'tinymce.core.keyboard.InlineUtils',
    'tinymce.core.selection.NormalizeRange'
  ],
  function (Fun, Insert, Element, CaretFinder, CaretPosition, NodeType, TreeWalker, BoundaryLocation, InlineUtils, NormalizeRange) {
    // Walks the parent block to the right and look for BR elements
    var hasRightSideContent = function (schema, container, parentBlock) {
      var walker = new TreeWalker(container, parentBlock), node;
      var nonEmptyElementsMap = schema.getNonEmptyElements();

      while ((node = walker.next())) {
        if (nonEmptyElementsMap[node.nodeName.toLowerCase()] || node.length > 0) {
          return true;
        }
      }
    };

    var scrollToBr = function (dom, selection, brElm) {
      // Insert temp marker and scroll to that
      var marker = dom.create('span', {}, '&nbsp;');
      brElm.parentNode.insertBefore(marker, brElm);
      selection.scrollIntoView(marker);
      dom.remove(marker);
    };

    var moveSelectionToBr = function (dom, selection, brElm, extraBr) {
      var rng = dom.createRng();

      if (!extraBr) {
        rng.setStartAfter(brElm);
        rng.setEndAfter(brElm);
      } else {
        rng.setStartBefore(brElm);
        rng.setEndBefore(brElm);
      }

      selection.setRng(rng);
    };

    var insertBrAtCaret = function (editor, evt) {
      // We load the current event in from EnterKey.js when appropriate to heed
      // certain event-specific variations such as ctrl-enter in a list
      var selection = editor.selection, dom = editor.dom;
      var brElm, extraBr;
      var rng = selection.getRng(true);

      NormalizeRange.normalize(dom, rng).each(function (normRng) {
        rng.setStart(normRng.startContainer, normRng.startOffset);
        rng.setEnd(normRng.endContainer, normRng.endOffset);
      });

      var offset = rng.startOffset;
      var container = rng.startContainer;

      // Resolve node index
      if (container.nodeType === 1 && container.hasChildNodes()) {
        var isAfterLastNodeInContainer = offset > container.childNodes.length - 1;

        container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
        if (isAfterLastNodeInContainer && container.nodeType === 3) {
          offset = container.nodeValue.length;
        } else {
          offset = 0;
        }
      }

      var parentBlock = dom.getParent(container, dom.isBlock);
      var containerBlock = parentBlock ? dom.getParent(parentBlock.parentNode, dom.isBlock) : null;
      var containerBlockName = containerBlock ? containerBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5

      // Enter inside block contained within a LI then split or insert before/after LI
      var isControlKey = evt && evt.ctrlKey;
      if (containerBlockName === 'LI' && !isControlKey) {
        parentBlock = containerBlock;
      }

      if (container && container.nodeType === 3 && offset >= container.nodeValue.length) {
        // Insert extra BR element at the end block elements
        if (!hasRightSideContent(editor.schema, container, parentBlock)) {
          brElm = dom.create('br');
          rng.insertNode(brElm);
          rng.setStartAfter(brElm);
          rng.setEndAfter(brElm);
          extraBr = true;
        }
      }

      brElm = dom.create('br');
      rng.insertNode(brElm);

      scrollToBr(dom, selection, brElm);
      moveSelectionToBr(dom, selection, brElm, extraBr);
      editor.undoManager.add();
    };

    var insertBrBefore = function (editor, inline) {
      var br = Element.fromTag('br');
      Insert.before(Element.fromDom(inline), br);
      editor.undoManager.add();
    };

    var insertBrAfter = function (editor, inline) {
      if (!hasBrAfter(editor.getBody(), inline)) {
        Insert.after(Element.fromDom(inline), Element.fromTag('br'));
      }

      var br = Element.fromTag('br');
      Insert.after(Element.fromDom(inline), br);
      scrollToBr(editor.dom, editor.selection, br.dom());
      moveSelectionToBr(editor.dom, editor.selection, br.dom(), false);
      editor.undoManager.add();
    };

    var isBeforeBr = function (pos) {
      return NodeType.isBr(pos.getNode());
    };

    var hasBrAfter = function (rootNode, startNode) {
      if (isBeforeBr(CaretPosition.after(startNode))) {
        return true;
      } else {
        return CaretFinder.nextPosition(rootNode, CaretPosition.after(startNode)).map(function (pos) {
          return NodeType.isBr(pos.getNode());
        }).getOr(false);
      }
    };

    var isAnchorLink = function (elm) {
      return elm && elm.nodeName === 'A' && 'href' in elm;
    };

    var isInsideAnchor = function (location) {
      return location.fold(
        Fun.constant(false),
        isAnchorLink,
        isAnchorLink,
        Fun.constant(false)
      );
    };

    var readInlineAnchorLocation = function (editor) {
      var isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
      var position = CaretPosition.fromRangeStart(editor.selection.getRng());
      return BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), position).filter(isInsideAnchor);
    };

    var insertBrOutsideAnchor = function (editor, location) {
      location.fold(
        Fun.noop,
        Fun.curry(insertBrBefore, editor),
        Fun.curry(insertBrAfter, editor),
        Fun.noop
      );
    };

    var insertBr = function (editor, evt) {
      var anchorLocation = readInlineAnchorLocation(editor);

      if (anchorLocation.isSome()) {
        anchorLocation.each(Fun.curry(insertBrOutsideAnchor, editor));
      } else {
        insertBrAtCaret(editor, evt);
      }
    };

    return {
      insertBr: insertBr
    };
  }
);
