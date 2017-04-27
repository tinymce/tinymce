/**
 * InlineBoundaryDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.InlineBoundaryDelete',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'ephox.sugar.api.node.Element',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.delete.DeleteElement',
    'tinymce.core.keyboard.BoundaryCaret',
    'tinymce.core.keyboard.BoundaryLocation',
    'tinymce.core.keyboard.BoundarySelection',
    'tinymce.core.keyboard.InlineUtils'
  ],
  function (Fun, Option, Options, Element, CaretContainer, CaretPosition, DeleteElement, BoundaryCaret, BoundaryLocation, BoundarySelection, InlineUtils) {
    var rangeFromPositions = function (from, to) {
      var range = document.createRange();

      range.setStart(from.container(), from.offset());
      range.setEnd(to.container(), to.offset());

      return range;
    };

    var setCaretLocation = function (editor, caret) {
      return function (location) {
        return BoundaryCaret.renderCaret(caret, location).map(function (pos) {
          BoundarySelection.setCaretPosition(editor, pos);
          return true;
        }).getOr(false);
      };
    };

    var deleteFromTo = function (editor, caret, from, to) {
      var rootNode = editor.getBody();

      editor.undoManager.ignore(function () {
        editor.selection.setRng(rangeFromPositions(from, to));
        editor.execCommand('Delete');

        BoundaryLocation.readLocation(rootNode, CaretPosition.fromRangeStart(editor.selection.getRng()))
          .map(BoundaryLocation.inside)
          .map(setCaretLocation(editor, caret));
      });

      editor.nodeChanged();
    };

    var backspaceDeleteCollapsed = function (editor, caret, forward, from) {
      var rootNode = editor.getBody();
      var fromLocation = BoundaryLocation.readLocation(rootNode, from);

      return fromLocation.bind(function (location) {
        if (forward) {
          return location.fold(
            Fun.constant(Option.some(BoundaryLocation.inside(location))), // Before
            Option.none, // Start
            Fun.constant(Option.some(BoundaryLocation.outside(location))), // End
            Option.none  // After
          );
        } else {
          return location.fold(
            Option.none, // Before
            Fun.constant(Option.some(BoundaryLocation.outside(location))), // Start
            Option.none, // End
            Fun.constant(Option.some(BoundaryLocation.inside(location)))  // After
          );
        }
      })
      .map(setCaretLocation(editor, caret))
      .getOrThunk(function () {
        var toPosition = InlineUtils.findCaretPosition(rootNode, forward, from);
        var toLocation = toPosition.bind(function (pos) {
          return BoundaryLocation.readLocation(rootNode, pos);
        });

        if (fromLocation.isSome() && toLocation.isSome()) {
          InlineUtils.findInline(rootNode, from).bind(function (elm) {
            return DeleteElement.deleteElement(editor, forward, Element.fromDom(elm));
          });
          return true;
        } else {
          return toLocation.map(function (_) {
            toPosition.map(function (to) {
              if (forward) {
                deleteFromTo(editor, caret, from, to);
              } else {
                deleteFromTo(editor, caret, to, from);
              }
            });

            return true;
          }).getOr(false);
        }
      });
    };

    var backspaceDelete = function (editor, caret, forward) {
      if (editor.selection.isCollapsed()) {
        var from = CaretPosition.fromRangeStart(editor.selection.getRng());
        return backspaceDeleteCollapsed(editor, caret, forward, from);
      }

      return false;
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);