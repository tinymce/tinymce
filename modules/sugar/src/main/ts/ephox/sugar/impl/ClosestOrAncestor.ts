import { Option, Type } from '@ephox/katamari';
import Element from '../api/node/Element';
import { Node as DomNode } from '@ephox/dom-globals';

type TestFn = (e: Element<DomNode>) => boolean;
type ScopeTestFn<T> = (scope: Element<DomNode>, a: T) => boolean;
type AncestorFn<T> = (scope: Element<DomNode>, predicate: T, isRoot?: TestFn) => Option<Element<DomNode>>;

export default function <T>(is: ScopeTestFn<T>, ancestor: AncestorFn<T>, scope: Element<DomNode>, a: T, isRoot: TestFn): Option<Element<DomNode>> {
  return is(scope, a) ?
          Option.some(scope) :
          Type.isFunction(isRoot) && isRoot(scope) ?
              Option.none<Element<DomNode>>() :
              ancestor(scope, a, isRoot);
}