import * as FilteredEvent from '../../impl/FilteredEvent';
import { MouseEvent } from '@ephox/dom-globals';
import Element from '../node/Element';
import { EventFilter, EventHandler } from './Types';

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const isLeftClick = function (raw: MouseEvent) {
  return raw.button === 0;
};

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
const isLeftButtonPressed = function (raw: MouseEvent) {
  // Only added by Chrome/Firefox in June 2015.
  // This is only to fix a 1px bug (TBIO-2836) so return true if we're on an older browser
  if (raw.buttons === undefined) { return true; }

  // use bitwise & for optimal comparison
  // tslint:disable-next-line:no-bitwise
  return (raw.buttons & 1) !== 0;
};

// Not 100% sure whether this works, so use with caution
const isRealClick = function (raw: any) {
  // Firefox non-standard property
  // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent#mozInputSource
  return (raw.mozInputSource === 6 || raw.mozInputSource === 0) ? false
    // standards, only gecko/webkit as of Sept 2015
    // https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted
    : raw.isTrusted !== undefined && raw.isTrusted !== true ? false
    // fallback to yes because there's no other way to really know
    : true;
};

const filtered = function (event: string, filter: EventFilter) {
  return {
    bind (element: Element, f: EventHandler) {
      return FilteredEvent.bind(element, event, filter, f);
    }
  };
};

const realClick = filtered('click', isRealClick);
const leftDown = filtered('mousedown', isLeftClick);
const leftPressedOver = filtered('mouseover', isLeftButtonPressed);
const leftUp = filtered('mouseup', isLeftClick);

export {
  realClick,
  leftDown,
  leftPressedOver,
  leftUp,
};