import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import * as Look from '../general/Look';

const universe = DomUniverse();

const selector = function (sel: string) {
  return (item: Element) => Look.selector(universe, sel)(universe, item);
};

const predicate = function (pred: (e: Element) => boolean) {
  return (item: Element) => Look.predicate(universe, pred)(universe, item);
};

const exact = function (element: Element) {
  return (item: Element) => Look.exact(universe, element)(universe, item);
};

export {
  selector,
  predicate,
  exact
};
