import { Type } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Element from '../node/Element';
import { Node as DomNode } from '@ephox/dom-globals';

var ancestor = function <A>(scope: Element, transform: (e: Element) => Option<A>, isRoot?): Option<A> {
  var element: DomNode = scope.dom();
  var stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

  while (element.parentNode) {
    element = element.parentNode;
    var el = Element.fromDom(element);

    var transformed = transform(el);
    if (transformed.isSome()) return transformed;
    else if (stop(el)) break;
  }
  return Option.none<A>();
};

var closest = function <A>(scope: Element, transform: (e: Element) => Option<A>, isRoot?): Option<A> {
  var current = transform(scope);
  return current.orThunk(function () {
    return isRoot(scope) ? Option.none<A>() : ancestor(scope, transform, isRoot);
  });
};

export {
  ancestor,
  closest,
};