import { Fun } from '@ephox/katamari';
import FilteredEvent from '../../impl/FilteredEvent';

var filter = Fun.constant(true); // no filter on plain DomEvents

var bind = function (element, event, handler) {
  return FilteredEvent.bind(element, event, filter, handler);
};

var capture = function (element, event, handler) {
  return FilteredEvent.capture(element, event, filter, handler);
};

export default {
  bind,
  capture,
};