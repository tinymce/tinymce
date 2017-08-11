/**
 * CefDeleteAction.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.CefDeleteAction',
  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.delete.DeleteUtils',
    'tinymce.core.dom.Empty',
    'tinymce.core.dom.NodeType'
  ],
  function (Adt, Option, Element, CaretFinder, CaretPosition, CaretUtils, DeleteUtils, Empty, NodeType) {
    var DeleteAction = Adt.generate([
      { remove: [ 'element' ] },
      { moveToElement: [ 'element' ] },
      { moveToPosition: [ 'position' ] }
    ]);

    var isAtContentEditableBlockCaret = function (forward, from) {
      var elm = from.getNode(forward === false);
      var caretLocation = forward ? 'after' : 'before';
      return NodeType.isElement(elm) && elm.getAttribute('data-mce-caret') === caretLocation;
    };

    var deleteEmptyBlockOrMoveToCef = function (rootNode, forward, from, to) {
      var toCefElm = to.getNode(forward === false);
      return DeleteUtils.getParentTextBlock(Element.fromDom(rootNode), Element.fromDom(from.getNode())).map(function (blockElm) {
        return Empty.isEmpty(blockElm) ? DeleteAction.remove(blockElm.dom()) : DeleteAction.moveToElement(toCefElm);
      }).orThunk(function () {
        return Option.some(DeleteAction.moveToElement(toCefElm));
      });
    };

    var findCefPosition = function (rootNode, forward, from) {
      return CaretFinder.fromPosition(forward, rootNode, from).bind(function (to) {
        if (forward && NodeType.isContentEditableFalse(to.getNode())) {
          return deleteEmptyBlockOrMoveToCef(rootNode, forward, from, to);
        } else if (forward === false && NodeType.isContentEditableFalse(to.getNode(true))) {
          return deleteEmptyBlockOrMoveToCef(rootNode, forward, from, to);
        } else if (forward && CaretUtils.isAfterContentEditableFalse(from)) {
          return Option.some(DeleteAction.moveToPosition(to));
        } else if (forward === false && CaretUtils.isBeforeContentEditableFalse(from)) {
          return Option.some(DeleteAction.moveToPosition(to));
        } else {
          return Option.none();
        }
      });
    };

    var getContentEditableBlockAction = function (forward, elm) {
      if (forward && NodeType.isContentEditableFalse(elm.nextSibling)) {
        return Option.some(DeleteAction.moveToElement(elm.nextSibling));
      } else if (forward === false && NodeType.isContentEditableFalse(elm.previousSibling)) {
        return Option.some(DeleteAction.moveToElement(elm.previousSibling));
      } else {
        return Option.none();
      }
    };

    var getContentEditableAction = function (rootNode, forward, from) {
      if (isAtContentEditableBlockCaret(forward, from)) {
        return getContentEditableBlockAction(forward, from.getNode(forward === false))
          .fold(
            function () {
              return findCefPosition(rootNode, forward, from);
            },
            Option.some
          );
      } else {
        return findCefPosition(rootNode, forward, from);
      }
    };

    var read = function (rootNode, forward, rng) {
      var normalizedRange = CaretUtils.normalizeRange(forward ? 1 : -1, rootNode, rng);
      var from = CaretPosition.fromRangeStart(normalizedRange);

      if (forward === false && CaretUtils.isAfterContentEditableFalse(from)) {
        return Option.some(DeleteAction.remove(from.getNode(true)));
      } else if (forward && CaretUtils.isBeforeContentEditableFalse(from)) {
        return Option.some(DeleteAction.remove(from.getNode()));
      } else {
        return getContentEditableAction(rootNode, forward, from);
      }
    };

    return {
      read: read
    };
  }
);
