import { DomUniverse } from '@ephox/boss';
import Extract from '../general/Extract';

var universe = DomUniverse();

var from = function (element, optimise) {
  return Extract.from(universe, element, optimise);
};

var all = function (element, optimise) {
  return Extract.all(universe, element, optimise);
};

var extract = function (child, offset, optimise) {
  return Extract.extract(universe, child, offset, optimise);
};

var extractTo = function (child, offset, pred, optimise) {
  return Extract.extractTo(universe, child, offset, pred, optimise);
};

var find = function (parent, offset, optimise) {
  return Extract.find(universe, parent, offset, optimise);
};

var toText = function (element, optimise) {
  return Extract.toText(universe, element, optimise);
};

export default {
  extract: extract,
  extractTo: extractTo,
  all: all,
  from: from,
  find: find,
  toText: toText
};