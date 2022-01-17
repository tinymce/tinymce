import { Fun, Optional } from '@ephox/katamari';

import * as SugarBody from '../node/SugarBody';
import { SugarElement } from '../node/SugarElement';
import * as SelectorFind from '../search/SelectorFind';

const closest = (target: SugarElement<Node>): Optional<SugarElement<HTMLElement>> =>
  SelectorFind.closest(target, '[contenteditable]');

const isEditable = (element: SugarElement<HTMLElement>, assumeEditable: boolean = false): boolean => {
  if (SugarBody.inBody(element)) {
    return element.dom.isContentEditable;
  } else {
    // Find the closest contenteditable element and check if it's editable
    return closest(element).fold(
      Fun.constant(assumeEditable),
      (editable) => getRaw(editable) === 'true'
    );
  }
};

const getRaw = (element: SugarElement<HTMLElement>): string =>
  element.dom.contentEditable;

const get = (element: SugarElement<HTMLElement>): boolean =>
  isEditable(element, false);

const set = (element: SugarElement<HTMLElement>, editable: boolean): void => {
  element.dom.contentEditable = editable ? 'true' : 'false';
};

export {
  get,
  getRaw,
  closest,
  isEditable,
  set
};
