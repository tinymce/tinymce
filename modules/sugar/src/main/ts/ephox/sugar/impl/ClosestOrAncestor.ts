import { Node as DomNode } from '@ephox/dom-globals';
import { Option, Type } from '@ephox/katamari';
import Element from '../api/node/Element';

type TestFn = (e: Element<DomNode>) => boolean;
type ScopeTestFn<T, R extends DomNode> = (scope: Element<DomNode>, a: T) => scope is Element<R>;
type AncestorFn<T, R extends DomNode> = (scope: Element<DomNode>, predicate: T, isRoot?: TestFn) => Option<Element<R>>;

export default <T, R extends DomNode = DomNode> (is: ScopeTestFn<T, R>, ancestor: AncestorFn<T, R>, scope: Element<DomNode>, a: T, isRoot?: TestFn): Option<Element<R>> =>
  is(scope, a) ?
    Option.some(scope) :
    Type.isFunction(isRoot) && isRoot(scope) ?
      Option.none<Element<R>>() :
      ancestor(scope, a, isRoot);
