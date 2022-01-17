import { build, LinkableAttribute } from "./AriaManager";
import { Optional } from '@ephox/katamari';
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

const manager = build(LinkableAttribute.AriaOwns);

export {
  find,
  manager
};
