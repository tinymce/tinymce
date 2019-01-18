import { Arr } from '@ephox/katamari';

var get = function (universe, id) {
  return universe.find(universe.get(), id).getOrDie();
};

var getAll = function (universe, ids) {
  return Arr.map(ids, function (id) {
    return get(universe, id);
  });
};

export default {
  get: get,
  getAll: getAll
};