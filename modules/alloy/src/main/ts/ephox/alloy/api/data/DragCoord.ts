import { Adt, Arr, Option } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

// Snappables use an option for the coord and then pass it to absorb below
// so "T" here should either be a `number` or an `Option<number>`
export type DragCoords<T = number, U = CoordAdt<T>> = (x: T, y: T) => U;

export interface CoordAdt<T = number> {
  fold: <U>(
    offset: DragCoords<T, U>,
    absolute: DragCoords<T, U>,
    fixed: DragCoords<T, U>,
  ) => U;
  match: <U>(branches: {
    offset: DragCoords<T, U>;
    absolute: DragCoords<T, U>;
    fixed: DragCoords<T, U>;
  }) => U;
  log: (label: string) => void;
}

export type StylesCoord = {
  left: Option<string>;
  right: Option<string>;
  top: Option<string>;
  bottom: Option<string>;
  position: Option<string>;
};

type CoordTransform = (coords: Position) => Position;

export type CoordStencil = (coord: CoordAdt<number>, scroll: Position, origin: Position) => Position;
/*
 * origin: the position (without scroll) of the offset parent
 * scroll: the scrolling position of the window
 *
 * fixed: the fixed coordinates to show for css
 * offset: the absolute coordinates to show for css when inside an offset parent
 * absolute: the absolute coordinates to show before considering the offset parent
 */
const adt: {
  offset: DragCoords<number | Option<number>>;
  absolute: DragCoords<number | Option<number>>;
  fixed: DragCoords<number | Option<number>>;
} = Adt.generate([
  { offset: [ 'x', 'y' ] },
  { absolute: [ 'x', 'y' ] },
  { fixed: [ 'x', 'y' ] }
]);

const subtract = (change: Position): CoordTransform => {
  return (point) => {
    return point.translate(-change.left(), -change.top());
  };
};

const add = (change: Position): CoordTransform => {
  return (point) => {
    return point.translate(change.left(), change.top());
  };
};

const transform = (changes: CoordTransform[]) => (x: number, y: number): Position => {
  return Arr.foldl(changes, (rest, f) => {
    return f(rest);
  }, Position(x, y));
};

const asFixed: CoordStencil = (coord: CoordAdt<number>, scroll: Position, origin: Position) => {
  return coord.fold(
    // offset to fixed
    transform([ add(origin), subtract(scroll) ]),
    // absolute to fixed
    transform([ subtract(scroll) ]),
    // fixed to fixed
    transform([ ])
  );
};

const asAbsolute: CoordStencil = (coord: CoordAdt<number>, scroll: Position, origin: Position) => {
  return coord.fold(
    // offset to absolute
    transform([ add(origin) ]),
    // absolute to absolute
    transform([ ]),
    // fixed to absolute
    transform([ add(scroll) ])
  );
};

const asOffset: CoordStencil = (coord: CoordAdt<number>, scroll: Position, origin: Position) => {
  return coord.fold(
    // offset to offset
    transform([ ]),
    // absolute to offset
    transform([ subtract(origin) ]),
    // fixed to offset
    transform([ add(scroll), subtract(origin) ])
  );
};

const toString = (coord: CoordAdt<number>): string => {
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

const withinRange = (coord1: CoordAdt<number>, coord2: CoordAdt<number>, xRange: number, yRange: number, scroll: Position, origin: Position): boolean => {
  const a1 = asAbsolute(coord1, scroll, origin);
  const a2 = asAbsolute(coord2, scroll, origin);
  // tslint:disable-next-line:no-console
  // console.log(`a1.left(): ${a1.left()}, a2.left(): ${a2.left()}, leftDelta: ${a1.left() - a2.left()}, xRange: ${xRange}, lD <= xRange: ${Math.abs(a1.left() - a2.left()) <= xRange}`);
  // console.log(`a1.top(): ${a1.top()}, a2.top(): ${a2.top()}, topDelta: ${a1.top() - a2.top()}, yRange: ${yRange}, lD <= xRange: ${Math.abs(a1.top() - a2.top()) <= yRange}`);
  return Math.abs(a1.left() - a2.left()) <= xRange &&
    Math.abs(a1.top() - a2.top()) <= yRange;
};

const getDeltas = (coord1: CoordAdt<number>, coord2: CoordAdt<number>, xRange: number, yRange: number, scroll: Position, origin: Position): Position => {
  const a1 = asAbsolute(coord1, scroll, origin);
  const a2 = asAbsolute(coord2, scroll, origin);
  const left = Math.abs(a1.left() - a2.left());
  const top = Math.abs(a1.top() - a2.top());
  return Position(left, top);
};

const toStyles = (coord: CoordAdt<number>, scroll: Position, origin: Position): StylesCoord => {
  const stylesOpt = coord.fold(
    (x, y) => {
      // offset
      return { position: Option.some('absolute'), left: Option.some(x + 'px'), top: Option.some(y + 'px') };
    },
    (x, y) => {
      return { position: Option.some('absolute'), left: Option.some((x - origin.left()) + 'px'), top: Option.some((y - origin.top()) + 'px') };
      // absolute
    },
    (x, y) => {
      // fixed
      return { position: Option.some('fixed'), left: Option.some(x + 'px'), top: Option.some(y + 'px') };
    }
  );

  return { right: Option.none(),  bottom: Option.none(), ...stylesOpt };
};

const translate = (coord: CoordAdt<number>, deltaX: number, deltaY: number): CoordAdt<number> => {
  return coord.fold(
    (x, y) => {
      return offset(x + deltaX, y + deltaY);
    },
    (x, y) => {
      return absolute(x + deltaX, y + deltaY);
    },
    (x, y) => {
      return fixed(x + deltaX, y + deltaY);
    }
  );
};

const absorb = (partialCoord: CoordAdt<Option<number>>, originalCoord: CoordAdt<number>, scroll: Position, origin: Position): CoordAdt<number> => {
  const absorbOne = (stencil: CoordStencil, nu: DragCoords) => {
    return (optX: Option<number>, optY: Option<number>): CoordAdt => {
      const original = stencil(originalCoord, scroll, origin);
      return nu(optX.getOr(original.left()), optY.getOr(original.top()));
    };
  };

  return partialCoord.fold(
    absorbOne(asOffset, offset),
    absorbOne(asAbsolute, absolute),
    absorbOne(asFixed, fixed)
  );
};

const offset = adt.offset as {
  (x: number, y: number): CoordAdt<number>;
  (x: Option<number>, y: Option<number>): CoordAdt<Option<number>>;
};
const absolute = adt.absolute as {
  (x: number, y: number): CoordAdt<number>;
  (x: Option<number>, y: Option<number>): CoordAdt<Option<number>>;
};
const fixed = adt.fixed as {
  (x: number, y: number): CoordAdt<number>;
  (x: Option<number>, y: Option<number>): CoordAdt<Option<number>>;
};

export {
  offset,
  absolute,
  fixed,

  asFixed,
  asAbsolute,
  asOffset,
  withinRange,
  getDeltas,
  toStyles,
  translate,

  absorb,
  toString
};
