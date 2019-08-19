import { Node as DomNode, ChildNode } from '@ephox/dom-globals';
import { Arr, Fun, Option, Type } from '@ephox/katamari';
import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import * as Compare from '../dom/Compare';
import * as Body from '../node/Body';
import Element from '../node/Element';

const first: {
  <T extends DomNode = DomNode> (predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T>>;
  (predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode>>;
} = function <T extends DomNode = DomNode> (predicate: (e: Element<DomNode>) => e is Element<T>) {
  return descendant<T>(Body.body(), predicate);
};

const ancestor: {
  <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>, isRoot?: (e: Element<DomNode>) => boolean): Option<Element<T>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean): Option<Element<DomNode>>;
} = function <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>, isRoot?: (e: Element<DomNode>) => boolean) {
  let element = scope.dom();
  const stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

  while (element.parentNode) {
    element = element.parentNode;
    const el = Element.fromDom(element);

    if (predicate(el)) {
      return Option.some(el);
    } else if (stop(el)) {
      break;
    }
  }
  return Option.none<Element<T>>();
};

const closest: {
  <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>, isRoot?: (e: Element<DomNode>) => boolean): Option<Element<T>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean): Option<Element<DomNode>>;
} = function <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>, isRoot?: (e: Element<DomNode>) => boolean) {
  // This is required to avoid ClosestOrAncestor passing the predicate to itself
  const is = function (s: Element<DomNode>, test: (e: Element<DomNode>) => e is Element<T>): s is Element<T> {
    return test(s);
  };
  return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot) as Option<Element<T>>;
};

const sibling: {
  <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode>>;
} = function <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>) {
  const element = scope.dom();
  if (!element.parentNode) {
    return Option.none<Element<T>>();
  }

  return child(Element.fromDom(element.parentNode), function (x): x is Element<T> {
    return !Compare.eq(scope, x) && predicate(x);
  });
};

const child: {
  <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode>>;
} = function <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>) {
  const pred = (node: DomNode): node is T => predicate(Element.fromDom(node));
  const result = Arr.find(scope.dom().childNodes, pred) as Option<T>;
  return result.map(Element.fromDom);
};

const descendant: {
  <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode>>;
} = function <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T>> {
  const descend = function (node: DomNode): Option<Element<T>> {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = Element.fromDom(node.childNodes[i]);
      if (predicate(child)) {
        return Option.some(child);
      }

      const res = descend(node.childNodes[i]);
      if (res.isSome()) {
        return res;
      }
    }

    return Option.none<Element<T>>();
  };

  return descend(scope.dom());
};

export { first, ancestor, closest, sibling, child, descendant, };
