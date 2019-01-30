import Generator from '../parray/Generator';
import Query from '../parray/Query';
import Split from '../parray/Split';
import Translate from '../parray/Translate';

const generate = function (items, generator, start) {
  return Generator.make(items, generator, start);
};

const get = function (parray, offset) {
  return Query.get(parray, offset);
};

const find = function (parray, pred) {
  return Query.find(parray, pred);
};

const splits = function (parray, positions, subdivide) {
  return Split.splits(parray, positions, subdivide);
};

const translate = function (parray, amount) {
  return Translate.translate(parray, amount);
};

const sublist = function (parray, start, finish) {
  return Query.sublist(parray, start, finish);
};

export default <any> {
  generate,
  get,
  find,
  splits,
  translate,
  sublist
};