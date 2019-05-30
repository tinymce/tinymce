import { Fun, Option } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import Comparator from './Comparator';

const selector = function (item: Gene, query: string): Option<Gene> {
  return item.parent.bind(function (parent) {
    return Comparator.is(parent, query) ? Option.some(parent) : selector(parent, query);
  });
};

const closest = function (scope: Gene, query: string) {
  return Comparator.is(scope, query) ? Option.some(scope) : selector(scope, query);
};

const top = function (item: Gene): Gene {
  return item.parent.fold(Fun.constant(item), function (parent) {
    return top(parent);
  });
};

const predicate = function (item: Gene, f: (e: Gene) => boolean): Option<Gene> {
  return item.parent.bind(function (parent) {
    return f(parent) ? Option.some(parent) : predicate(parent, f);
  });
};

const all = function (item: Gene): Gene[] {
  return item.parent.fold(Fun.constant([]), function (parent) {
    return [parent].concat(all(parent));
  });
};

export default {
  selector,
  closest,
  predicate,
  all,
  top
};