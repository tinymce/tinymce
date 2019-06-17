import { Fun, Id, Option } from '@ephox/katamari';
import { Attr, Node, PredicateFind, SelectorFind, Traverse, Element } from '@ephox/sugar';

import { SugarDocument } from '../alien/TypeDefinitions';

const find = (queryElem: Element): Option<Element> => {
  const dependent: Option<Element> = PredicateFind.closest(queryElem, (elem) => {
    if (! Node.isElement(elem)) { return false; }
    const id = Attr.get(elem, 'id');
    return id !== undefined && id.indexOf('aria-owns') > -1;
  });

  return dependent.bind((dep) => {
    const id = Attr.get(dep, 'id');
    const doc: SugarDocument = Traverse.owner(dep);

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

  const link = (elem) => {
    Attr.set(elem, 'aria-owns', ariaId);
  };

  const unlink = (elem) => {
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