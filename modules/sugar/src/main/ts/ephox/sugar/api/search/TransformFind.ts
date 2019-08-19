import { Node as DomNode } from '@ephox/dom-globals';
import { Fun, Option, Type } from '@ephox/katamari';
import Element from '../node/Element';

const ancestor = function <A>(scope: Element<DomNode>, transform: (e: Element<DomNode>) => Option<A>, isRoot?: (e: Element<DomNode>) => boolean): Option<A> {
  let element = scope.dom();
  const stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

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

const closest = function <A>(scope: Element<DomNode>, transform: (e: Element<DomNode>) => Option<A>, isRoot?: (e: Element<DomNode>) => boolean): Option<A> {
  const current = transform(scope);
  return current.orThunk(function () {
    return isRoot(scope) ? Option.none<A>() : ancestor(scope, transform, isRoot);
  });
};

export { ancestor, closest, };
