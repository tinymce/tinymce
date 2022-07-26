import { Optional } from '@ephox/katamari';
import { SelectorFind, SugarElement } from '@ephox/sugar';

const autocompleteSelector = '[data-mce-autocompleter]';

export const detect = (elm: SugarElement<Node>): Optional<SugarElement<Element>> =>
  SelectorFind.closest(elm, autocompleteSelector);

export const findIn = (elm: SugarElement<Element>): Optional<SugarElement<Element>> =>
  SelectorFind.descendant(elm, autocompleteSelector);
