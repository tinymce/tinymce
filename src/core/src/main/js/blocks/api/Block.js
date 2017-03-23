/**
 * Block.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.api.Block',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Selectors',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretWalker'
  ],
  function (Fun, Option, Element, Selectors, CaretPosition, CaretWalker) {
    return function (editor, guid) {
      var findByGuid = function () {
        return Selectors.one('[data-mce-block-id="' + guid + '"]', Element.fromDom(editor.getBody()));
      };

      var dom = function () {
        return findByGuid().getOr(null);
      };

      var select = function () {
        findByGuid().map(function (element) {
          editor.selection.select(element.dom());
        });
      };

      var findPosition = function (rootElement, forward) {
        var walker = new CaretWalker(editor.getBody());
        var caretPosition = CaretPosition.fromRangeStart(editor.selection.getRng());
        return Option.from(forward ? walker.next(caretPosition) : walker.prev(caretPosition));
      };

      var unselect = function (forward) {
        findPosition(editor.getBody(), forward).fold(
          function () {
            return findPosition(editor.getBody(), !forward);
          },
          Option.some
        ).map(function (pos) {
          editor.selection.setRng(pos.toRange());
        });
      };

      var remove = function () {
      };

      return {
        dom: dom,
        select: select,
        unselect: unselect,
        remove: remove
      };
    };
  }
);
