import { Arr } from '@ephox/katamari';
import { TestUniverse } from '@ephox/boss';

const get = function (universe: TestUniverse, id: string) {
  return universe.find(universe.get(), id).getOrDie('Test element "' + id + '" not found');
};

const getAll = function (universe: TestUniverse, ids: string[]) {
  return Arr.map(ids, function (id) {
    return get(universe, id);
  });
};

export {
  get,
  getAll
};
