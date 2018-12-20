import { Fun } from '@ephox/katamari';
import * as FilteredEvent from '../../impl/FilteredEvent';

const filter = Fun.constant(true); // no filter on plain DomEvents

const bind = function (element, event, handler) {
  return FilteredEvent.bind(element, event, filter, handler);
};

const capture = function (element, event, handler) {
  return FilteredEvent.capture(element, event, filter, handler);
};

export {
  bind,
  capture,
};