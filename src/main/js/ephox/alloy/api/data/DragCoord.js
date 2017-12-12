import { Arr } from '@ephox/katamari';
import { Adt } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

/*
 * origin: the position (without scroll) of the offset parent
 * scroll: the scrolling position of the window
 *
 * fixed: the fixed coordinates to show for css
 * offset: the absolute coordinates to show for css when inside an offset parent
 * absolute: the absolute coordinates to show before considering the offset parent
 */
var adt = Adt.generate([
  { offset: [ 'x', 'y' ] },
  { absolute: [ 'x', 'y' ] },
  { fixed: [ 'x', 'y' ] }
]);

var subtract = function (change) {
  return function (point) {
    return point.translate(-change.left(), -change.top());
  };
};

var add = function (change) {
  return function (point) {
    return point.translate(change.left(), change.top());
  };
};

var transform = function (changes) {
  return function (x, y) {
    return Arr.foldl(changes, function (rest, f) {
      return f(rest);
    }, Position(x, y));
  };
};

var asFixed = function (coord, scroll, origin) {
  return coord.fold(
    // offset to fixed
    transform([ add(origin), subtract(scroll) ]),
    // absolute to fixed
    transform([ subtract(scroll) ]),
    // fixed to fixed
    transform([ ])
  );
};

var asAbsolute = function (coord, scroll, origin) {
  return coord.fold(
    // offset to absolute
    transform([ add(origin) ]),
    // absolute to absolute
    transform([ ]),
    // fixed to absolute
    transform([ add(scroll) ])
  );
};

var asOffset = function (coord, scroll, origin) {
  return coord.fold(
    // offset to offset
    transform([ ]),
    // absolute to offset
    transform([ subtract(origin) ]),
    // fixed to offset
    transform([ add(scroll), subtract(origin) ])
  );
};

var toString = function (coord) {
  return coord.fold(
    function (x, y) {
      return 'offset(' + x + ', ' + y + ')';
    },
    function (x, y) {
      return 'absolute(' + x + ', ' + y + ')';
    },
    function (x, y) {
      return 'fixed(' + x + ', ' + y + ')';
    }
  );
};

var withinRange = function (coord1, coord2, xRange, yRange, scroll, origin) {
  var a1 = asAbsolute(coord1, scroll, origin);
  var a2 = asAbsolute(coord2, scroll, origin);
  return Math.abs(a1.left() - a2.left()) <= xRange &&
    Math.abs(a1.top() - a2.top()) <= yRange;
};

var toStyles = function (coord, scroll, origin) {
  return coord.fold(
    function (x, y) {
      // offset
      return { position: 'absolute', left: x + 'px', top: y + 'px'};
    },
    function (x, y) {
      return { position: 'absolute', left: (x - origin.left()) + 'px', top: (y - origin.top()) + 'px' };
      // absolute
    },
    function (x, y) {
      // fixed
      return { position: 'fixed', left: x + 'px', top: y + 'px' };
    }
  );
};

var translate = function (coord, deltaX, deltaY) {
  return coord.fold(
    function (x, y) {
      return adt.offset(x + deltaX, y + deltaY);
    },
    function (x, y) {
      return adt.absolute(x + deltaX, y + deltaY);
    },
    function (x, y) {
      return adt.fixed(x + deltaX, y + deltaY);
    }
  );
};

var absorb = function (partialCoord, originalCoord, scroll, origin) {
  var absorbOne = function (stencil, nu) {
    return function (optX, optY) {
      var original = stencil(originalCoord, scroll, origin);
      return nu(optX.getOr(original.left()), optY.getOr(original.top()));
    };
  };

  return partialCoord.fold(
    absorbOne(asOffset, adt.offset),
    absorbOne(asAbsolute, adt.absolute),
    absorbOne(asFixed, adt.fixed)
  );
};

export default <any> {
  offset: adt.offset,
  absolute: adt.absolute,
  fixed: adt.fixed,

  asFixed: asFixed,
  asAbsolute: asAbsolute,
  asOffset: asOffset,
  withinRange: withinRange,
  toStyles: toStyles,
  translate: translate,

  absorb: absorb,
  toString: toString
};