import { Adt, Arr, Option } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { SugarPosition } from '../../alien/TypeDefinitions';

// TODO: Morgan, check why and how this type can take both a number or an option.
export type DragCoords = (x: number | Option<number>, y: number | Option<number>) => CoordAdt;

export interface CoordAdt extends Adt {
  // TODO
}

export interface StylesCoord {
  left: string;
  top: string;
  position: string;
}

type CoordTransform = (coords: SugarPosition) => SugarPosition;

export type CoordStencil = (coord: CoordAdt, scroll: SugarPosition, origin: SugarPosition) => SugarPosition;
/*
 * origin: the position (without scroll) of the offset parent
 * scroll: the scrolling position of the window
 *
 * fixed: the fixed coordinates to show for css
 * offset: the absolute coordinates to show for css when inside an offset parent
 * absolute: the absolute coordinates to show before considering the offset parent
 */
const adt: {
  offset: DragCoords;
  absolute: DragCoords;
  fixed: DragCoords;
} = Adt.generate([
  { offset: [ 'x', 'y' ] },
  { absolute: [ 'x', 'y' ] },
  { fixed: [ 'x', 'y' ] }
]);

const subtract = (change: SugarPosition): CoordTransform => {
  return (point) => {
    return point.translate(-change.left(), -change.top());
  };
};

const add = (change: SugarPosition): CoordTransform => {
  return (point) => {
    return point.translate(change.left(), change.top());
  };
};

const transform = (changes: CoordTransform[]) => (x: number, y: number): SugarPosition => {
  return Arr.foldl(changes, (rest, f) => {
    return f(rest);
  }, Position(x, y));
};

const asFixed: CoordStencil = (coord: CoordAdt, scroll: SugarPosition, origin: SugarPosition) => {
  return coord.fold(
    // offset to fixed
    transform([ add(origin), subtract(scroll) ]),
    // absolute to fixed
    transform([ subtract(scroll) ]),
    // fixed to fixed
    transform([ ])
  );
};

const asAbsolute: CoordStencil = (coord: CoordAdt, scroll: SugarPosition, origin: SugarPosition) => {
  return coord.fold(
    // offset to absolute
    transform([ add(origin) ]),
    // absolute to absolute
    transform([ ]),
    // fixed to absolute
    transform([ add(scroll) ])
  );
};

const asOffset: CoordStencil = (coord: CoordAdt, scroll: SugarPosition, origin: SugarPosition) => {
  return coord.fold(
    // offset to offset
    transform([ ]),
    // absolute to offset
    transform([ subtract(origin) ]),
    // fixed to offset
    transform([ add(scroll), subtract(origin) ])
  );
};

const toString = (coord: CoordAdt): string => {
  return coord.fold(
    (x, y) => {
      return 'offset(' + x + ', ' + y + ')';
    },
    (x, y) => {
      return 'absolute(' + x + ', ' + y + ')';
    },
    (x, y) => {
      return 'fixed(' + x + ', ' + y + ')';
    }
  );
};

const withinRange = (coord1: CoordAdt, coord2: CoordAdt, xRange: number, yRange: number, scroll: SugarPosition, origin: SugarPosition): boolean => {
  const a1 = asAbsolute(coord1, scroll, origin);
  const a2 = asAbsolute(coord2, scroll, origin);
  return Math.abs(a1.left() - a2.left()) <= xRange &&
    Math.abs(a1.top() - a2.top()) <= yRange;
};

const toStyles = (coord: CoordAdt, scroll: SugarPosition, origin: SugarPosition): StylesCoord => {
  return coord.fold(
    (x, y) => {
      // offset
      return { position: 'absolute', left: x + 'px', top: y + 'px'};
    },
    (x, y) => {
      return { position: 'absolute', left: (x - origin.left()) + 'px', top: (y - origin.top()) + 'px' };
      // absolute
    },
    (x, y) => {
      // fixed
      return { position: 'fixed', left: x + 'px', top: y + 'px' };
    }
  );
};

const translate = (coord: CoordAdt, deltaX: number, deltaY: number): CoordAdt => {
  return coord.fold(
    (x, y) => {
      return adt.offset(x + deltaX, y + deltaY);
    },
    (x, y) => {
      return adt.absolute(x + deltaX, y + deltaY);
    },
    (x, y) => {
      return adt.fixed(x + deltaX, y + deltaY);
    }
  );
};

const absorb = (partialCoord: CoordAdt, originalCoord: CoordAdt, scroll: SugarPosition, origin: SugarPosition): CoordAdt => {
  const absorbOne = (stencil: CoordStencil, nu: DragCoords) => {
    return (optX, optY): CoordAdt => {
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

const offset = adt.offset as DragCoords;
const absolute = adt.absolute as DragCoords;
const fixed = adt.fixed as DragCoords;

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