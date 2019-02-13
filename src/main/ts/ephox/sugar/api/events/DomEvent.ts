import { Fun } from '@ephox/katamari';
import * as FilteredEvent from '../../impl/FilteredEvent';
import Element from '../node/Element';

const filter = Fun.constant(true); // no filter on plain DomEvents

const bind = (element: Element, event: string, handler: (evt: FilteredEvent.EventArgs) => void): FilteredEvent.EventUnbinder => {
  return FilteredEvent.bind(element, event, filter, handler);
};

const capture = (element: Element, event: string, handler: (evt: FilteredEvent.EventArgs) => void): FilteredEvent.EventUnbinder => {
  return FilteredEvent.capture(element, event, filter, handler);
};

export {
  bind,
  capture,
};