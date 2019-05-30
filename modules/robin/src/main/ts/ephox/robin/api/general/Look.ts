import { Fun } from '@ephox/katamari';
import Look from '../../look/Look';

var selector = function (universe, sel) {
  return Look.selector(sel);
};

var predicate = function (universe, pred) {
  return Look.predicate(pred);
};

var exact = function (universe, item) {
  var itemMatch = Fun.curry(universe.eq, item);

  return Look.predicate(itemMatch);
};

export default <any> {
  selector: selector,
  predicate: predicate,
  exact: exact
};