import { Arr, Optional } from '@ephox/katamari';
import { Attribute, Compare, Css, Remove, SugarElement, Traverse, SugarNode } from '@ephox/sugar';

const reduceFontStyleNesting = (block: Element, node: Element): void => {
  const blockSugar = SugarElement.fromDom(block);
  const nodeSugar = SugarElement.fromDom(node);
  const isEndBlock = (element: SugarElement) => Compare.eq(element, blockSugar);
  const elements = [ nodeSugar, ...Traverse.parentsElement(nodeSugar, isEndBlock) ];
  let fontSize = Optional.none<string>();

  Arr.each(elements, (element, index) => {
    if (fontSize.isSome()) {
      Css.remove(element, 'font-size');
      Attribute.remove(element, 'data-mce-style');
    } else {
      fontSize = Css.getRaw(element, 'font-size');
    }

    Optional.from(elements[index - 1]).each((previousElement) => {
      if (Attribute.hasNone(element) && SugarNode.name(element) === SugarNode.name(previousElement)) {
        Remove.unwrap(element);
      }
    });
  });
};

export {
  reduceFontStyleNesting
};
