import { Optional } from '@ephox/katamari';
import { SugarElement } from '../node/SugarElement';
import * as SelectorFind from '../search/SelectorFind';

const set = (element: SugarElement<HTMLInputElement>, status: boolean): void => {
  element.dom.checked = status;
};

// :checked selector requires IE9
// http://www.quirksmode.org/css/selectors/#t60
const find = (parent: SugarElement<Node>): Optional<SugarElement<HTMLInputElement>> =>
  SelectorFind.descendant<HTMLInputElement>(parent, 'input:checked');

export {
  set,
  find
};
