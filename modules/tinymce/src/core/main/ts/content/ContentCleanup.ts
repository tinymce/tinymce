import { Arr, Unicode } from '@ephox/katamari';
import { Attribute, Insert, Remove, SelectorFilter, SugarElement } from '@ephox/sugar';

import * as ElementType from '../dom/ElementType';

export const cleanupBogusElements = (parent: SugarElement<Node>): void => {
  const bogusElements = SelectorFilter.descendants(parent, '[data-mce-bogus]');
  Arr.each(bogusElements, (elem) => {
    const bogusValue = Attribute.get(elem, 'data-mce-bogus');
    if (bogusValue === 'all') {
      Remove.remove(elem);
    } else if (ElementType.isBr(elem)) {
      // Need to keep bogus padding brs represented as a zero-width space so that they aren't collapsed by the browser
      Insert.before(elem, SugarElement.fromText(Unicode.zeroWidth));
      Remove.remove(elem);
    } else {
      Remove.unwrap(elem);
    }
  });
};

export const cleanupInputNames = (parent: SugarElement<Node>): void => {
  const inputs = SelectorFilter.descendants(parent, 'input');

  Arr.each(inputs, (input) => {
    Attribute.remove(input, 'name');
  });
};
