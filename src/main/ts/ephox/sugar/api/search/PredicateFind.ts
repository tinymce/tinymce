import { Type } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Body from '../node/Body';
import Compare from '../dom/Compare';
import Element from '../node/Element';
import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import { Node as DomNode } from '@ephox/dom-globals';

var first = function (predicate: (e: Element) => boolean) {
  return descendant(Body.body(), predicate);
};

var ancestor = function (scope: Element, predicate: (e: Element) => boolean, isRoot?) {
  var element: DomNode = scope.dom();
  var stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

  while (element.parentNode) {
    element = element.parentNode;
    var el = Element.fromDom(element);

    if (predicate(el)) return Option.some(el);
    else if (stop(el)) break;
  }
  return Option.none<Element>();
};

var closest = function (scope: Element, predicate: (e: Element) => boolean, isRoot?) {
  // This is required to avoid ClosestOrAncestor passing the predicate to itself
  var is = function (scope: Element) {
    return predicate(scope);
  };
  return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot);
};

var sibling = function (scope, predicate: (e: Element) => boolean) {
  var element: DomNode = scope.dom();
  if (!element.parentNode) return Option.none<Element>();

  return child(Element.fromDom(element.parentNode), function (x) {
    return !Compare.eq(scope, x) && predicate(x);
  });
};

var child = function (scope: Element, predicate: (e: Element) => boolean) {
  var result = Arr.find(scope.dom().childNodes,
    Fun.compose(predicate, Element.fromDom));
  return result.map(Element.fromDom);
};

var descendant = function (scope: Element, predicate: (e: Element) => boolean) {
  var descend = function (node: DomNode): Option<Element> {
    for (var i = 0; i < node.childNodes.length; i++) {
      if (predicate(Element.fromDom(node.childNodes[i])))
        return Option.some(Element.fromDom(node.childNodes[i]));

      var res = descend(node.childNodes[i]);
      if (res.isSome())
        return res;
    }

    return Option.none<Element>();
  };

  return descend(scope.dom());
};

export default {
  first,
  ancestor,
  closest,
  sibling,
  child,
  descendant,
};