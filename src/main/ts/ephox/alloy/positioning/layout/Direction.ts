import { Adt } from '@ephox/katamari';
import { AdtInterface } from 'ephox/alloy/alien/TypeDefinitions';


export interface DirectionAdt extends AdtInterface {

}

const adt = Adt.generate([
  { southeast: [ ] },
  { southwest: [ ] },
  { northeast: [ ] },
  { northwest: [ ] }
]);

const cata = <B>(
  subject: DirectionAdt,
  southeast: () => B,
  southwest: () => B,
  northeast: () => B,
  northwest: () => B
): B => {
  return subject.fold(southeast, southwest, northeast, northwest);
};

// TODO: Simplify with the typescript approach.
const southeast = adt.southeast as () => DirectionAdt;
const southwest = adt.southwest as () => DirectionAdt;
const northeast = adt.northeast as () => DirectionAdt;
const northwest = adt.northwest as () => DirectionAdt;

export {
  southeast,
  southwest,
  northeast,
  northwest,
  cata
};