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
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.dom.NodeType'
  ],
  function (Adt, Option, CaretFinder, CaretPosition, CaretUtils, NodeType) {
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

    var findCefPosition = function (rootNode, forward, from) {
      return CaretFinder.fromPosition(forward, rootNode, from).bind(function (to) {
        if (forward && NodeType.isContentEditableFalse(to.getNode())) {
          return Option.some(DeleteAction.moveToElement(to.getNode()));
        } else if (forward === false && NodeType.isContentEditableFalse(to.getNode(true))) {
          return Option.some(DeleteAction.moveToElement(to.getNode(true)));
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
