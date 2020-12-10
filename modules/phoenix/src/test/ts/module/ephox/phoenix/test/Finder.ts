import { Gene, TestUniverse } from '@ephox/boss';
import { Arr } from '@ephox/katamari';

const get = function (universe: TestUniverse, id: string): Gene {
  return universe.find(universe.get(), id).getOrDie('Test element "' + id + '" not found');
};

const getAll = function (universe: TestUniverse, ids: string[]): Gene[] {
  return Arr.map(ids, (id) => {
    return get(universe, id);
  });
};

export {
  get,
  getAll
};
