import { Adt, Arr } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

/*
 * origin: the position (without scroll) of the offset parent
 * scroll: the scrolling position of the window
 *
 * fixed: the fixed coordinates to show for css
 * offset: the absolute coordinates to show for css when inside an offset parent
 * absolute: the absolute coordinates to show before considering the offset parent
 */
const adt = Adt.generate([
  { offset: [ 'x', 'y' ] },
  { absolute: [ 'x', 'y' ] },
  { fixed: [ 'x', 'y' ] }
]);

const subtract = function (change) {
  return function (point) {
    return point.translate(-change.left(), -change.top());
  };
};

const add = function (change) {
  return function (point) {
    return point.translate(change.left(), change.top());
  };
};

const transform = function (changes) {
  return function (x, y) {
    return Arr.foldl(changes, function (rest, f) {
      return f(rest);
    }, Position(x, y));
  };
};

const asFixed = function (coord, scroll, origin) {
  return coord.fold(
    // offset to fixed
    transform([ add(origin), subtract(scroll) ]),
    // absolute to fixed
    transform([ subtract(scroll) ]),
    // fixed to fixed
    transform([ ])
  );
};

const asAbsolute = function (coord, scroll, origin) {
  return coord.fold(
    // offset to absolute
    transform([ add(origin) ]),
    // absolute to absolute
    transform([ ]),
    // fixed to absolute
    transform([ add(scroll) ])
  );
};

const asOffset = function (coord, scroll, origin) {
  return coord.fold(
    // offset to offset
    transform([ ]),
    // absolute to offset
    transform([ subtract(origin) ]),
    // fixed to offset
    transform([ add(scroll), subtract(origin) ])
  );
};

const toString = function (coord) {
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

const withinRange = function (coord1, coord2, xRange, yRange, scroll, origin) {
  const a1 = asAbsolute(coord1, scroll, origin);
  const a2 = asAbsolute(coord2, scroll, origin);
  return Math.abs(a1.left() - a2.left()) <= xRange &&
    Math.abs(a1.top() - a2.top()) <= yRange;
};

const toStyles = function (coord, scroll, origin) {
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

const translate = function (coord, deltaX, deltaY) {
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

const absorb = function (partialCoord, originalCoord, scroll, origin) {
  const absorbOne = function (stencil, nu) {
    return function (optX, optY) {
      const original = stencil(originalCoord, scroll, origin);
      return nu(optX.getOr(original.left()), optY.getOr(original.top()));
    };
  };

  return partialCoord.fold(
    absorbOne(asOffset, adt.offset),
    absorbOne(asAbsolute, adt.absolute),
    absorbOne(asFixed, adt.fixed)
  );
};

const offset = adt.offset;
const absolute = adt.absolute;
const fixed = adt.fixed;

export {
  offset,
  absolute,
  fixed,

  asFixed,
  asAbsolute,
  asOffset,
  withinRange,
  toStyles,
  translate,

  absorb,
  toString
};