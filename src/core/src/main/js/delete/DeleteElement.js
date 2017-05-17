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
    'ephox.katamari.api.Options',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.search.Traverse',
    'tinymce.core.caret.CaretCandidate',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.Empty',
    'tinymce.core.dom.NodeType',
    'tinymce.core.keyboard.InlineUtils'
  ],
  function (Fun, Option, Options, Insert, Remove, Element, Node, PredicateFind, Traverse, CaretCandidate, CaretPosition, Empty, NodeType, InlineUtils) {
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

    var getPreviousSiblingCaretPosition = function (elm) {
      if (CaretCandidate.isCaretCandidate(elm.previousSibling)) {
        return Option.some(afterOrEndOf(elm.previousSibling));
      } else {
        return elm.previousSibling ? InlineUtils.findCaretPositionIn(elm.previousSibling, false) : Option.none();
      }
    };

    var getNextSiblingCaretPosition = function (elm) {
      if (CaretCandidate.isCaretCandidate(elm.nextSibling)) {
        return Option.some(beforeOrStartOf(elm.nextSibling));
      } else {
        return elm.nextSibling ? InlineUtils.findCaretPositionIn(elm.nextSibling, true) : Option.none();
      }
    };

    var findCaretPositionBackwardsFromElm = function (rootElement, elm) {
      var startPosition = CaretPosition.before(elm.previousSibling ? elm.previousSibling : elm.parentNode);
      return InlineUtils.findCaretPosition(rootElement, false, startPosition).fold(
        function () {
          return InlineUtils.findCaretPosition(rootElement, true, CaretPosition.after(elm));
        },
        Option.some
      );
    };

    var findCaretPositionForwardsFromElm = function (rootElement, elm) {
      return InlineUtils.findCaretPosition(rootElement, true, CaretPosition.after(elm)).fold(
        function () {
          return InlineUtils.findCaretPosition(rootElement, false, CaretPosition.before(elm));
        },
        Option.some
      );
    };

    var findCaretPositionBackwards = function (rootElement, elm) {
      return getPreviousSiblingCaretPosition(elm).orThunk(function () {
        return getNextSiblingCaretPosition(elm);
      }).orThunk(function () {
        return findCaretPositionBackwardsFromElm(rootElement, elm);
      });
    };

    var findCaretPositionForward = function (rootElement, elm) {
      return getNextSiblingCaretPosition(elm).orThunk(function () {
        return getPreviousSiblingCaretPosition(elm);
      }).orThunk(function () {
        return findCaretPositionForwardsFromElm(rootElement, elm);
      });
    };

    var findCaretPosition = function (forward, rootElement, elm) {
      return forward ? findCaretPositionForward(rootElement, elm) : findCaretPositionBackwards(rootElement, elm);
    };

    var findCaretPosOutsideElmAfterDelete = function (forward, rootElement, elm) {
      return findCaretPosition(forward, rootElement, elm).map(Fun.curry(reposition, elm));
    };

    var setSelection = function (editor, forward, pos) {
      pos.fold(
        function () {
          editor.focus();
        },
        function (pos) {
          editor.selection.setRng(pos.toRange(), forward);
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

    // When deleting an element between two text nodes IE 11 doesn't automatically merge the adjacent text nodes
    var deleteNormalized = function (elm, afterDeletePosOpt) {
      return Options.liftN([Traverse.prevSibling(elm), Traverse.nextSibling(elm), afterDeletePosOpt], function (prev, next, afterDeletePos) {
        var offset, prevNode = prev.dom(), nextNode = next.dom();

        if (NodeType.isText(prevNode) && NodeType.isText(nextNode)) {
          offset = prevNode.data.length;
          prevNode.appendData(nextNode.data);
          Remove.remove(next);
          Remove.remove(elm);
          if (afterDeletePos.container() === nextNode) {
            return new CaretPosition(prevNode, offset);
          } else {
            return afterDeletePos;
          }
        } else {
          Remove.remove(elm);
          return afterDeletePos;
        }
      }).orThunk(function () {
        Remove.remove(elm);
        return afterDeletePosOpt;
      });
    };

    var deleteElement = function (editor, forward, elm) {
      var afterDeletePos = findCaretPosOutsideElmAfterDelete(forward, editor.getBody(), elm.dom());
      var parentBlock = PredicateFind.ancestor(elm, Fun.curry(isBlock, editor), eqRawNode(editor.getBody()));
      var normalizedAfterDeletePos = deleteNormalized(elm, afterDeletePos);

      parentBlock.bind(paddEmptyBlock).fold(
        function () {
          setSelection(editor, forward, normalizedAfterDeletePos);
        },
        function (paddPos) {
          setSelection(editor, forward, Option.some(paddPos));
        }
      );
    };

    return {
      deleteElement: deleteElement
    };
  }
);