import { Node as DomNode } from '@ephox/dom-globals';
import { Fun, Option, Type } from '@ephox/katamari';
import Element from '../node/Element';

const ensureIsRoot = (isRoot?: (e: Element<DomNode>) => boolean) => Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

const ancestor = <A> (scope: Element<DomNode>, transform: (e: Element<DomNode>) => Option<A>, isRoot?: (e: Element<DomNode>) => boolean): Option<A> => {
  let element = scope.dom();
  const stop = ensureIsRoot(isRoot);

  while (element.parentNode) {
    element = element.parentNode;
    const el = Element.fromDom(element);

    const transformed = transform(el);
    if (transformed.isSome()) {
      return transformed;
    } else if (stop(el)) {
      break;
    }
  }
  return Option.none<A>();
};

const closest = <A> (scope: Element<DomNode>, transform: (e: Element<DomNode>) => Option<A>, isRoot?: (e: Element<DomNode>) => boolean): Option<A> => {
  const current = transform(scope);
  const stop = ensureIsRoot(isRoot);
  return current.orThunk(() => stop(scope) ? Option.none<A>() : ancestor(scope, transform, stop));
};

export { ancestor, closest };
