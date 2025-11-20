import { Arr, Fun } from '@ephox/katamari';
import { Attribute, Compare, Css, Remove, SugarElement, SugarNode, PredicateFilter } from '@ephox/sugar';

const reduceFontStyleNesting = (block: Element, node: Element): void => {
  const blockSugar = SugarElement.fromDom(block);
  const nodeSugar = SugarElement.fromDom(node);
  const isSpan = SugarNode.isTag('span');
  const isEndBlock = Fun.curry(Compare.eq, blockSugar);
  const hasFontSize = (element: SugarElement<Node>): element is SugarElement<Element> =>
    SugarNode.isElement(element) && Css.getRaw(element, 'font-size').isSome();

  const elementsWithFontSize = [
    ...(hasFontSize(nodeSugar) ? [ nodeSugar ] : []),
    ...PredicateFilter.ancestors<Element>(nodeSugar, hasFontSize, isEndBlock)
  ];
  Arr.each(
    elementsWithFontSize.slice(1),
    (element) => {
      Css.remove(element, 'font-size');
      Attribute.remove(element, 'data-mce-style');

      if (isSpan(element) && Attribute.hasNone(element)) {
        Remove.unwrap(element);
      }
    }
  );
};

export {
  reduceFontStyleNesting
};
