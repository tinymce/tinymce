import { Adt } from '@ephox/katamari';

var adt = Adt.generate([
  { aboveView: [ 'item' ] },
  { inView: [ 'item' ] },
  { belowView: [ 'item' ] }
]);

var cata = function (subject, onAbove, onIn, onBelow) {
  return subject.fold(onAbove, onIn, onBelow);
};

export default <any> {
  aboveView: adt.aboveView,
  inView: adt.inView,
  belowView: adt.belowView,
  cata: cata
};