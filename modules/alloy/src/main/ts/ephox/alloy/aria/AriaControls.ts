import { Id, Optional } from '@ephox/katamari';
import { Attribute, PredicateFind, SelectorFind, SugarElement, SugarNode, SugarShadowDom } from '@ephox/sugar';

export interface AriaManager {
  readonly id: string;
  readonly link: (elem: SugarElement<Element>) => void;
  readonly unlink: (elem: SugarElement<Element>) => void;
}

const attribute = 'aria-controls';

const find = (queryElem: SugarElement<Node>): Optional<SugarElement<Element>> => {
  const dependent = PredicateFind.closest(queryElem, (elem): elem is SugarElement<Element> => {
    if (!SugarNode.isElement(elem)) {
      return false;
    }
    const id = Attribute.get(elem, 'id');
    return id !== undefined && id.indexOf(attribute) > -1;
  });

  return dependent.bind((dep) => {
    const id = Attribute.get(dep, 'id');
    const dos = SugarShadowDom.getRootNode(dep);

    return SelectorFind.descendant(dos, `[${attribute}="${id}"]`);
  });
};

const manager = (): AriaManager => {
  const ariaId = Id.generate(attribute);

  const link = (elem: SugarElement<Element>) => {
    Attribute.set(elem, attribute, ariaId);
  };

  const unlink = (elem: SugarElement<Element>) => {
    Attribute.remove(elem, attribute);
  };

  return {
    id: ariaId,
    link,
    unlink,
  };
};

export {
  find,
  manager
};
