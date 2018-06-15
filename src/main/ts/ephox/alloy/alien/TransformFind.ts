import { Option } from '@ephox/katamari';
import { PredicateFind } from '@ephox/sugar';
import { SugarElement } from 'ephox/alloy/api/Main';

const closest = <T>(target: SugarElement, transform: (SugarElement) => Option<T>, isRoot: (SugarElement) => boolean): Option<T> => {
  // TODO: Sugar method is inefficient ... .need to write something new which allows me to keep the optional
  // information, rather than just returning a boolean. Sort of a findMap for Predicate.ancestor.
  const delegate: Option<SugarElement> = PredicateFind.closest(target, (elem: SugarElement) => {
    return transform(elem).isSome();
  }, isRoot);

  return delegate.bind(transform);
};

export {
  closest
};