/**
 * DeleteElement.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.DeleteElement',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.PredicateFind',
    'tinymce.core.caret.CaretCandidate',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.Empty',
    'tinymce.core.dom.NodeType',
    'tinymce.core.keyboard.InlineUtils'
  ],
  function (Fun, Option, Insert, Remove, Element, Node, PredicateFind, CaretCandidate, CaretPosition, Empty, NodeType, InlineUtils) {
    var needsReposition = function (pos, elm) {
      var container = pos.container();
      var offset = pos.offset();
      return CaretPosition.isTextPosition(pos) === false && container === elm.parentNode && offset > CaretPosition.before(elm).offset();
    };

    var reposition = function (elm, pos) {
      return needsReposition(pos, elm) ? new CaretPosition(pos.container(), pos.offset() - 1) : pos;
    };

    var beforeOrStartOf = function (node) {
      return NodeType.isText(node) ? new CaretPosition(node, 0) : CaretPosition.before(node);
    };

    var afterOrEndOf = function (node) {
      return NodeType.isText(node) ? new CaretPosition(node, node.data.length) : CaretPosition.after(node);
    };

    var findCaretPosition = function (forward, rootElement, elm) {
      if (CaretCandidate.isCaretCandidate(elm.previousSibling)) {
        return Option.some(afterOrEndOf(elm.previousSibling));
      } else if (CaretCandidate.isCaretCandidate(elm.nextSibling)) {
        return Option.some(beforeOrStartOf(elm));
      } else {
        return InlineUtils.findCaretPosition(rootElement, forward, CaretPosition.before(elm)).fold(
          function () {
            return InlineUtils.findCaretPosition(rootElement, !forward, CaretPosition.after(elm));
          },
          Option.some
        );
      }
    };

    var findCaretPosOutsideElmAfterDelete = function (forward, rootElement, elm) {
      return findCaretPosition(forward, rootElement, elm).map(Fun.curry(reposition, elm));
    };

    var setSelection = function (editor, pos) {
      pos.fold(
        function () {
          editor.focus();
        },
        function (pos) {
          editor.selection.setRng(pos.toRange());
        }
      );
    };

    var eqRawNode = function (rawNode) {
      return function (elm) {
        return elm.dom() === rawNode;
      };
    };

    var isBlock = function (editor, elm) {
      return elm && editor.schema.getBlockElements().hasOwnProperty(Node.name(elm));
    };

    var paddEmptyBlock = function (elm) {
      if (Empty.isEmpty(elm)) {
        var br = Element.fromHtml('<br data-mce-bogus="1">');
        Remove.empty(elm);
        Insert.append(elm, br);
        return Option.some(CaretPosition.before(br.dom()));
      } else {
        return Option.none();
      }
    };

    var deleteElement = function (editor, forward, elm) {
      var afterDeletePos = findCaretPosOutsideElmAfterDelete(forward, editor.getBody(), elm.dom());
      var parentBlock = PredicateFind.ancestor(elm, Fun.curry(isBlock, editor), eqRawNode(editor.getBody()));

      Remove.remove(elm);

      parentBlock.bind(paddEmptyBlock).fold(
        function () {
          setSelection(editor, afterDeletePos);
        },
        function (paddPos) {
          setSelection(editor, Option.some(paddPos));
        }
      );
    };

    return {
      deleteElement: deleteElement
    };
  }
);