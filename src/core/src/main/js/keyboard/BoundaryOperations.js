/**
 * BoundaryOperations.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.BoundaryOperations',
  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.keyboard.InlineUtils'
  ],
  function (Adt, Fun, Option, CaretContainer, CaretPosition, InlineUtils) {
    var operation = Adt.generate([
      { prepend: [ 'container' ] },
      { append: [ 'container' ] },
      { before: [ 'container' ] },
      { after: [ 'container' ] }
    ]);

    var createOperation = function (rootNode, forward, from, to) {
      if (InlineUtils.isBetweenBlocks(rootNode, from, to)) {
        return InlineUtils.findInline(rootNode, from).map(function (inline) {
          return forward ? operation.after(inline) : operation.before(inline);
        });
      } else if (InlineUtils.betweenInlines(rootNode, from, to)) {
        return InlineUtils.findInline(rootNode, to).map(function (inline) {
          return forward ? operation.before(inline) : operation.after(inline);
        });
      } else {
        var op = forward ? operation.append : operation.prepend;
        return Option.some(op(to.container()));
      }
    };

    var createOperationInverse = function (rootNode, forward, from, to) {
      if (InlineUtils.betweenInlines(rootNode, from, to)) {
        return InlineUtils.findInline(rootNode, to).map(function (inline) {
          return forward ? operation.before(inline) : operation.after(inline);
        });
      } else if (InlineUtils.isBetweenBlocks(rootNode, from, to)) {
        return InlineUtils.findInline(rootNode, from).map(function (inline) {
          return forward ? operation.after(inline) : operation.before(inline);
        });
      } else {
        var op = forward ? operation.prepend : operation.append;
        return Option.some(op(to.container()));
      }
    };

    var fromTextToOutsideInline = function (rootNode, from, to, forward) {
      if (InlineUtils.isAtZwsp(from) === false && InlineUtils.isPlainTextPosition(rootNode, from) && InlineUtils.isPlainTextPosition(rootNode, to)) {
        return InlineUtils.findCaretPosition(rootNode, forward, to)
          .filter(Fun.curry(InlineUtils.isInlineTextPosition, rootNode))
          .map(Fun.constant(to))
          .bind(Fun.curry(createOperation, rootNode, forward, from));
      } else {
        return Option.none();
      }
    };

    var fromTextInsideInlineToInlineEndPoint = function (rootNode, from, to, forward) {
      if (InlineUtils.isInlineTextPosition(rootNode, from) && InlineUtils.isAtInlineEndPoint(rootNode, to)) {
        return createOperation(rootNode, forward, from, to);
      } else {
        return Option.none();
      }
    };

    var fromOutsideInlineToInsideInline = function (rootNode, from, to, forward) {
      if (InlineUtils.isPlainTextPosition(rootNode, from) && InlineUtils.isInlineTextPosition(rootNode, to)) {
        return createOperationInverse(rootNode, forward, from, to);
      } else {
        return Option.none();
      }
    };

    var fromInsideInlineToOutsideInline = function (rootNode, from, to, forward) {
      if (InlineUtils.isInlineTextPosition(rootNode, from) && InlineUtils.isPlainTextPosition(rootNode, to)) {
        return createOperationInverse(rootNode, forward, from, to);
      } else {
        return Option.none();
      }
    };

    var staticOperation = function (rootNode, forward, from) {
      if (InlineUtils.isInlineTextPosition(rootNode, from)) {
        return InlineUtils.findInline(rootNode, from).map(function (inline) {
          return forward ? operation.after(inline) : operation.before(inline);
        });
      } if (InlineUtils.isAtZwsp(from)) {
        return InlineUtils.findSiblingInline(forward, from.container())
          .map(function (inline) {
            return forward ? operation.after(inline) : operation.before(inline);
          });
      } else {
        return Option.none();
      }
    };

    var applyOperation = function (caret, operation) {
      return operation.fold(
        function (container) { // Prepend
          CaretContainer.remove(caret.get());
          var text = CaretContainer.prependInline(container);
          caret.set(text);
          return new CaretPosition(text, 1);
        },
        function (container) { // Append
          CaretContainer.remove(caret.get());
          var text = CaretContainer.appendInline(container);
          caret.set(text);
          return new CaretPosition(text, text.length - 1);
        },
        function (container) { // Before
          CaretContainer.remove(caret.get());
          var text = CaretContainer.insertInline(container, true);
          caret.set(text);
          return new CaretPosition(text, 1);
        },
        function (container) { // After
          CaretContainer.remove(caret.get());
          var text = CaretContainer.insertInline(container, false);
          caret.set(text);
          return new CaretPosition(text, text.length);
        }
      );
    };

    return {
      fromTextToOutsideInline: fromTextToOutsideInline,
      fromTextInsideInlineToInlineEndPoint: fromTextInsideInlineToInlineEndPoint,
      fromOutsideInlineToInsideInline: fromOutsideInlineToInsideInline,
      fromInsideInlineToOutsideInline: fromInsideInlineToOutsideInline,
      staticOperation: staticOperation,
      applyOperation: applyOperation
    };
  }
);