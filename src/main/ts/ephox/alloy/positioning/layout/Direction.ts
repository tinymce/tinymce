import { Adt } from '@ephox/katamari';

export interface DirectionAdt extends Adt {

}

const adt: {
  southeast: () => DirectionAdt;
  southwest: () => DirectionAdt;
  northeast: () => DirectionAdt;
  northwest: () => DirectionAdt;
  south: () => DirectionAdt;
  north: () => DirectionAdt;
  east: () => DirectionAdt;
  west: () => DirectionAdt;
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
  southeast: () => B,
  southwest: () => B,
  northeast: () => B,
  northwest: () => B,
  south: () => B,
  north: () => B,
  east: () => B,
  west: () => B
): B => {
  return subject.fold(southeast, southwest, northeast, northwest, south, north, east, west);
};

const cataVertical = <B>(subject: DirectionAdt, south: () => B, middle: () => B, north: () => B): B => {
  return subject.fold(south, south, north, north, south, north, middle, middle);
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
  cataVertical
};