import { Adt } from '@ephox/katamari';

const adt = Adt.generate([
  { southeast: [ ] },
  { southwest: [ ] },
  { northeast: [ ] },
  { northwest: [ ] }
]);

const cata = (subject, southeast, southwest, northeast, northwest) => {
  return subject.fold(southeast, southwest, northeast, northwest);
};

const southeast = adt.southeast;
const southwest = adt.southwest;
const northeast = adt.northeast;
const northwest = adt.northwest;

export {
  southeast,
  southwest,
  northeast,
  northwest,
  cata
};