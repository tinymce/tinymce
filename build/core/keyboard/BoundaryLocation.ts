/**
 * BoundaryLocation.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Adt, Fun, Option, Options } from '@ephox/katamari';
import CaretFinder from '../caret/CaretFinder';
import * as CaretUtils from '../caret/CaretUtils';
import InlineUtils from './InlineUtils';
import LazyEvaluator from '../util/LazyEvaluator';
import { getParentCaretContainer } from 'tinymce/core/fmt/FormatContainer';

const Location = Adt.generate([
  { before: [ 'element' ] },
  { start: [ 'element' ] },
  { end: [ 'element' ] },
  { after: [ 'element' ] }
]);

const rescope = function (rootNode, node) {
  const parentBlock = CaretUtils.getParentBlock(node, rootNode);
  return parentBlock ? parentBlock : rootNode;
};

const before = function (isInlineTarget, rootNode, pos) {
  const nPos = InlineUtils.normalizeForwards(pos);
  const scope = rescope(rootNode, nPos.container());
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

const isNotInsideFormatCaretContainer = function (rootNode, elm) {
  return getParentCaretContainer(rootNode, elm) === null;
};

const findInsideRootInline = function (isInlineTarget, rootNode, pos) {
  return InlineUtils.findRootInline(isInlineTarget, rootNode, pos).filter(Fun.curry(isNotInsideFormatCaretContainer, rootNode));
};

const start = function (isInlineTarget, rootNode, pos) {
  const nPos = InlineUtils.normalizeBackwards(pos);
  return findInsideRootInline(isInlineTarget, rootNode, nPos).bind(function (inline) {
    const prevPos = CaretFinder.prevPosition(inline, nPos);
    return prevPos.isNone() ? Option.some(Location.start(inline)) : Option.none();
  });
};

const end = function (isInlineTarget, rootNode, pos) {
  const nPos = InlineUtils.normalizeForwards(pos);
  return findInsideRootInline(isInlineTarget, rootNode, nPos).bind(function (inline) {
    const nextPos = CaretFinder.nextPosition(inline, nPos);
    return nextPos.isNone() ? Option.some(Location.end(inline)) : Option.none();
  });
};

const after = function (isInlineTarget, rootNode, pos) {
  const nPos = InlineUtils.normalizeBackwards(pos);
  const scope = rescope(rootNode, nPos.container());
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

const isValidLocation = function (location) {
  return InlineUtils.isRtl(getElement(location)) === false;
};

const readLocation = function (isInlineTarget, rootNode, pos) {
  const location = LazyEvaluator.evaluateUntil([
    before,
    start,
    end,
    after
  ], [isInlineTarget, rootNode, pos]);

  return location.filter(isValidLocation);
};

const getElement = function (location) {
  return location.fold(
    Fun.identity, // Before
    Fun.identity, // Start
    Fun.identity, // End
    Fun.identity  // After
  );
};

const getName = function (location) {
  return location.fold(
    Fun.constant('before'), // Before
    Fun.constant('start'),  // Start
    Fun.constant('end'),    // End
    Fun.constant('after')   // After
  );
};

const outside = function (location) {
  return location.fold(
    Location.before, // Before
    Location.before, // Start
    Location.after,  // End
    Location.after   // After
  );
};

const inside = function (location) {
  return location.fold(
    Location.start, // Before
    Location.start, // Start
    Location.end,   // End
    Location.end    // After
  );
};

const isEq = function (location1, location2) {
  return getName(location1) === getName(location2) && getElement(location1) === getElement(location2);
};

const betweenInlines = function (forward, isInlineTarget, rootNode, from, to, location) {
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

const skipNoMovement = function (fromLocation, toLocation) {
  return fromLocation.fold(
    Fun.constant(true),
    function (fromLocation) {
      return !isEq(fromLocation, toLocation);
    }
  );
};

const findLocationTraverse = function (forward, isInlineTarget, rootNode, fromLocation, pos) {
  const from = InlineUtils.normalizePosition(forward, pos);
  const to = CaretFinder.fromPosition(forward, rootNode, from).map(Fun.curry(InlineUtils.normalizePosition, forward));

  const location = to.fold(
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

const findLocationSimple = function (forward, location) {
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

const findLocation = function (forward, isInlineTarget, rootNode, pos) {
  const from = InlineUtils.normalizePosition(forward, pos);
  const fromLocation = readLocation(isInlineTarget, rootNode, from);

  return readLocation(isInlineTarget, rootNode, from).bind(Fun.curry(findLocationSimple, forward)).orThunk(function () {
    return findLocationTraverse(forward, isInlineTarget, rootNode, fromLocation, pos);
  });
};

export default {
  readLocation,
  findLocation,
  prevLocation: Fun.curry(findLocation, false),
  nextLocation: Fun.curry(findLocation, true),
  getElement,
  outside,
  inside
};