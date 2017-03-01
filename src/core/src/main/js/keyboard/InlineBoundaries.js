/**
 * InlineBoundaries.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.InlineBoundaries',
  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.caret.CaretWalker',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.keyboard.CaretFinder',
    'tinymce.core.keyboard.LazyEvaluator',
    'tinymce.core.text.Bidi'
  ],
  function (Adt, Arr, Fun, Option, CaretContainer, CaretPosition, CaretUtils, CaretWalker, DOMUtils, CaretFinder, LazyEvaluator, Bidi) {
    var DOM = DOMUtils.DOM;
    var operation = Adt.generate([
      { prepend: [ 'container' ] },
      { append: [ 'container' ] },
      { before: [ 'container' ] },
      { after: [ 'container' ] }
    ]);

    var isInlineTarget = function (elm) {
      return DOM.is(elm, 'a[href],code');
    };

    var hasRtlDirection = function (pos) {
      var elm = CaretPosition.isTextPosition(pos) ? pos.container().parentNode : pos.container();
      return DOM.getStyle(elm, 'direction', true) === 'rtl';
    };

    var isInRtlText = function (pos) {
      var inBidiText = CaretPosition.isTextPosition(pos) ? Bidi.hasStrongRtl(pos.container().data) : false;
      return inBidiText || hasRtlDirection(pos);
    };

    var isPlainTextPosition = function (rootNode, pos) {
      return CaretPosition.isTextPosition(pos) && isInInline(rootNode, pos) === false && isInRtlText(pos) === false;
    };

    var isInlineTextPosition = function (rootNode, pos) {
      return CaretPosition.isTextPosition(pos) && isInInline(rootNode, pos) && isInRtlText(pos) === false;
    };

    var findInline = function (rootNode, pos) {
      return Option.from(DOM.getParent(pos.container(), isInlineTarget, rootNode));
    };

    var findSiblingInline = function (forward, container) {
      return Option.from(container).bind(function () {
        return Option.from(forward ? container.previousSibling : container.nextSibling);
      });
    };

    var isInInline = function (rootNode, pos) {
      return pos ? findInline(rootNode, pos).isSome() : false;
    };

    var betweenInlines = function (rootNode, from, to) {
      return findInline(rootNode, from).bind(function (inline1) {
        return findInline(rootNode, to).map(function (inline2) {
          return inline1 !== inline2;
        });
      }).getOr(false);
    };

    var isAtInlineEndPoint = function (rootNode, pos) {
      return findInline(rootNode, pos).map(function (inline) {
        return CaretFinder.findCaretPosition(inline, pos, false).isNone() || CaretFinder.findCaretPosition(inline, pos, true).isNone();
      }).getOr(false);
    };

    var isBetweenBlocks = function (rootNode, from, to) {
      return CaretUtils.isInSameBlock(from, to, rootNode) === false;
    };

    var positionToOperation = function (rootNode, forward, from, to) {
      if (isBetweenBlocks(rootNode, from, to)) {
        return findInline(rootNode, from).map(function (inline) {
          return forward ? operation.after(inline) : operation.before(inline);
        });
      } else if (betweenInlines(rootNode, from, to)) {
        return findInline(rootNode, to).map(function (inline) {
          return forward ? operation.before(inline) : operation.after(inline);
        });
      } else {
        var op = forward ? operation.append : operation.prepend;
        return Option.some(op(to.container()));
      }
    };

    var positionToOperation2 = function (rootNode, forward, from, to) {
      if (betweenInlines(rootNode, from, to)) {
        return findInline(rootNode, to).map(function (inline) {
          return forward ? operation.before(inline) : operation.after(inline);
        });
      } else if (isBetweenBlocks(rootNode, from, to)) {
        return findInline(rootNode, from).map(function (inline) {
          return forward ? operation.after(inline) : operation.before(inline);
        });
      } else {
        var op = forward ? operation.prepend : operation.append;
        return Option.some(op(to.container()));
      }
    };

    var isAtZwsp = function (pos) {
      return CaretContainer.isBeforeInline(pos) || CaretContainer.isAfterInline(pos);
    };

    var fromTextToOutsideInline = function (rootNode, from, to, forward) {
      if (isAtZwsp(from) === false && isPlainTextPosition(rootNode, from) && isPlainTextPosition(rootNode, to)) {
        return CaretFinder.findCaretPosition(rootNode, to, forward)
          .filter(Fun.curry(isInlineTextPosition, rootNode))
          .map(Fun.constant(to))
          .bind(Fun.curry(positionToOperation, rootNode, forward, from));
      } else {
        return Option.none();
      }
    };

    var fromTextInsideInlineToInlineEndPoint = function (rootNode, from, to, forward) {
      if (isInlineTextPosition(rootNode, from) && isAtInlineEndPoint(rootNode, to)) {
        return positionToOperation(rootNode, forward, from, to);
      } else {
        return Option.none();
      }
    };

    var fromOutsideInlineToInsideInline = function (rootNode, from, to, forward) {
      if (isPlainTextPosition(rootNode, from) && isInlineTextPosition(rootNode, to)) {
        return positionToOperation2(rootNode, forward, from, to);
      } else {
        return Option.none();
      }
    };

    var fromInsideInlineToOutsideInline = function (rootNode, from, to, forward) {
      if (isInlineTextPosition(rootNode, from) && isPlainTextPosition(rootNode, to)) {
        return positionToOperation2(rootNode, forward, from, to);
      } else {
        return Option.none();
      }
    };

    var staticInline = function (rootNode, from, forward) {
      if (isInlineTextPosition(rootNode, from)) {
        return findInline(rootNode, from).map(function (inline) {
          return forward ? operation.after(inline) : operation.before(inline);
        });
      } if (isAtZwsp(from)) {
        return findSiblingInline(forward, from.container())
          .map(function (inline) {
            return forward ? operation.after(inline) : operation.before(inline);
          });
      } else {
        return Option.none();
      }
    };

    var setSelection = function (editor, sc, so, ec, eo) {
      var rng = editor.dom.createRng();
      rng.setStart(sc, so);
      rng.setEnd(ec, eo);
      editor.selection.setRng(rng);
    };

    var insertZwsp = function (editor, caret, result) {
      return result.fold(
        function (container) { // Prepend
          CaretContainer.remove(caret.get());
          var text = CaretContainer.prependInline(container);
          setSelection(editor, text, 1, text, 1);
          caret.set(text);
          return true;
        },
        function (container) { // Append
          CaretContainer.remove(caret.get());
          var text = CaretContainer.appendInline(container);
          setSelection(editor, text, text.length - 1, text, text.length - 1);
          caret.set(text);
          return true;
        },
        function (container) { // Before
          CaretContainer.remove(caret.get());
          var text = CaretContainer.insertInline(container, true);
          setSelection(editor, text, 1, text, 1);
          caret.set(text);
          return true;
        },
        function (container) { // After
          CaretContainer.remove(caret.get());
          var text = CaretContainer.insertInline(container, false);
          setSelection(editor, text, text.length, text, text.length);
          caret.set(text);
          return true;
        }
      );
    };

    var selectAndDelete = function (editor, elm) {
      editor.selection.select(elm);
      editor.execCommand('Delete');
    };

    var deleteCollapsed = function (editor, from) {
      var rootNode = editor.getBody();
      if (isInInline(rootNode, from) && CaretContainer.isAfterInline(from)) {
        var to = CaretFinder.findCaretPosition(editor.getBody(), from, true).getOr(null);
        if (isAtInlineEndPoint(rootNode, to)) {
          findInline(rootNode, from).bind(Fun.curry(selectAndDelete, editor));
          return true;
        }
      }

      return false;
    };

    var backspaceCollapsed = function (editor, from) {
      var rootNode = editor.getBody();
      if (isInInline(rootNode, from) && CaretContainer.isBeforeInline(from)) {
        var to = CaretFinder.findCaretPosition(editor.getBody(), from, false).getOr(null);
        if (isAtInlineEndPoint(rootNode, to)) {
          findInline(rootNode, from).bind(Fun.curry(selectAndDelete, editor));
          return true;
        }
      }

      return false;
    };

    var backspaceDeleteCollapsed = function (editor, forward) {
      var from = CaretPosition.fromRangeStart(editor.selection.getRng());
      return forward ? deleteCollapsed(editor, from) : backspaceCollapsed(editor, from);
    };

    var backspaceDelete = function (editor, forward) {
      return function () {
        if (editor.selection.isCollapsed()) {
          return backspaceDeleteCollapsed(editor, forward);
        }

        return false;
      };
    };

    var moveOperation = function (editor, forward, from, to) {
      var operations = [
        fromTextToOutsideInline,
        fromTextInsideInlineToInlineEndPoint,
        fromOutsideInlineToInsideInline,
        fromInsideInlineToOutsideInline
      ];

      return to ? LazyEvaluator.evaluate(operations, [editor.getBody(), from, to, forward]) : staticInline(editor.getBody(), from, forward);
    };

    var move = function (editor, caret, forward) {
      return function () {
        var from = CaretFinder.normalize(forward, CaretPosition.fromRangeStart(editor.selection.getRng())).getOr(null);
        var to = CaretFinder.findCaretPosition(editor.getBody(), from, forward).bind(Fun.curry(CaretFinder.normalize, forward)).getOr(null);
        return moveOperation(editor, forward, from, to).map(Fun.curry(insertZwsp, editor, caret)).isSome();
      };
    };

    var setSelected = function (state, elm) {
      if (state) {
        elm.setAttribute('data-mce-selected', '1');
      } else {
        elm.removeAttribute('data-mce-selected', '1');
      }
    };

    var setupSelectedState = function (editor) {
      editor.on('NodeChange', function (e) {
        Arr.each(editor.dom.select('a[href][data-mce-selected],code[data-mce-selected]'), Fun.curry(setSelected, false));
        Arr.find(e.parents, isInlineTarget).bind(Fun.curry(setSelected, true));
      });
    };

    return {
      findInline: findInline,
      isInInline: isInInline,
      fromTextToOutsideInline: fromTextToOutsideInline,
      fromOutsideInlineToInsideInline: fromOutsideInlineToInsideInline,
      fromInsideInlineToOutsideInline: fromInsideInlineToOutsideInline,
      fromTextInsideInlineToInlineEndPoint: fromTextInsideInlineToInlineEndPoint,
      move: move,
      backspaceDelete: backspaceDelete,
      setupSelectedState: setupSelectedState
    };
  }
);