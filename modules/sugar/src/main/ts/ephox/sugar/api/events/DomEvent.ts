import { Event, HTMLElementEventMap } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import * as FilteredEvent from '../../impl/FilteredEvent';
import Element from '../node/Element';
import { EventHandler, EventUnbinder } from './Types';

const filter = Fun.constant(true); // no filter on plain DomEvents

const bind: {
  <K extends keyof HTMLElementEventMap> (element: Element, event: K, handler: EventHandler<HTMLElementEventMap[K]>): EventUnbinder;
  <T extends Event>(element: Element, event: string, handler: EventHandler<T>): EventUnbinder;
} = <T extends Event>(element: Element, event: string, handler: EventHandler<T>): EventUnbinder =>
  FilteredEvent.bind<T>(element, event, filter, handler);

const capture: {
  <K extends keyof HTMLElementEventMap> (element: Element, event: K, handler: EventHandler<HTMLElementEventMap[K]>): EventUnbinder;
  <T extends Event>(element: Element, event: string, handler: EventHandler<T>): EventUnbinder;
} = <T extends Event>(element: Element, event: string, handler: EventHandler<T>): EventUnbinder =>
  FilteredEvent.capture<T>(element, event, filter, handler);

const fromRawEvent = FilteredEvent.fromRawEvent;

export {
  bind,
  capture,
  fromRawEvent
};
