import { Arr } from '@ephox/katamari';

import { Gene } from '../api/Gene';
import * as Comparator from './Comparator';

const selector = (item: Gene, query: string): Gene[] => {
  return Arr.bind(item.children || [], (child) => {
    const rest = selector(child, query);
    return Comparator.is(child, query) ? [ child ].concat(rest) : rest;
  });
};

const predicate = (item: Gene, pred: (e: Gene) => boolean): Gene[] => {
  return Arr.bind(item.children || [], (child) => {
    const rest = predicate(child, pred);
    return pred(child) ? [ child ].concat(rest) : rest;
  });
};

export {
  selector,
  predicate
};
