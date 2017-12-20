import Comparator from './Comparator';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var selector = function (item, query) {
  var matches = [];
  return item.parent.bind(function (parent) {
    return Comparator.is(parent, query) ? Option.some(parent) : selector(parent, query);
  });
};

var closest = function (scope, query) {
  return Comparator.is(scope, query) ? Option.some(scope) : selector(scope, query);
};

var top = function (item) {
  return item.parent.fold(Fun.constant(item), function (parent) {
    return top(parent);
  });
};

var predicate = function (item, f) {
  return item.parent.bind(function (parent) {
    return f(parent) ? Option.some(parent) : predicate(parent, f);
  });
};

var all = function (item) {
  return item.parent.fold(Fun.constant([]), function (parent) {
    return [parent].concat(all(parent));
  });
};

export default <any> {
  selector: selector,
  closest: closest,
  predicate: predicate,
  all: all,
  top: top
};