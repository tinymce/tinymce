import { Event } from '@ephox/dom-globals';
import Element from '../node/Element';

export interface EventArgs<T = Event> {
  readonly target: () => Element;
  readonly x: () => number;
  readonly y: () => number;
  readonly stop: () => void;
  readonly prevent: () => void;
  readonly kill: () => void;
  readonly raw: () => T;
}

export interface EventUnbinder {
  readonly unbind: () => void;
}

export type EventHandler<T = Event> = (evt: EventArgs<T>) => void;
export type EventFilter<T = Event> = (evt: T) => boolean;
