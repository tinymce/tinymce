import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var all = function (universe, look, elements, f) {
  var head = elements[0];
  var tail = elements.slice(1);
  return f(universe, look, head, tail);
};

/**
 * Check if look returns the same element for all elements, and return it if it exists.
 */
var oneAll = function (universe, look, elements) {
  return elements.length > 0 ?
    all(universe, look, elements, unsafeOne) :
    Option.none();
};

var unsafeOne = function (universe, look, head, tail) {
  var start = look(universe, head);
  return Arr.foldr(tail, function (b, a) {
    var current = look(universe, a);
    return commonElement(universe, b, current);
  }, start);
};

var commonElement = function (universe, start, end) {
  return start.bind(function (s) {
    return end.filter(Fun.curry(universe.eq, s));
  });
};

export default <any> {
  oneAll: oneAll
};