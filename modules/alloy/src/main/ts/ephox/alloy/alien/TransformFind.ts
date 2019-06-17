import { Option } from '@ephox/katamari';
import { PredicateFind, Element } from '@ephox/sugar';

const closest = <T>(target: Element, transform: (e: Element) => Option<T>, isRoot: (e: Element) => boolean): Option<T> => {
  // TODO: Sugar method is inefficient ... .need to write something new which allows me to keep the optional
  // information, rather than just returning a boolean. Sort of a findMap for Predicate.ancestor.
  const delegate: Option<Element> = PredicateFind.closest(target, (elem: Element) => {
    return transform(elem).isSome();
  }, isRoot);

  return delegate.bind(transform);
};

export {
  closest
};