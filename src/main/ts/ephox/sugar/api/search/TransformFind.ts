import { Type } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Element from '../node/Element';

var ancestor = function (scope, transform, isRoot) {
  var element = scope.dom();
  var stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

  while (element.parentNode) {
    element = element.parentNode;
    var el = Element.fromDom(element);

    var transformed = transform(el);
    if (transformed.isSome()) return transformed;
    else if (stop(el)) break;
  }
  return Option.none();
};

var closest = function (scope, transform, isRoot) {
  var current = transform(scope);
  return current.orThunk(function () {
    return isRoot(scope) ? Option.none() : ancestor(scope, transform, isRoot);
  });
};

export default <any> {
  ancestor: ancestor,
  closest: closest
};