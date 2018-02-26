import { PredicateFind } from '@ephox/sugar';

const closest = function (target, transform, isRoot) {
  // TODO: Sugar method is inefficient ... .need to write something new which allows me to keep the optional
  // information, rather than just returning a boolean. Sort of a findMap for Predicate.ancestor.
  const delegate = PredicateFind.closest(target, function (elem) {
    return transform(elem).isSome();
  }, isRoot);

  return delegate.bind(transform);
};

export {
  closest
};