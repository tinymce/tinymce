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
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.fmt.CaretFormat',
    'tinymce.core.keyboard.InlineUtils',
    'tinymce.core.util.LazyEvaluator'
  ],
  function (Adt, Fun, Option, Options, CaretFinder, CaretUtils, CaretFormat, InlineUtils, LazyEvaluator) {
    var Location = Adt.generate([
      { before: [ 'element' ] },
      { start: [ 'element' ] },
      { end: [ 'element' ] },
      { after: [ 'element' ] }
    ]);

    var rescope = function (rootNode, node) {
      var parentBlock = CaretUtils.getParentBlock(node, rootNode);
      return parentBlock ? parentBlock : rootNode;
    };

    var before = function (isInlineTarget, rootNode, pos) {
      var nPos = InlineUtils.normalizeForwards(pos);
      var scope = rescope(rootNode, nPos.container());
      return InlineUtils.findRootInline(isInlineTarget, scope, nPos).fold(
        function () {
          return CaretFinder.nextPosition(scope, nPos)
            .bind(Fun.curry(InlineUtils.findRootInline, isInlineTarget, scope))
            .map(function (inline) {
              return Location.before(inline);
            });
        },
        Option.none
      );
    };

    var isNotInsideFormatCaretContainer = function (rootNode, elm) {
      return CaretFormat.getParentCaretContainer(rootNode, elm) === null;
    };

    var findInsideRootInline = function (isInlineTarget, rootNode, pos) {
      return InlineUtils.findRootInline(isInlineTarget, rootNode, pos).filter(Fun.curry(isNotInsideFormatCaretContainer, rootNode));
    };

    var start = function (isInlineTarget, rootNode, pos) {
      var nPos = InlineUtils.normalizeBackwards(pos);
      return findInsideRootInline(isInlineTarget, rootNode, nPos).bind(function (inline) {
        var prevPos = CaretFinder.prevPosition(inline, nPos);
        return prevPos.isNone() ? Option.some(Location.start(inline)) : Option.none();
      });
    };

    var end = function (isInlineTarget, rootNode, pos) {
      var nPos = InlineUtils.normalizeForwards(pos);
      return findInsideRootInline(isInlineTarget, rootNode, nPos).bind(function (inline) {
        var nextPos = CaretFinder.nextPosition(inline, nPos);
        return nextPos.isNone() ? Option.some(Location.end(inline)) : Option.none();
      });
    };

    var after = function (isInlineTarget, rootNode, pos) {
      var nPos = InlineUtils.normalizeBackwards(pos);
      var scope = rescope(rootNode, nPos.container());
      return InlineUtils.findRootInline(isInlineTarget, scope, nPos).fold(
        function () {
          return CaretFinder.prevPosition(scope, nPos)
            .bind(Fun.curry(InlineUtils.findRootInline, isInlineTarget, scope))
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

    var readLocation = function (isInlineTarget, rootNode, pos) {
      var location = LazyEvaluator.evaluateUntil([
        before,
        start,
        end,
        after
      ], [isInlineTarget, rootNode, pos]);

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

    var getName = function (location) {
      return location.fold(
        Fun.constant('before'), // Before
        Fun.constant('start'),  // Start
        Fun.constant('end'),    // End
        Fun.constant('after')   // After
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

    var inside = function (location) {
      return location.fold(
        Location.start, // Before
        Location.start, // Start
        Location.end,   // End
        Location.end    // After
      );
    };

    var isEq = function (location1, location2) {
      return getName(location1) === getName(location2) && getElement(location1) === getElement(location2);
    };

    var betweenInlines = function (forward, isInlineTarget, rootNode, from, to, location) {
      return Options.liftN([
        InlineUtils.findRootInline(isInlineTarget, rootNode, from),
        InlineUtils.findRootInline(isInlineTarget, rootNode, to)
      ], function (fromInline, toInline) {
        if (fromInline !== toInline && InlineUtils.hasSameParentBlock(rootNode, fromInline, toInline)) {
          // Force after since some browsers normalize and lean left into the closest inline
          return Location.after(forward ? fromInline : toInline);
        } else {
          return location;
        }
      }).getOr(location);
    };

    var skipNoMovement = function (fromLocation, toLocation) {
      return fromLocation.fold(
        Fun.constant(true),
        function (fromLocation) {
          return !isEq(fromLocation, toLocation);
        }
      );
    };

    var findLocationTraverse = function (forward, isInlineTarget, rootNode, fromLocation, pos) {
      var from = InlineUtils.normalizePosition(forward, pos);
      var to = CaretFinder.fromPosition(forward, rootNode, from).map(Fun.curry(InlineUtils.normalizePosition, forward));

      var location = to.fold(
        function () {
          return fromLocation.map(outside);
        },
        function (to) {
          return readLocation(isInlineTarget, rootNode, to)
            .map(Fun.curry(betweenInlines, forward, isInlineTarget, rootNode, from, to))
            .filter(Fun.curry(skipNoMovement, fromLocation));
        }
      );

      return location.filter(isValidLocation);
    };

    var findLocationSimple = function (forward, location) {
      if (forward) {
        return location.fold(
          Fun.compose(Option.some, Location.start), // Before -> Start
          Option.none,
          Fun.compose(Option.some, Location.after), // End -> After
          Option.none
        );
      } else {
        return location.fold(
          Option.none,
          Fun.compose(Option.some, Location.before), // Before <- Start
          Option.none,
          Fun.compose(Option.some, Location.end) // End <- After
        );
      }
    };

    var findLocation = function (forward, isInlineTarget, rootNode, pos) {
      var from = InlineUtils.normalizePosition(forward, pos);
      var fromLocation = readLocation(isInlineTarget, rootNode, from);

      return readLocation(isInlineTarget, rootNode, from).bind(Fun.curry(findLocationSimple, forward)).orThunk(function () {
        return findLocationTraverse(forward, isInlineTarget, rootNode, fromLocation, pos);
      });
    };

    return {
      readLocation: readLocation,
      findLocation: findLocation,
      prevLocation: Fun.curry(findLocation, false),
      nextLocation: Fun.curry(findLocation, true),
      getElement: getElement,
      outside: outside,
      inside: inside
    };
  }
);