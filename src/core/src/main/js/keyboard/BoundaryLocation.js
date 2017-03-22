/**
 * BoundaryLocation.js
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

    var isValidLocation = function (location) {
      return InlineUtils.isRtl(getElement(location)) === false;
    };

    var readLocation = function (rootNode, pos) {
      var location = LazyEvaluator.evaluateUntil([
        before,
        start,
        end,
        after
      ], [rootNode, pos]);

      return location.filter(isValidLocation);
    };

    var getElement = function (location) {
      return location.fold(
        Fun.identity, // Before
        Fun.identity, // Start
        Fun.identity, // End
        Fun.identity  // After
      );
    };

    var outside = function (location) {
      return location.fold(
        Location.before, // Before
        Location.before, // Start
        Location.after,  // End
        Location.after   // After
      );
    };

    var isInside = function (location) {
      return location.fold(
        Fun.constant(false), // Before
        Fun.constant(true),  // Start
        Fun.constant(true),  // End
        Fun.constant(false)  // After
      );
    };

    var betweenInlines = function (forward, rootNode, from, to, location) {
      return Options.liftN([
        InlineUtils.findInline(rootNode, from),
        InlineUtils.findInline(rootNode, to)
      ], function (fromInline, toInline) {
        if (fromInline !== toInline && InlineUtils.hasSameParentBlock(rootNode, fromInline, toInline)) {
          // Force after since some browsers normalize and lean left into the closest inline
          return Location.after(forward ? fromInline : toInline);
        } else {
          return location;
        }
      }).getOr(location);
    };

    var isFirstPositionInBlock = function (rootBlock, pos) {
      return InlineUtils.findCaretPosition(rootBlock, false, pos).isNone();
    };

    var isLastPositionInBlock = function (rootBlock, pos) {
      return InlineUtils.findCaretPosition(rootBlock, true, pos).bind(function (nextPos) {
        if (NodeType.isBr(nextPos.getNode())) {
          return InlineUtils.findCaretPosition(rootBlock, true, CaretPosition.after(nextPos.getNode()));
        } else {
          return Option.some(nextPos);
        }
      }).isNone();
    };

    var isEndPositionInBlock = function (forward, rootBlock, pos) {
      return forward ? isLastPositionInBlock(rootBlock, pos) : isFirstPositionInBlock(rootBlock, pos);
    };

    var onlyOutside = function (location) {
      if (isInside(location)) {
        return Option.some(outside(location));
      } else {
        return Option.none();
      }
    };

    var findFirstOrLastLocationInBlock = function (rootNode, forward, toBlock) {
      return InlineUtils.findCaretPositionIn(toBlock, forward).bind(function (lastPosition) {
        return readLocation(toBlock, lastPosition).map(outside);
      });
    };

    var betweenBlocks = function (forward, rootNode, from, to, location) {
      var fromBlock = CaretUtils.getParentBlock(from.container(), rootNode);
      if (isEndPositionInBlock(forward, fromBlock, to) && isInside(location) === false) {
        return readLocation(rootNode, from).bind(onlyOutside);
      } else if (isEndPositionInBlock(forward, fromBlock, from)) {
        return readLocation(rootNode, from)
          .bind(onlyOutside)
          .orThunk(function () {
            var toBlock = CaretUtils.getParentBlock(to.container(), rootNode);
            return findFirstOrLastLocationInBlock(rootNode, forward, toBlock);
          });
      } else {
        return Option.some(location);
      }
    };

    var findLocation = function (forward, rootNode, pos) {
      var from = InlineUtils.normalizePosition(forward, pos);
      var to = InlineUtils.findCaretPosition(rootNode, forward, from).map(Fun.curry(InlineUtils.normalizePosition, forward));
      var location = to.fold(
        function () {
          return readLocation(rootNode, from).map(outside);
        },
        function (to) {
          return readLocation(rootNode, to)
            .bind(Fun.curry(betweenBlocks, forward, rootNode, from, to))
            .map(Fun.curry(betweenInlines, forward, rootNode, from, to));
        }
      );

      return location.filter(isValidLocation);
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