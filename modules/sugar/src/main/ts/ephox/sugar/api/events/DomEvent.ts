import { Fun } from '@ephox/katamari';
import * as FilteredEvent from '../../impl/FilteredEvent';
import Element from '../node/Element';
import { EventArgs, EventUnbinder } from './Types';

const filter = Fun.constant(true); // no filter on plain DomEvents

const bind = (element: Element, event: string, handler: (evt: EventArgs) => void): EventUnbinder => {
  return FilteredEvent.bind(element, event, filter, handler);
};

const capture = (element: Element, event: string, handler: (evt: EventArgs) => void): EventUnbinder => {
  return FilteredEvent.capture(element, event, filter, handler);
};

const fromRawEvent = FilteredEvent.fromRawEvent;

export {
  bind,
  capture,
  fromRawEvent
};
