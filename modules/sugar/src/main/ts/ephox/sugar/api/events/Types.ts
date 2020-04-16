import { Event } from '@ephox/dom-globals';
import Element from '../node/Element';

export interface EventArgs<T = Event> {
  target: () => Element;
  x: () => number;
  y: () => number;
  stop: () => void;
  prevent: () => void;
  kill: () => void;
  raw: () => T;
}

export interface EventUnbinder {
  unbind: () => void;
}

export type EventHandler<T = Event> = (evt: EventArgs<T>) => void;
export type EventFilter<T = Event> = (evt: T) => boolean;
