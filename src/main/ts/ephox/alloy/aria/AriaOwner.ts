import { Fun, Id } from '@ephox/katamari';
import { Attr, Node, PredicateFind, SelectorFind, Traverse } from '@ephox/sugar';

const find = function (queryElem) {
  const dependent = PredicateFind.closest(queryElem, function (elem) {
    if (! Node.isElement(elem)) { return false; }
    const id = Attr.get(elem, 'id');
    return id !== undefined && id.indexOf('aria-owns') > -1;
  });

  return dependent.bind(function (dep) {
    const id = Attr.get(dep, 'id');
    const doc = Traverse.owner(dep);

    return SelectorFind.descendant(doc, '[aria-owns="' + id + '"]');
  });
};

const manager = function () {
  const ariaId = Id.generate('aria-owns');

  const link = function (elem) {
    Attr.set(elem, 'aria-owns', ariaId);
  };

  const unlink = function (elem) {
    Attr.remove(elem, 'aria-owns');
  };

  return {
    id: Fun.constant(ariaId),
    link,
    unlink
  };
};

export {
  find,
  manager
};