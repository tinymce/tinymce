import { Id, Optional } from '@ephox/katamari';
import { Attribute, PredicateFind, SelectorFind, SugarElement, SugarNode, SugarShadowDom } from '@ephox/sugar';

const find = (queryElem: SugarElement<Node>): Optional<SugarElement<Element>> => {
  const dependent = PredicateFind.closest(queryElem, (elem): elem is SugarElement<Element> => {
    if (!SugarNode.isElement(elem)) {
      return false;
    }
    const id = Attribute.get(elem, 'id');
    return id !== undefined && id.indexOf('aria-owns') > -1;
  });

  return dependent.bind((dep) => {
    const id = Attribute.get(dep, 'id');
    const dos = SugarShadowDom.getRootNode(dep);

    return SelectorFind.descendant(dos, '[aria-owns="' + id + '"]');
  });
};

export interface AriaManager {
  id: string;
  link: (elem: SugarElement<Element>) => void;
  unlink: (elem: SugarElement<Element>) => void;
}

const manager = (): AriaManager => {
  const ariaId = Id.generate('aria-owns');

  const link = (elem: SugarElement<Element>) => {
    Attribute.set(elem, 'aria-owns', ariaId);
  };

  const unlink = (elem: SugarElement<Element>) => {
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
