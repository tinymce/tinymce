import { Universe } from '@ephox/boss';
import { Arr, Fun } from '@ephox/katamari';
import * as Extract from './Extract';

const newline = '\n';
const space = ' ';

const onEmpty = function <E, D>(item: E, universe: Universe<E, D>) {
  return universe.property().name(item) === 'img' ? space : newline;
};

const from = function <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean) {
  const typed = Extract.typed(universe, item, optimise);
  return Arr.map(typed, function (t) {
    return t.fold(Fun.constant(newline), onEmpty, universe.property().getText, universe.property().getText);
  }).join('');
};

export {
  from
};
