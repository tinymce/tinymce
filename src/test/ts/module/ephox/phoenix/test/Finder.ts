import { Arr } from '@ephox/katamari';
import { Universe } from '@ephox/boss';

var get = function <E, D>(universe: Universe<E, D>, id: string) {
  return universe!.find(universe!.get(), id).getOrDie();
};

var getAll = function <E, D>(universe: Universe<E, D>, ids: string[]) {
  return Arr.map(ids, function (id) {
    return get(universe, id);
  });
};

export {
  get,
  getAll
};