import { Fun, Optional, Type } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';

const ensureIsRoot = (isRoot?: (e: SugarElement<Node>) => boolean) => Type.isFunction(isRoot) ? isRoot : Fun.never;

const ancestor = <A> (scope: SugarElement<Node>, transform: (e: SugarElement<Node>) => Optional<A>, isRoot?: (e: SugarElement<Node>) => boolean): Optional<A> => {
  let element = scope.dom;
  const stop = ensureIsRoot(isRoot);

  while (element.parentNode) {
    element = element.parentNode;
    const el = SugarElement.fromDom(element);

    const transformed = transform(el);
    if (transformed.isSome()) {
      return transformed;
    } else if (stop(el)) {
      break;
    }
  }
  return Optional.none<A>();
};

const closest = <A> (scope: SugarElement<Node>, transform: (e: SugarElement<Node>) => Optional<A>, isRoot?: (e: SugarElement<Node>) => boolean): Optional<A> => {
  const current = transform(scope);
  const stop = ensureIsRoot(isRoot);
  return current.orThunk(() => stop(scope) ? Optional.none<A>() : ancestor(scope, transform, stop));
};

export { ancestor, closest };
