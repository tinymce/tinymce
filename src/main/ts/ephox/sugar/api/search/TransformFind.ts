import { Type } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Element from '../node/Element';
import { Node as DomNode } from '@ephox/dom-globals';

var ancestor = function (scope: Element, transform: (e: Element) => Option<Element>, isRoot?) {
  var element: DomNode = scope.dom();
  var stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

  while (element.parentNode) {
    element = element.parentNode;
    var el = Element.fromDom(element);

    var transformed = transform(el);
    if (transformed.isSome()) return transformed;
    else if (stop(el)) break;
  }
  return Option.none<Element>();
};

var closest = function (scope: Element, transform: (e: Element) => Option<Element>, isRoot?) {
  var current = transform(scope);
  return current.orThunk(function () {
    return isRoot(scope) ? Option.none<Element>() : ancestor(scope, transform, isRoot);
  });
};

export default {
  ancestor,
  closest,
};