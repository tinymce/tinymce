import Generator from '../parray/Generator';
import Query from '../parray/Query';
import Split from '../parray/Split';
import Translate from '../parray/Translate';

var generate = function (items, generator, _start) {
  return Generator.make(items, generator, _start);
};

var get = function (parray, offset) {
  return Query.get(parray, offset);
};

var find = function (parray, pred) {
  return Query.find(parray, pred);
};

var splits = function (parray, positions, subdivide) {
  return Split.splits(parray, positions, subdivide);
};

var translate = function (parray, amount) {
  return Translate.translate(parray, amount);
};

var sublist = function (parray, start, finish) {
  return Query.sublist(parray, start, finish);
};

export default <any> {
  generate: generate,
  get: get,
  find: find,
  splits: splits,
  translate: translate,
  sublist: sublist
};