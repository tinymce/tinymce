import { Fun, Id, Option } from '@ephox/katamari';
import { Attr, Element, Node, PredicateFind, SelectorFind, Traverse } from '@ephox/sugar';

const find = (queryElem: Element): Option<Element> => {
  const dependent: Option<Element> = PredicateFind.closest(queryElem, (elem) => {
    if (! Node.isElement(elem)) { return false; }
    const id = Attr.get(elem, 'id');
    return id !== undefined && id.indexOf('aria-owns') > -1;
  });

  return dependent.bind((dep) => {
    const id = Attr.get(dep, 'id');
    const doc = Traverse.owner(dep);

    return SelectorFind.descendant(doc, '[aria-owns="' + id + '"]');
  });
};

export interface AriaManager {
  id: () => string;
  link: (elem: Element) => void;
  unlink: (elem: Element) => void;
}

const manager = (): AriaManager => {
  const ariaId = Id.generate('aria-owns');

  const link = (elem: Element) => {
    Attr.set(elem, 'aria-owns', ariaId);
  };

  const unlink = (elem: Element) => {
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
