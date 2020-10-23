import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';
import * as Look from '../general/Look';

const universe = DomUniverse();

const selector = function (sel: string) {
  return (item: SugarElement) => Look.selector(universe, sel)(universe, item);
};

const predicate = function (pred: (e: SugarElement) => boolean) {
  return (item: SugarElement) => Look.predicate(universe, pred)(universe, item);
};

const exact = function (element: SugarElement) {
  return (item: SugarElement) => Look.exact(universe, element)(universe, item);
};

export {
  selector,
  predicate,
  exact
};
