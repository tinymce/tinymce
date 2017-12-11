import { DomUniverse } from '@ephox/boss';
import { Fun } from '@ephox/katamari';
import Look from '../general/Look';

var universe = DomUniverse();

var selector = function (sel) {
  return Fun.curry(Look.selector(universe, sel), universe);
};

var predicate = function (pred) {
  return Fun.curry(Look.predicate(universe, pred), universe);
};

var exact = function (element) {
  return Fun.curry(Look.exact(universe, element), universe);
};

export default <any> {
  selector: selector,
  predicate: predicate,
  exact: exact
};