import { Adt } from '@ephox/katamari';

type DirectionFunc<T> = () => T;

export interface DirectionAdt {
  fold: <T>(
    southeast: DirectionFunc<T>,
    southwest: DirectionFunc<T>,
    northeast: DirectionFunc<T>,
    northwest: DirectionFunc<T>,
    south: DirectionFunc<T>,
    north: DirectionFunc<T>,
    east: DirectionFunc<T>,
    west: DirectionFunc<T>,
  ) => T;
  match: <T>(branches: {
    southeast: DirectionFunc<T>;
    southwest: DirectionFunc<T>;
    northeast: DirectionFunc<T>;
    northwest: DirectionFunc<T>;
    south: DirectionFunc<T>;
    north: DirectionFunc<T>;
    east: DirectionFunc<T>;
    west: DirectionFunc<T>;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  southeast: DirectionFunc<DirectionAdt>;
  southwest: DirectionFunc<DirectionAdt>;
  northeast: DirectionFunc<DirectionAdt>;
  northwest: DirectionFunc<DirectionAdt>;
  south: DirectionFunc<DirectionAdt>;
  north: DirectionFunc<DirectionAdt>;
  east: DirectionFunc<DirectionAdt>;
  west: DirectionFunc<DirectionAdt>;
} = Adt.generate([
  { southeast: [ ] },
  { southwest: [ ] },
  { northeast: [ ] },
  { northwest: [ ] },
  { south: [ ] },
  { north: [ ] },
  { east: [ ] },
  { west: [ ] }
]);

const cata = <B>(
  subject: DirectionAdt,
  southeast: DirectionFunc<B>,
  southwest: DirectionFunc<B>,
  northeast: DirectionFunc<B>,
  northwest: DirectionFunc<B>,
  south: DirectionFunc<B>,
  north: DirectionFunc<B>,
  east: DirectionFunc<B>,
  west: DirectionFunc<B>
): B => {
  return subject.fold(southeast, southwest, northeast, northwest, south, north, east, west);
};

const cataVertical = <B>(subject: DirectionAdt, south: DirectionFunc<B>, middle: DirectionFunc<B>, north: DirectionFunc<B>): B => {
  return subject.fold(south, south, north, north, south, north, middle, middle);
};

const cataHorizontal = <B>(subject: DirectionAdt, east: DirectionFunc<B>, middle: DirectionFunc<B>, west: DirectionFunc<B>): B => {
  return subject.fold(east, west, east, west, middle, middle, east, west);
};

// TODO: Simplify with the typescript approach.
const southeast = adt.southeast;
const southwest = adt.southwest;
const northeast = adt.northeast;
const northwest = adt.northwest;
const south = adt.south;
const north = adt.north;
const east = adt.east;
const west = adt.west;

export {
  southeast,
  southwest,
  northeast,
  northwest,
  south,
  north,
  east,
  west,
  cata,
  cataVertical,
  cataHorizontal
};
