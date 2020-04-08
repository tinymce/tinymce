import { ChildNode, Node as DomNode } from '@ephox/dom-globals';
import { Arr, Fun, Option, Type } from '@ephox/katamari';
import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import * as Compare from '../dom/Compare';
import * as Body from '../node/Body';
import Element from '../node/Element';

const first: {
  <T extends DomNode = DomNode> (predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T & ChildNode>>;
  (predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode & ChildNode>>;
} = (predicate: (e: Element<DomNode>) => boolean) =>
  descendant(Body.body(), predicate);

const ancestor: {
  <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>, isRoot?: (e: Element<DomNode>) => boolean): Option<Element<T>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean): Option<Element<DomNode>>;
} = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean) => {
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
  return Option.none<Element<DomNode>>();
};

const closest: {
  <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>, isRoot?: (e: Element<DomNode>) => boolean): Option<Element<T>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean): Option<Element<DomNode>>;
} = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean) => {
  // This is required to avoid ClosestOrAncestor passing the predicate to itself
  const is = (s: Element<DomNode>, test: (e: Element<DomNode>) => boolean): s is Element<DomNode> => test(s);
  return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot);
};

const sibling: {
  <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T & ChildNode>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode & ChildNode>>;
} = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode & ChildNode>> => {
  const element = scope.dom();
  if (!element.parentNode) {
    return Option.none<Element<DomNode & ChildNode>>();
  }

  return child(Element.fromDom(element.parentNode), (x) => !Compare.eq(scope, x) && predicate(x));
};

const child: {
  <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T & ChildNode>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode & ChildNode>>;
} = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) => {
  const pred = (node: DomNode) => predicate(Element.fromDom(node));
  const result = Arr.find(scope.dom().childNodes, pred);
  return result.map(Element.fromDom);
};

const descendant: {
  <T extends DomNode = DomNode> (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T & ChildNode>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode & ChildNode>>;
} = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) => {
  const descend = (node: DomNode): Option<Element<DomNode & ChildNode>> => {
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

    return Option.none<Element<DomNode & ChildNode>>();
  };

  return descend(scope.dom());
};

export { first, ancestor, closest, sibling, child, descendant };
