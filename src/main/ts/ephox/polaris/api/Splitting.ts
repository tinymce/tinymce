import { Adt } from '@ephox/katamari';

var adt = Adt.generate([
  { include: [ 'item' ] },
  { excludeWith: [ 'item' ] },
  { excludeWithout: [ 'item' ] }
]);

var cata = function (subject, onInclude, onExcludeWith, onExcludeWithout) {
  return subject.fold(onInclude, onExcludeWith, onExcludeWithout);
};

export default <any> {
  include: adt.include,
  excludeWith: adt.excludeWith,
  excludeWithout: adt.excludeWithout,
  cata: cata
};