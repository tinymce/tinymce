import { Adt } from '@ephox/katamari';
import { AdtInterface } from '../../alien/TypeDefinitions';

export interface DirectionAdt extends AdtInterface {

}

const adt: {
  southeast: () => DirectionAdt;
  southwest: () => DirectionAdt;
  northeast: () => DirectionAdt;
  northwest: () => DirectionAdt;
  southmiddle: () => DirectionAdt;
  northmiddle: () => DirectionAdt;
} = Adt.generate([
  { southeast: [ ] },
  { southwest: [ ] },
  { northeast: [ ] },
  { northwest: [ ] },
  { southmiddle: [ ] },
  { northmiddle: [ ] }
]);

const cata = <B>(
  subject: DirectionAdt,
  southeast: () => B,
  southwest: () => B,
  northeast: () => B,
  northwest: () => B,
  southmiddle: () => B,
  northmiddle: () => B
): B => {
  return subject.fold(southeast, southwest, northeast, northwest, southmiddle, northmiddle);
};

// TODO: Simplify with the typescript approach.
const southeast = adt.southeast;
const southwest = adt.southwest;
const northeast = adt.northeast;
const northwest = adt.northwest;
const southmiddle = adt.southmiddle;
const northmiddle = adt.northmiddle;

export {
  southeast,
  southwest,
  northeast,
  northwest,
  southmiddle,
  northmiddle,
  cata
};