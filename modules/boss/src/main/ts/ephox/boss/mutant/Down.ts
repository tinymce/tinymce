import { Arr } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import Comparator from './Comparator';

const selector = function (item: Gene, query: string): Gene[] {
  return Arr.bind(item.children || [], function (child) {
    const rest = selector(child, query);
    return Comparator.is(child, query) ? [child].concat(rest) : rest;
  });
};

const predicate = function (item: Gene, pred: (e: Gene) => boolean): Gene[] {
  return Arr.bind(item.children || [], function (child) {
    const rest = predicate(child, pred);
    return pred(child) ? [child].concat(rest) : rest;
  });
};

export default {
  selector,
  predicate
};