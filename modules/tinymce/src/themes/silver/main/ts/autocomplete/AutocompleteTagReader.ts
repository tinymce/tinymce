import { Optional } from '@ephox/katamari';
import { SelectorFind, SugarElement } from '@ephox/sugar';

const autocompleteSelector = '[data-mce-autocompleter]';

export const detect = (elm: SugarElement): Optional<SugarElement> => SelectorFind.closest(elm, autocompleteSelector);

export const findIn = (elm: SugarElement): Optional<SugarElement> => SelectorFind.descendant(elm, autocompleteSelector);
