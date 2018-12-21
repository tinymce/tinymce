import { Node as DomNode } from '@ephox/dom-globals';
import { Arr, Fun, Option, Type } from '@ephox/katamari';
import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import * as Compare from '../dom/Compare';
import * as Body from '../node/Body';
import Element from '../node/Element';

const first = function (predicate: (e: Element) => boolean) {
  return descendant(Body.body(), predicate);
};

const ancestor = function (scope: Element, predicate: (e: Element) => boolean, isRoot?) {
  let element: DomNode = scope.dom();
  const stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

  while (element.parentNode) {
    element = element.parentNode;
    const el = Element.fromDom(element);

    if (predicate(el)) { return Option.some(el); } else if (stop(el)) { break; }
  }
  return Option.none<Element>();
};

const closest = function (scope: Element, predicate: (e: Element) => boolean, isRoot?) {
  // This is required to avoid ClosestOrAncestor passing the predicate to itself
  const is = function (s: Element) {
    return predicate(s);
  };
  return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot);
};

const sibling = function (scope, predicate: (e: Element) => boolean) {
  const element: DomNode = scope.dom();
  if (!element.parentNode) { return Option.none<Element>(); }

  return child(Element.fromDom(element.parentNode), function (x) {
    return !Compare.eq(scope, x) && predicate(x);
  });
};

const child = function (scope: Element, predicate: (e: Element) => boolean) {
  const result = Arr.find(scope.dom().childNodes,
    Fun.compose(predicate, Element.fromDom));
  return result.map(Element.fromDom);
};

const descendant = function (scope: Element, predicate: (e: Element) => boolean) {
  const descend = function (node: DomNode): Option<Element> {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < node.childNodes.length; i++) {
      if (predicate(Element.fromDom(node.childNodes[i]))) {
        return Option.some(Element.fromDom(node.childNodes[i]));
      }

      const res = descend(node.childNodes[i]);
      if (res.isSome()) {
        return res;
      }
    }

    return Option.none<Element>();
  };

  return descend(scope.dom());
};

export { first, ancestor, closest, sibling, child, descendant, };
