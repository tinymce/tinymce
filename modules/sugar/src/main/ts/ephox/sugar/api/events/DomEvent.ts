import { Fun } from '@ephox/katamari';
import * as FilteredEvent from '../../impl/FilteredEvent';
import { SugarElement } from '../node/SugarElement';
import { EventHandler, EventUnbinder } from './Types';

const filter = Fun.always; // no filter on plain DomEvents

const bind: {
  <K extends keyof HTMLElementEventMap> (element: SugarElement, event: K, handler: EventHandler<HTMLElementEventMap[K]>): EventUnbinder;
  <T extends Event>(element: SugarElement, event: string, handler: EventHandler<T>): EventUnbinder;
} = <T extends Event>(element: SugarElement, event: string, handler: EventHandler<T>): EventUnbinder =>
  FilteredEvent.bind<T>(element, event, filter, handler);

const capture: {
  <K extends keyof HTMLElementEventMap> (element: SugarElement, event: K, handler: EventHandler<HTMLElementEventMap[K]>): EventUnbinder;
  <T extends Event>(element: SugarElement, event: string, handler: EventHandler<T>): EventUnbinder;
} = <T extends Event>(element: SugarElement, event: string, handler: EventHandler<T>): EventUnbinder =>
  FilteredEvent.capture<T>(element, event, filter, handler);

const fromRawEvent = FilteredEvent.fromRawEvent;

export {
  bind,
  capture,
  fromRawEvent
};
