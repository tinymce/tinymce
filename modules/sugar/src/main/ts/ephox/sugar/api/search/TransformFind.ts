import { Node } from '@ephox/dom-globals';
import { Fun, Option, Type } from '@ephox/katamari';
import { SugarElement } from '../node/SugarElement';

const ensureIsRoot = (isRoot?: (e: SugarElement<Node>) => boolean) => Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

const ancestor = <A> (scope: SugarElement<Node>, transform: (e: SugarElement<Node>) => Option<A>, isRoot?: (e: SugarElement<Node>) => boolean): Option<A> => {
  let element = scope.dom();
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
  return Option.none<A>();
};

const closest = <A> (scope: SugarElement<Node>, transform: (e: SugarElement<Node>) => Option<A>, isRoot?: (e: SugarElement<Node>) => boolean): Option<A> => {
  const current = transform(scope);
  const stop = ensureIsRoot(isRoot);
  return current.orThunk(() => stop(scope) ? Option.none<A>() : ancestor(scope, transform, stop));
};

export { ancestor, closest };
