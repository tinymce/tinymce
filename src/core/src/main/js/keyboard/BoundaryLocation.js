/**
 * BoundaryLocations.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.BoundaryLocation',
  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.dom.NodeType',
    'tinymce.core.keyboard.InlineUtils',
    'tinymce.core.util.LazyEvaluator'
  ],
  function (Adt, Fun, Option, Options, CaretContainer, CaretPosition, CaretUtils, NodeType, InlineUtils, LazyEvaluator) {
    var Location = Adt.generate([
      { before: [ 'element' ] },
      { start: [ 'element' ] },
      { end: [ 'element' ] },
      { after: [ 'element' ] }
    ]);

    var before = function (rootNode, pos) {
      var nPos = InlineUtils.normalizeForwards(pos);
      return InlineUtils.findInline(rootNode, nPos).fold(
        function () {
          return InlineUtils.findCaretPosition(rootNode, true, nPos)
            .bind(Fun.curry(InlineUtils.findInline, rootNode))
            .map(function (inline) {
              return Location.before(inline);
            });
        },
        Option.none
      );
    };

    var start = function (rootNode, pos) {
      var nPos = InlineUtils.normalizeBackwards(pos);
      return InlineUtils.findInline(rootNode, nPos).bind(function (inline) {
        var prevPos = InlineUtils.findCaretPosition(inline, false, nPos);
        return prevPos.isNone() ? Option.some(Location.start(inline)) : Option.none();
      });
    };

    var end = function (rootNode, pos) {
      var nPos = InlineUtils.normalizeForwards(pos);
      return InlineUtils.findInline(rootNode, nPos).bind(function (inline) {
        var nextPos = InlineUtils.findCaretPosition(inline, true, nPos);
        return nextPos.isNone() ? Option.some(Location.end(inline)) : Option.none();
      });
    };

    var after = function (rootNode, pos) {
      var nPos = InlineUtils.normalizeBackwards(pos);
      return InlineUtils.findInline(rootNode, nPos).fold(
        function () {
          return InlineUtils.findCaretPosition(rootNode, false, nPos)
            .bind(Fun.curry(InlineUtils.findInline, rootNode))
            .map(function (inline) {
              return Location.after(inline);
            });
        },
        Option.none
      );
    };

    var readLocation = function (rootNode, pos) {
      return LazyEvaluator.evaluateUntil([
        before,
        start,
        end,
        after
      ], [rootNode, pos]);
    };

    var getElement = function (location) {
      return location.fold(
        Fun.identity,
        Fun.identity,
        Fun.identity,
        Fun.identity
      );
    };

    var outside = function (location) {
      return location.fold(
        Location.before,
        Location.before,
        Location.after,
        Location.after
      );
    };

    var isInside = function (location) {
      return location.fold(
        Fun.constant(false),
        Fun.constant(true),
        Fun.constant(true),
        Fun.constant(false)
      );
    };

    var betweenInlines = function (rootNode, from, to, location) {
      return Options.liftN([
        InlineUtils.findInline(rootNode, from),
        InlineUtils.findInline(rootNode, to)
      ], function (fromInline, toInline) {
        return fromInline !== toInline ? outside(location, fromInline) : location;
      }).getOr(location);
    };

    var isFirstPosition = function (rootBlock, pos) {
      return InlineUtils.findCaretPosition(rootBlock, false, pos).isNone();
    };

    var isLastPosition = function (rootBlock, pos) {
      return InlineUtils.findCaretPosition(rootBlock, true, pos).bind(function (nextPos) {
        if (NodeType.isBr(nextPos.getNode())) {
          return InlineUtils.findCaretPosition(rootBlock, true, CaretPosition.after(nextPos.getNode()));
        } else {
          return Option.some(nextPos);
        }
      }).isNone();
    };

    var isEndPosition = function (forward, rootBlock, pos) {
      return forward ? isLastPosition(rootBlock, pos) : isFirstPosition(rootBlock, pos);
    };

    var betweenBlocks = function (forward, rootNode, from, to, location) {
      var fromBlock = CaretUtils.getParentBlock(from.container(), rootNode);
      if (isEndPosition(forward, fromBlock, to) && isInside(location) === false) {
        return readLocation(rootNode, from).bind(function (fromLocation) {
          if (isInside(fromLocation)) {
            return Option.some(outside(fromLocation));
          } else {
            return Option.none();
          }
        });
      } else if (isEndPosition(forward, fromBlock, from)) {
        return readLocation(rootNode, from).bind(function (fromLocation) {
          if (isInside(fromLocation)) {
            return Option.some(outside(fromLocation));
          } else {
            return Option.none();
          }
        }).orThunk(function () {
          var toBlock = CaretUtils.getParentBlock(to.container(), rootNode);
          return InlineUtils.findCaretPositionIn(toBlock, forward).bind(function (lastPosition) {
            return readLocation(toBlock, lastPosition).map(outside);
          });
        });
      } else {
        return Option.some(location);
      }
    };

    var findLocation = function (forward, rootNode, pos) {
      var from = InlineUtils.normalizePosition(forward, pos);
      var to = InlineUtils.findCaretPosition(rootNode, forward, from).map(Fun.curry(InlineUtils.normalizePosition, forward));
      return to.fold(
        function () {
          return readLocation(rootNode, from).map(outside);
        },
        function (to) {
          return readLocation(rootNode, to)
            .bind(Fun.curry(betweenBlocks, forward, rootNode, from, to))
            .map(Fun.curry(betweenInlines, rootNode, from, to));
        }
      );
    };

    return {
      readLocation: readLocation,
      prevLocation: Fun.curry(findLocation, false),
      nextLocation: Fun.curry(findLocation, true),
      getElement: getElement,
      outside: outside
    };
  }
);