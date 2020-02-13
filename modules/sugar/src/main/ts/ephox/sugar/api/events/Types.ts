import Element from '../node/Element';

export interface EventArgs<T = any> { // Set to any since there might be a lot of code working directly with the sub types of Event
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

export type EventHandler = (evt: EventArgs) => void;
export type EventFilter = (evt: any) => boolean;
