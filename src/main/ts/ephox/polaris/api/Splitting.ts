import { Adt } from '@ephox/katamari';

const adt = Adt.generate([
  { include: [ 'item' ] },
  { excludeWith: [ 'item' ] },
  { excludeWithout: [ 'item' ] }
]);

const cata = function (subject, onInclude, onExcludeWith, onExcludeWithout) {
  return subject.fold(onInclude, onExcludeWith, onExcludeWithout);
};

export default {
  include: adt.include,
  excludeWith: adt.excludeWith,
  excludeWithout: adt.excludeWithout,
  cata
};