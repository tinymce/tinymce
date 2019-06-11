import Element from '../node/Element';

export interface EventArgs {
  target: () => Element;
  x: () => number;
  y: () => number;
  stop: () => void;
  prevent: () => void;
  kill: () => void;
  raw: () => any; // Set to any since there might be a lot of code working directly with the sub types of Event
}

export interface EventUnbinder {
  unbind: () => void;
}

export type EventHandler = (evt: EventArgs) => void;
export type EventFilter = (evt: any) => boolean;