import { Adt } from '@ephox/katamari';

var adt = Adt.generate([
  { 'southeast': [ ] },
  { 'southwest': [ ] },
  { 'northeast': [ ] },
  { 'northwest': [ ] }
]);


var cata = function (subject, southeast, southwest, northeast, northwest) {
  return subject.fold(southeast, southwest, northeast, northwest);
};

export default <any> {
  southeast: adt.southeast,
  southwest: adt.southwest,
  northeast: adt.northeast,
  northwest: adt.northwest,
  cata: cata
};