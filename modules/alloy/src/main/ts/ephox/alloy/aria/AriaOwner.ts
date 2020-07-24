import { Id, Option } from '@ephox/katamari';
import { Attribute, PredicateFind, SelectorFind, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

const find = (queryElem: SugarElement): Option<SugarElement> => {
  const dependent: Option<SugarElement> = PredicateFind.closest(queryElem, (elem) => {
    if (!SugarNode.isElement(elem)) {
      return false;
    }
    const id = Attribute.get(elem, 'id');
    return id !== undefined && id.indexOf('aria-owns') > -1;
  });

  return dependent.bind((dep) => {
    const id = Attribute.get(dep, 'id');
    const doc = Traverse.owner(dep);

    return SelectorFind.descendant(doc, '[aria-owns="' + id + '"]');
  });
};

export interface AriaManager {
  id: string;
  link: (elem: SugarElement) => void;
  unlink: (elem: SugarElement) => void;
}

const manager = (): AriaManager => {
  const ariaId = Id.generate('aria-owns');

  const link = (elem: SugarElement) => {
    Attribute.set(elem, 'aria-owns', ariaId);
  };

  const unlink = (elem: SugarElement) => {
    Attribute.remove(elem, 'aria-owns');
  };

  return {
    id: ariaId,
    link,
    unlink
  };
};

export {
  find,
  manager
};
