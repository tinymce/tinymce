import { Fun, Optional } from '@ephox/katamari';

import { Gene } from '../api/Gene';
import * as Comparator from './Comparator';

const selector = (item: Gene, query: string): Optional<Gene> => {
  return item.parent.bind((parent) => {
    return Comparator.is(parent, query) ? Optional.some(parent) : selector(parent, query);
  });
};

const closest = (scope: Gene, query: string): Optional<Gene> => {
  return Comparator.is(scope, query) ? Optional.some(scope) : selector(scope, query);
};

const top = (item: Gene): Gene => {
  return item.parent.fold(Fun.constant(item), (parent) => {
    return top(parent);
  });
};

const predicate = (item: Gene, f: (e: Gene) => boolean): Optional<Gene> => {
  return item.parent.bind((parent) => {
    return f(parent) ? Optional.some(parent) : predicate(parent, f);
  });
};

const all = (item: Gene): Gene[] => {
  return item.parent.fold(Fun.constant([]), (parent) => {
    return [ parent ].concat(all(parent));
  });
};

export {
  selector,
  closest,
  predicate,
  all,
  top
};
